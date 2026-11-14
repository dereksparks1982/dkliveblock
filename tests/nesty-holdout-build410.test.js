"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path");
const H=require("../scripts/nesty-holdout-evaluator.js");
const Model=require("../src/adaptive-model.js");
const Lab=require("../scripts/nesty-evidence-lab.js");
const original=H.fixture(),clone=()=>structuredClone(original);
test("410: 60 synthetic examples across six site-separated profiles",()=>{
 const rows=H.validateCorpus(original);
 assert.equal(rows.length,60);
 assert.deepEqual([...new Set(rows.map(x=>x.profile))].sort(),[...H.PROFILES].sort());
 assert.equal(rows.filter(r=>r.expectedAd).length,24);
 assert.equal(rows.filter(r=>!r.expectedAd).length,36);
 assert.ok(rows.every(r=>r.evidenceSource==="self-authored-synthetic"));
});
test("410: feature schema exactly reuses existing synthetic Nesty model",()=>{
 assert.deepEqual(H.FEATURES,Model.AD_FEATURES);
 assert.equal(H.FEATURES.length,6);
 const rows=H.validateCorpus(original);
 assert.ok(rows.every(r=>H.FEATURES.every(k=>typeof r.features[k]==="boolean")));
});
test("410: all six leave-one-site-out folds exclude the withheld profile",()=>{
 const rows=H.validateCorpus(original);
 for(const p of H.PROFILES){
  const {train,test}=H.splitSite(rows,p);
  assert.equal(train.length,50);assert.equal(test.length,10);
  assert.ok(train.every(r=>r.profile!==p));
  assert.ok(test.every(r=>r.profile===p));
  assert.equal(new Set([...train,...test].map(r=>r.id)).size,60);
 }
});
test("410: site holdout validation rejects unknown profile and invalid rows",()=>{
 const rows=H.validateCorpus(original);
 assert.throws(()=>H.splitSite(rows,"private-site"));
 assert.throws(()=>H.splitSite([],"facebook"));
});
test("410: duplicate ID is refused",()=>{
 const x=clone();x.cases[0].id=x.cases[1].id;
 assert.throws(()=>H.validateCorpus(x));
});
test("410: filenames, URLs, cookies, tokens and user metadata are disallowed fields",()=>{
 for(const [key,value] of [["url","https://facebook.com/me"],["cookie","secret"],
  ["postText","user-content"],["token","abc"],["origin","private.example"]]){
  const x=clone();x.cases[0][key]=value;
  assert.throws(()=>H.validateCorpus(x));
 }
});
test("410: schema, provenance and dataset class cannot be replaced",()=>{
 for(const patch of [
  {schema:2},{fixtureId:"my-data"},{datasetClass:"browser-capture"},{url:"extra"}
 ]){
  assert.throws(()=>H.validateCorpus({...clone(),...patch}));
 }
});
test("410: refuse negative labels masquerading as ad positives in protected cases",()=>{
 const x=clone();const protectedRow=x.cases.find(r=>r.protectedCase);
 protectedRow.expectedAd=true;
 assert.throws(()=>H.validateCorpus(x));
});
test("410: protected context cannot be labeled as ad",()=>{
 const x=clone();x.cases[0].features.protectedContext=true;
 assert.throws(()=>H.validateCorpus(x));
});
test("410: protected negatives must carry explicit protectedContext",()=>{
 const x=clone();x.cases.find(r=>r.protectedCase).features.protectedContext=false;
 assert.throws(()=>H.validateCorpus(x));
});
test("410: feature set must be exact and Boolean",()=>{
 for(const mutate of [x=>x.cases[0].features.newSignal=true,
  x=>delete x.cases[0].features.knownSlot,
  x=>x.cases[0].features.knownSlot="true"]){
  const x=clone();mutate(x);
  assert.throws(()=>H.validateCorpus(x));
 }
});
test("410: require site balanced labels to avoid one-class metrics",()=>{
 const x=clone();for(const r of x.cases)if(r.profile==="facebook")r.expectedAd=false;
 assert.throws(()=>H.validateCorpus(x));
});
test("410: reject oversized corpus and incomplete data",()=>{
 const x=clone();x.cases.push(...Array.from({length:65},(_,i)=>({
  ...x.cases[i%60],id:"facebook-extra-"+i
 })));
 assert.throws(()=>H.validateCorpus(x));
 assert.throws(()=>H.validateCorpus({...clone(),cases:[]}));
});
test("410: reject score strings, out-of-range, NaN and missing scores",()=>{
 for(const score of ["0.9",NaN,Infinity,-0.1,1.1,undefined]){
  assert.throws(()=>H.evaluate(clone(),()=>({score})));
 }
});
test("410: zero denominator Wilson upper reports unknown not perfect",()=>{
 assert.equal(H.wilsonUpper(0,0),null);
 assert.ok(H.wilsonUpper(0,20)>0.1);
 assert.equal(H.wilsonUpper(20,20),1);
 for(const values of [[-1,1],[2,1],[1,-1],[0.5,10]])
  assert.throws(()=>H.wilsonUpper(...values));
});
test("410: explicit protected context vetoes even score 1",()=>{
 const r=H.validateCorpus(original).find(x=>x.protectedCase);
 assert.equal(H.predict(r,1,0.5),false);
 assert.equal(H.predict({...r,features:{...r.features,protectedContext:false}},1,0.5),true);
});
test("410: reuse original evidence lab confusion-matrix semantics",()=>{
 const rows=H.validateCorpus(original).slice(0,10);
 const scored=new Map(rows.map((r,i)=>[r.id,i<4?1:0]));
 const metric=H.measure(rows,scored,0.8);
 assert.deepEqual([metric.truePositives,metric.trueNegatives,metric.falsePositives,metric.falseNegatives],
  [4,6,0,0]);
 assert.equal(metric.falsePositiveRate,0);
 assert.ok(metric.falsePositiveWilsonUpper95>0);
 assert.equal(typeof Lab.score,"function");
});
test("410: fixed threshold baseline exposes synthetic false positives",()=>{
 const report=H.evaluate();
 assert.ok(report.baseline.falsePositives>0);
 assert.ok(report.baseline.falsePositiveRate>0.01);
 assert.ok(report.blockingReasons.includes("false-positive-target-missed"));
});
test("410: candidate abstains when precision/recall calibration cannot be satisfied",()=>{
 const report=H.evaluate();
 assert.equal(report.abstainedFolds,6);
 assert.equal(report.selectedFolds,0);
 for(const p of H.PROFILES){
  assert.equal(report.folds[p].selection,"abstain");
  assert.equal(report.folds[p].selectedThreshold,null);
  assert.equal(report.folds[p].calibratedTest,null);
 }
});
test("410: deliberate injected scorer can pass a calibration without changing release gate",()=>{
 // Perfect *synthetic* scores allow a threshold on each training fold,
 // but never grant the authority to deploy a new model.
 const scorer=features=>({score:features.protectedContext?0:
  (features.knownSlot||features.sponsoredMenu||features.railAdLink||features.adExplainer)?
   (features.knownSlot&&features.adExplainer?0.99:0.75):0.1});
 const report=H.evaluate(clone(),scorer);
 assert.equal(report.eligibleForProduction,false);
 assert.equal(report.realWorldAccuracyVerified,false);
 assert.equal(report.automaticBlocking,false);
});
test("410: privacy-safe output contains only aggregate site metrics",()=>{
 const report=H.evaluate(),text=JSON.stringify(report);
 for(const forbidden of ["https://","cookies","postText","token","ordinary-author",
   "known-slot","rail-plus-author","protected-login"])
  assert.ok(!text.includes(forbidden),forbidden);
 assert.equal("cases" in report,true);
 assert.equal(Array.isArray(report.folds),false);
 assert.equal(typeof report.baseline.precision,"number");
});
test("410: fixed thresholds are predetermined, not fitted on held-out outcomes",()=>{
 assert.deepEqual(H.THRESHOLDS,[0.8,0.9,0.95,0.98,0.99,0.995,0.999]);
 const rows=H.validateCorpus(original);
 const scored=new Map(rows.map(r=>[r.id,r.expectedAd?1:0]));
 const {train,test}=H.splitSite(rows,"facebook");
 const sel=H.chooseThreshold(train,scored);
 assert.equal(sel.threshold,0.8);
 for(const row of test)scored.set(row.id,1-row.expectedAd);
 assert.equal(H.chooseThreshold(train,scored).threshold,sel.threshold);
});
test("410: errors fail closed when no external args or input files are authorized",()=>{
 assert.throws(()=>H.main(["--dataset","/private/browser.json"]));
 assert.throws(()=>H.main(["--enable-live"]));
});
test("410: no runtime hooks, unknown dependencies, or new permissions",()=>{
 const code=fs.readFileSync(path.join(__dirname,"../scripts/nesty-holdout-evaluator.js"),"utf8");
 const manifest=require("../src/manifest.json"),pkg=require("../package.json");
 assert.doesNotMatch(code,/browser\.webRequest|tabs\.create|fetch\s*\(|sendBeacon\s*\(/);
 assert.doesNotMatch(JSON.stringify(manifest),/nesty-holdout-evaluator/);
 assert.equal(pkg.version,manifest.version);
 assert.equal(pkg.dependencies["@ghostery/adblocker"],"2.20.3");
 assert.equal(pkg.dependencies["mljs"],undefined);
});
test("410: explicit zero production promotion despite optimistic external scorer",()=>{
 const r=H.evaluate(clone(),()=>({score:1}));
 assert.equal(r.eligibleForProduction,false);
 assert.equal(r.releaseGate,"blocked");
 assert.equal(r.newRuntimeModel,false);
 assert.equal(r.trainedThisBuild,false);
 assert.ok(r.blockingReasons.includes("synthetic-labels-only"));
});
