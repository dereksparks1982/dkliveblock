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
const pending=new WeakMap(),cache=new WeakMap(),decorated=new WeakSet();
function plain(x){return !!x&&typeof x==="object"&&!Array.isArray(x);}
function playable(x){return plain(x)&&(
 plain(x.streamingData)||plain(x.videoDetails)||plain(x.playerResponse));}
function safeToPrune(x){
 if(!playable(x))return true;
 if(x.playabilityStatus?.status&&x.playabilityStatus.status!=="OK")return true;
 for(const field of AD_FIELDS){
  if(!Object.prototype.hasOwnProperty.call(x,field)||
    !(Array.isArray(x[field])||plain(x[field])))continue;
  if(!Object.getOwnPropertyDescriptor(x,field)?.configurable)return false;
 }
 return true;
}
function pruneObject(x){
 if(!playable(x)||x.playabilityStatus?.status&&x.playabilityStatus.status!=="OK")return 0;
 let removed=0;
 const fields=AD_FIELDS.filter(field=>
  Object.prototype.hasOwnProperty.call(x,field)&&
  (Array.isArray(x[field])||plain(x[field])));
 // A frozen/non-configurable player payload must not break fetch().json().
 for(const field of fields)if(!Object.getOwnPropertyDescriptor(x,field)?.configurable)
  return 0;
 for(const field of fields){delete x[field];removed++;}
 return removed;
}
function prune(x,url=""){
 if(plain(x)&&x.playabilityStatus?.status&&x.playabilityStatus.status!=="OK")
  return false;
 if(url&&typeof DKYouTubeFeed!=="undefined"&&DKYouTubeFeed.kind(url))
  return DKYouTubeFeed.prune(x,url).changed;
 if(!plain(x))return false;
 // Preflight nested and outer objects before deleting any ad property.
 // Otherwise a non-configurable nested field can leave only the outer
 // structure modified, and break playback data consistency.
 if(!safeToPrune(x))return false;
 if(plain(x.playerResponse)&&!safeToPrune(x.playerResponse))return false;
 if(typeof x.playerResponse==="string"&&x.playerResponse.length<=MAX/2){
  const desc=Object.getOwnPropertyDescriptor(x,"playerResponse");
  if(desc&&!desc.writable)return false;
 }
 let removed=pruneObject(x);
 if(plain(x.playerResponse))removed+=pruneObject(x.playerResponse);
 else if(typeof x.playerResponse==="string"&&x.playerResponse.length<=MAX/2){
  try{
   const child=JSON.parse(x.playerResponse),count=pruneObject(child);
   if(count){x.playerResponse=JSON.stringify(child);removed+=count;}
  }catch(_){}
 }
 return removed>0;
}
function rewrite(text,url=""){
 if(url&&typeof DKYouTubeFeed!=="undefined"&&DKYouTubeFeed.kind(url))
  return DKYouTubeFeed.rewrite(url,text).text;
 if(typeof text!=="string"||text.length>MAX||text.length<2)return text;
 const prefix=text.startsWith(")]}'\n")?")]}'\n":"";
 let obj;try{obj=JSON.parse(prefix?text.slice(prefix.length):text);}catch(_){return text;}
 try{return prune(obj)?prefix+JSON.stringify(obj):text;}
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
    return Promise.resolve(json.apply(this,args)).then(data=>{if(enabled)try{prune(data,requestURL);}catch(_){}return data;});
   }
  });
  if(typeof text==="function")Object.defineProperty(response,"text",{
   configurable:true,value:function(...args){
    return Promise.resolve(text.apply(this,args)).then(body=>{try{return enabled?rewrite(body,requestURL):body;}catch(_){return body;}});
   }
  });
  if(typeof clone==="function")Object.defineProperty(response,"clone",{
   configurable:true,value:function(...args){const result=clone.apply(this,args);return result===this?result:decorate(result,requestURL);}
  });
 }catch(_){/* If a response is locked or non-extensible, leave it untouched. */}
 return response;
}
function pruneExistingBootstrap(){
 // A data property already loaded by YouTube may still be consumed during
 // navigation. Do not replace an accessor, intercept an assignment, or touch
 // unrelated initial page data.
 try{
  const own=Object.getOwnPropertyDescriptor(g,"ytInitialPlayerResponse");
  if(own&&Object.prototype.hasOwnProperty.call(own,"value")&&plain(own.value))
   prune(own.value);
  const initial=Object.getOwnPropertyDescriptor(g,"ytInitialData");
  if(initial&&Object.prototype.hasOwnProperty.call(initial,"value")&&plain(initial.value)&&
     typeof DKYouTubeFeed!=="undefined")
   DKYouTubeFeed.prune(initial.value,"https://www.youtube.com/youtubei/v1/browse");
 }catch(_){} 
}
function enable(){
 if(enabled){
  // On SPA navigation YouTube may replace bootstrap data without a reload.
  // Reprocess on an explicit refresh, but do not install a second hook.
  pruneExistingBootstrap();
  return;
 }
 enabled=true;
 pruneExistingBootstrap();
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
    if(!cache.has(this))cache.set(this,rewrite(original,pending.get(this)));
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
    if(this.responseType==="json"){try{prune(value,pending.get(this));}catch(_){}return value;}
    if((this.responseType===""||this.responseType==="text")&&typeof value==="string"){
     if(!cache.has(this))cache.set(this,rewrite(value,pending.get(this)));
     return cache.get(this);
    }
    return value;
   }
  };
  try{Object.defineProperty(proto,"response",wrappedResponse);}catch(_){}
 }
}
function disable(){
 if(!enabled)return;enabled=false;
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
document.addEventListener(EVENT,event=>{
 if(event.detail==="enable")enable();
 else if(event.detail==="disable")disable();
},false);
if(typeof Event==="function"&&document.dispatchEvent)
 document.dispatchEvent(new Event("dk-live-block:youtube-response-ready"));
})();
