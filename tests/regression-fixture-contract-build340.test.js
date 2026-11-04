"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path");
const files=["tests/facebook-scan-fairness-build325.test.js","tests/facebook-russian-ads-build327.test.js","tests/facebook-russian-segments-build328.test.js","tests/facebook-cursor-report-build331.test.js","tests/facebook-marketplace-fast-guard-build334.test.js","tests/facebook-editor-descendant-build335.test.js","tests/facebook-rail-rotation-build337.test.js"];
test("Build 340: corrected fixtures no longer pin historical versions",()=>{
 for(const f of files){const s=fs.readFileSync(path.join(__dirname,"..",f),"utf8");
  assert.doesNotMatch(s,/assert\.equal\(p\.version,"0\.3\.\d+"\)/);}
});
test("Build 340: article scanner cursor is modulo all 250 cards",()=>{
 const s=fs.readFileSync(path.join(__dirname,"facebook-scan-fairness-build325.test.js"),"utf8");
 assert.match(s,/articleCursor,230/);
});
test("Build 340: exact uppercase Russian disclosure is accepted",()=>{
 const s=fs.readFileSync(path.join(__dirname,"facebook-russian-ads-build327.test.js"),"utf8");
 assert.match(s,/isSponsoredLabel\(v\),true,v/);
});
test("Build 340: mock display priority must be preserved for restore",()=>{
 for(const n of ["facebook-marketplace-fast-guard-build334","facebook-editor-descendant-build335"]){
  const s=fs.readFileSync(path.join(__dirname,n+".test.js"),"utf8");
  assert.match(s,/getPropertyPriority\(\)\{return this\.priority/);
 }
});
test("Build 340: current manifest/package agree",()=>{
 const p=require("../package.json"),m=require("../src/manifest.json");
 assert.equal(p.version,m.version);
});
