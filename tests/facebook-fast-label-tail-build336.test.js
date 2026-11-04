"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict");
const FB=require("../src/facebook-ads.js");
test("Build 336: first and last fifty fast-path descendants retained",()=>{
 const data=Array.from({length:240},(_,i)=>i),sample=FB.sampleFastLabels(data);
 assert.equal(sample.length,100);assert.deepEqual(sample.slice(0,3),[0,1,2]);
 assert.deepEqual(sample.slice(-3),[237,238,239]);
});
test("Build 336: lists at/below budget retain order without aliasing",()=>{
 for(const len of [0,1,50,99,100]){
  const src=Array.from({length:len},(_,i)=>i),got=FB.sampleFastLabels(src);
  assert.deepEqual(got,src);assert.notEqual(got,src);
 }
});
test("Build 336: invalid and hostile inputs rejected",()=>{
 for(const v of [null,"word",undefined,{length:NaN},{length:-1},{length:1000001}])
  assert.deepEqual(FB.sampleFastLabels(v),[]);
 assert.deepEqual(FB.sampleFastLabels(Array.from({length:101}),10000),[]);
});
test("Build 336: fast scanner uses bounded head/tail decoder",()=>{
 const src=require("node:fs").readFileSync(require("node:path").join(__dirname,"../src/facebook-ads.js"),"utf8");
 assert.match(src,/const labels=\[rootNode,\.\.\.sampleFastLabels\(rootNode\.querySelectorAll/);
 assert.match(src,/if\(\+\+inspected>320\|\|count>=15\)break/);
});
test("Build 336: app and manifest versions remain matched",()=>{
 const p=require("../package.json"),m=require("../src/manifest.json");
 assert.equal(p.version,m.version);assert.match(p.version,/^0\.3\.\d+$/);
});
