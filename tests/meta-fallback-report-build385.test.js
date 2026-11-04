"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path");
const R=require("../src/facebook-diagnostic-report.js");
const D=require("../src/facebook-runtime-diagnostics.js");
const src=path.join(__dirname,"..","src");
const healthy={
 ok:true,active:true,adRecognition:true,adapterLoaded:true,picking:false,
 detector:{platform:"facebook",coreFull:1,coreEnabled:1,settingsReady:1,observerActive:1,
  scans:20,labelsClassified:3,labelsAnchored:0,hidden:0,legacyActive:1,
  legacyWakeups:2,legacyHidden:0,nestyFallback:{
   active:true,wakeups:2,lastReason:"full-engine-missed-labels",
   secretPostText:"PRIVATE-CONTENT",profileId:"NEVER-EXPORT"}}
};
test("Build 385: Nesty fallback can be active without claiming ads were removed",()=>{
 const report=R.build(healthy,null);
 assert.equal(report.detector.legacyActive,1);
 assert.equal(report.detector.legacyWakeups,2);
 assert.equal(report.detector.legacyHidden,0);
 assert.equal(report.triage.code,"nesty-legacy-fallback-active");
 assert.doesNotMatch(JSON.stringify(report),/PRIVATE-CONTENT|NEVER-EXPORT|secretPostText|profileId|lastReason/);
});
test("Build 385: actual fallback hide is distinguishable from mere activation",()=>{
 const d={...healthy,detector:{...healthy.detector,legacyHidden:1}};
 const r=R.build(d,null);
 assert.equal(r.detector.hidden,0);
 assert.equal(r.detector.legacyHidden,1);
 assert.equal(r.triage.code,"dom-hide-observed");
 assert.match(D.diagnosisText(r),/Nesty fallback active: yes/);
 assert.match(D.diagnosisText(r),/legacy-hidden posts: 1/);
});
test("Build 385: hostile count fields are rejected and only fixed keys exported",()=>{
 const result=R.build({...healthy,detector:{...healthy.detector,
  legacyWakeups:"100000",legacyHidden:-1,unknown:"private",legacyActive:99999999}},null);
 assert.equal("unknown" in result.detector,false);
 assert.equal("legacyWakeups" in result.detector,false);
 assert.equal("legacyHidden" in result.detector,false);
 assert.equal("legacyActive" in result.detector,false);
});
test("Build 385: full-core-missing or paused diagnosis precedes legacy flags",()=>{
 const stopped=R.build({...healthy,active:false},null);
 assert.equal(stopped.triage.code,"protection-inactive");
 const missing=R.build({...healthy,detector:{...healthy.detector,coreMissing:1}},null);
 assert.equal(missing.triage.code,"facebook-full-core-missing");
});
test("Build 385: no additional network or remote-data interface",()=>{
 const code=fs.readFileSync(path.join(src,"meta-module.js"),"utf8");
 const diag=fs.readFileSync(path.join(src,"facebook-runtime-diagnostics.js"),"utf8");
 assert.match(code,/legacyActive:supervisor\?\.snapshot/);
 assert.ok(!code.includes("fetch("));
 assert.ok(!diag.includes("sendBeacon("));
 assert.ok(!diag.includes("browser.storage.local.set("));
 assert.equal(require("../src/manifest.json").version,require("../package.json").version);
});
