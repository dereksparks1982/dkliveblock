/* DK Live Block conservative automatic recognition of unmistakable ad containers.
   Uses local DOM attributes only: no telemetry, network fetches, or page scripts.
   Reversible, bounded and avoids players, authentication, payments, and articles. */
(function(root){"use strict";
const YOUTUBE_AD_TAGS=new Set(["ytd-ad-slot-renderer","ytd-display-ad-renderer",
 "ytd-in-feed-ad-layout-renderer","ytd-promoted-sparkles-web-renderer",
 "ytd-promoted-video-renderer","ytm-promoted-video-renderer"]);
const CANDIDATES=[
 "ins.adsbygoogle","amp-ad","amp-auto-ads",
 ...YOUTUBE_AD_TAGS,
 "[data-ad-client][data-ad-slot]","[data-ad-unit][data-ad-slot]",
 "[data-google-query-id]",
 "[id^='div-gpt-ad-']","iframe[id^='google_ads_iframe_']",
 "iframe[name^='google_ads_iframe_']",
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
  if(tag==="amp-ad"||tag==="amp-auto-ads"||YOUTUBE_AD_TAGS.has(tag))return true;
  if(tag==="ins"&&/(?:^|\s)adsbygoogle(?:\s|$)/.test(cls))return true;
  if(element.hasAttribute?.("data-ad-client")&&element.hasAttribute?.("data-ad-slot"))return true;
  if(element.hasAttribute?.("data-ad-unit")&&element.hasAttribute?.("data-ad-slot"))return true;
  if(element.hasAttribute?.("data-google-query-id"))return true;
  if(/^div-gpt-ad-[a-z0-9_-]{1,90}$/i.test(id))return true;
  if(tag==="iframe"&&/^google_ads_iframe_[a-z0-9_\/-]{1,140}$/i.test(id))return true;
  if(tag==="iframe"&&/^google_ads_iframe_[a-z0-9_\/-]{1,140}$/i.test(
   String(element.getAttribute?.("name")||"")))return true;
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
function relevantMutation(record,siteHost=""){
 if(!record)return false;
 if(record.type==="attributes"){
  if((siteHost==="facebook.com"||siteHost.endsWith(".facebook.com"))&&
     record.attributeName==="aria-labelledby")return true;
  if(!["class","id","name","data-ad-client","data-ad-slot","data-ad-unit","data-google-query-id","data-testid","aria-label"].includes(record.attributeName))return false;
  return hasStrongSignal(record.target);
 }
 if(record.type!=="childList")return false;
 // Limit DOM work to 12 indexed nodes, never invoke an untrusted iterator.
 const items=record.addedNodes;
 const count=Math.min(12,Number.isSafeInteger(items?.length)?items.length:0);
 for(let i=0;i<count;i++){
  let el;try{el=items[i];}catch(_){continue;}
  try{
   if((siteHost==="xnxx.com"||siteHost.endsWith(".xnxx.com"))&&
      (el?.matches?.('a[href*="xnxx.gold"]')||
       el?.querySelector?.('a[href*="xnxx.gold"]')))return true;
   if((siteHost==="facebook.com"||siteHost.endsWith(".facebook.com"))&&
      (el?.matches?.('[role="article"],[aria-posinset],[role="complementary"],[aria-labelledby]')||
       el?.querySelector?.('[role="article"],[aria-posinset],[aria-labelledby]')||
       /^(ad|sponsored)$/i.test(String(el?.textContent||"").trim())))return true;
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

// Some sites render their own commercial sidebar as ordinary page markup,
// with no ad classes, third-party ad script or network request to block.
// Only recognize the exact owner-observed cam promotion on this one site.
function sitePromotionCandidates(document,window){
 try{
  const hostname=String(window?.location?.hostname||document?.location?.hostname||"").toLowerCase();
  if(hostname!=="xnxx.com"&&!hostname.endsWith(".xnxx.com"))return [];
  const viewport=Number(window?.innerWidth)||0;
  if(viewport<600||!document?.querySelectorAll)return [];
  const headings=document.querySelectorAll("h2,h3,h4,h5,h6,header,strong,div,span");
  const count=Math.min(2400,headings.length||0);
  let examined=0;
  for(let i=0;i<count;i++){
   const heading=headings[i];
   if(!heading||typeof heading.textContent!=="string")continue;
   const title=heading.textContent.trim().replace(/\s+/g," ").toLowerCase();
   if(title!=="chat with live girls")continue;
   let node=heading.parentElement,selected=null;
   for(let depth=0;node&&depth<7;depth++,node=node.parentElement){
    if(node===document.body||node===document.documentElement)break;
    const rect=node.getBoundingClientRect?.();
    if(!rect||!Number.isFinite(rect.width)||!Number.isFinite(rect.left)||
       !Number.isFinite(rect.height)||rect.width<180||rect.width>Math.min(560,viewport*.48)||
       rect.left<viewport*.48||rect.height<140||rect.height>2200)continue;
    if(node.querySelector?.("main,article,form,video[controls],.html5-video-player,#movie_player,#player,[role='main']"))continue;
    const label=typeof node.textContent==="string"?node.textContent:"";
    if(label.length>5000)continue;
    const clips=node.querySelectorAll?.("img,video")?.length||0;
    // Require the label AND a multi-preview commercial panel, not a
    // heading in an article, player, or another site navigation widget.
    if(clips>=2&&(/click to see more/i.test(label)||/cam girls/i.test(label)||clips>=4))
     selected=node;
    examined++;
   }
   if(selected?.isConnected!==false&&selected?.style?.setProperty&&selected?.getClientRects?.().length)
    return [selected];
  }
 }catch(_){}
 return [];
}

function xnxxGoldCandidates(document,window){
 try{
  const host=String(window?.location?.hostname||document?.location?.hostname||"").toLowerCase();
  if(host!=="xnxx.com"&&!host.endsWith(".xnxx.com"))return [];
  const viewport=Number(window?.innerWidth)||0;
  if(viewport<600)return [];
  const anchors=document.querySelectorAll?.('a[href*="xnxx.gold"]')||[];
  for(let i=0;i<Math.min(60,anchors.length);i++){
   const a=anchors[i];let url;
   try{url=new URL(String(a.getAttribute?.("href")||""),"https://www.xnxx.com");}catch(_){continue;}
   if(!["http:","https:"].includes(url.protocol)||!["xnxx.gold","www.xnxx.gold"].includes(url.hostname))continue;
   let node=a;
   for(let d=0;d<5&&node;d++,node=node.parentElement){
    if(node===document.body||node===document.documentElement)break;
    const text=String(node.textContent||"").replace(/\s+/g," ").trim().toLowerCase();
    if(!/^try xnxx\.gold\.? ad-free experience with extra content and features\.?$/.test(text))continue;
    if(node.querySelector?.("video,audio,iframe,form,main,article,nav,[role='main'],#player"))continue;
    const r=node.getBoundingClientRect?.();
    if(!r||r.top<0||r.top>260||r.height<22||r.height>110||
       r.width<viewport*.55||r.width>viewport*1.05)continue;
    if(!node.style?.setProperty||!node.getClientRects?.().length)continue;
    return [node];
   }
  }
 }catch(_){}
 return [];
}

function create(document,window,limit=60){
 const hidden=new Map(),max=Math.max(1,Math.min(100,limit));
 let cursor=0,allowed=[];
 function allowedElement(el){
  for(const selector of allowed){
   try{if(el.matches?.(selector)||el.closest?.(selector))return true;}catch(_){}
  }
  return false;
 }
 function restoreOne(el,old){
  try{
   if(!el.isConnected||el.style.getPropertyValue("display")!=="none"||
      el.style.getPropertyPriority("display")!=="important")return;
   if(old.value)el.style.setProperty("display",old.value,old.priority);
   else el.style.removeProperty("display");
  }catch(_){}
 }
 function setExceptions(selectors){
  allowed=Array.isArray(selectors)?[...new Set(selectors.slice(0,120).filter(s=>
   typeof s==="string"&&s.length>0&&s.length<=240&&s===s.trim()&&
   !/[\r\n{};]/.test(s)))]:[];
  for(const [el,old] of hidden){
   if(allowedElement(el)){restoreOne(el,old);hidden.delete(el);}
  }
 }
 function restore(){
  for(const [el,old] of hidden)restoreOne(el,old);
  hidden.clear();cursor=0;
 }
 function prune(){for(const el of hidden.keys())if(!el.isConnected)hidden.delete(el);}
 function scan(){
  if(!document?.querySelectorAll)return 0;
  prune();
  let removed=0;
  function hide(el){
   if(!el||allowedElement(el)||el.isConnected===false||!el.style?.setProperty||!el.getClientRects?.().length)return false;
   try{
    const tracked=hidden.has(el);
    if(!tracked&&hidden.size>=max)return false;
    if(tracked&&el.style.getPropertyValue("display")==="none"&&
      el.style.getPropertyPriority("display")==="important")return false;
    hidden.set(el,{value:el.style.getPropertyValue("display"),
      priority:el.style.getPropertyPriority("display")});
    el.style.setProperty("display","none","important");removed++;return true;
   }catch(_){return false;}
  }
  for(const promo of sitePromotionCandidates(document,window))hide(promo);
  for(const promo of xnxxGoldCandidates(document,window))hide(promo);
  const groups=[];let count=0;
  for(const scope of collectScopes(document)){
   try{
    const list=scope.querySelectorAll(CANDIDATES);
    if(list.length){groups.push(list);count+=list.length;}
   }catch(_){}
  }
  if(!count){cursor=0;return removed;}
  const byIndex=n=>{
   for(const group of groups){if(n<group.length)return group[n];n-=group.length;}
   return null;
  };
  let inspected=0;
  const begin=cursor%count;
  // Fair across regular DOM and open shadow roots, capped at 120 checks.
  while(inspected<Math.min(count,120)&&removed<6){
   const el=byIndex((begin+inspected)%count);inspected++;
   if(!safe(el,document)||allowedElement(el))continue;
   hide(el);
  }
  cursor=(begin+Math.max(1,inspected))%count;
  return removed;
 }
 return {scan,restore,prune,setExceptions,get hiddenCount(){return hidden.size;}};
}
const api={create,hasStrongSignal,safe,collectScopes,relevantMutation,sitePromotionCandidates,xnxxGoldCandidates,CANDIDATES};
root.DKAdRecognition=api;
if(typeof module!=="undefined")module.exports=api;
})(typeof globalThis!=="undefined"?globalThis:this);
