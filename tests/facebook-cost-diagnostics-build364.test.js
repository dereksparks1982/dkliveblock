"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path");
const source=fs.readFileSync(path.join(__dirname,"../src/facebook-full-core.js"),"utf8");
const R=require("../src/facebook-diagnostic-report.js");
function report(d){return R.build({ok:true,active:true,adRecognition:true,adapterLoaded:true,
 picking:false,detector:d,lastScanAt:0},null)}
test("Build 364: cost metrics are bounded, stripped, and intentionally source-free",()=>{
 const d=report({coreFull:1,observerActive:1,coreEnabled:1,settingsReady:1,
  scanCostMs:23,observerCostMs:41,retryCostMs:10,scanElements:1234,
  labelsUnanchored:2,customPostText:"private",unrecognizedUrl:"https://example.com/private"});
 assert.equal(d.detector.scanCostMs,23);assert.equal(d.detector.observerCostMs,41);
 assert.equal(d.detector.retryCostMs,10);assert.equal(d.detector.labelsUnanchored,2);
 assert.equal("customPostText" in d.detector,false);assert.equal("unrecognizedUrl" in d.detector,false);
});
test("Build 364: malformed cost data and negative timestamps are ignored",()=>{
 const d=report({scanCostMs:-1,observerCostMs:"40",retryCostMs:NaN,scanElements:1.1,labelsUnanchored:Infinity});
 for(const key of ["scanCostMs","observerCostMs","retryCostMs","scanElements","labelsUnanchored"])
  assert.equal(key in d.detector,false,key);
});
test("Build 364: active engine without an attached observer is diagnosed",()=>{
 const d=report({coreFull:1,coreEnabled:1,settingsReady:1,observerActive:0,scans:1});
 assert.equal(d.triage.code,"facebook-observer-inactive");
});
test("Build 364: cost metrics derive from the original complete observer",()=>{
 assert.match(source,/scanCostMs:duration\(stats\.ms\)/);
 assert.match(source,/observerCostMs:duration\(stats\.observerMs\)/);
 assert.match(source,/retryCostMs:duration\(stats\.retryMs\)/);
 assert.match(source,/labelsUnanchored:Math\.max\(0,labelsClassified-labelsAnchored-labelsDeferred\)/);
});
test("Build 364: complete feature source retained and versions agree",()=>{
 assert.ok(source.includes("function sweepUnlabeledAds("));
 assert.equal(require("../src/manifest.json").version,require("../package.json").version);
});
