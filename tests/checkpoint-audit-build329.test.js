"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path");
const Audit=require("../scripts/checkpoint-audit.js"),root=path.resolve(__dirname,"..");
const files=()=>Object.fromEntries(Audit.FILES.map(p=>[p,fs.readFileSync(path.join(root,p),"utf8")]));
test("Build 329: exact source checkpoint passes and is not browser certification",()=>{
 const r=Audit.inspect(root);assert.equal(r.sourceIntegrity,true,r.failures.join(","));
 assert.equal(r.liveFirefoxVerified,false);
 assert.equal(r.fullUbuntuSuiteVerified,false);assert.equal(r.publicReleaseApproved,false);
 assert.equal(Audit.TESTS.length,16);assert.equal(Audit.POST_324_TESTS.length,5);
});
test("Build 329: missing newly registered regression is detected",()=>{
 const f=files();f["scripts/test-local.sh"]=f["scripts/test-local.sh"].replace("tests/facebook-portal-tail-build326.test.js","");
 assert.ok(Audit.fromFiles(f).failures.includes("post-324-regressions-registered"));
});
test("Build 329: changed scan cap is detected",()=>{
 const f=files();f["src/facebook-ads.js"]=f["src/facebook-ads.js"].replace("Math.min(240,cards.length)","Math.min(2000,cards.length)");
 assert.ok(Audit.fromFiles(f).failures.includes("facebook-rotation-caps-preserved"));
});
test("Build 329: deleted exact Russian label is detected",()=>{
 const f=files();f["src/facebook-ads.js"]=f["src/facebook-ads.js"].replace('s==="реклама"','s==="some-other-value"');
 assert.ok(Audit.fromFiles(f).failures.includes("guarded-russian-ad-label-scope"));
});
test("Build 329: manifest privilege drift is still rejected",()=>{
 const f=files(),m=JSON.parse(f["src/manifest.json"]);m.permissions.push("downloads");f["src/manifest.json"]=JSON.stringify(m);
 assert.ok(Audit.fromFiles(f).failures.includes("original-permissions-unchanged"));
});
