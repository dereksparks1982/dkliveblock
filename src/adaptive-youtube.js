/* DK Live Block: locally adaptive, bounded YouTube playback fallback.
   A temporary choice among existing reviewed defenses, never new code,
   never an ad allowance, and never a general website bypass. */
(function(root){"use strict";
const MAX_TABS=40,WINDOW_MS=2*60*1000,MIN_GAP_MS=20000,FALLBACK_MS=10*60*1000;
const BAD=new Set(["buffering","media-error"]);
function validSite(site){return typeof site==="string"&&
 (site==="youtube.com"||site.endsWith(".youtube.com")||
  site==="youtube-nocookie.com"||site.endsWith(".youtube-nocookie.com"));}
function valid(id,site,now){return Number.isInteger(id)&&id>=0&&validSite(site)&&
 Number.isFinite(now)&&now>=0;}
function clear(store,id){store.delete(id);}
function entry(store,id,site,now){
 if(!valid(id,site,now))return null;
 const x=store.get(id);
 if(!x)return null;
 if(x.site!==site||!Number.isFinite(x.last)||now<x.last||
    (x.until&&now>=x.until)||(!x.until&&now-x.first>WINDOW_MS)){
  store.delete(id);return null;
 }
 return x;
}
function mode(store,id,site,now=Date.now()){
 const x=entry(store,id,site,now);
 return x?.until&&now<x.until?"response-only":"combined";
}
function status(store,id,site,now=Date.now()){
 const x=entry(store,id,site,now);
 const active=!!(x?.until&&now<x.until);
 return {active,mode:active?"response-only":"combined",
  expires:active?x.until:0,reason:active?"repeated-playback-failures":""};
}
function note(store,id,site,kind,blockedMediaNearby,now=Date.now()){
 const unchanged={changed:false,mode:mode(store,id,site,now)};
 if(!valid(id,site,now)||!BAD.has(kind)||typeof blockedMediaNearby!=="boolean")
  return unchanged;
 let x=entry(store,id,site,now);
 if(x?.until)return unchanged;
 if(!x||now-x.first>WINDOW_MS){
  x={site,first:now,last:now,count:0,nearby:false,until:0};
 }
 // No repeated fast page signals may generate two independent failures.
 if(x.count&&now-x.last<MIN_GAP_MS)return unchanged;
 x.last=now;x.count++;x.nearby=x.nearby||blockedMediaNearby;
 if(x.count>=2&&x.nearby){
  x.until=now+FALLBACK_MS;
  store.delete(id);store.set(id,x);
  if(store.size>MAX_TABS)store.delete(store.keys().next().value);
  return {changed:true,mode:"response-only",expires:x.until};
 }
 store.delete(id);store.set(id,x);
 if(store.size>MAX_TABS)store.delete(store.keys().next().value);
 return unchanged;
}
const API=Object.freeze({validSite,clear,mode,status,note,
 MAX_TABS,WINDOW_MS,MIN_GAP_MS,FALLBACK_MS});
root.DKAdaptiveYouTube=API;
if(typeof module!=="undefined")module.exports=API;
})(typeof globalThis!=="undefined"?globalThis:this);
