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
function pruneObject(x){
 if(!playable(x)||x.playabilityStatus?.status&&x.playabilityStatus.status!=="OK")return 0;
 let removed=0;
 for(const field of AD_FIELDS){
  if(Object.prototype.hasOwnProperty.call(x,field)&&
     (Array.isArray(x[field])||plain(x[field]))){delete x[field];removed++;}
 }
 return removed;
}
function prune(x){
 if(!plain(x))return false;
 let removed=pruneObject(x);
 if(plain(x.playerResponse))removed+=pruneObject(x.playerResponse);
 return removed>0;
}
function rewrite(text){
 if(typeof text!=="string"||text.length>MAX||text.length<2)return text;
 const prefix=text.startsWith(")]}'\n")?")]}'\n":"";
 let obj;try{obj=JSON.parse(prefix?text.slice(prefix.length):text);}catch(_){return text;}
 return prune(obj)?prefix+JSON.stringify(obj):text;
}
function target(raw){
 try{
  const u=new URL(String(raw),location.href);
  if(u.protocol!=="https:"||u.username||u.password||
     !/(^|\.)youtube\.com$/.test(u.hostname))return false;
  return u.pathname==="/youtubei/v1/player"||u.pathname==="/youtubei/v1/get_watch";
 }catch(_){return false;}
}
function eligible(method,url){return enabled&&String(method||"GET").toUpperCase()==="POST"&&target(url);}
function jsonType(response){
 try{return /^\s*(?:application\/json|text\/json)\s*(?:;|$)/i.test(
  typeof response?.headers?.get==="function"?response.headers.get("content-type")||"":"");}
 catch(_){return false;}
}
function decorate(response){
 if(!response||response.status!==200||!jsonType(response)||decorated.has(response))return response;
 decorated.add(response);
 try{
  const json=response.json,text=response.text,clone=response.clone;
  if(typeof json==="function")Object.defineProperty(response,"json",{
   configurable:true,value:function(...args){
    return Promise.resolve(json.apply(this,args)).then(data=>{if(enabled)prune(data);return data;});
   }
  });
  if(typeof text==="function")Object.defineProperty(response,"text",{
   configurable:true,value:function(...args){
    return Promise.resolve(text.apply(this,args)).then(body=>enabled?rewrite(body):body);
   }
  });
  if(typeof clone==="function")Object.defineProperty(response,"clone",{
   configurable:true,value:function(...args){return decorate(clone.apply(this,args));}
  });
 }catch(_){/* If a response is locked or non-extensible, leave it untouched. */}
 return response;
}
function enable(){
 if(enabled)return;enabled=true;
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
   return eligibleNow?Promise.resolve(result).then(decorate):result;
  };
  g.fetch=wrappedFetch;
 }
 const proto=g.XMLHttpRequest?.prototype;
 if(!proto)return;
 oldOpen=proto.open;oldSend=proto.send;
 oldResponse=Object.getOwnPropertyDescriptor(proto,"response");
 oldText=Object.getOwnPropertyDescriptor(proto,"responseText");
 if(typeof oldOpen==="function"){
  wrappedOpen=function(method,url,...rest){
   const result=oldOpen.call(this,method,url,...rest);
   pending.set(this,eligible(method,url));cache.delete(this);return result;
  };
  proto.open=wrappedOpen;
 }
 if(typeof oldSend==="function"){
  wrappedSend=function(...args){return oldSend.apply(this,args);};
  proto.send=wrappedSend;
 }
 function allowed(xhr){
  try{return enabled&&pending.get(xhr)===true&&xhr.readyState===4&&xhr.status===200&&
   /^\s*(?:application\/json|text\/json)\s*(?:;|$)/i.test(xhr.getResponseHeader("content-type")||"");}
  catch(_){return false;}
 }
 if(typeof oldText?.get==="function"&&oldText.configurable){
  wrappedText={
   configurable:true,enumerable:oldText.enumerable,
   get:function(){
    const original=oldText.get.call(this);
    if(!allowed(this)||typeof original!=="string")return original;
    if(!cache.has(this))cache.set(this,rewrite(original));
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
    if(this.responseType==="json"){prune(value);return value;}
    if((this.responseType===""||this.responseType==="text")&&typeof value==="string"){
     if(!cache.has(this))cache.set(this,rewrite(value));
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
 if(wrappedFetch&&g.fetch===wrappedFetch)g.fetch=oldFetch;
 const proto=g.XMLHttpRequest?.prototype;
 if(proto){
  if(proto.open===wrappedOpen&&typeof oldOpen==="function")proto.open=oldOpen;
  if(proto.send===wrappedSend&&typeof oldSend==="function")proto.send=oldSend;
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
})();
