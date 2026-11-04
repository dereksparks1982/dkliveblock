"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict");
const FB=require("../src/facebook-ads.js");
function child(post){
 return {getBoundingClientRect:()=>({width:500,height:240}),matches:()=>post,querySelector:()=>null};
}
test("Build 351: two independent tail siblings forbid whole wrapper hide",()=>{
 const wrapper={children:[...Array.from({length:98},()=>child(false)),child(true),child(true)]};
 assert.equal(FB.holdsSeparatePostSiblings(wrapper),true);
});
test("Build 351: only one tail post is not falsely treated as two",()=>{
 const wrapper={children:[...Array.from({length:99},()=>child(false)),child(true)]};
 assert.equal(FB.holdsSeparatePostSiblings(wrapper),false);
});
test("Build 351: 60-child work budget samples first and last thirty",()=>{
 const sampled=FB.samplePostSiblings(Array.from({length:100},(_,i)=>i));
 assert.equal(sampled.length,60);assert.equal(sampled[29],29);
 assert.equal(sampled[30],70);assert.equal(sampled.at(-1),99);
});
test("Build 351: invalid or small child collections fail safely",()=>{
 assert.deepEqual(FB.samplePostSiblings([1,2]),[1,2]);
 for(const x of [null,"text",undefined,{length:-1},{length:1000001}])
  assert.deepEqual(FB.samplePostSiblings(x),[]);
});
test("Build 351: safeCard reuses independent post boundary and versions match",()=>{
 const s=require("node:fs").readFileSync(require("node:path").join(__dirname,"../src/facebook-ads.js"),"utf8");
 assert.match(s,/independentPostCount\(c\)<=1/);
 assert.equal(require("../src/manifest.json").version,require("../package.json").version);
});
