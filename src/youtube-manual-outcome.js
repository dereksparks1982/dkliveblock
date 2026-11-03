/* Offline user-entered observations. Never equate a failure to play with
 * a successful ad block; no page URLs, network, accounts or telemetry. */
(function(root){"use strict";
const TYPES=Object.freeze(["ordinary","ad-funded-film","shorts","other"]);
const PLAY=Object.freeze(["unknown","works","refused","stalled"]);
const ADS=Object.freeze(["unknown","seen","none-seen"]);
function choose(v,items){return typeof v==="string"&&items.includes(v)?v:items[0];}
function classify(play,ads){
 if(play==="refused")return "playback-refused";
 if(play==="stalled")return "playback-stalled";
 if(play!=="works")return "playback-unverified";
 if(ads==="seen")return "ad-observed";
 if(ads==="none-seen")return "no-ad-observed";
 return "playback-works-ad-unknown";
}
function assess(raw){
 const data=raw&&typeof raw==="object"&&!Array.isArray(raw)?raw:{};
 const base={type:choose(data.baselineVideoType,TYPES),play:choose(data.baselinePlayback,PLAY),ads:choose(data.baselineAds,ADS)};
 const next={type:choose(data.candidateVideoType,TYPES),play:choose(data.candidatePlayback,PLAY),ads:choose(data.candidateAds,ADS)};
 const warnings=[];
 if(base.type!==next.type)warnings.push("Video types differ: this is not a controlled ordinary-video versus movie comparison.");
 for(const row of [base,next])if(row.play!=="works"&&row.ads==="none-seen"){
  warnings.push("No ad observed during failed or unverified playback is not evidence of successful ad blocking.");break;
 }
 if(base.play==="refused"||next.play==="refused")
  warnings.push("YouTube playback refusal requires a live-browser check before diagnosing blocked advertisements.");
 const result={baseline:classify(base.play,base.ads),candidate:classify(next.play,next.ads),
  sameVideoType:base.type===next.type,verifiedAdFree:false,
  warnings:Object.freeze(warnings)};
 return Object.freeze(result);
}
const API=Object.freeze({TYPES,PLAY,ADS,assess});
root.DKYouTubeManualOutcome=API;
if(typeof module!=="undefined")module.exports=API;
})(typeof globalThis!=="undefined"?globalThis:this);
