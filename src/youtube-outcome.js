/* DK Live Block: privacy-safe, non-affirmative YouTube outcome classifier.
   Never equates removed JSON metadata, ad-state observation or a Skip click
   with independently verified ad-free video playback. */
(function(root){"use strict";
const EVENTS=new Set(["enforcement","media-error","buffering","ad-skip","ad-showing"]);
function count(n){return Number.isSafeInteger(n)&&n>=0?Math.min(n,1000000000):0;}
function summarize(snapshot){
 const rows=(Array.isArray(snapshot?.playbackDiagnostics)?snapshot.playbackDiagnostics:[]).slice(0,30);
 const counts={enforcement:0,"media-error":0,buffering:0,"ad-skip":0,"ad-showing":0};
 for(const row of rows)if(EVENTS.has(row?.kind))counts[row.kind]++;
 let category="insufficient-evidence";
 if(counts.enforcement)category="anti-adblock-enforcement-observed";
 else if(counts["media-error"]||counts.buffering)category="playback-fault-observed";
 else if(counts["ad-showing"])category="player-ad-state-observed";
 else if(counts["ad-skip"])category="skip-action-observed";
 else if(count(snapshot?.youtubeResponse?.modified))category="metadata-modified-outcome-unverified";
 return {category,counts,observations:Object.values(counts).reduce((a,b)=>a+b,0),
  modifiedResponses:count(snapshot?.youtubeResponse?.modified),
  verifiedAdFree:false,
  caveat:"Local counters do not establish whether video played ad-free. The observation mode, a clean profile and direct browser comparison are required."};
}
const API=Object.freeze({EVENTS,summarize});
root.DKYouTubeOutcome=API;
if(typeof module!=="undefined")module.exports=API;
})(typeof globalThis!=="undefined"?globalThis:this);
