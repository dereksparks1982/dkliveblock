/* Build 168: bounded, tab-local YouTube experiment modes.
   Does not store browsing history, persist preferences or modify requests. */
(function(root){"use strict";
const MODES=Object.freeze(["combined","response-only","bridge-only","observe","player-pass-through"]);
const MAX_TABS=40,TTL=3600000;
function validSite(host){return typeof host==="string"&&
 (host==="youtube.com"||host.endsWith(".youtube.com")||
  host==="youtube-nocookie.com"||host.endsWith(".youtube-nocookie.com"));}
function get(store,id,host,now=Date.now()){
 if(!Number.isInteger(id)||id<0||!validSite(host))return "combined";
 const entry=store.get(id);
 if(!entry)return "combined";
 if(entry.host!==host||!Number.isFinite(entry.expires)||entry.expires<=now||
    !MODES.includes(entry.mode)){store.delete(id);return "combined";}
 return entry.mode;
}
function set(store,id,host,mode,now=Date.now()){
 if(!Number.isInteger(id)||id<0||!validSite(host)||!MODES.includes(mode)||
    !Number.isFinite(now))return false;
 store.delete(id);
 if(mode==="combined")return true;
 store.set(id,{host,mode,expires:now+TTL});
 if(store.size>MAX_TABS)store.delete(store.keys().next().value);
 return true;
}
function policy(mode,enabled=true){
 const active=enabled===true;
 return Object.freeze({
  response:active&&(mode==="combined"||mode==="response-only"),
  bridge:active&&(mode==="combined"||mode==="bridge-only"),
  observe:active&&(mode==="observe"||mode==="player-pass-through")
 });
}
// Passive observation does not bypass network filtering. A bridge-only
// request remains available even when Firefox has no response-filter API.
function preserveRequest(mode,enabled,canFilter){
 const selected=policy(mode,enabled);
 return selected.bridge||(selected.response&&canFilter===true);
}
// Explicit, per-tab isolation mode: never a general YouTube exception.
 // The background also requires the existing validated POST/player-origin gate.
 const PASS_HOSTS=new Set(["youtube.com","www.youtube.com","m.youtube.com","music.youtube.com"]);
 const PASS_PATHS=new Set(["/youtubei/v1/player","/youtubei/v1/get_watch","/youtubei/v1/resolve_url"]);
 function playerPassThrough(mode,url,enabled=true){
  if(mode!=="player-pass-through"||enabled!==true||typeof url!=="string"||
     url.length>4096)return false;
  try{
   const target=new URL(url);
   return target.protocol==="https:"&&!target.username&&!target.password&&!target.port&&
     PASS_HOSTS.has(target.hostname)&&PASS_PATHS.has(target.pathname);
  }catch(_){return false;}
 }
 const API=Object.freeze({MODES,MAX_TABS,TTL,validSite,get,set,policy,preserveRequest,playerPassThrough});
root.DKYouTubeExperiment=API;
if(typeof module!=="undefined")module.exports=API;
})(typeof globalThis!=="undefined"?globalThis:this);
