"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path");
const Lab=require("../scripts/nesty-evidence-lab.js");
const Audit=require("../scripts/engine-verdict-audit.js");
const fixture=Lab.loadFixture(),ROOT=path.resolve(__dirname,"..");
test("Build 295: 35 labeled synthetic and reserved-domain fixtures",()=>{
 const rows=Lab.validateCorpus(fixture);
 assert.equal(rows.length,35);
 assert.equal(new Set(rows.map(x=>x.id)).size,35);
 assert.ok(rows.filter(x=>x.protectedCase).length>=20);
 assert.ok(rows.every(x=>x.evidenceSource==="self-authored-synthetic"));
 assert.ok(rows.every(x=>new URL(x.url).hostname.endsWith(".example")));
});
test("Build 295: scoring detects protected false positives and misses",()=>{
 const rows=[{expectedBlock:true,protectedCase:false},{expectedBlock:true,protectedCase:false},
 {expectedBlock:false,protectedCase:true},{expectedBlock:false,protectedCase:false}];
 const v=[{productionBlock:true},{productionBlock:false},
 {productionBlock:true},{productionBlock:false}];
 const s=Lab.score(rows,v,"productionBlock");
 assert.deepEqual([s.truePositives,s.trueNegatives,s.falsePositives,
 s.falseNegatives,s.protectedFalsePositives],[1,1,1,1,1]);
 assert.equal(s.precision,0.5);
 assert.equal(s.recall,0.5);
 assert.equal(s.falsePositiveRate,0.5);
 assert.equal(Lab.ratio(0,0),null);
});
test("Build 295: reject duplicate, private or malformed evidence inputs",()=>{
 const mutations=[
 r=>r.id=fixture.cases[1].id,
 r=>r.url="https://facebook.com/profile",
 r=>r.url="https://user:secret@ads.fb.example/item",
 r=>r.url+="?token=1",
 r=>r.evidenceSource="private-live-data",
 r=>r.injection="alert(1)",
 r=>r.rules="https://external.invalid",
 r=>r.policy={bypass:true},
 r=>r.method="DELETE"
 ];
 for(const change of mutations){
  const bad=structuredClone(fixture);
  change(bad.cases[0]);
  assert.throws(()=>Lab.validateCorpus(bad));
 }
});
test("Build 295: bound corpus size, site profile, and rule length",()=>{
 assert.throws(()=>Lab.validateCorpus({...fixture,cases:Array(97).fill(fixture.cases[0])}),/Bounded/);
 const x=structuredClone(fixture);x.cases[0].profile="unknown";
 assert.throws(()=>Lab.validateCorpus(x),/Invalid/);
 const y=structuredClone(fixture);y.cases[0].rules="x".repeat(2100);
 assert.throws(()=>Lab.validateCorpus(y),/Invalid/);
});
test("Build 295: auditing requires exact ID ordering and boolean verdicts",()=>{
 const stub=(env,rows)=>rows.map(r=>({id:r.id,nativeBlock:false,
 productionBlock:false,vendorMatch:false,category:"both_allow"}));
 assert.equal(Lab.analyze(fixture,{},stub).sampleCount,35);
 assert.throws(()=>Lab.analyze(fixture,{},(e,rows)=>stub(e,rows).slice(1)),/Incomplete/);
 assert.throws(()=>Lab.analyze(fixture,{},(e,rows)=>stub(e,rows).map((r,i)=>
 i? r:{...r,id:"wrong"})),/Untrusted/);
 assert.throws(()=>Lab.analyze(fixture,{},(e,rows)=>stub(e,rows).map((r,i)=>
 i? r:{...r,productionBlock:"yes"})),/Untrusted/);
});
test("Build 295: report includes only safe categories, not request addresses or filter text",()=>{
 const report=Lab.analyze(fixture,{},(env,rows)=>rows.map(r=>({id:r.id,
 nativeBlock:r.expectedBlock,productionBlock:r.expectedBlock,
 vendorMatch:false,category:"both_allow"})));
 const text=JSON.stringify(report);
 for(const s of ["https://","ads.fb.example","||ads.","thumb.jpg"])
  assert.equal(text.includes(s),false,s);
 assert.equal(report.automaticBlocking,false);
 assert.equal(report.trainedModel,false);
 assert.equal(report.realBrowserVerified,false);
 assert.equal(report.vendorRawMatchIsNotProductionVerdict,true);
 assert.ok(Object.isFrozen(report));
});
test("Build 295: actual shipped DK/Ghostery engines evaluate every simulated case",()=>{
 const report=Lab.analyze(fixture,Audit.loadEnvironment());
 assert.equal(report.sampleCount,35);
 assert.equal(report.positiveCases+report.negativeCases,35);
 assert.equal(report.hybrid.truePositives+report.hybrid.trueNegatives+
 report.hybrid.falsePositives+report.hybrid.falseNegatives,35);
 assert.ok(report.byProfile.facebook.cases>=7);
 assert.ok(report.byProfile.streaming.cases>=3);
 for(const x of report.cases){
  assert.equal("url" in x,false);
  assert.equal("rules" in x,false);
  assert.equal(typeof x.hybridBlock,"boolean");
 }
});
test("Build 295: local runner, version and unchanged extension permissions",()=>{
 const pkg=require("../package.json"),manifest=require("../src/manifest.json");
 const script=fs.readFileSync(path.join(ROOT,"scripts/test-local.sh"),"utf8");
 assert.equal(pkg.version,"0.3.265");
 assert.equal(manifest.version,pkg.version);
 assert.equal(pkg.scripts["audit:evidence"],"node scripts/nesty-evidence-lab.js");
 assert.ok(script.includes("tests/nesty-evidence-lab-build295.test.js"));
 assert.ok(script.includes("node scripts/nesty-evidence-lab.js || rc=1"));
 assert.equal(manifest.permissions.includes("declarativeNetRequest"),false);
});
