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
 "button[aria-label='Skip Ad']",
 "button[aria-label='Skip Ads']"
];
const AD_SKIP_CLASS=/\b(?:ytp-ad-skip-button(?:-modern)?|ytp-skip-ad-button)\b/;
const AD_LABEL=/^\s*(?:skip\s+ads?|skip\s+advertisements?|skip\s+commercials?)\s*$/i;
const PLAYER_GUARD=/(?:^|[,\s>+~(])(?:video|audio|ytd-player|#movie_player|\.html5-video-player|\.html5-video-container|\.video-stream|\.ytp-chrome-bottom|\.ytp-progress-bar|\.ytp-play-progress|\.ytp-volume-panel|\.ytp-time-display)(?=$|[,\s>+~[:.)])/i;
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
 if(!button||button.isConnected===false||button.disabled||button.getAttribute?.("aria-disabled")==="true"||button.getAttribute?.("aria-hidden")==="true")return false;
 if(typeof button.click!=="function"||typeof button.getClientRects!=="function"||!button.getClientRects().length)return false;
 return true;
}
function isAdSkip(button){
 if(!isVisible(button))return false;
 const dedicated=hasAdSkipClass(button);
 if(dedicated)return true;
 if(!AD_LABEL.test(labelOf(button)))return false;
 try{return !!button.closest?.(".ad-showing, .ytp-ad-module, #movie_player.ad-showing");}
 catch(_){return false;}
}
function createController(cooldownMs=5000){
 const pressed=new WeakMap();
 function scan(document,now=Date.now()){
  if(!document||!Number.isFinite(now))return {clicked:false,reason:"unavailable"};
  let candidates=[];
  try{candidates=document.querySelectorAll(SKIP_SELECTORS.join(","));}catch(_){return {clicked:false,reason:"unavailable"};}
  let seen=0;
  for(const button of candidates){
   if(++seen>35)break;
   if(!isAdSkip(button))continue;
   if(pressed.has(button)&&now-pressed.get(button)<cooldownMs)return {clicked:false,reason:"cooldown"};
   try{pressed.set(button,now);button.click();return {clicked:true,reason:"skipped"};}
   catch(_){return {clicked:false,reason:"unavailable"};}
  }
  return {clicked:false,reason:"no-button"};
 }
 return {scan};
}
const api={isStreamingHost,mediaRecoveryAllowed,protectSelector,safeCosmetics,playerElement,isAdSkip,createController};
root.DKVideoAssist=api;
if(typeof module!=="undefined")module.exports=api;
})(typeof globalThis!=="undefined"?globalThis:this);
