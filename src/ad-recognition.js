/* DK Live Block conservative automatic recognition of unmistakable ad containers.
   Uses local DOM attributes only: no telemetry, network fetches, or page scripts.
   Reversible, bounded and avoids players, authentication, payments, and articles. */
(function(root){"use strict";
const CANDIDATES=[
 "ins.adsbygoogle","amp-ad","amp-auto-ads",
 "[data-ad-client][data-ad-slot]","[data-ad-unit][data-ad-slot]",
 "[id^='div-gpt-ad-']","iframe[id^='google_ads_iframe_']",
 "[data-testid*='ad-slot' i]","[data-testid='advertisement' i]",
 "[data-testid='ad-container' i]","[data-testid='ad-banner' i]",
 "[aria-label='Advertisement' i]","[aria-label='Sponsored advertisement' i]",
 "[aria-label='Ad' i]","[aria-label='Ad slot' i]",
 "[aria-label='Paid advertisement' i]","[class~='ad-slot']"
].join(",");
const EXCLUDED="video, audio, form, input, select, textarea, button, iframe[src*='accounts.google.com'], [role='dialog'], [aria-modal='true'], article, main, [role='main'], [role='navigation'], [id='movie_player'], .html5-video-player, [data-sitekey], [class*='captcha' i]";
const PROTECTED_ANCESTORS="[role='dialog'], [aria-modal='true'], [class*='captcha' i], [id*='captcha' i], form, article, [id='movie_player'], .html5-video-player, [role='navigation'], [role='button']";
function hasStrongSignal(element){
 try{
  const tag=(element.localName||"").toLowerCase();
  const cls=typeof element.className==="string"?element.className:"";
  const id=String(element.id||"");
  const aria=String(element.getAttribute?.("aria-label")||"").trim().toLowerCase();
  if(tag==="amp-ad"||tag==="amp-auto-ads")return true;
  if(tag==="ins"&&/(?:^|\s)adsbygoogle(?:\s|$)/.test(cls))return true;
  if(element.hasAttribute?.("data-ad-client")&&element.hasAttribute?.("data-ad-slot"))return true;
  if(element.hasAttribute?.("data-ad-unit")&&element.hasAttribute?.("data-ad-slot"))return true;
  if(/^div-gpt-ad-[a-z0-9_-]{1,90}$/i.test(id))return true;
  if(tag==="iframe"&&/^google_ads_iframe_[a-z0-9_-]{1,90}$/i.test(id))return true;
  if(/^(?:ad|ad slot|advertisement|paid advertisement|sponsored advertisement)$/.test(aria))return true;
  if(element.hasAttribute?.("data-testid")){
   const testid=String(element.getAttribute("data-testid")||"").toLowerCase();
   if(/\bad-slot\b/.test(testid)||
      ["advertisement","ad-container","ad-banner"].includes(testid))return true;
  }
  if(/(?:^|\s)ad-slot(?:\s|$)/.test(cls))return true;
 }catch(_){}
 return false;
}
function protectedHost(element){
 let el=element;
 for(let depth=0;el&&depth<12;depth++){
  try{
   if(el.closest?.(PROTECTED_ANCESTORS))return true;
   el=el.getRootNode?.()?.host||null;
  }catch(_){return true;}
 }
 return !!el;
}
function focusedWithin(element,document){
 try{
  const active=element.getRootNode?.()?.activeElement;
  if(active&&element.contains?.(active))return true;
  return !!(document?.activeElement&&element.contains?.(document.activeElement));
 }catch(_){return true;}
}
function collectScopes(document){
 if(!document?.querySelectorAll)return [];
 const scopes=[document],queue=[document],seen=new Set([document]);
 let walked=0,shadows=0;
 while(queue.length&&walked<900&&shadows<12){
  const scope=queue.shift(),nodes=[scope.documentElement||scope];
  for(let i=0;i<nodes.length&&walked<900&&shadows<12;i++){
   const el=nodes[i];walked++;
   try{
    const shadow=el?.shadowRoot;
    if(shadow?.mode==="open"&&!seen.has(shadow)){
     seen.add(shadow);scopes.push(shadow);queue.push(shadow);shadows++;
    }
    if(el?.children)for(let j=0;j<el.children.length&&nodes.length<900;j++)
     nodes.push(el.children[j]);
   }catch(_){}
  }
 }
 return scopes;
}
function relevantMutation(record){
 if(!record)return false;
 if(record.type==="attributes"){
  if(!["class","id","data-ad-client","data-ad-slot","data-ad-unit","data-testid","aria-label"].includes(record.attributeName))return false;
  return hasStrongSignal(record.target);
 }
 if(record.type!=="childList")return false;
 let checked=0;
 for(const el of record.addedNodes||[]){
  if(++checked>12)break;
  try{
   if(hasStrongSignal(el)||el?.querySelector?.(CANDIDATES)||
      el?.shadowRoot?.querySelector?.(CANDIDATES))return true;
  }catch(_){}
 }
 return false;
}
function safe(element,document){
 if(!element||element===document.body||element===document.documentElement||element.isConnected===false)return false;
 try{
  if(element.matches?.(EXCLUDED)||element.querySelector?.(EXCLUDED))return false;
  if(protectedHost(element)||focusedWithin(element,document))return false;
  if(element.shadowRoot?.querySelector?.(EXCLUDED))return false;
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
  const groups=[];let count=0;
  for(const scope of collectScopes(document)){
   try{
    const list=scope.querySelectorAll(CANDIDATES);
    if(list.length){groups.push(list);count+=list.length;}
   }catch(_){}
  }
  if(!count){cursor=0;return 0;}
  const byIndex=n=>{
   for(const group of groups){if(n<group.length)return group[n];n-=group.length;}
   return null;
  };
  let inspected=0,removed=0;
  const begin=cursor%count;
  // Fair across regular DOM and open shadow roots, capped at 120 checks.
  while(inspected<Math.min(count,120)&&removed<6){
   const el=byIndex((begin+inspected)%count);inspected++;
   if(!safe(el,document))continue;
   try{
    const tracked=hidden.has(el);
    if(!tracked&&hidden.size>=max)continue;
    if(tracked&&el.style.getPropertyValue("display")==="none"&&
      el.style.getPropertyPriority("display")==="important")continue;
    if(!tracked)hidden.set(el,{value:el.style.getPropertyValue("display"),
      priority:el.style.getPropertyPriority("display")});
    el.style.setProperty("display","none","important");removed++;
   }catch(_){}
  }
  cursor=(begin+Math.max(1,inspected))%count;
  return removed;
 }
 return {scan,restore,prune,get hiddenCount(){return hidden.size;}};
}
const api={create,hasStrongSignal,safe,collectScopes,relevantMutation,CANDIDATES};
root.DKAdRecognition=api;
if(typeof module!=="undefined")module.exports=api;
})(typeof globalThis!=="undefined"?globalThis:this);
