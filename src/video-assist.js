/* DK Live Block: conservative YouTube skip-button assistant and playback protection.
   Never rewrites video streams, changes playback speed, mutates media state or
   pretends to remove server-inserted ads. */
(function(root){"use strict";
const SKIP_SELECTORS=[
 ".ytp-ad-skip-button",
 ".ytp-ad-skip-button-modern",
 ".ytp-skip-ad-button",
 ".ytp-ad-skip-button-slot button",
 ".ytp-ad-skip-button-container button",
 ".ytp-ad-skip-button-modern button",
 "button.ytp-ad-skip-button",
 "button[aria-label='Skip Ad' i]",
 "button[aria-label='Skip Ads' i]",
 "button[aria-label='Skip Advertisement' i]",
 "button[aria-label='Skip Advertisements' i]",
 "button[aria-label='Skip Commercial' i]",
 "button[aria-label='Passer l’annonce' i]",
 "button[aria-label='Werbung überspringen' i]",
 "button[aria-label='Saltar anuncio' i]",
 "button[aria-label='Reklamı geç' i]",
 "button[aria-label='Пропустить рекламу']",
 "button[aria-label='تخطي الإعلان']",
 "button[aria-label='跳过广告']"
];
const AD_SKIP_CLASS=/\b(?:ytp-ad-skip-button(?:-modern)?|ytp-skip-ad-button)\b/;
const AD_LABEL=/^(?:skip\s+ads?|skip\s+advertisements?|skip\s+commercials?|passer l'(?:annonce|publicité)|ignorer l'(?:annonce|publicité)|werbung überspringen|anzeige überspringen|saltar anuncios?|omitir anuncios?|pular anúncios?|reklamı (?:geç|atla)|reklamları atla|пропустить рекламу|تخطي الإعلان|تخطي الإعلانات|跳过广告)$/iu;
const SHORT_SKIP=/^\s*skip\s*$/i;
const AD_CONTEXT=".ad-showing, #movie_player.ad-showing, .ytp-ad-module, .ytp-ad-skip-button-slot, .ytp-ad-skip-button-container";
// A recycled ad-skip container must never turn an ordinary playback control into an ad action.
const NON_AD_SKIP=/^\s*(?:skip\s+(?:intro|recap|opening|credits|preview|tutorial|to\s+next)|next\s+(?:video|episode)|play\s+next)\b/i;
const PLAYER_GUARD=/(?:^|[,\s>+~(])(?:video|audio|ytd-player|#movie_player|\.html5-video-player|\.html5-video-container|\.video-stream|\.ytp-chrome-bottom|\.ytp-progress-bar|\.ytp-play-progress|\.ytp-volume-panel|\.ytp-time-display|\.ytp-ad-skip-button(?:-modern|-slot|-container)?|\.ytp-skip-ad-button)(?=$|[,\s>+~[:.)])/i;
const streamingDomains=["youtube.com","youtube-nocookie.com","youtu.be","disneyplus.com"];
function hostnameMatches(host,base){return host===base||host.endsWith("."+base);}
function isStreamingHost(host){return typeof host==="string"&&streamingDomains.some(base=>hostnameMatches(host.toLowerCase(),base));}
function protectSelector(selector){return typeof selector==="string"&&PLAYER_GUARD.test(selector);}
function mediaRecoveryAllowed(pageHost,resourceType,siteAllowances){
 return resourceType==="media"&&isStreamingHost(pageHost)&&
  Array.isArray(siteAllowances)&&siteAllowances.includes(pageHost);
}
function safeCosmetics(selectors,host){
 if(!Array.isArray(selectors))return [];
 return isStreamingHost(host)?selectors.filter(x=>!protectSelector(x)):selectors;
}
function playerElement(element){
 if(!element)return false;
 try{if(element.matches?.("video, audio, ytd-player, #movie_player, .html5-video-player, .html5-video-container, .video-stream, .ytp-chrome-bottom"))return true;
  if(element.querySelector?.("video, audio"))return true;
  if(element.closest?.("video, audio, #movie_player, .html5-video-player, .html5-video-container, .ytp-chrome-bottom"))return true;
 }catch(_){}
 return false;
}
function normalizeLabel(value){
 return String(value||"").normalize("NFKC").replace(/[‘’]/g,"'").replace(/\s+/g," ")
  .trim().toLocaleLowerCase().slice(0,90);
}
function labelsOf(button){
 try{return [button.textContent,button.getAttribute?.("aria-label"),button.getAttribute?.("title")]
  .map(normalizeLabel).filter(Boolean);}
 catch(_){return [];}
}
function safeAction(button){
 try{
  const tag=String(button.localName||"").toLowerCase(),attr=name=>button.getAttribute?.(name);
  if(tag==="a"||attr("href")!=null||attr("role")==="link"||
    attr("aria-pressed")!=null||attr("aria-checked")!=null)return false;
  const form=button.form||button.closest?.("form");
  const type=String(attr("type")||button.type||(tag==="button"?"submit":"")).toLowerCase();
  return !(form&&type==="submit");
 }catch(_){return false;}
}
function hasAdSkipClass(button){
 const s=typeof button?.className==="string"?button.className:"";
 return AD_SKIP_CLASS.test(s)||!!button?.closest?.(".ytp-ad-skip-button-slot, .ytp-ad-skip-button-container");
}
function isVisible(button){
 if(!button||button.isConnected===false||button.disabled||
    button.getAttribute?.("aria-disabled")==="true"||
    button.getAttribute?.("aria-hidden")==="true")return false;
 if(typeof button.click!=="function"||typeof button.getClientRects!=="function"||!button.getClientRects().length)return false;
 try{
  if(button.closest?.("[inert], [hidden], [aria-hidden='true'], [aria-disabled='true']"))return false;
  // Rectangles can still exist for invisible or non-interactive controls.
  const view=button.ownerDocument?.defaultView;
  const style=view?.getComputedStyle?.(button);
  if(style&&(style.display==="none"||style.visibility==="hidden"||style.visibility==="collapse"||
     style.pointerEvents==="none"||Number(style.opacity)===0))return false;
 }catch(_){return false;}
 return true;
}
function isAdSkip(button){
 if(!isVisible(button)||!safeAction(button))return false;
 const labels=labelsOf(button);
 // Any conflicting visible/accessibility/title label means do not click.
 if(!labels.length||labels.some(label=>NON_AD_SKIP.test(label)))return false;
 const dedicated=hasAdSkipClass(button);
 const explicit=labels.every(label=>AD_LABEL.test(label));
 const compact=dedicated&&labels.every(label=>SHORT_SKIP.test(label));
 if(!explicit&&!compact)return false;
 if(dedicated&&explicit)return true;
 try{return !!button.closest?.(AD_CONTEXT);}
 catch(_){return false;}
}
function createController(cooldownMs=5000){
 let pressed=new WeakMap();
 function scan(document,now=Date.now()){
  if(!document||!Number.isFinite(now))return {clicked:false,reason:"unavailable"};
  let candidates=[];
  try{candidates=document.querySelectorAll(SKIP_SELECTORS.join(","));}catch(_){return {clicked:false,reason:"unavailable"};}
  let seen=0,cooling=false;
  for(const button of candidates){
   if(++seen>35)break;
   if(!isAdSkip(button))continue;
   // A stale control from an earlier SPA view must not block a new skip button.
   if(pressed.has(button)&&now-pressed.get(button)<cooldownMs){cooling=true;continue;}
   try{pressed.set(button,now);button.click();return {clicked:true,reason:"skipped"};}
   catch(_){return {clicked:false,reason:"unavailable"};}
  }
  return {clicked:false,reason:cooling?"cooldown":"no-button"};
 }
 return {scan,reset(){pressed=new WeakMap();}};
}
const api={isStreamingHost,mediaRecoveryAllowed,protectSelector,safeCosmetics,playerElement,isAdSkip,createController,normalizeLabel};
root.DKVideoAssist=api;
if(typeof module!=="undefined")module.exports=api;
})(typeof globalThis!=="undefined"?globalThis:this);
