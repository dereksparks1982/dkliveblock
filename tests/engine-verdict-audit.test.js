"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict");
const Audit=require("../scripts/engine-verdict-audit.js");
test("Build 162 distinguishes native/Ghostery mismatch categories",()=>{
 const own=(block,exception=false)=>({block,rule:exception?{exception:true}:{exception:false}});
 assert.equal(Audit.classify(own(true),{match:false,exception:{}}),
  "native_block_vendor_exception");
 assert.equal(Audit.classify(own(false,true),{match:true}),
  "native_exception_vendor_block");
 assert.equal(Audit.classify(own(false),{match:true}),"native_allow_vendor_block");
 assert.equal(Audit.classify(own(true),{match:false}),"native_block_vendor_no_match");
 assert.equal(Audit.classify(own(false),{match:true,redirect:{resource:"empty"}}),
  "vendor_redirect_unsupported");
 assert.equal(Audit.classify(own(false),{match:true,rewrite:{}}),
  "vendor_rewrite_unsupported");
 assert.equal(Audit.classify(own(false),{error:true}),"vendor_error");
 assert.equal(Audit.classify(own(true),{match:true}),"both_block");
 assert.equal(Audit.classify(own(false),{match:false}),"both_allow");
});
test("Build 162 page exceptions, popups and frames intentionally skip vendor",()=>{
 for(const row of [
  {type:"script",url:"https://ads.example/p",policy:{document:true}},
  {type:"script",url:"https://ads.example/p",policy:{genericblock:true}},
  {type:"popup",url:"https://ads.example/p"},
  {type:"main_frame",url:"https://ads.example/p"}
 ])assert.equal(Audit.eligible(row),false);
 assert.equal(Audit.classify({block:false},{match:true},{skipped:true}),
  "production_skips_vendor");
});
test("Build 162 actual embedded Ghostery creates safe bounded synthetic comparisons",()=>{
 const env=Audit.loadEnvironment(),cases=Audit.audit(env),summary=Audit.summarize(cases);
 assert.equal(cases.length,Audit.SAMPLES.length);
 assert.equal(summary.caseCount,cases.length);
 assert.equal(cases.find(x=>x.id==="simple-script-block").nativeBlock,true);
 assert.equal(cases.find(x=>x.id==="simple-image-allow").nativeBlock,false);
 assert.equal(cases.find(x=>x.id==="native-scoped-exception").nativeException,true);
 assert.equal(cases.find(x=>x.id==="document-exemption").productionBlock,false);
 assert.equal(cases.find(x=>x.id==="popup-exception").productionBlock,false);
 assert.ok(Object.keys(summary.categories).length>0);
 for(const result of cases){
  assert.equal(typeof result.id,"string");
  assert.ok(!("url" in result)&&!("rules" in result)&&!("origin" in result),
   "diagnostics must not include browsing targets or source rule text");
  assert.equal(typeof result.productionBlock,"boolean");
 }
});
test("Build 162 rejects unbounded and malformed corpus entries",()=>{
 const env=Audit.loadEnvironment();
 assert.throws(()=>Audit.audit(env,Array(97).fill(Audit.SAMPLES[0])),/Bounded/);
 assert.throws(()=>Audit.audit(env,[{...Audit.SAMPLES[0],id:"bad url"}]),/Invalid/);
 assert.throws(()=>Audit.audit(env,[{...Audit.SAMPLES[0],origin:"not|a|hostname"}]),/Invalid/);
});
