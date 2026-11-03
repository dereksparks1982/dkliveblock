/* Read-only multi-source YouTube compatibility triage. Counters can
   co-occur without sharing a cause. Never changes playback or blocking. */
(function(root){"use strict";
const positive=n=>Number.isSafeInteger(n)&&n>0;
function assess(data){
 const p=data?.playbackAssessment?.counts||{},net=data?.networkEvidence||{},
  response=data?.responseFiltering||{},codes=[];
 if(positive(p.enforcement))codes.push("in-player-enforcement-observed");
 if(positive(p["media-error"]))codes.push("media-error-observed");
 if(positive(p.buffering))codes.push("buffering-observed");
 if(positive(net.mediaBlocked)&&
    (positive(p.buffering)||positive(p["media-error"])))
  codes.push("blocked-media-and-playback-fault-coobserved");
 if(positive(net.firstPartyXHR)&&positive(p.enforcement))
  codes.push("first-party-xhr-and-enforcement-coobserved");
 if(positive(response.modified)&&positive(p.enforcement))
  codes.push("player-json-edit-and-enforcement-coobserved");
 if(!codes.length)codes.push("insufficient-playback-evidence");
 return Object.freeze({source:"local-counts-only",signals:Object.freeze(codes),
  rootCauseEstablished:false,verifiedAdFree:false,
  next:"Compare the same ordinary video and the separate Free with Ads movie under matched Firefox conditions before changing network or response filters."});
}
const API=Object.freeze({assess});
root.DKYouTubeCompatibilityAdvice=API;
if(typeof module!=="undefined")module.exports=API;
})(typeof globalThis!=="undefined"?globalThis:this);
