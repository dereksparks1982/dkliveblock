/* DK Live Block: tiny offline-trained recommendation model.
   Training: deterministic squared-hinge single-neuron gradient, scripts/train-adaptive-model.py.
   Objective was originally prototyped with vendored MIT-licensed micrograd.
   Data: 256 PUBLICLY REPRODUCIBLE SYNTHETIC cases; no user telemetry.
   This is an uncalibrated score, NOT a prediction of ad-block success.
   Never controls request blocking, remote scripts or site allowlists. */
(function(root){"use strict";
const FEATURES=Object.freeze([
 "faultCountNormalized","blockedMediaEvidence","sawMediaError",
 "sawBuffering","sawEnforcement","sawAdSkip","sawAdShowing"
]);
const WEIGHTS=Object.freeze([1.75555591, 1.76633709, -0.04558999, -0.04558999, -2.01190795, -2.01196629, -2.01192669]);
const BIAS=-2.34714122,THRESHOLD=0.60,VERSION="offline-synthetic-v2";
function predict(input){
 if(!input||!Number.isInteger(input.faultCount)||input.faultCount<0||
   input.faultCount>3||["blockedMediaEvidence","sawMediaError","sawBuffering",
   "sawEnforcement","sawAdSkip","sawAdShowing"].some(k=>typeof input[k]!=="boolean"))
  return null;
 const features=[input.faultCount/3,
  Number(input.blockedMediaEvidence),Number(input.sawMediaError),
  Number(input.sawBuffering),Number(input.sawEnforcement),
  Number(input.sawAdSkip),Number(input.sawAdShowing)];
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
