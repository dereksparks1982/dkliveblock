/* DK Live Block: tiny offline-trained recommendation model.
   Training: MIT-licensed karpathy/micrograd, scripts/train-adaptive-model.py.
   Data: 128 PUBLICLY REPRODUCIBLE SYNTHETIC cases; no user telemetry.
   This is an uncalibrated score, NOT a prediction of ad-block success.
   Never controls request blocking, remote scripts or site allowlists. */
(function(root){"use strict";
const FEATURES=Object.freeze([
 "faultCountNormalized","blockedMediaEvidence","sawMediaError",
 "sawBuffering","sawEnforcement","sawAdSkip"
]);
const WEIGHTS=Object.freeze([
 2.29637322,2.16070138,-0.04009724,-0.04009724,-2.35395501,-2.35391517
]);
const BIAS=-2.9804441,THRESHOLD=0.60,VERSION="micrograd-synthetic-v1";
function predict(input){
 if(!input||!Number.isInteger(input.faultCount)||input.faultCount<0||
   input.faultCount>3||["blockedMediaEvidence","sawMediaError","sawBuffering",
   "sawEnforcement","sawAdSkip"].some(k=>typeof input[k]!=="boolean"))
  return null;
 const features=[input.faultCount/3,
  Number(input.blockedMediaEvidence),Number(input.sawMediaError),
  Number(input.sawBuffering),Number(input.sawEnforcement),
  Number(input.sawAdSkip)];
 const logit=features.reduce((s,x,i)=>s+x*WEIGHTS[i],BIAS);
 if(!Number.isFinite(logit))return null;
 const score=1/(1+Math.exp(-logit));
 // Uncalibrated output: only a training-set classifier score.
 return Object.freeze({recommendation:score>=THRESHOLD?"response-only":"combined",
  score:Number(score.toFixed(4)),modelVersion:VERSION});
}
const API=Object.freeze({FEATURES,WEIGHTS,BIAS,THRESHOLD,VERSION,predict});
root.DKAdaptiveModel=API;
if(typeof module!=="undefined")module.exports=API;
})(typeof globalThis!=="undefined"?globalThis:this);
