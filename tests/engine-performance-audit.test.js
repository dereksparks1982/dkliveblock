"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict");
const P=require("../scripts/engine-performance-audit.js");
test("Build 166 deterministic benchmark synthesizes only .invalid request destinations",()=>{
 const a=P.inputs(5,6),b=P.inputs(5,6);
 assert.deepEqual(a,b);
 assert.equal(a.filters.split("\n").length,5);
 assert.equal(a.requests.length,6);
 assert.ok(a.requests.every(r=>new URL(r.url).hostname.endsWith(".perf.invalid")));
 assert.ok(a.filters.includes("ads0.perf.invalid"));
});
test("Build 166 size bounds and timing calculations cannot silently overflow",()=>{
 assert.throws(()=>P.inputs(P.MAX_RULES+1,1),/out of range/);
 assert.throws(()=>P.inputs(1,P.MAX_REQUESTS+1),/out of range/);
 assert.throws(()=>P.inputs(0,1),/out of range/);
 assert.equal(P.median([1,3,2]),2);
 assert.equal(P.median([4,1,2,3]),2.5);
 assert.throws(()=>P.median([NaN,2]),/Invalid/);
 assert.throws(()=>P.median([]),/Invalid/);
});
test("Build 166 local timing helper is nonnegative and repeatable on synthetic work",()=>{
 const value=P.measure(()=>{let x=0;for(let i=0;i<100;i++)x+=i;});
 assert.ok(Number.isFinite(value)&&value>=0);
});

test("Build 175 profiling counts actual hostname parses without changing match results",()=>{
 let calls=0;
 const shared={host:url=>{calls++;return new URL(url).hostname;}};
 class FakeEngine{
  checkRequest(url,type,origin,policy,method){
   assert.equal(type,"image");
   assert.equal(method,"GET");
   shared.host(url);
   return {block:false};
  }
 }
 const env={DKRules:shared,DKFilter:{FilterEngine:FakeEngine}};
 const before=shared.host;
 const requests=P.inputs(4,5).requests;
 assert.equal(P.hostnameParses(env,"synthetic-only",requests),5);
 assert.equal(calls,5);
 assert.equal(shared.host,before,"instrumentation must restore engine helper");
 assert.throws(()=>P.hostnameParses({
  DKRules:shared,DKFilter:{FilterEngine:class{
   checkRequest(){throw Error("simulated matcher failure");}
  }}}, "synthetic-only", requests),/simulated matcher failure/);
 assert.equal(shared.host,before,"host helper must be restored after failure");
});
