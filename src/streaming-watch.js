/* DK Live Block Build 21: bounded, YouTube-only ad-skip change watcher.
   No media manipulation, playback telemetry, remote code, or subscription bypass. */
(function(root){"use strict";
const PLAYER=".html5-video-player, #movie_player, .ytp-ad-module, .ytp-ad-skip-button-slot, .ytp-ad-skip-button-container";
const SKIP=".ytp-ad-skip-button, .ytp-ad-skip-button-modern, .ytp-skip-ad-button, .ytp-ad-skip-button-slot, .ytp-ad-skip-button-container, button[aria-label='Skip Ad' i], button[aria-label='Skip Ads' i], button[aria-label='Skip Advertisement' i], button[aria-label='Skip Commercial' i], button[aria-label='Skip Commercials' i], button[aria-label='Skip Advertisements' i], button[aria-label='Passer l’annonce' i], button[aria-label='Werbung überspringen' i], button[aria-label='Saltar anuncio' i], button[aria-label='Reklamı geç' i], button[aria-label='Пропустить рекламу'], button[aria-label='تخطي الإعلان'], button[aria-label='跳过广告']";
function elementRelated(node){
 if(!node||node.nodeType!==1)return false;
 try{return !!(node.matches?.(PLAYER+", "+SKIP)||node.closest?.(PLAYER)||node.querySelector?.(SKIP));}
 catch(_){return false;}
}
function relevant(records){
 if(!Array.isArray(records))return false;
 for(const record of records.slice(0,40)){
  if(!record||!record.target)continue;
  if(elementRelated(record.target))return true;
  if(record.type==="childList"){
   // Only examine a bounded number of inserted nodes, never the full page.
   const added=record.addedNodes;
   // A large NodeList must NOT be copied just to inspect its first 12 nodes.
   const count=Math.min(12,Number.isSafeInteger(added?.length)?added.length:0);
   for(let i=0;i<count;i++)if(elementRelated(added[i]))return true;
  }
 }
 return false;
}
function create(document,scan,enabled,options={}){
 const Observer=options.MutationObserver||root.MutationObserver;
 const later=options.setTimeout||root.setTimeout;
 const cancel=options.clearTimeout||root.clearTimeout;
 const delay=Number.isFinite(options.delay)&&options.delay>=0?Math.min(1000,options.delay):120;
 let observer=null,timer=null,running=false;
 function clear(){if(timer!==null){cancel(timer);timer=null;}}
 function schedule(wait=delay){
  if(!running||!enabled()||timer!==null||typeof later!=="function")return false;
  timer=later(()=>{
   timer=null;
   if(running&&enabled())try{scan();}catch(_){/* The page must remain usable. */}
  },wait);
  return true;
 }
 function start(){
  if(running)return true;
  if(!document?.documentElement||typeof Observer!=="function"||typeof scan!=="function"||!enabled())return false;
  try{
   const instance=new Observer(records=>{if(relevant(records))schedule();});
   instance.observe(document.documentElement,{
    childList:true,subtree:true,attributes:true,
    attributeFilter:["class","style","hidden","aria-hidden","aria-disabled","aria-label","disabled","title"]
   });
   observer=instance;running=true;schedule(0);return true;
  }catch(_){observer?.disconnect?.();observer=null;running=false;clear();return false;}
 }
 function stop(){running=false;clear();observer?.disconnect?.();observer=null;}
 function poke(){return schedule(0);}
 return {start,stop,poke,get running(){return running;}};
}
const api={create,relevant,elementRelated};
root.DKStreamingWatch=api;
if(typeof module!=="undefined")module.exports=api;
})(typeof globalThis!=="undefined"?globalThis:this);
