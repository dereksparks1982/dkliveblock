"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path");
const Gate=require("../scripts/third-party-license-gate.js");
test("Build 394: reviewed local MIT and MPL files remain present",()=>{
 const report=Gate.check(Gate.current());
 assert.equal(report.ok,true,report.issues.join("\n"));
});
test("Build 394: unknown or unpinned dependency fails",()=>{
 const snapshot=Gate.current();
 assert.equal(Gate.check({...snapshot,pkg:{...snapshot.pkg,dependencies:{
  ...snapshot.pkg.dependencies,"gpl-unreviewed":"1.0.0"}}}).ok,false);
 assert.equal(Gate.check({...snapshot,pkg:{...snapshot.pkg,dependencies:{
  "@ghostery/adblocker":"^2.20.3"}}}).ok,false);
});
test("Build 394: removed upstream notice or changed vendor digest fails",()=>{
 const snapshot=Gate.current();
 assert.equal(Gate.check({...snapshot,bundleSha256:"wrong"}).ok,false);
 assert.equal(Gate.check({...snapshot,sources:{...snapshot.sources,
  "src/LICENSE-GHOSTERY.txt":"removed"}}).ok,false);
});
test("Build 394: Firefox integration order is verified without changing runtime",()=>{
 const snapshot=Gate.current();
 assert.equal(Gate.check({...snapshot,manifest:{...snapshot.manifest,
  background:{scripts:["hybrid-engine.js","ghostery-vendor.js"]}}}).ok,false);
});
test("Build 394: provenance gate performs no network or installation",()=>{
 const code=fs.readFileSync(path.join(__dirname,"../scripts/third-party-license-gate.js"),"utf8");
 for(const name of ["fetch(","spawn(","exec(","https.get(","sendBeacon(","XMLHttpRequest"])
  assert.equal(code.includes(name),false,name);
});
