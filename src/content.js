"use strict";
/* DK Live Block page-side cleanup. No stream rewriting, no remote scripts. */
(function(){
 let active=false,css="",youtubeSkip=true,rememberVideos=false,lastRememberAt=0,cookieReject=false,adRecognition=true,antiAdblock=true,paywallPopups=true,distractionControl=true,playbackHealthEnabled=false,style=null,picking=false,selected=null,banner=null,procedural=[],lastProc=0,lastAnti=0,lastPaywall=0,lastOverlayScan=0,lastAdScan=0,overlayTimer=null,overlayObserver=null,refreshSequence=0;
 const clickedRejectButtons=new WeakSet(),clickedRejectRoots=new WeakSet();
 let lastConsentScan=0,lastEnforcementReport=0,adScanTimer=null;
 const hidden=new Map(),overlayRecovery=DKOverlayRecovery.create(document,window);
 const host=location.hostname.toLowerCase(),isYouTube=host==="youtube.com"||host.endsWith(".youtube.com")||host==="youtube-nocookie.com"||host.endsWith(".youtube-nocookie.com");
 const isHealthSite=typeof DKPlaybackHealth!=="undefined"&&DKPlaybackHealth.supportsHost(host);
 const videoController=DKVideoAssist.createController();
 const cosmeticDebugger=DKCosmeticDebug.create(document);
 const healthProbe=isHealthSite?DKPlaybackHealth.createProbe():null;
 function samplePlaybackHealth(){
  if(!active||!playbackHealthEnabled||!healthProbe||picking||window!==window.top)return;
  const player=document.querySelector("video.html5-main-video, #movie_player video, video");
  const kind=healthProbe.scan(player,document);
  if(kind)browser.runtime.sendMessage({action:"reportPlaybackHealth",kind}).catch(()=>{});
 }
 const videoWatcher=isYouTube?DKStreamingWatch.create(document,()=>skipVideo(),()=>active&&youtubeSkip&&!picking):null;
 function syncVideoWatcher(){if(!videoWatcher)return;if(active&&youtubeSkip&&!picking){videoWatcher.start();videoWatcher.poke();}else videoWatcher.stop();}
 const adRecognizer=typeof DKAdRecognition!=="undefined"?DKAdRecognition.create(document,window):null;
 function inspectAdSlots(){
  if(!active||!adRecognition||picking||!adRecognizer)return;
  lastAdScan=Date.now();adRecognizer.scan();
 }
 function queueAdScan(){
  if(adScanTimer!==null||!active||!adRecognition||picking||!adRecognizer||
    typeof setTimeout!=="function")return;
  adScanTimer=setTimeout(()=>{adScanTimer=null;inspectAdSlots();},450);
 }
 function applyCSS(){
  if(!document.documentElement)return;
  if(!active||!css){style?.remove();style=null;return;}
  if(!style||!style.isConnected){style=document.createElement("style");style.id="dk-live-block-style";document.documentElement.appendChild(style);}
  if(style.textContent!==css)style.textContent=css;
 }
 async function refresh(){
  const sequence=++refreshSequence;
  try{
   const s=await browser.runtime.sendMessage({action:"getStyle",url:location.href});
   if(sequence!==refreshSequence)return; // Ignore stale replies after rapid SPA navigation.
   const nextActive=!!s.active,nextAnti=!!s.antiAdblock,nextPaywall=!!s.paywallPopups,nextDistractions=!!s.distractionControl;
   const nextProcedural=Array.isArray(s.procedural)?s.procedural:[];
   const proceduralChanged=JSON.stringify(nextProcedural)!==JSON.stringify(procedural);
   // Do not flash already-hidden notices on ordinary navigation or rule refresh.
   if(active&&!nextActive||antiAdblock&&!nextAnti||paywallPopups&&!nextPaywall||distractionControl&&!nextDistractions)restoreAntiHidden();
   if(!nextActive||proceduralChanged){restoreHidden();cosmeticDebugger.restore();}
   if(!nextActive||adRecognition&&!s.adRecognition)adRecognizer?.restore();
   const nextHealth=!!s.playbackHealthEnabled;
   if(!nextActive||!nextHealth||!playbackHealthEnabled&&nextHealth)healthProbe?.reset();
   playbackHealthEnabled=nextHealth;
   active=nextActive;css=s.css||"";youtubeSkip=!!s.youtubeSkip;rememberVideos=!!s.rememberVideos;cookieReject=!!s.cookieReject;adRecognition=s.adRecognition!==false;
   antiAdblock=nextAnti;paywallPopups=nextPaywall;distractionControl=nextDistractions;procedural=nextProcedural;
   if(isYouTube&&window===window.top&&typeof CustomEvent==="function"&&document.dispatchEvent)
    document.dispatchEvent(new CustomEvent("dk-live-block:youtube-response-control",{
     detail:s.youtubePageAssistEnabled?"enable":"disable"
    }));
   applyCSS();queueOverlayScan();inspectAdSlots();syncVideoWatcher();
  }catch(_){/* A broken extension must not break the page. */}
 }
 function restoreHidden(){
  for(const [el,old] of hidden){
   try{
    if(!el.isConnected||
      el.style.getPropertyValue("display")!=="none"||
      el.style.getPropertyPriority("display")!=="important")continue;
    // Undo only our own hide. Do not overwrite a newer site style.
    if(old.value)el.style.setProperty("display",old.value,old.priority);
    else el.style.removeProperty("display");
   }catch(_){}
  }
  hidden.clear();
 }
 function hideProcedural(){
  if(!active||!procedural.length)return;
  for(const rule of procedural.slice(0,50)){
   let elements;try{elements=document.querySelectorAll(rule.selector);}catch(_){continue;}
   let count=0;
   for(const el of elements){if(++count>200)break;
    if(el===document.body||el===document.documentElement||!DKProcedural.matches(el,rule)||
      DKAuthProtection.isIdentityUI(el,String(el.textContent||"").slice(0,180))||
      DKVideoAssist.isStreamingHost(host)&&DKVideoAssist.playerElement(el))continue;
    const currentValue=el.style.getPropertyValue("display");
    const currentPriority=el.style.getPropertyPriority("display");
    if(hidden.has(el)){
     // The site may have changed this element since our last scan.
     // Keep its latest choice to restore after filtering is disabled.
     if(currentValue==="none"&&currentPriority==="important")continue;
    }
    hidden.set(el,{value:currentValue,priority:currentPriority});
    el.style.setProperty("display","none","important");if(hidden.size>800)break;
   }
   if(hidden.size>800)break;
  }
  for(const el of hidden.keys())if(!el.isConnected)hidden.delete(el);
 }
 function restoreAntiHidden(){overlayRecovery.restore();}
 function unlockScrollAfterNotice(){overlayRecovery.unlockScroll();}
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
   if(el===document.documentElement||el===document.body||el===banner)continue;
   if((player&&el.contains(player))||el.querySelector("video, audio"))continue;
   const info=(el.textContent||"").trim();
   if(DKPopupGuard.protectedDialog(el,info))continue;
   if(info.length<12||info.length>1800)continue;
   const computed=window.getComputedStyle(el);
   const visible=Boolean(el.isConnected&&el.getClientRects().length)&&computed.visibility!=="hidden"&&computed.display!=="none";
   const kind=[el.localName||"",el.id||"",typeof el.className==="string"?el.className:""].join(" ");
   const overlay=/(?:dialog|modal|overlay|popup|enforcement)/i.test(kind)||
    el.getAttribute?.("role")==="dialog"||el.getAttribute?.("aria-modal")==="true"||
    computed.position==="fixed"||computed.position==="sticky";
   if(!DKAntiAdblock.shouldHide({text:info,visible,overlay,containsPlayer:false,rootElement:false}))continue;
   // YouTube's playback-refusal dialog reflects an unresolved server-side
   // enforcement state. Never hide it and imply playback has resumed.
   if(isYouTube&&DKAntiAdblock.isPlaybackEnforcement(info)){
    const now=Date.now();
    if(playbackHealthEnabled&&window===window.top&&
      (lastEnforcementReport===0||now-lastEnforcementReport>=20000)){
     lastEnforcementReport=now;
     browser.runtime.sendMessage({action:"reportPlaybackHealth",kind:"enforcement"}).catch(()=>{});
    }
    continue;
   }
   if(!overlayRecovery.hide(el))continue;
   removed++;
   overlayRecovery.hideBackdropAround(el);
  }
  if(removed){
   unlockScrollAfterNotice();
   try{browser.runtime.sendMessage({action:"reportPopupCleanup",kind:"antiAdblock",count:removed}).catch(()=>{});}catch(_){}
  }
  overlayRecovery.prune();
 }
 function suppressSubscriptionModals(){
  if(!active||!paywallPopups||picking||!document.body||document.fullscreenElement)return;
  // Check substantive article evidence per candidate, excluding the modal itself.
  const candidates=[
   "dialog[open]","[role='dialog']","[aria-modal='true']",
   "[class*='paywall' i]","[id*='paywall' i]",
   "[class*='subscribe' i]","[id*='subscribe' i]",
   "[class*='modal' i]","[class*='overlay' i]","[class*='gateway' i]",
   "[data-testid*='paywall' i]"
  ].join(",");
  let nodes;try{nodes=document.querySelectorAll(candidates);}catch(_){return;}
  const video=document.querySelector("video");
  let visited=0,hiddenCount=0;
  for(const el of nodes){
   if(++visited>100||hiddenCount>=4)break;
   if(el===document.body||el===document.documentElement||el===banner)continue;
   // A modal may contain a purchase button, but never hide actual readable articles or players.
   if((video&&el.contains(video))||el.querySelector("video, audio, article, [itemprop='articleBody']"))continue;
   const text=(el.textContent||"").trim();
   if(DKPopupGuard.protectedDialog(el,text))continue;
   if(text.length>1600||text.length<17)continue;
   const style=window.getComputedStyle(el);
   const visible=Boolean(el.isConnected&&el.getClientRects().length)&&style.visibility!=="hidden"&&style.display!=="none";
   const label=[el.localName||"",el.id||"",typeof el.className==="string"?el.className:""].join(" ");
   const explicitDialog=el.localName==="dialog"||el.getAttribute?.("role")==="dialog"||el.getAttribute?.("aria-modal")==="true";
   const positioned=style.position==="fixed"||style.position==="sticky"||style.position==="absolute";
   const overlay=explicitDialog||positioned&&/(?:dialog|modal|paywall|overlay|subscribe|gateway)/i.test(label);
   if(!visible||!overlay)continue;
   const articleLoaded=DKPaywall.hasLoadedArticle(document,el);
   if(!DKPaywall.shouldHide({text,visible,overlay,articleLoaded,containsPlayer:false,rootElement:false}))continue;
   if(!overlayRecovery.hide(el))continue;
   hiddenCount++;
   overlayRecovery.hideBackdropAround(el);
  }
  if(hiddenCount){
   unlockScrollAfterNotice();
   try{browser.runtime.sendMessage({action:"reportPopupCleanup",kind:"paywall",count:hiddenCount}).catch(()=>{});}catch(_){}
  }
  overlayRecovery.prune();
 }

 function suppressDistractions(){
  if(!active||!distractionControl||picking||!document.body||document.fullscreenElement)return;
  const selector=[
   "dialog[open]","[role='dialog']","[aria-modal='true']",
   "[class*='newsletter' i]","[id*='newsletter' i]",
   "[class*='survey' i]","[id*='survey' i]",
   "[class*='mailing-list' i]","[class*='floating-ad' i]",
   "[class*='corner-ad' i]","[data-testid*='newsletter' i]",
   "[class*='banner' i]","[id*='banner' i]",
   "[class*='notice' i]","[class*='notification' i]",
   "[class*='toast' i]","[class*='alert' i]",
   "[class*='vpn' i]","[id*='vpn' i]",
   "[class*='popup' i]","[class*='modal' i]",
   "[role='alert']","[role='status']",
   "[data-testid*='banner' i]","[data-testid*='notice' i]",
   "[style*='position:fixed' i]","[style*='position: fixed' i]"
  ].join(",");
  let nodes;try{nodes=document.querySelectorAll(selector);}catch(_){return;}
  let inspected=0,removed=0;
  for(const el of nodes){
   if(++inspected>100||removed>=4)break;
   if(el===document.body||el===document.documentElement||el===banner)continue;
   let text="",marker="",sensitive=false,hasPlayer=false,hasFrame=false;
   try{
    text=String(el.textContent||"").trim().slice(0,1200);
    marker=[el.id||"",typeof el.className==="string"?el.className:""].join(" ").slice(0,250);
    sensitive=DKPopupGuard.protectedDialog(el,text);
    hasPlayer=!!el.querySelector?.("video, audio, [id='movie_player'], .html5-video-player");
    hasFrame=!!el.querySelector?.("iframe, object, embed");
    if(sensitive||hasPlayer||hasFrame||DKDistractions.userEngaged(el,document.activeElement))continue;
    const style=window.getComputedStyle(el);
    const visible=el.isConnected&&el.getClientRects().length>0&&
      style.display!=="none"&&style.visibility!=="hidden";
    const explicit=el.localName==="dialog"||el.getAttribute?.("role")==="dialog"||
      el.getAttribute?.("aria-modal")==="true";
    const positioned=style.position==="fixed"||style.position==="sticky";
    const overlay=explicit||positioned&&
      (/(?:popup|modal|overlay|newsletter|survey|floating|corner-ad|banner|toast|notice|notification|alert|vpn)/i.test(marker)||
       DKDistractions.vpnNotice(text)||DKDistractions.sitePromotion(text,host));
    const category=DKDistractions.classify({text,labelText:marker,
      overlay,visible,hasPlayer,hasMediaFrame:hasFrame,hasSensitive:sensitive,
      fullscreen:!!document.fullscreenElement,host});
    if(!category||!overlayRecovery.hide(el))continue;
    removed++;overlayRecovery.hideBackdropAround(el);
   }catch(_){/* Unknown DOM: never interrupt the page. */}
  }
  if(removed){
   unlockScrollAfterNotice();
   try{browser.runtime.sendMessage({action:"reportPopupCleanup",kind:"distraction",count:removed}).catch(()=>{});}catch(_){}
  }
  overlayRecovery.prune();
 }
 function scanDynamicOverlays(){
  if(!active||picking||!document.body||(!antiAdblock&&!paywallPopups&&!distractionControl))return;
  lastOverlayScan=Date.now();
  if(antiAdblock){lastAnti=lastOverlayScan;suppressAntiAdblockNotices();}
  if(paywallPopups){lastPaywall=lastOverlayScan;suppressSubscriptionModals();}
  if(distractionControl)suppressDistractions();
 }
 function queueOverlayScan(){
  if(overlayTimer!==null||!active||(!antiAdblock&&!paywallPopups&&!distractionControl)||typeof setTimeout!=="function")return;
  const delay=Math.max(220,800-(Date.now()-lastOverlayScan));
  overlayTimer=setTimeout(()=>{
   overlayTimer=null;scanDynamicOverlays();
  },delay);
 }
 function observePopupChanges(){
  if(overlayObserver||!document.documentElement||typeof MutationObserver!=="function")return;
  try{
   overlayObserver=new MutationObserver(records=>{
    // Delay heavy scanning; avoid loops from our own display style updates.
    let popups=false,ads=false;
    for(const item of records.slice(0,40)){
     if(!popups&&DKPopupGuard.shouldInspectMutation(item,el=>overlayRecovery.wasHidden(el)))popups=true;
     if(!ads&&adRecognizer&&DKAdRecognition.relevantMutation(item))ads=true;
     if(popups&&ads)break;
    }
    if(popups)queueOverlayScan();
    if(ads)queueAdScan();
   });
   overlayObserver.observe(document.documentElement,{
    childList:true,subtree:true,attributes:true,
    attributeFilter:["class","style","hidden","aria-hidden","open","id",
     "data-ad-client","data-ad-slot","data-ad-unit","data-testid","aria-label"]
   });
  }catch(_){overlayObserver=null;}
 }
 function skipVideo(){
  if(!active||!youtubeSkip||!isYouTube||picking)return;
  videoController.scan(document);
 }
 function rejectCookies(){
  if(!active||!cookieReject||picking||document.fullscreenElement)return;
  const roots=DKConsentDOM.findBanners(document);
  let checked=0;
  for(const root of roots){
   if(++checked>20)break;
   try{
    if(clickedRejectRoots.has(root)||DKConsentDOM.userEngaged(root,document)||
       !DKConsentDOM.inspectBanner(root,window))continue;
    const {buttons,context:info}=DKConsentDOM.collectControls(root);
    if(!DKConsent.cookieContext(info)||DKPopupGuard.protectedDialog(root,info))continue;
    let inspected=0;
    for(const button of buttons){
     if(++inspected>35)break;
     if(clickedRejectButtons.has(button))continue;
     const state=DKConsentDOM.inspectButton(button,window);
     if(!DKConsent.shouldReject({context:info,text:button.textContent,
       ariaLabel:button.getAttribute?.("aria-label")||"",
       title:button.getAttribute?.("title")||"",...state}))continue;
     if(typeof button.click!=="function")continue;
     clickedRejectButtons.add(button);clickedRejectRoots.add(root);
     button.click();return;
    }
   }catch(_){/* Unknown page widget: never interrupt browsing. */}
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
  syncVideoWatcher();
 }
 function hover(event){
  if(!picking||event.target===banner||banner?.contains(event.target))return;
  if(!(event.target instanceof Element)||event.target===document.body||event.target===document.documentElement||
    DKVideoAssist.isStreamingHost(host)&&DKVideoAssist.playerElement(event.target))return;
  if(selected)selected.style.outline="";selected=event.target;selected.style.outline="3px solid #11ac99";
 }
 async function choose(event){
  if(!picking||event.target===banner||banner?.contains(event.target))return;
  if(DKVideoAssist.isStreamingHost(host)&&DKVideoAssist.playerElement(event.target))return;
  if(DKAuthProtection.isIdentityUI(event.target,String(event.target?.textContent||"").slice(0,180)))return;
  event.preventDefault();event.stopImmediatePropagation();
  const selector=cleanSelector(event.target);endPicker();
  if(selector&&selector.length<=600){try{await browser.runtime.sendMessage({action:"addElementRule",selector});}catch(_){}}
 }
 function keys(e){if(e.key==="Escape"){e.preventDefault();endPicker();}}
 async function maybeRememberVideo(){
  // Explicitly opt-in only. Never send a video to the background until the
  // HTML5 player has played at least one minute outside an advertising break.
  if(!rememberVideos||!isYouTube||window!==window.top||Date.now()-lastRememberAt<30000)return;
  const player=document.querySelector("video");
  if(!player||player.paused||player.ended||player.seeking||!Number.isFinite(player.currentTime)||
    !Number.isFinite(player.duration)||player.duration<90||
    player.currentTime<60||player.currentTime>=player.duration-15||
    document.querySelector(".html5-video-player.ad-showing"))return;
  const videoId=new URL(location.href).searchParams.get("v");
  if(!/^[A-Za-z0-9_-]{11}$/.test(videoId||""))return;
  lastRememberAt=Date.now();
  try{await browser.runtime.sendMessage({action:"rememberVideoProgress",videoId,
   position:Math.floor(player.currentTime),duration:Math.floor(player.duration),
   title:String(document.title||"YouTube video").slice(0,180)});}catch(_){}
 }
 function startPicker(){
  if(!active||picking||!document.body)return false;
  picking=true;syncVideoWatcher();banner=document.createElement("div");banner.textContent="DK Live Block: click an element to hide. Esc cancels.";
  banner.setAttribute("style","position:fixed!important;z-index:2147483647!important;right:12px!important;top:12px!important;padding:12px!important;background:#073934!important;color:white!important;border:2px solid #14b8a6!important;font:14px sans-serif!important");
  document.documentElement.appendChild(banner);
  document.addEventListener("mouseover",hover,true);document.addEventListener("click",choose,true);document.addEventListener("keydown",keys,true);
  return true;
 }
 browser.runtime.onMessage.addListener(msg=>{
  if(msg.action==="refresh"){refresh();return Promise.resolve({ok:true});}
  if(msg.action==="startPicker")return Promise.resolve({ok:startPicker()});
  if(msg.action==="inspectCosmeticDebug"){
   if(!active||msg.siteHost!==host||window!==window.top)return Promise.resolve({error:"Inspector unavailable on this page."});
   return Promise.resolve({ok:true,rows:DKCosmeticDebug.inspect(document,msg.selectors)});
  }
  if(msg.action==="highlightCosmeticDebug"){
   if(!active||msg.siteHost!==host||window!==window.top)return Promise.resolve({error:"Inspector unavailable on this page."});
   return Promise.resolve(cosmeticDebugger.highlight(msg.selector));
  }
  if(msg.action==="clearCosmeticDebug"){
   cosmeticDebugger.restore();return Promise.resolve({ok:true});
  }
  // Read only on an explicit toolbar request; never collect passive watch history.
  if(msg.action==="getVideoPosition"){
   if(!/^(www\.|m\.|music\.)?youtube\.com$/.test(host)||window!==window.top)return Promise.resolve({position:0});
   const video=document.querySelector("video");
   const seconds=Number.isFinite(video?.currentTime)?Math.min(86400,Math.max(0,Math.floor(video.currentTime))):0;
   return Promise.resolve({position:seconds});
  }
 });
 if(isYouTube&&window===window.top&&document.addEventListener){
  let bridgeReadySeen=false;
  document.addEventListener("dk-live-block:youtube-response-ready",()=>{
   if(bridgeReadySeen)return;
   bridgeReadySeen=true;refresh();
  },false);
 }
 refresh();
 // YouTube single-page navigation does not necessarily reload the document.
 if(typeof window.addEventListener==="function"){
  const onNavigate=()=>{
   healthProbe?.reset();videoController.reset?.();refresh();videoWatcher?.poke();
  };
  window.addEventListener("yt-navigate-finish",onNavigate,false);
  window.addEventListener("popstate",onNavigate,false);
 }
 if(!document.documentElement){
  try{
   const watcher=new MutationObserver(()=>{
    if(document.documentElement){watcher.disconnect();applyCSS();observePopupChanges();queueOverlayScan();syncVideoWatcher();}
   });
   watcher.observe(document,{childList:true,subtree:true});
  }catch(_){}
 }else observePopupChanges();
 // Lightweight video/cookie checks remain periodic; heavy overlay scans run on DOM changes
 // and at a low-frequency fallback for pages that modify existing nodes in place.
 setInterval(()=>{
  skipVideo();samplePlaybackHealth();
  if(Date.now()-lastConsentScan>=3500){lastConsentScan=Date.now();rejectCookies();}
  if(rememberVideos&&isYouTube)maybeRememberVideo().catch(()=>{});
  if(Date.now()-lastProc>3000){lastProc=Date.now();hideProcedural();}
  if(Date.now()-lastAdScan>3500)inspectAdSlots();
  if(Date.now()-lastOverlayScan>15000)scanDynamicOverlays();
 },1250);
})();
