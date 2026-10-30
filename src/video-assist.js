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
 "button[aria-label='Skip Commercial' i]"
];
const AD_SKIP_CLASS=/\b(?:ytp-ad-skip-button(?:-modern)?|ytp-skip-ad-button)\b/;
const AD_LABEL=/^\s*(?:skip\s+ads?|skip\s+advertisements?|skip\s+commercials?)\s*$/i;
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
function labelOf(button){
 try{return String(button.getAttribute?.("aria-label")||button.textContent||"").replace(/\s+/g," ").trim().slice(0,90);}
 catch(_){return "";}
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
 if(!isVisible(button))return false;
 const label=labelOf(button);
 if(NON_AD_SKIP.test(label))return false;
 const dedicated=hasAdSkipClass(button);
 // Dedicated skip wrappers may be recycled between SPA views, so never click
 // arbitrary "Learn more", "Next video" or unrelated controls in them.
 if(!AD_LABEL.test(label)&&!(dedicated&&(!label||SHORT_SKIP.test(label))))return false;
 if(dedicated&&AD_LABEL.test(label))return true;
 try{return !!button.closest?.(AD_CONTEXT);}
 catch(_){return false;}
}
function createController(cooldownMs=5000){
 const pressed=new WeakMap();
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
 return {scan};
}
const api={isStreamingHost,mediaRecoveryAllowed,protectSelector,safeCosmetics,playerElement,isAdSkip,createController};
root.DKVideoAssist=api;
if(typeof module!=="undefined")module.exports=api;
})(typeof globalThis!=="undefined"?globalThis:this);
