"use strict";
/* Build 410: offline, synthetic-only Nesty evaluation. This is NOT a browser
 * runtime, new model training, telemetry, user-content collection, rule writer,
 * or permission to hide any post. Reuses Build 295 evidence metrics and the
 * already-shipped, uncalibrated synthetic AD model for review-only research. */
const Model=require("../src/adaptive-model.js");
const Lab=require("./nesty-evidence-lab.js");
const PROFILES=Object.freeze(["facebook","youtube","streaming","pornhub","general","popup"]);
const FEATURES=Model.AD_FEATURES;
const MAX_CASES=120;
const THRESHOLDS=Object.freeze([0.8,0.9,0.95,0.98,0.99,0.995,0.999]);
const PATTERNS=Object.freeze([
 ["known-slot",true,false,["knownSlot"]],
 ["sponsor-plus-explainer",true,false,["sponsoredMenu","adExplainer"]],
 ["rail-plus-author",true,false,["railAdLink","authorAdByline"]],
 ["multi-confirmed",true,false,["knownSlot","adExplainer","authorAdByline"]],
 ["ordinary-post",false,false,[]],
 ["protected-login",false,true,["protectedContext","knownSlot"]],
 ["protected-checkout",false,true,["protectedContext","sponsoredMenu","adExplainer"]],
 ["ordinary-author",false,false,["authorAdByline"]],
 ["ordinary-rail",false,false,["sponsoredMenu","railAdLink"]],
 ["ordinary-explainer",false,false,["adExplainer"]]
]);
const TOP_KEYS=Object.freeze(["schema","datasetClass","fixtureId","cases"]);
const ROW_KEYS=Object.freeze(["id","profile","expectedAd","protectedCase","evidenceSource","features"]);
const ID=/^[a-z0-9]+(?:-[a-z0-9]+)*$/;
function keysExact(value,keys){
 return !!value&&typeof value==="object"&&!Array.isArray(value)&&
  Object.keys(value).length===keys.length&&
  Object.keys(value).every(key=>keys.includes(key));
}
function fixture(){
 const cases=[];
 for(const profile of PROFILES){
  for(const [pattern,expectedAd,protectedCase,present] of PATTERNS){
   const features=Object.fromEntries(FEATURES.map(k=>[k,present.includes(k)]));
   cases.push({id:profile+"-"+pattern,profile,expectedAd,protectedCase,
    evidenceSource:"self-authored-synthetic",features});
  }
 }
 return {schema:1,datasetClass:"self-authored-synthetic",fixtureId:"dk-nesty-holdout-410",
  cases};
}
function validateCorpus(data){
 if(!keysExact(data,TOP_KEYS)||data.schema!==1||
  data.datasetClass!=="self-authored-synthetic"||
  data.fixtureId!=="dk-nesty-holdout-410"||
  !Array.isArray(data.cases)||data.cases.length<30||
  data.cases.length>MAX_CASES)throw Error("Refusing unapproved, private or oversized Nesty corpus");
 const ids=new Set(),counts=Object.fromEntries(PROFILES.map(p=>[p,{positive:0,negative:0}]));
 const rows=[];
 for(const r of data.cases){
  if(!keysExact(r,ROW_KEYS)||typeof r.id!=="string"||r.id.length>75||
   !ID.test(r.id)||ids.has(r.id)||!PROFILES.includes(r.profile)||
   !r.id.startsWith(r.profile+"-")||
   typeof r.expectedAd!=="boolean"||typeof r.protectedCase!=="boolean"||
   (r.protectedCase&&r.expectedAd)||
   r.evidenceSource!=="self-authored-synthetic"||
   !keysExact(r.features,FEATURES)||
   FEATURES.some(k=>typeof r.features[k]!=="boolean")||
   (r.protectedCase&&!r.features.protectedContext)||
   (r.features.protectedContext&&r.expectedAd))
   throw Error("Invalid or sensitive synthetic Nesty evidence row");
  ids.add(r.id);
  counts[r.profile][r.expectedAd?"positive":"negative"]++;
  rows.push(Object.freeze({...r,features:Object.freeze({...r.features})}));
 }
 if(PROFILES.some(p=>counts[p].positive<2||counts[p].negative<2))
  throw Error("Site profiles must contain independent positive and negative cases");
 return Object.freeze(rows);
}
function splitSite(rows,heldOut){
 if(!PROFILES.includes(heldOut)||!Array.isArray(rows))
  throw Error("Unsupported holdout site");
 const train=rows.filter(row=>row.profile!==heldOut);
 const test=rows.filter(row=>row.profile===heldOut);
 if(!train.length||!test.length||
  train.some(row=>row.profile===heldOut)||test.some(row=>row.profile!==heldOut))
  throw Error("Site-separated holdout is incomplete");
 const trainingIds=new Set(train.map(row=>row.id));
 if(test.some(row=>trainingIds.has(row.id)))throw Error("Holdout ID leaked into training");
 return Object.freeze({train:Object.freeze(train),test:Object.freeze(test)});
}
function wilsonUpper(falsePositives,negatives){
 if(!Number.isSafeInteger(falsePositives)||!Number.isSafeInteger(negatives)||
  negatives<0||falsePositives<0||falsePositives>negatives)throw Error("Invalid Wilson inputs");
 if(!negatives)return null;
 const z=1.96,p=falsePositives/negatives,z2=z*z;
 const upper=(p+z2/(2*negatives)+z*Math.sqrt(
  p*(1-p)/negatives+z2/(4*negatives*negatives)))/(1+z2/negatives);
 return Number(Math.min(1,upper).toFixed(4));
}
function predict(row,score,threshold){
 // Explicit protected contexts veto a proposed classification even if a
 // scorer returns 1. This is still only an evaluation, NOT a browser rule.
 return !row.features.protectedContext&&score>=threshold;
}
function measure(rows,scored,threshold){
 const verdicts=rows.map(row=>{
  if(!scored.has(row.id))throw Error("Missing candidate score");
  return {productionBlock:predict(row,scored.get(row.id),threshold)};
 });
 // Reuse Build 295's established TP/TN/FP/FN and protected FP logic.
 const s=Lab.score(rows.map(r=>({expectedBlock:r.expectedAd,
  protectedCase:r.protectedCase})),verdicts,"productionBlock");
 return Object.freeze({...s,cases:rows.length,
  negativeCases:s.falsePositives+s.trueNegatives,
  protectedNegativeCases:rows.filter(r=>r.protectedCase).length,
  falsePositiveWilsonUpper95:wilsonUpper(s.falsePositives,s.falsePositives+s.trueNegatives)});
}
function chooseThreshold(train,scored){
 if(train.length<40)throw Error("Training-side fold too small");
 // Fixed grid and criteria. Held-out site must never be passed to this step.
 for(const threshold of THRESHOLDS){
  const m=measure(train,scored,threshold);
  if(m.negativeCases>=25&&m.truePositives+m.falseNegatives>=15&&
    m.protectedFalsePositives===0&&m.falsePositiveRate!==null&&
    m.falsePositiveRate<=0.05&&m.precision!==null&&m.precision>=0.98&&
    m.recall!==null&&m.recall>=0.5)
   return Object.freeze({threshold,trainingMetrics:m});
 }
 return null; // fail-closed abstention, never tune on held-out results
}
function evaluate(input=fixture(),scorer=Model.inspectAdCandidate){
 const rows=validateCorpus(input);
 if(typeof scorer!=="function")throw Error("Candidate scoring function required");
 const scored=new Map();
 for(const row of rows){
  const result=scorer(row.features);
  const score=result?.score;
  if(typeof score!=="number"||!Number.isFinite(score)||score<0||score>1)
   throw Error("Untrusted candidate score");
  scored.set(row.id,score);
 }
 const folds={};
 let abstained=0,chosen=0;
 for(const profile of PROFILES){
  const {train,test}=splitSite(rows,profile);
  const selection=chooseThreshold(train,scored);
  if(selection===null)abstained++;else chosen++;
  // Always report the fixed, uncalibrated model threshold as diagnostics,
  // even if calibration abstains. This is NOT a deployed-blocking outcome.
  folds[profile]=Object.freeze({
   trainCases:train.length,testCases:test.length,
   selection:selection===null?"abstain":"training-only-selected",
   selectedThreshold:selection?.threshold??null,
   baselineAtExistingThreshold:measure(test,scored,Model.AD_THRESHOLD),
   calibratedTest:selection?measure(test,scored,selection.threshold):null
  });
 }
 const overall=measure(rows,scored,Model.AD_THRESHOLD);
 const reasons=["synthetic-labels-only","no-approved-real-site-holdout",
  "minimum-independent-negative-sample-not-met"];
 if(abstained)reasons.push("threshold-calibration-abstained");
 if(overall.protectedFalsePositives)reasons.push("protected-content-false-positive");
 if(overall.falsePositiveRate>0.01)reasons.push("false-positive-target-missed");
 return Object.freeze({
  reportType:"offline-nesty-site-holdout",schema:1,
  evidenceClass:"self-authored-synthetic-only",
  fixtureId:input.fixtureId,modelVersion:Model.AD_VERSION,
  cases:rows.length,profiles:PROFILES.length,
  siteHeldOutEveryFold:true,features:FEATURES.length,
  baseThreshold:Model.AD_THRESHOLD,baseline:overall,
  folds:Object.freeze(folds),
  selectedFolds:chosen,abstainedFolds:abstained,
  target:Object.freeze({precision:0.98,trainingFalsePositiveRate:0.05,
   trainingRecall:0.5,minimumRealNegativeExamples:200,
   minimumRealPositiveExamples:100,productionFalsePositiveUpper95:0.01}),
  status:"research-only",realWorldAccuracyVerified:false,
  trainedThisBuild:false,newRuntimeModel:false,automaticBlocking:false,
  eligibleForProduction:false,releaseGate:"blocked",
  blockingReasons:Object.freeze(reasons)
 });
}
function main(argv=process.argv.slice(2)){
 if(argv.length)throw Error("Offline Nesty evaluation takes no file, URL or training arguments");
 const report=evaluate();
 console.log(JSON.stringify(report,null,2));
 if(report.eligibleForProduction)throw Error("Synthetic benchmark cannot authorize production");
}
if(require.main===module){
 try{main();}catch(err){console.error("Nesty holdout audit:",err.message);process.exitCode=1;}
}
module.exports={PROFILES,FEATURES,THRESHOLDS,PATTERNS,fixture,validateCorpus,
 splitSite,wilsonUpper,predict,measure,chooseThreshold,evaluate,main};
