/* DK Live Block Build 43: local YouTube and Disney+ playback health probe.
   Only coarse buffering/error observations. No URLs, titles, media progress,
   response payloads, or automatic request allowances. */
(function(root){"use strict";
const BUFFER_MS=5000,REPORT_INTERVAL=20000,TTL_MS=30*60*1000,MAX=30;
const KINDS=new Set(["buffering","media-error","enforcement"]);
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
 if(!Number.isInteger(tab)||tab<0||!supportsHost(siteHost)||!KINDS.has(kind)||!Number.isFinite(now))return false;
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
 createProbe,record,recent,clear,isAdBreak,isUnavailable});
root.DKPlaybackHealth=api;
if(typeof module!=="undefined")module.exports=api;
})(typeof globalThis!=="undefined"?globalThis:this);