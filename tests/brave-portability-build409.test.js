"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path");
const B=require("../scripts/brave-portability-audit.js");
const Diff=require("../scripts/engine-verdict-audit.js");
const C=B.corpus();
const verdicts=()=>({schema:1,engine:B.ENGINE,crateVersion:"0.13.5",
 cases:C.cases.map(c=>({id:c.id,blocked:false,exception:false,redirect:false}))});
const fakeBaseline=C.cases.map(c=>({id:c.id,productionBlock:false,nativeBlock:false,
 vendorMatch:false,vendorException:false}));
const safari=()=>({schema:1,engine:B.ENGINE,crateVersion:"0.13.5",
 format:"apple-content-blocker-v1",inputRuleLines:4,convertedSourceRuleCount:3,
 rules:[{trigger:{"url-filter":"ads\\.example"},action:{type:"block"}},
 {trigger:{"url-filter":"tracker\\.example"},action:{type:"block"}}]});
const read=p=>fs.readFileSync(path.join(__dirname,"..",p),"utf8");
test("409: corpus reuses existing bounded DK engine case IDs exactly",()=>{
 assert.equal(C.schema,1);assert.equal(C.mode,"compare");
 assert.deepEqual(C.cases.map(x=>x.id),Diff.SAMPLES.map(x=>x.id));
 assert.equal(new Set(C.cases.map(x=>x.id)).size,C.cases.length);
});
test("409: comparison inputs are synthetic and never user browsing data",()=>{
 for(const c of C.cases){
  assert.match(c.origin,/\.example$/);
  assert.match(c.url,/^(?:https?|wss):\/\/[^/]+\.example(?:\/|$)/);
  assert.equal(typeof c.rules,"string");
  assert.equal(c.method,Diff.SAMPLES.find(x=>x.id===c.id).method||"GET");
 }
});
test("409: valid report accepts unordered but complete Brave verdicts",()=>{
 const x=verdicts();x.cases.reverse();
 assert.equal(B.validateVerdicts(x),true);
 assert.equal(B.compare(x,fakeBaseline).cases.length,C.cases.length);
});
test("409: missing, extra and duplicate case IDs are rejected",()=>{
 for(const mutate of [a=>a.cases.pop(),a=>a.cases[0].id="fabricated-ad",
  a=>a.cases[1].id=a.cases[0].id]){
  const x=verdicts();mutate(x);assert.throws(()=>B.validateVerdicts(x));
 }
});
test("409: report cannot smuggle URLs, filters or private text",()=>{
 for(const [field,value] of [["url","https://private.example/me"],
   ["rules","||private.example^"],["profile","someone"],["token","secret"]]){
  const x=verdicts();x.cases[0][field]=value;
  assert.throws(()=>B.validateVerdicts(x));
 }
 const x=verdicts();x.browsingHistory=[];assert.throws(()=>B.validateVerdicts(x));
});
test("409: strict pinned engine and numeric schema required",()=>{
 for(const patch of [{crateVersion:"0.13.4"},{engine:"unknown"},{schema:2}]){
  assert.throws(()=>B.validateVerdicts({...verdicts(),...patch}));
 }
});
test("409: invalid verdict booleans fail instead of coercing",()=>{
 for(const val of ["true",1,null]){
  const x=verdicts();x.cases[0].blocked=val;
  assert.throws(()=>B.validateVerdicts(x));
 }
});
test("409: same verdicts get agreement but no browser success claim",()=>{
 const r=B.compare(verdicts(),fakeBaseline);
 assert.equal(r.verifiedBrowser,false);
 assert.equal(r.productionPolicyChanged,false);
 assert.equal(r.counts.disagree,0);
 assert.ok(r.counts.policyExcluded>0);
 assert.ok(r.counts.agree>0);
 assert.equal(r.cases.length,C.cases.length);
});
test("409: meaningful vendor/production divergences are surfaced",()=>{
 const x=verdicts(),id=Diff.SAMPLES.find(Diff.eligible).id;
 x.cases.find(v=>v.id===id).blocked=true;
 const r=B.compare(x,fakeBaseline);
 assert.equal(r.counts.disagree,1);
 assert.equal(r.cases.find(v=>v.id===id).parity,"disagree");
});
test("409: redirect behavior is segregated for review, not treated as parity",()=>{
 const x=verdicts(),id=Diff.SAMPLES.find(Diff.eligible).id;
 x.cases.find(v=>v.id===id).redirect=true;
 assert.equal(B.compare(x,fakeBaseline).cases.find(v=>v.id===id).parity,"redirect-needs-review");
});
test("409: policy-excluded popups/frames stay excluded in Brave comparison",()=>{
 const x=verdicts(),r=B.compare(x,fakeBaseline);
 for(const id of ["popup-exception","page-frame","document-exemption"])
  assert.equal(r.cases.find(v=>v.id===id).parity,"policy-excluded");
});
test("409: Safari conversion uses tiny fixed synthetic fixture only",()=>{
 const x=B.safariCorpus();
 assert.equal(x.schema,1);assert.equal(x.mode,"safari");
 assert.equal(x.rules.split("\n").length,4);
 assert.ok(!x.rules.includes("http"));
});
test("409: Safari report summarizes action categories, not raw rule contents",()=>{
 const result=B.safariSummary(safari());
 assert.equal(result.outputRuleCount,2);
 assert.equal(result.actionTypes.block,2);
 assert.equal(result.orionSupported,null);
 assert.equal(result.safariInstalled,false);
 assert.equal("rules" in result,false);
});
test("409: reject malformed, unknown, or oversized Safari action exports",()=>{
 const x=safari();x.rules[0].action.type="inject-javascript";
 assert.throws(()=>B.safariSummary(x));
 const y=safari();y.rules[0].trigger["url-filter"]="x".repeat(2049);
 assert.throws(()=>B.safariSummary(y));
 const z=safari();z.rawUserData="secret";
 assert.throws(()=>B.safariSummary(z));
});
test("409: portability description never claims iPhone Orion APIs are confirmed",()=>{
 assert.match(B.CAPABILITIES.orionIOS,/not independently verified/);
 assert.match(B.CAPABILITIES.safariWebExtension,/declarativeNetRequest/);
});
test("409: upstream Rust public API is pinned, dev-only and supports real converter",()=>{
 const cargo=read("experiments/brave-differential/Cargo.toml");
 const rust=read("experiments/brave-differential/src/main.rs");
 assert.match(cargo,/=0\.13\.5/);assert.match(cargo,/content-blocking/);
 assert.match(rust,/Engine::new_with_filter_set/);
 assert.match(rust,/check_network_request/);
 assert.match(rust,/into_content_blocking/);
 assert.doesNotMatch(read("src/manifest.json"),/adblock-rust|brave-differential/);
});
test("409: no shipped extension permissions or background scripts change",()=>{
 const manifest=require("../src/manifest.json"),pkg=require("../package.json");
 assert.equal(manifest.version,pkg.version);
 assert.equal(pkg.dependencies["@ghostery/adblocker"],"2.20.3");
 assert.equal(pkg.dependencies.adblock,undefined);
 assert.ok(!manifest.background.scripts.some(s=>/brave/i.test(s)));
});
