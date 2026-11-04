"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path");
const A=require("../scripts/checkpoint-audit.js"),root=path.resolve(__dirname,"..");
test("Build 341: source integrity recognizes entire 325-341 series",()=>{
 const r=A.inspect(root);assert.equal(r.sourceIntegrity,true,r.failures.join(","));
 assert.ok(A.POST_324_TESTS.length>=17);assert.equal(r.liveFirefoxVerified,false);
});
test("Build 341: every registered post-324 fixture exists in current tree",()=>{
 for(const name of A.POST_324_TESTS)assert.ok(fs.statSync(path.join(root,"tests",name+".test.js")).isFile(),name);
});
test("Build 341: old code and current integration tests remain registered",()=>{
 const runner=fs.readFileSync(path.join(root,"scripts/test-local.sh"),"utf8");
 assert.ok(A.TESTS.every(name=>runner.includes("tests/"+name+".test.js")));
 assert.ok(A.POST_324_TESTS.every(name=>runner.includes("tests/"+name+".test.js")));
});
test("Build 341: no newer fixtures freeze their historical SemVer",()=>{
 const runner=fs.readFileSync(path.join(root,"scripts/test-local.sh"),"utf8");
 for(const name of A.POST_324_TESTS){
  const s=fs.readFileSync(path.join(root,"tests",name+".test.js"),"utf8");
  assert.doesNotMatch(s,/assert\.equal\(p\.version,"0\.3\.\d+"\)/,name);
 }
 assert.ok(runner.includes("tests/regression-fixture-contract-build340.test.js"));
});
test("Build 341: offline source audit does not certify browser or release",()=>{
 const p=require("../package.json"),m=require("../src/manifest.json");
 assert.equal(p.version,m.version);assert.match(p.version,/^0\.3\.\d+$/);
 assert.equal(A.inspect(root).publicReleaseApproved,false);
});
