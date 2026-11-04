/* DK Live Block Build 43: local YouTube and Disney+ playback health probe.
   Only coarse buffering/error observations. No URLs, titles, media progress,
   response payloads, or automatic request allowances. */
(function(root){"use strict";
const BUFFER_MS=5000,REPORT_INTERVAL=20000,TTL_MS=30*60*1000,MAX=30;
const KINDS=new Set(["buffering","media-error","enforcement","ad-skip","ad-showing"]);
function isYouTube(host){
 return typeof host==="string"&&/^(?:(?:[a-z0-9-]+\.)*)(?:youtube\.com|youtube-nocookie\.com)$/.test(host);
}
function platform(host){
 if(isYouTube(host))return "YouTube";
 if(typeof host==="string"&&/^(?:[a-z0-9-]+\.)*disneyplus\.com$/.test(host))return "Disney+";
 return "";
}
function supportsHost(host){return !!platform(host);}
function isAdBreak(document){
 try{return !!document?.querySelector?.(".html5-video-player.ad-showing, #movie_player.ad-showing");}
 catch(_){return true;}
}
function isUnavailable(video,document){
 try{
  return !document||document.visibilityState==="hidden"||document.hidden===true||
   document.defaultView?.navigator?.onLine===false||isAdBreak(document)||
   !video||video.isConnected===false||!video.getClientRects?.().length||
   video.seeking||video.ended;
 }catch(_){return true;}
}
// Reports a transition to YouTube's own ad-showing player state, not
// verified ad playback and NEVER a successfully blocked ad. No video ID,
// time, URL, player payload, DOM text or telemetry leaves this function.
function createAdProbe(){
 let showing=false,last=-Infinity,trackedVideo=null;
 function scan(video,document,now=Date.now()){
  if(!Number.isFinite(now)||!document||document.hidden===true||
     document.visibilityState==="hidden"||!video||video.isConnected===false){
   showing=false;trackedVideo=null;return null;
  }
  if(video!==trackedVideo){trackedVideo=video;showing=false;}
  let current=false;
  try{
   current=!!document.querySelector?.(
    ".html5-video-player.ad-showing, #movie_player.ad-showing");
  }catch(_){showing=false;return null;}
  if(!current){showing=false;return null;}
  if(showing)return null;
  showing=true;
  // Coalesce class flapping; do not accumulate counts during one ad break.
  if(now-last<8000)return null;
  last=now;
  return "ad-showing";
 }
 function reset(){showing=false;last=-Infinity;trackedVideo=null;}
 return {scan,reset};
}
// Build 296: observe actual YouTube player refusal text without removing or
// changing it. Only bounded text inside the known player root is inspected,
// never exported. A positive result means "enforcement observed", not "fixed".
function createEnforcementProbe(recognizer){
 let present=false,last=-Infinity,candidateSince=null,sustainedReported=false;
 const CONFIRM_MS=800,STALE_MS=6000,SUSTAINED_MS=22000;
 const selectors=[
  "#movie_player .ytp-error",
  "#movie_player .ytp-error-content",
  "#movie_player .ytp-playability-error",
  "#movie_player yt-playability-error-supported-renderer",
  "#movie_player yt-player-error-message-view-model",
  "#movie_player ytd-enforcement-message-view-model",
  "#movie_player .ytp-error-message"
 ];
 function scan(document,now=Date.now()){
  if(!Number.isFinite(now)||!document||document.hidden===true||
     document.visibilityState==="hidden"||typeof recognizer!=="function"){
   present=false;candidateSince=null;sustainedReported=false;return null;
  }
  let found=false;
  try{
   // Deliberately do not inspect page body, comments, video description, or
   // non-player dialogs. Each selector resolves at most one node.
   for(const selector of selectors){
    const element=document.querySelector?.(selector);
    if(!element||element.isConnected===false||
       typeof element.getClientRects!=="function"||
       !element.getClientRects().length)continue;
    const view=document.defaultView;
    if(typeof view?.getComputedStyle==="function"){
     const css=view.getComputedStyle(element);
     if(css?.display==="none"||css?.visibility==="hidden")continue;
    }
    const raw=element.textContent;
    if(typeof raw!=="string"||raw.length<25||raw.length>1800)continue;
    if(recognizer(raw)){found=true;break;}
   }
  }catch(_){return null;}
  if(!found){present=false;candidateSince=null;sustainedReported=false;return null;}
  if(present){
   // One bounded follow-up if the same refusal persists. Avoid a reload
   // or repeated reports on a continuously blocked video.
   if(!sustainedReported&&now-last>=SUSTAINED_MS){
    sustainedReported=true;last=now;return "enforcement";
   }
   return null;
  }
  // Require two visible samples. A transient DOM translation or stale player
  // error must not trigger a false adblock enforcement diagnosis.
  if(candidateSince===null||now<candidateSince||now-candidateSince>STALE_MS){
   candidateSince=now;return null;
  }
  if(now-candidateSince<CONFIRM_MS)return null;
  candidateSince=null;present=true;sustainedReported=false;
  if(now-last<REPORT_INTERVAL)return null;
  last=now;
  return "enforcement";
 }
 function reset(){present=false;last=-Infinity;candidateSince=null;sustainedReported=false;}
 return Object.freeze({scan,reset});
}
function createProbe(){
 let bufferingSince=null,lastReport=-Infinity,lastError=0,trackedVideo=null;
 function scan(video,document,now=Date.now()){
  if(!Number.isFinite(now)||isUnavailable(video,document)){
   bufferingSince=null;trackedVideo=null;return null;
  }
  // YouTube can recycle a document and replace its video element without a
  // navigation event. Never carry a buffering timer over to a new player.
  if(video!==trackedVideo){trackedVideo=video;bufferingSince=null;lastError=0;}
  if(video.error&&[2,3,4].includes(video.error.code)){
   const code=video.error.code;
   if(code!==lastError&&now-lastReport>=REPORT_INTERVAL){
    lastError=code;lastReport=now;bufferingSince=null;return "media-error";
   }
   return null;
  }
  lastError=0;
  if(video.paused||video.ended||video.seeking||
     !Number.isInteger(video.readyState)||video.readyState>=3){
   bufferingSince=null;return null;
  }
  if(bufferingSince===null||now<bufferingSince){bufferingSince=now;return null;}
  if(now-bufferingSince<BUFFER_MS||now-lastReport<REPORT_INTERVAL)return null;
  lastReport=now;return "buffering";
 }
 function reset(){bufferingSince=null;lastReport=-Infinity;lastError=0;trackedVideo=null;}
 return {scan,reset};
}
function record(store,tab,siteHost,kind,blockedMediaNearby=false,now=Date.now()){
 if(!Number.isInteger(tab)||tab<0||!supportsHost(siteHost)||!KINDS.has(kind)||
    (kind==="ad-skip"||kind==="ad-showing")&&!isYouTube(siteHost)||!Number.isFinite(now))return false;
 const previous=store.get(tab);
 const s=previous?.siteHost===siteHost?previous:{siteHost,rows:[]};
 s.rows=s.rows.filter(row=>now-row.when>=0&&now-row.when<TTL_MS);
 if(s.rows.length&&s.rows[s.rows.length-1].kind===kind&&
    now-s.rows[s.rows.length-1].when<REPORT_INTERVAL)return false;
 s.rows.push({kind,when:now,blockedMediaNearby:blockedMediaNearby===true});
 if(s.rows.length>MAX)s.rows=s.rows.slice(-MAX);
 store.set(tab,s);return true;
}
function recent(store,tab,siteHost,now=Date.now()){
 if(!supportsHost(siteHost)||!Number.isInteger(tab)||tab<0)return [];
 const s=store.get(tab);if(!s||s.siteHost!==siteHost)return [];
 s.rows=s.rows.filter(row=>now-row.when>=0&&now-row.when<TTL_MS);
 if(!s.rows.length){store.delete(tab);return [];}
 return s.rows.slice().reverse().map(x=>({...x}));
}
function clear(store,tab){store.delete(tab);}
const api=Object.freeze({BUFFER_MS,REPORT_INTERVAL,TTL_MS,MAX,isYouTube,platform,supportsHost,
 createProbe,createAdProbe,createEnforcementProbe,record,recent,clear,isAdBreak,isUnavailable});
root.DKPlaybackHealth=api;
if(typeof module!=="undefined")module.exports=api;
})(typeof globalThis!=="undefined"?globalThis:this);