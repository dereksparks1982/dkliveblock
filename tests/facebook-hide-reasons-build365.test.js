"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path");
const src=fs.readFileSync(path.join(__dirname,"../src/facebook-full-core.js"),"utf8");
const R=require("../src/facebook-diagnostic-report.js");
const build=data=>R.build({ok:true,active:true,adRecognition:true,picking:false,adapterLoaded:true,detector:data},null);
test("Build 365: seven reason buckets and restores are retained",()=>{
 for(const key of ["hideByLabel","hideByShape","hideByMarked","hideBySuggested",
 "hideByUnfollowed","hideBySection","hideByOther","restoreOperations"])
  assert.ok(src.includes(key+":"),key);
 assert.ok(src.includes('via === "shape"'));
 assert.ok(src.includes('via === "marked"'));
});
test("Build 365: privacy-safe report preserves numeric categories only",()=>{
 const report=build({hideByShape:6,hideByLabel:4,hideByMarked:1,
  hideBySuggested:2,hideByUnfollowed:0,hideBySection:3,hideByOther:0,
  restoreOperations:2,advertiserName:"ModRetro",adUrl:"https://secret.invalid"});
 assert.equal(report.detector.hideByShape,6);
 assert.equal(report.detector.hideByLabel,4);
 assert.equal(report.detector.restoreOperations,2);
 assert.equal("advertiserName" in report.detector,false);
 assert.equal("adUrl" in report.detector,false);
});
test("Build 365: invalid and enormous category values are not exported",()=>{
 const result=build({hideByShape:1000001,hideByLabel:-1,hideByOther:"5"});
 assert.ok(!("hideByShape" in result.detector));
 assert.ok(!("hideByLabel" in result.detector));
 assert.ok(!("hideByOther" in result.detector));
});
test("Build 365: original per-post hiding and restoring still execute",()=>{
 assert.ok(src.includes("hiddenPosts.set(container, { reason"));
 assert.ok(src.includes("hiddenPosts.delete(container)"));
 assert.ok(src.includes("function hidePost("));
 assert.ok(src.includes("function restorePost("));
});
test("Build 365: package and manifest versions agree",()=>{
 assert.equal(require("../src/manifest.json").version,require("../package.json").version);
});
