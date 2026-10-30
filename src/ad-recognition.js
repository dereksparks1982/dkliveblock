/* DK Live Block conservative automatic recognition of unmistakable ad containers.
   Uses local DOM attributes only: no telemetry, network fetches, or page scripts.
   Reversible, bounded and avoids players, authentication, payments, and articles. */
(function(root){"use strict";
const CANDIDATES=[
 "ins.adsbygoogle","[data-ad-client][data-ad-slot]","[data-ad-unit][data-ad-slot]",
 "[id^='div-gpt-ad-']","iframe[id^='google_ads_iframe_']",
 "[data-testid*='ad-slot' i]","[data-testid='advertisement' i]",
 "[aria-label='Advertisement' i]","[aria-label='Sponsored advertisement' i]",
 "[aria-label='Ad' i]","[class~='ad-slot']"
].join(",");
const EXCLUDED="video, audio, form, input, select, textarea, button, iframe[src*='accounts.google.com'], [role='dialog'], [aria-modal='true'], article, main, [role='main'], [role='navigation'], [id='movie_player'], .html5-video-player, [data-sitekey], [class*='captcha' i]";
const PROTECTED_ANCESTORS="[role='dialog'], [aria-modal='true'], [class*='captcha' i], [id*='captcha' i], form, article, [id='movie_player'], .html5-video-player, [role='navigation'], [role='button']";
function hasStrongSignal(element){
 try{
  const tag=(element.localName||"").toLowerCase();
  const cls=typeof element.className==="string"?element.className:"";
  const id=String(element.id||"");
  const aria=String(element.getAttribute?.("aria-label")||"").trim().toLowerCase();
  if(tag==="ins"&&/(?:^|\s)adsbygoogle(?:\s|$)/.test(cls))return true;
  if(element.hasAttribute?.("data-ad-client")&&element.hasAttribute?.("data-ad-slot"))return true;
  if(element.hasAttribute?.("data-ad-unit")&&element.hasAttribute?.("data-ad-slot"))return true;
  if(/^div-gpt-ad-[a-z0-9_-]{1,90}$/i.test(id))return true;
  if(tag==="iframe"&&/^google_ads_iframe_[a-z0-9_-]{1,90}$/i.test(id))return true;
  if(/^(?:ad|advertisement|sponsored advertisement)$/.test(aria))return true;
  if(element.hasAttribute?.("data-testid")&&
     (/\bad-slot\b/i.test(element.getAttribute("data-testid"))||
      element.getAttribute("data-testid").toLowerCase()==="advertisement"))return true;
  if(/(?:^|\s)ad-slot(?:\s|$)/.test(cls))return true;
 }catch(_){}
 return false;
}
function safe(element,document){
 if(!element||element===document.body||element===document.documentElement||element.isConnected===false)return false;
 try{
  if(element.matches?.(EXCLUDED)||element.querySelector?.(EXCLUDED))return false;
  if(element.closest?.(PROTECTED_ANCESTORS))return false;
  if(typeof DKAuthProtection!=="undefined"&&DKAuthProtection.isIdentityUI(element,""))return false;
  if(typeof DKVideoAssist!=="undefined"&&DKVideoAssist.playerElement(element))return false;
  if(!hasStrongSignal(element))return false;
  if(!element.style?.setProperty||!element.getClientRects?.().length)return false;
 }catch(_){return false;}
 return true;
}
function create(document,window,limit=60){
 const hidden=new Map(),max=Math.max(1,Math.min(100,limit));
 let cursor=0;
 function restore(){
  for(const [el,old] of hidden){
   try{
    if(!el.isConnected||el.style.getPropertyValue("display")!=="none"||
       el.style.getPropertyPriority("display")!=="important")continue;
    if(old.value)el.style.setProperty("display",old.value,old.priority);
    else el.style.removeProperty("display");
   }catch(_){}
  }
  hidden.clear();cursor=0;
 }
 function prune(){for(const el of hidden.keys())if(!el.isConnected)hidden.delete(el);}
 function scan(){
  if(!document?.querySelectorAll)return 0;
  prune();
  let list;try{list=document.querySelectorAll(CANDIDATES);}catch(_){return 0;}
  const count=list.length||0;
  if(!count)return 0;
  let inspected=0,removed=0;
  // Rotate the starting index so large, long-lived pages don't repeatedly
  // inspect the same initial candidates and starve later ad insertions.
  const begin=cursor%count;
  while(inspected<Math.min(count,120)&&removed<6&&hidden.size<max){
   const el=list[(begin+inspected)%count];inspected++;
   if(!safe(el,document))continue;
   try{
    if(!hidden.has(el))hidden.set(el,{value:el.style.getPropertyValue("display"),
     priority:el.style.getPropertyPriority("display")});
    if(el.style.getPropertyValue("display")==="none"&&
       el.style.getPropertyPriority("display")==="important")continue;
    el.style.setProperty("display","none","important");removed++;
   }catch(_){}
  }
  cursor=(begin+Math.max(1,inspected))%count;
  return removed;
 }
 return {scan,restore,prune,get hiddenCount(){return hidden.size;}};
}
const api={create,hasStrongSignal,safe,CANDIDATES};
root.DKAdRecognition=api;
if(typeof module!=="undefined")module.exports=api;
})(typeof globalThis!=="undefined"?globalThis:this);
