/* Static, trusted YouTube MAIN-world scriptlet. No WebExtension APIs, remote
   execution, page-to-extension messages, cookies, requests, media or DRM writes.
   Activated solely by the existing isolated content controller's local setting. */
(function(){"use strict";
const EVENT="dk-live-block:youtube-response-control",MAX=1500000;
const AD_FIELDS=["adPlacements","adSlots","playerAds"];
const g=window;
if(g!==g.top||!/(^|\.)youtube\.com$/.test(location.hostname)&&
 !/(^|\.)youtube-nocookie\.com$/.test(location.hostname))return;
let enabled=false,wrappedFetch=null,oldFetch=null,oldOpen=null,oldSend=null,wrappedOpen=null,wrappedSend=null;
let oldResponse=null,oldText=null,wrappedResponse=null,wrappedText=null;
let oldJSONParse=null,wrappedJSONParse=null,bootstrapHook=null;
// All our internal JSON handling calls this saved parser, never the scriptlet.
// That avoids self-interception and preserves rewrite(text) semantics.
const originalJSONParse=JSON.parse;
function parseInternal(text){return originalJSONParse(text);}
const pending=new WeakMap(),cache=new WeakMap(),decorated=new WeakSet();
// Site-controlled events are untrusted and never influence blocking decisions.
const PRUNE_KINDS=new Set(["bootstrap","json-parse","fetch-json","fetch-text","xhr-json","xhr-text"]);
let reportedPrunes=0;
function reportPrune(kind){
 if(!enabled||reportedPrunes>=16||!PRUNE_KINDS.has(kind)||
    typeof CustomEvent!=="function"||typeof document.dispatchEvent!=="function")return;
 try{
  document.dispatchEvent(new CustomEvent("dk-live-block:youtube-page-pruned",{detail:{kind}}));
  reportedPrunes++;
 }catch(_){}
}
function plain(x){return !!x&&typeof x==="object"&&!Array.isArray(x);}
function ownData(x,key){
 if(!plain(x))return undefined;
 const descriptor=Object.getOwnPropertyDescriptor(x,key);
 return descriptor&&Object.prototype.hasOwnProperty.call(descriptor,"value")?
  descriptor.value:undefined;
}
function denied(x){
 const status=ownData(ownData(x,"playabilityStatus"),"status");
 return Boolean(status&&status!=="OK"||plain(ownData(x,"error")));
}
function playable(x){return plain(x)&&(
 plain(ownData(x,"streamingData"))||plain(ownData(x,"videoDetails"))||
 plain(ownData(x,"playerResponse")));}
function safeToPrune(x){
 if(!playable(x))return true;
 if(denied(x))return true;
 for(const field of AD_FIELDS){
  if(!Object.prototype.hasOwnProperty.call(x,field)||
    !(Array.isArray(ownData(x,field))||plain(ownData(x,field))))continue;
  if(!Object.getOwnPropertyDescriptor(x,field)?.configurable)return false;
 }
 return true;
}
function pruneObject(x){
 if(!playable(x)||denied(x))return 0;
 let removed=0;
 const fields=AD_FIELDS.filter(field=>
  Object.prototype.hasOwnProperty.call(x,field)&&
  (Array.isArray(ownData(x,field))||plain(ownData(x,field))));
 // A frozen/non-configurable player payload must not break fetch().json().
 for(const field of fields)if(!Object.getOwnPropertyDescriptor(x,field)?.configurable)
  return 0;
 for(const field of fields){delete x[field];removed++;}
 return removed;
}
function resolveTarget(raw){
 try{
  const u=new URL(String(raw),location.href);
  return u.protocol==="https:"&&!u.username&&!u.password&&
   /(^|\.)youtube\.com$/.test(u.hostname)&&
   u.pathname==="/youtubei/v1/resolve_url";
 }catch(_){return false;}
}
function prune(x,url=""){
 if(plain(x)&&denied(x))return false;
 if(url&&typeof DKYouTubeFeed!=="undefined"&&DKYouTubeFeed.kind(url))
  return DKYouTubeFeed.prune(x,url).changed;
 if(!plain(x))return false;
 if(url&&resolveTarget(url)){
  const endpoint=ownData(x,"endpoint");
  const watch=ownData(endpoint,"watchEndpoint");
  const prefetch=ownData(watch,"unserializedPrefetchData");
  if(!plain(prefetch)||denied(prefetch))return false;
  const player=ownData(prefetch,"playerResponse");
  if(plain(player)){
   if(denied(player)||!safeToPrune(player))return false;
   return pruneObject(player)>0;
  }
  // Serialized prefetch player JSON is legitimate, but only edit the known
  // writable own data property. Never invoke getters or change an ambiguous
  // child, and never touch the enclosing signed navigation metadata.
  if(typeof player!=="string"||player.length>MAX/2)return false;
  const desc=Object.getOwnPropertyDescriptor(prefetch,"playerResponse");
  if(!desc||!Object.prototype.hasOwnProperty.call(desc,"value")||!desc.writable)
   return false;
  let parsed;try{parsed=parseInternal(player);}catch(_){return false;}
  if(!plain(parsed)||denied(parsed)||!safeToPrune(parsed))return false;
  const count=pruneObject(parsed);
  if(!count)return false;
  prefetch.playerResponse=JSON.stringify(parsed);
  return true;
 }
 const nested=ownData(x,"playerResponse");
 // Accessor-backed player data is not needed for ad filtering and is not
 // invoked. The outer object remains eligible only by its own data fields.
 if(!safeToPrune(x))return false;
 if(plain(nested)&&(denied(nested)||!safeToPrune(nested)))return false;
 // Do not touch the outer object before checking a stringified inner refusal.
 // A malformed or oversized inner response also fails open in its entirety.
 let parsedChild=null;
 if(typeof nested==="string"){
  if(nested.length>MAX/2)return false;
  try{parsedChild=parseInternal(nested);}catch(_){return false;}
  if(!plain(parsedChild)||denied(parsedChild))return false;
  const desc=Object.getOwnPropertyDescriptor(x,"playerResponse");
  if(desc&&!desc.writable)return false;
 }
 let removed=pruneObject(x);
 if(plain(nested))removed+=pruneObject(nested);
 else if(parsedChild){
  const count=pruneObject(parsedChild);
  if(count){x.playerResponse=JSON.stringify(parsedChild);removed+=count;}
 }
 return removed>0;
}
function rewrite(text,url=""){
 if(url&&typeof DKYouTubeFeed!=="undefined"&&DKYouTubeFeed.kind(url))
  return DKYouTubeFeed.rewrite(url,text).text;
 if(typeof text!=="string"||text.length>MAX||text.length<2)return text;
 const prefix=text.startsWith(")]}'\n")?")]}'\n":"";
 let obj;try{obj=parseInternal(prefix?text.slice(prefix.length):text);}catch(_){return text;}
 try{return prune(obj,url)?prefix+JSON.stringify(obj):text;}
 catch(_){return text;}
}
function normalize(raw){
 try{return new URL(String(raw),location.href).href;}catch(_){return "";}
}
function target(raw){
 try{
  const u=new URL(String(raw),location.href);
  if(u.protocol!=="https:"||u.username||u.password||
     !/(^|\.)youtube\.com$/.test(u.hostname))return false;
  return u.pathname==="/youtubei/v1/player"||u.pathname==="/youtubei/v1/get_watch"||
   u.pathname==="/youtubei/v1/resolve_url"||
  (typeof DKYouTubeFeed!=="undefined"&&!!DKYouTubeFeed.kind(u.href));
 }catch(_){return false;}
}
function eligible(method,url){return enabled&&String(method||"GET").toUpperCase()==="POST"&&target(url);}
function jsonType(response){
 try{return /^\s*(?:application\/json|text\/json)\s*(?:;|$)/i.test(
  typeof response?.headers?.get==="function"?response.headers.get("content-type")||"":"");}
 catch(_){return false;}
}
function decorate(response,requestURL=""){
 if(!response||response.status!==200||!jsonType(response)||decorated.has(response))return response;
 decorated.add(response);
 try{
  const json=response.json,text=response.text,clone=response.clone;
  if(typeof json==="function")Object.defineProperty(response,"json",{
   configurable:true,value:function(...args){
    return Promise.resolve(json.apply(this,args)).then(data=>{
      if(enabled)try{if(prune(data,requestURL))reportPrune("fetch-json");}catch(_){}
      return data;
     });
   }
  });
  if(typeof text==="function")Object.defineProperty(response,"text",{
   configurable:true,value:function(...args){
    return Promise.resolve(text.apply(this,args)).then(body=>{
      try{
       const result=enabled?rewrite(body,requestURL):body;
       if(result!==body)reportPrune("fetch-text");
       return result;
      }catch(_){return body;}
     });
   }
  });
  if(typeof clone==="function")Object.defineProperty(response,"clone",{
   configurable:true,value:function(...args){const result=clone.apply(this,args);return result===this?result:decorate(result,requestURL);}
  });
 }catch(_){/* If a response is locked or non-extensible, leave it untouched. */}
 return response;
}

const BOOTSTRAP_KEY="ytInitialPlayerResponse";
function bootstrapDescriptor(){
 // Only read our own saved data value. Never invoke arbitrary page getters.
 const d=Object.getOwnPropertyDescriptor(g,BOOTSTRAP_KEY);
 if(bootstrapHook&&d?.get===bootstrapHook.getter&&
    d?.set===bootstrapHook.setter)return {value:bootstrapHook.value};
 return d;
}
function installBootstrapAssignmentHook(){
 if(bootstrapHook)return;
 let original;
 try{original=Object.getOwnPropertyDescriptor(g,BOOTSTRAP_KEY);}
 catch(_){return;}
 // Existing accessors, locked properties, and read-only globals are sacrosanct.
 if(original&&(!Object.prototype.hasOwnProperty.call(original,"value")||
    !original.configurable||!original.writable))return;
 const hook={original,assigned:false,value:original?.value};
 hook.getter=function(){return hook.value;};
 hook.setter=function(next){
  hook.value=next;
  hook.assigned=true;
  if(!enabled||!plain(next))return;
  try{
   if(prune(next)){reportBootstrap("assignment",true);reportPrune("bootstrap");}
  }catch(_){/* Assignments must never fail due to the blocker. */}
 };
 try{
  Object.defineProperty(g,BOOTSTRAP_KEY,{
   configurable:true,enumerable:original?.enumerable??true,
   get:hook.getter,set:hook.setter
  });
  bootstrapHook=hook;
 }catch(_){/* Non-extensible or hostile pages retain native behavior. */}
}
function restoreBootstrapAssignmentHook(){
 const hook=bootstrapHook;
 if(!hook)return;
 bootstrapHook=null;
 try{
  const d=Object.getOwnPropertyDescriptor(g,BOOTSTRAP_KEY);
  // Do not replace a newer accessor installed by the page itself.
  if(d?.get!==hook.getter||d?.set!==hook.setter)return;
  if(!hook.original&&!hook.assigned){
   delete g[BOOTSTRAP_KEY];
   return;
  }
  Object.defineProperty(g,BOOTSTRAP_KEY,{
   configurable:hook.original?.configurable??true,
   enumerable:hook.original?.enumerable??true,
   writable:hook.original?.writable??true,value:hook.value
  });
 }catch(_){/* Never break disable or page execution. */}
}
// Passive, coarse diagnostics only. Never read accessors or export payload data.
function reportBootstrap(phase,playerMetadataCleaned){
 if(typeof CustomEvent!=="function"||typeof document.dispatchEvent!=="function")return;
 try{
  const d=bootstrapDescriptor();
  const value=d&&Object.prototype.hasOwnProperty.call(d,"value")?d.value:null;
  const state=!d?"absent":!Object.prototype.hasOwnProperty.call(d,"value")?
   "accessor":plain(value)?"data":"other";
  let adFields=0;
  if(state==="data")for(const key of AD_FIELDS){
   const field=Object.getOwnPropertyDescriptor(value,key);
   if(field&&Object.prototype.hasOwnProperty.call(field,"value")&&
      (Array.isArray(field.value)||plain(field.value)))adFields++;
  }
  const id=Object.getOwnPropertyDescriptor(g,"ytInitialData");
  const initialData=!!id&&Object.prototype.hasOwnProperty.call(id,"value")&&plain(id.value);
  document.dispatchEvent(new CustomEvent("dk-live-block:youtube-bootstrap-observed",{
   detail:{phase,state,adFields,refused:state==="data"&&denied(value),initialData,
    ...(typeof playerMetadataCleaned==="boolean"?{playerMetadataCleaned}:{})}
  }));
 }catch(_){/* Never interfere with the page on diagnosis failure. */}
}
let observationOnly=false,sampleGeneration=0;
function scheduleBootstrapSamples(){
 if(typeof setTimeout!=="function")return;
 const generation=++sampleGeneration;
 for(const [phase,delay] of [["late-1s",1000],["late-3s",3000]]){
  setTimeout(()=>{
   if(sampleGeneration!==generation||!(enabled||observationOnly))return;
   // YouTube may publish initial player JSON AFTER activation, especially
   // during SPA video navigation. The original enable-time pass misses it.
   // Revisit only the same strictly bounded bootstrap fields in active mode.
   // Observe mode must remain read-only for the A/B test.
   const cleaned=enabled?pruneExistingBootstrap(false):false;
   reportBootstrap(phase,cleaned);
  },delay);
 }
}
function pruneExistingBootstrap(observe=true){
 if(observe)reportBootstrap("pre-enable");
 let playerMetadataCleaned=false;
 // A data property already loaded by YouTube may still be consumed during
 // navigation. Do not replace an accessor, intercept an assignment, or touch
 // unrelated initial page data.
 try{
  const own=bootstrapDescriptor();
  if(own&&Object.prototype.hasOwnProperty.call(own,"value")&&plain(own.value))
   playerMetadataCleaned=prune(own.value)===true;
   if(playerMetadataCleaned)reportPrune("bootstrap");
  const initial=Object.getOwnPropertyDescriptor(g,"ytInitialData");
  if(initial&&Object.prototype.hasOwnProperty.call(initial,"value")&&plain(initial.value)&&
     typeof DKYouTubeFeed!=="undefined")
   DKYouTubeFeed.prune(initial.value,"https://www.youtube.com/youtubei/v1/browse");
 }catch(_){}
 if(observe)reportBootstrap("post-enable");
 return playerMetadataCleaned;
}

// Inspired by uBlock Origin's *architecture* (site-scoped, exception-aware
// scriptlet injection), independently implemented here. This narrowly guards
// first-party player JSON parsed by YouTube, not arbitrary page data, ad rules,
// cookies, media streams or remote scripts. Only enabled bridge modes install it.
function playerJSONCandidate(raw){
 if(typeof raw!=="string"||raw.length<16||raw.length>MAX)return false;
 if(raw.indexOf('"adPlacements"')<0&&raw.indexOf('"adSlots"')<0&&
    raw.indexOf('"playerAds"')<0)return false;
 return raw.indexOf('"streamingData"')>=0||raw.indexOf('"videoDetails"')>=0||
  raw.indexOf('"playerResponse"')>=0;
}
function enablePlayerJSONScriptlet(){
 if(wrappedJSONParse||typeof JSON.parse!=="function")return;
 oldJSONParse=JSON.parse;
 wrappedJSONParse=function(...args){
  const data=Reflect.apply(oldJSONParse,this,args);
  if(enabled&&playerJSONCandidate(args[0])){
   try{if(prune(data))reportPrune("json-parse");}catch(_){/* Never break native JSON.parse behavior. */}
  }
  return data;
 };
 try{JSON.parse=wrappedJSONParse;}
 catch(_){wrappedJSONParse=null;oldJSONParse=null;}
}
function disablePlayerJSONScriptlet(){
 if(wrappedJSONParse&&JSON.parse===wrappedJSONParse)
  try{JSON.parse=oldJSONParse;}catch(_){}
 wrappedJSONParse=null;oldJSONParse=null;
}
function enable(){
 if(observationOnly){observationOnly=false;sampleGeneration++;}
 if(enabled){
  // On SPA navigation YouTube may replace bootstrap data without a reload.
  // Reprocess on an explicit refresh, but do not install a second hook.
  pruneExistingBootstrap(false);
  return;
 }
 enabled=true;
 enablePlayerJSONScriptlet();
 pruneExistingBootstrap();
 installBootstrapAssignmentHook();
 scheduleBootstrapSamples();
 if(typeof g.fetch==="function"){
  oldFetch=g.fetch;
  wrappedFetch=function(...args){
   let url="",method="GET";
   try{
    url=typeof args[0]==="string"||args[0] instanceof URL?String(args[0]):args[0]?.url||"";
    method=args[1]?.method||args[0]?.method||"GET";
   }catch(_){}
   const eligibleNow=eligible(method,url);
   const result=oldFetch.apply(this,args);
   return eligibleNow?Promise.resolve(result).then(response=>decorate(response,normalize(url))):result;
  };
  try{g.fetch=wrappedFetch;}
  catch(_){wrappedFetch=null;oldFetch=null;}
 }
 const proto=g.XMLHttpRequest?.prototype;
 if(!proto)return;
 oldOpen=proto.open;oldSend=proto.send;
 oldResponse=Object.getOwnPropertyDescriptor(proto,"response");
 oldText=Object.getOwnPropertyDescriptor(proto,"responseText");
 if(typeof oldOpen==="function"){
  wrappedOpen=function(method,url,...rest){
   const result=oldOpen.call(this,method,url,...rest);
   pending.set(this,eligible(method,url)?normalize(url):"");cache.delete(this);return result;
  };
  try{proto.open=wrappedOpen;}catch(_){wrappedOpen=null;}
 }
 if(typeof oldSend==="function"){
  wrappedSend=function(...args){return oldSend.apply(this,args);};
  try{proto.send=wrappedSend;}catch(_){wrappedSend=null;}
 }
 function allowed(xhr){
  try{return enabled&&!!pending.get(xhr)&&xhr.readyState===4&&xhr.status===200&&
   /^\s*(?:application\/json|text\/json)\s*(?:;|$)/i.test(xhr.getResponseHeader("content-type")||"");}
  catch(_){return false;}
 }
 if(typeof oldText?.get==="function"&&oldText.configurable){
  wrappedText={
   configurable:true,enumerable:oldText.enumerable,
   get:function(){
    const original=oldText.get.call(this);
    if(!allowed(this)||typeof original!=="string")return original;
    if(!cache.has(this)){
      const updated=rewrite(original,pending.get(this));
      cache.set(this,updated);
      if(updated!==original)reportPrune("xhr-text");
     }
    return cache.get(this);
   }
  };
  try{Object.defineProperty(proto,"responseText",wrappedText);}catch(_){}
 }
 if(typeof oldResponse?.get==="function"&&oldResponse.configurable){
  wrappedResponse={
   configurable:true,enumerable:oldResponse.enumerable,
   get:function(){
    const value=oldResponse.get.call(this);
    if(!allowed(this))return value;
    if(this.responseType==="json"){
      try{if(prune(value,pending.get(this)))reportPrune("xhr-json");}catch(_){}
      return value;
     }
    if((this.responseType===""||this.responseType==="text")&&typeof value==="string"){
     if(!cache.has(this)){
       const updated=rewrite(value,pending.get(this));
       cache.set(this,updated);
       if(updated!==value)reportPrune("xhr-text");
      }
     return cache.get(this);
    }
    return value;
   }
  };
  try{Object.defineProperty(proto,"response",wrappedResponse);}catch(_){}
 }
}
function disable(){
 if(!enabled&&!observationOnly)return;
 const wasEnabled=enabled;
 enabled=false;observationOnly=false;sampleGeneration++;
 if(!wasEnabled)return;
 restoreBootstrapAssignmentHook();
 disablePlayerJSONScriptlet();
 if(wrappedFetch&&g.fetch===wrappedFetch)
  try{g.fetch=oldFetch;}catch(_){}
 const proto=g.XMLHttpRequest?.prototype;
 if(proto){
  if(wrappedOpen&&proto.open===wrappedOpen&&typeof oldOpen==="function")
   try{proto.open=oldOpen;}catch(_){}
  if(wrappedSend&&proto.send===wrappedSend&&typeof oldSend==="function")
   try{proto.send=oldSend;}catch(_){}
  if(oldText&&wrappedText&&Object.getOwnPropertyDescriptor(proto,"responseText")?.get===wrappedText.get)
   try{Object.defineProperty(proto,"responseText",oldText);}catch(_){}
  if(oldResponse&&wrappedResponse&&Object.getOwnPropertyDescriptor(proto,"response")?.get===wrappedResponse.get)
   try{Object.defineProperty(proto,"response",oldResponse);}catch(_){}
 }
 wrappedFetch=null;oldFetch=null;oldOpen=null;oldSend=null;wrappedOpen=null;wrappedSend=null;
 oldText=null;oldResponse=null;wrappedText=null;wrappedResponse=null;
}
function observe(){
 if(observationOnly)return;
 disable();observationOnly=true;
 // Observe mode never mutates player JSON or wraps fetch/XHR.
 reportBootstrap("pre-enable");reportBootstrap("post-enable");
 scheduleBootstrapSamples();
}
// YouTube navigates between regular videos without reloading the extension.
// Retry its current bootstrap immediately and for the next three seconds,
// but never set page properties, install setters or rewrite video streams.
document.addEventListener("yt-navigate-finish",()=>{
 if(enabled){
  pruneExistingBootstrap(false);
  scheduleBootstrapSamples();
 }else if(observationOnly){
  scheduleBootstrapSamples();
 }
},false);
document.addEventListener(EVENT,event=>{
 if(event.detail==="enable")enable();
 else if(event.detail==="observe")observe();
 else if(event.detail==="disable")disable();
},false);
if(typeof Event==="function"&&document.dispatchEvent)
 document.dispatchEvent(new Event("dk-live-block:youtube-response-ready"));
})();
