/* DK Live Block: locally adaptive, bounded YouTube playback fallback.
   A temporary choice among existing reviewed defenses, never new code,
   never an ad allowance, and never a general website bypass. */
(function(root){"use strict";
const MAX_TABS=40,WINDOW_MS=2*60*1000,MIN_GAP_MS=20000,FALLBACK_MS=10*60*1000;
const BAD=new Set(["buffering","media-error"]);
const REFUSAL_MS=10*60*1000;
const CONTEXT=new Set(["enforcement","ad-skip","ad-showing"]);
const Model=typeof root.DKAdaptiveModel!=="undefined"?root.DKAdaptiveModel:
 typeof require==="function"?require("./adaptive-model.js"):null;
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
    (x.refusalUntil?now>=x.refusalUntil:
     (x.until&&now>=x.until)||(!x.until&&now-x.first>WINDOW_MS))){
  store.delete(id);return null;
 }
 return x;
}
function mode(store,id,site,now=Date.now()){
 const x=entry(store,id,site,now);
 return x?.refusalUntil&&now<x.refusalUntil?"player-pass-through":
  x?.until&&now<x.until?"response-only":"combined";
}
function status(store,id,site,now=Date.now()){
 const x=entry(store,id,site,now);
 const active=!!(x?.until&&now<x.until);
 const refused=!!(x?.refusalUntil&&now<x.refusalUntil);
 return {active:active||refused,mode:refused?"player-pass-through":active?"response-only":"combined",
  expires:refused?x.refusalUntil:active?x.until:0,
  reason:refused?"observed-youtube-playback-refusal":active?"repeated-playback-failures":""};
}
// One short-lived retry on an observed in-player refusal. The browser
// keeps its ordinary network ad filters; only the two player JSON rewrite
// paths are disabled for this tab. No site-wide allowlist is introduced.
function recoverRefusal(store,id,site,now=Date.now()){
 if(!valid(id,site,now))return {changed:false};
 const old=entry(store,id,site,now);
 if(old?.refusalUntil&&old.refusalUntil>now)return {changed:false};
 const x=old||{site,first:now,last:now,count:0,nearby:false,until:0,
  sawMediaError:false,sawBuffering:false,sawEnforcement:false,
  sawAdSkip:false,sawAdShowing:false};
 x.last=now;x.until=0;x.refusalUntil=now+REFUSAL_MS;x.sawEnforcement=true;
 store.delete(id);store.set(id,x);
 if(store.size>MAX_TABS)store.delete(store.keys().next().value);
 return {changed:true,mode:"player-pass-through",expires:x.refusalUntil};
}
function note(store,id,site,kind,blockedMediaNearby,now=Date.now()){
 const unchanged={changed:false,mode:mode(store,id,site,now)};
 if(!valid(id,site,now)||(!BAD.has(kind)&&!CONTEXT.has(kind))||
    typeof blockedMediaNearby!=="boolean")return unchanged;
 let x=entry(store,id,site,now);
 if(x?.until||x?.refusalUntil)return unchanged;
 if(!x||now-x.first>WINDOW_MS){
  x={site,first:now,last:now,count:0,nearby:false,until:0,
   sawMediaError:false,sawBuffering:false,sawEnforcement:false,
   sawAdSkip:false,sawAdShowing:false};
 }
 // Contextual observations suppress inappropriate fallback suggestions.
 // They NEVER count as failures or cause additional blocking.
 if(CONTEXT.has(kind)){
  if(kind==="enforcement")x.sawEnforcement=true;
  if(kind==="ad-skip")x.sawAdSkip=true;
  if(kind==="ad-showing")x.sawAdShowing=true;
  x.last=now;store.delete(id);store.set(id,x);
  if(store.size>MAX_TABS)store.delete(store.keys().next().value);
  return unchanged;
 }
 // No repeated fast page signals may generate two independent failures.
 if(x.count&&now-x.last<MIN_GAP_MS)return unchanged;
 x.last=now;x.count++;x.nearby=x.nearby||blockedMediaNearby;
 x.sawMediaError=x.sawMediaError||kind==="media-error";
 x.sawBuffering=x.sawBuffering||kind==="buffering";
 if(x.count>=2&&x.nearby&&!x.sawEnforcement&&!x.sawAdSkip&&
    !x.sawAdShowing){
  const prediction=Model?.predict?.({
   faultCount:Math.min(x.count,3),blockedMediaEvidence:x.nearby,
   sawMediaError:x.sawMediaError,sawBuffering:x.sawBuffering,
   sawEnforcement:x.sawEnforcement,sawAdSkip:x.sawAdSkip,
   sawAdShowing:x.sawAdShowing
  });
  // Safety gate is always authoritative; model can only veto a fallback,
  // never grant permission to bypass network filtering or download scripts.
  if(prediction?.recommendation==="response-only"&&
     Number.isFinite(prediction.score)&&prediction.score>=Model.THRESHOLD){
   x.until=now+FALLBACK_MS;
   store.delete(id);store.set(id,x);
   if(store.size>MAX_TABS)store.delete(store.keys().next().value);
   return {changed:true,mode:"response-only",expires:x.until};
  }
 }
 store.delete(id);store.set(id,x);
 if(store.size>MAX_TABS)store.delete(store.keys().next().value);
 return unchanged;
}
const API=Object.freeze({validSite,clear,mode,status,note,recoverRefusal,
 MAX_TABS,WINDOW_MS,MIN_GAP_MS,FALLBACK_MS,REFUSAL_MS});
root.DKAdaptiveYouTube=API;
if(typeof module!=="undefined")module.exports=API;
})(typeof globalThis!=="undefined"?globalThis:this);
