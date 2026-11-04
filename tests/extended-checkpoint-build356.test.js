"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path");
const Audit=require("../scripts/checkpoint-audit.js"),root=path.resolve(__dirname,"..");
test("Build 356: all thirty-two build tests are registered exactly once",()=>{
 assert.equal(Audit.POST_324_TESTS.length,32);
 assert.equal(new Set(Audit.POST_324_TESTS).size,32);
 const runner=fs.readFileSync(path.join(root,"scripts/test-local.sh"),"utf8");
 for(const name of Audit.POST_324_TESTS)assert.ok(runner.includes("tests/"+name+".test.js"),name);
});
test("Build 356: full source checkpoint passes but browser certification remains false",()=>{
 const r=Audit.inspect(root);
 assert.equal(r.sourceIntegrity,true,r.failures.join(","));
 assert.ok(r.checked>=24);assert.equal(r.liveFirefoxVerified,false);
 assert.equal(r.fullUbuntuSuiteVerified,false);assert.equal(r.publicReleaseApproved,false);
});
test("Build 356: bilingual readmes disclose pending acceptance and shared banner",()=>{
 const en=fs.readFileSync(path.join(root,"README.md"),"utf8"),
  ru=fs.readFileSync(path.join(root,"README.ru.md"),"utf8");
 assert.match(en,/\*\*Development status:\*\* Active pre-release/);
 assert.match(ru,/\*\*Статус разработки:\*\* Предварительная версия/);
 assert.ok(en.includes("DK%20Live%20Block%20Neon%20Banner.png"));
 assert.ok(ru.includes("DK%20Live%20Block%20Neon%20Banner.png"));
});
test("Build 356: read-only diagnostics cannot auto-certify ad-free YouTube",()=>{
 const src=fs.readFileSync(path.join(root,"src/youtube-lab-ui.js"),"utf8");
 assert.match(src,/verifiedAdFree:false/);
 const advice=fs.readFileSync(path.join(root,"src/youtube-compatibility-advice.js"),"utf8");
 assert.match(advice,/rootCauseEstablished:false,verifiedAdFree:false/);
});
test("Build 356: current version, Firefox scope and permissions preserved",()=>{
 const p=require("../package.json"),m=require("../src/manifest.json");
 assert.equal(p.version,m.version);assert.match(p.version,/^0\.3\.\d+$/);
 assert.deepEqual([...m.permissions].sort(),[...Audit.PERMISSIONS].sort());
});
