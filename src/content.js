"use strict";
/* DK Live Block page-side cleanup. No stream rewriting, no remote scripts. */
(function(){
 let active=false,css="",youtubeSkip=true,cookieReject=false,antiAdblock=true,style=null,picking=false,selected=null,banner=null,procedural=[],lastProc=0,lastAnti=0;
 const clickedRejectButtons=new WeakSet();
 const hidden=new Map(),antiHidden=new Map(),scrollUnlocks=new Map();
 const host=location.hostname.toLowerCase(),isYouTube=host==="youtube.com"||host.endsWith(".youtube.com");
 function applyCSS(){
  if(!document.documentElement)return;
  if(!active||!css){style?.remove();style=null;return;}
  if(!style||!style.isConnected){style=document.createElement("style");style.id="dk-live-block-style";document.documentElement.appendChild(style);}
  if(style.textContent!==css)style.textContent=css;
 }
 async function refresh(){
  try{const s=await browser.runtime.sendMessage({action:"getStyle",url:location.href});
   active=!!s.active;css=s.css||"";youtubeSkip=!!s.youtubeSkip;cookieReject=!!s.cookieReject;antiAdblock=!!s.antiAdblock;procedural=Array.isArray(s.procedural)?s.procedural:[];restoreHidden();restoreAntiHidden();applyCSS();
  }catch(_){/* A broken extension must not break the page. */}
 }
 function restoreHidden(){
  for(const [el,old] of hidden){try{if(el.isConnected)el.style.setProperty("display",old.value,old.priority);}catch(_){}}
  hidden.clear();
 }
 function hideProcedural(){
  if(!active||!procedural.length)return;
  for(const rule of procedural.slice(0,50)){
   let elements;try{elements=document.querySelectorAll(rule.selector);}catch(_){continue;}
   let count=0;
   for(const el of elements){if(++count>200)break;
    if(el===document.body||el===document.documentElement||!DKProcedural.matches(el,rule))continue;
    if(!hidden.has(el))hidden.set(el,{value:el.style.getPropertyValue("display"),priority:el.style.getPropertyPriority("display")});
    el.style.setProperty("display","none","important");if(hidden.size>800)break;
   }
   if(hidden.size>800)break;
  }
  for(const el of hidden.keys())if(!el.isConnected)hidden.delete(el);
 }
 function restoreAntiHidden(){
  for(const [el,prior] of antiHidden){
   try{
    if(!el.isConnected)continue;
    if(prior.value)el.style.setProperty("display",prior.value,prior.priority);
    else el.style.removeProperty("display");
   }catch(_){}
  }
  antiHidden.clear();
  for(const [el,prior] of scrollUnlocks){
   try{
    if(!el.isConnected)continue;
    if(prior.value)el.style.setProperty("overflow-y",prior.value,prior.priority);
    else el.style.removeProperty("overflow-y");
   }catch(_){}
  }
  scrollUnlocks.clear();
 }
 function unlockScrollAfterNotice(){
  if(document.fullscreenElement||!document.documentElement)return;
  if(document.documentElement.scrollHeight<=window.innerHeight+80)return;
  for(const el of [document.documentElement,document.body]){
   if(!el||scrollUnlocks.has(el))continue;
   const overflow=window.getComputedStyle(el).overflowY;
   if(overflow!=="hidden"&&overflow!=="clip")continue;
   scrollUnlocks.set(el,{value:el.style.getPropertyValue("overflow-y"),priority:el.style.getPropertyPriority("overflow-y")});
   el.style.setProperty("overflow-y","auto","important");
  }
 }
 function suppressAntiAdblockNotices(){
  if(!active||!antiAdblock||picking||!document.body)return;
  const selector=[
   "dialog[open]","[role='dialog']","[aria-modal='true']",
   "yt-confirm-dialog-renderer","tp-yt-paper-dialog","ytd-enforcement-message-view-model",
   "[id*='adblock' i]","[class*='adblock' i]",
   "[id*='anti-ad' i]","[class*='anti-ad' i]",
   "[class*='modal' i]","[class*='overlay' i]","[class*='popup' i]"
  ].join(",");
  let candidates;
  try{candidates=document.querySelectorAll(selector);}catch(_){return;}
  const player=document.querySelector("video");
  let inspected=0,removed=0;
  for(const el of candidates){
   if(++inspected>120||removed>=6)break;
   if(antiHidden.has(el)||el===document.documentElement||el===document.body||el===banner)continue;
   if((player&&el.contains(player))||el.querySelector("video, audio"))continue;
   const info=(el.textContent||"").trim();
   if(info.length<12||info.length>1800)continue;
   const computed=window.getComputedStyle(el);
   const visible=Boolean(el.isConnected&&el.getClientRects().length)&&computed.visibility!=="hidden"&&computed.display!=="none";
   const kind=[el.localName||"",el.id||"",typeof el.className==="string"?el.className:""].join(" ");
   const overlay=/(?:dialog|modal|overlay|popup|enforcement)/i.test(kind)||
    el.getAttribute?.("role")==="dialog"||el.getAttribute?.("aria-modal")==="true"||
    computed.position==="fixed"||computed.position==="sticky";
   if(!DKAntiAdblock.shouldHide({text:info,visible,overlay,containsPlayer:false,rootElement:false}))continue;
   antiHidden.set(el,{value:el.style.getPropertyValue("display"),priority:el.style.getPropertyPriority("display")});
   el.style.setProperty("display","none","important");
   removed++;
   // Remove only an adjacent modal backdrop, and only after confirming the notice.
   for(const sibling of [el.previousElementSibling,el.nextElementSibling]){
    if(!sibling||antiHidden.has(sibling)||!sibling.matches?.('[class*="backdrop" i]'))continue;
    if(player&&sibling.contains(player))continue;
    antiHidden.set(sibling,{value:sibling.style.getPropertyValue("display"),priority:sibling.style.getPropertyPriority("display")});
    sibling.style.setProperty("display","none","important");
   }
  }
  if(removed)unlockScrollAfterNotice();
  for(const el of antiHidden.keys())if(!el.isConnected)antiHidden.delete(el);
 }
 function skipVideo(){
  if(!active||!youtubeSkip||!isYouTube)return;
  const btn=document.querySelector(".ytp-ad-skip-button, .ytp-ad-skip-button-modern, button.ytp-skip-ad-button, button[aria-label='Skip Ads']");
  if(btn&&!btn.disabled&&btn.getClientRects().length)btn.click();
 }
 function rejectCookies(){
  if(!active||!cookieReject)return;
  const selectors=["[role='dialog']","[aria-modal='true']","#onetrust-banner-sdk","#CybotCookiebotDialog",".qc-cmp2-container"];
  for(const root of document.querySelectorAll(selectors.join(","))){
   const info=(root.textContent||"").slice(0,1500);
   if(!DKConsent.cookieContext(info))continue;
   const buttons=root.querySelectorAll("button,[role='button']");
   for(const button of buttons){const label=button.textContent||button.getAttribute("aria-label")||"";
    if(!clickedRejectButtons.has(button)&&DKConsent.rejectLabel(label)&&button.getClientRects().length){
      clickedRejectButtons.add(button);
      button.click();return;
    }
   }
  }
 }
 function cleanSelector(el){
  if(el.id&&el.id.length<70)return "#"+CSS.escape(el.id);
  const names=[];let node=el;
  for(let i=0;i<5&&node&&node!==document.documentElement;i++){
   let value=node.localName;if(!value)break;
   const cls=[...node.classList].filter(x=>/^[a-zA-Z_-][\w-]{2,30}$/.test(x)&&!/^css-|^jsx-/.test(x));
   if(cls.length)value+="."+cls.slice(0,2).map(CSS.escape).join(".");
   const siblings=node.parentElement?[...node.parentElement.children].filter(x=>x.localName===node.localName):[];
   if(siblings.length>1)value+=":nth-of-type("+(siblings.indexOf(node)+1)+")";
   names.unshift(value);if(node.id){names[0]="#"+CSS.escape(node.id);break;}node=node.parentElement;
  }
  return names.join(" > ");
 }
 function endPicker(){
  picking=false;
  if(selected){selected.style.outline="";selected=null;}banner?.remove();banner=null;
  document.removeEventListener("mouseover",hover,true);document.removeEventListener("click",choose,true);document.removeEventListener("keydown",keys,true);
 }
 function hover(event){
  if(!picking||event.target===banner||banner?.contains(event.target))return;
  if(!(event.target instanceof Element)||event.target===document.body||event.target===document.documentElement)return;
  if(selected)selected.style.outline="";selected=event.target;selected.style.outline="3px solid #11ac99";
 }
 async function choose(event){
  if(!picking||event.target===banner||banner?.contains(event.target))return;
  event.preventDefault();event.stopImmediatePropagation();
  const selector=cleanSelector(event.target);endPicker();
  if(selector&&selector.length<=600){try{await browser.runtime.sendMessage({action:"addElementRule",selector});}catch(_){}}
 }
 function keys(e){if(e.key==="Escape"){e.preventDefault();endPicker();}}
 function startPicker(){
  if(!active||picking||!document.body)return false;
  picking=true;banner=document.createElement("div");banner.textContent="DK Live Block: click an element to hide. Esc cancels.";
  banner.setAttribute("style","position:fixed!important;z-index:2147483647!important;right:12px!important;top:12px!important;padding:12px!important;background:#073934!important;color:white!important;border:2px solid #14b8a6!important;font:14px sans-serif!important");
  document.documentElement.appendChild(banner);
  document.addEventListener("mouseover",hover,true);document.addEventListener("click",choose,true);document.addEventListener("keydown",keys,true);
  return true;
 }
 browser.runtime.onMessage.addListener(msg=>{
  if(msg.action==="refresh"){refresh();return Promise.resolve({ok:true});}
  if(msg.action==="startPicker")return Promise.resolve({ok:startPicker()});
 });
 refresh();
 if(!document.documentElement){const watcher=new MutationObserver(()=>{if(document.documentElement){watcher.disconnect();applyCSS();}});watcher.observe(document,{childList:true,subtree:true});}
 setInterval(()=>{skipVideo();rejectCookies();if(Date.now()-lastProc>3000){lastProc=Date.now();hideProcedural();}if(Date.now()-lastAnti>2200){lastAnti=Date.now();suppressAntiAdblockNotices();}},1250);
})();
