"use strict";
const test=require("node:test"),assert=require("node:assert/strict");
const {performance}=require("node:perf_hooks");
require("../src/rules.js");
const {FilterEngine}=require("../src/engine.js");
test("synthetic 45k-rule blocking workload stays within a generous offline budget",()=>{
 const n=45000;
 const input=Array.from({length:n},(_,i)=>"||advert"+i+".example.test^").join("\n");
 const start=performance.now(),engine=new FilterEngine(input),buildTime=performance.now()-start;
 assert.equal(engine.networkCount,n);
 assert.equal(engine.unsupportedCount,0);
 assert.ok(buildTime<15000,"45k-rule construction took "+Math.round(buildTime)+" ms");
 const t1=performance.now();
 for(let i=0;i<1500;i++){
  const url="https://advert"+(i*17%n)+".example.test/pixel";
  assert.equal(engine.shouldBlock(url,"image","shop.example.test"),true);
 }
 const checks=performance.now()-t1;
 assert.ok(checks<10000,"1500 request checks took "+Math.round(checks)+" ms");
});
