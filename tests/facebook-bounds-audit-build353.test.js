"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path");
const A=require("../scripts/checkpoint-audit.js"),root=path.resolve(__dirname,"..");
const files=()=>Object.fromEntries(A.FILES.map(n=>[n,fs.readFileSync(path.join(root,n),"utf8")]));
test("Build 353: newer bounded scan contracts pass without live assertions",()=>{
 const r=A.inspect(root);assert.equal(r.sourceIntegrity,true,r.failures.join(","));
 assert.equal(r.liveFirefoxVerified,false);assert.equal(r.publicReleaseApproved,false);
});
test("Build 353: deleted article sampler breaks audit",()=>{
 const f=files();f["src/facebook-ads.js"]=f["src/facebook-ads.js"].replace("sampleFastArticles(nodes,max=18)","sampleFastArticles(nodes,max=10000)");
 assert.ok(A.fromFiles(f).failures.includes("facebook-tail-helper-limits"));
});
test("Build 353: removing newest insertion budget breaks audit",()=>{
 const f=files();f["src/facebook-ads.js"]=f["src/facebook-ads.js"].replace("tailRoots>=8","tailRoots>=320");
 assert.ok(A.fromFiles(f).failures.includes("facebook-mutator-budget-guards"));
});
test("Build 353: weakened edit/post safety fails audit",()=>{
 const f=files();f["src/facebook-ads.js"]=f["src/facebook-ads.js"].replace("independentPostCount(c)<=1","true");
 assert.ok(A.fromFiles(f).failures.includes("facebook-editable-and-post-safety"));
});
test("Build 353: original Firefox permission baseline remains protected",()=>{
 const f=files(),m=JSON.parse(f["src/manifest.json"]);m.permissions.push("downloads");f["src/manifest.json"]=JSON.stringify(m);
 assert.ok(A.fromFiles(f).failures.includes("original-permissions-unchanged"));
 assert.equal(require("../src/manifest.json").version,require("../package.json").version);
});
