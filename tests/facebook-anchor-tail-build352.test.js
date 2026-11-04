"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict");
const FB=require("../src/facebook-ads.js");
function fixture(two){
 const style={setProperty(){}},doc={body:{},documentElement:{}},c={style,children:[],isConnected:true,
  matches:()=>false,closest:()=>null,querySelector:()=>null,
  getBoundingClientRect:()=>({width:550,height:300})};
 const nested={matches:()=>true,parentElement:c};
 const items=[...Array.from({length:108},()=>({parentElement:nested})),{parentElement:c},{parentElement:two?c:nested}];
 c.querySelectorAll=()=>items;
 return {c,doc};
}
test("Build 352: two late independent posts forbid whole-wrapper removal",()=>{
 const f=fixture(true);assert.equal(FB.safeCard(f.c,f.doc),false);
});
test("Build 352: one independent post amid nested comments is not mistaken for two",()=>{
 const f=fixture(false);assert.equal(FB.safeCard(f.c,f.doc),true);
});
test("Build 352: 100-anchor budget retains first and final fifty",()=>{
 const a=FB.sampleIndependentAnchors(Array.from({length:110},(_,i)=>i));
 assert.equal(a.length,100);assert.equal(a[49],49);assert.equal(a[50],60);
 assert.equal(a.at(-1),109);
});
test("Build 352: short and bad anchor collections fail safely",()=>{
 assert.deepEqual(FB.sampleIndependentAnchors([1,2]),[1,2]);
 for(const x of [null,"text",undefined,{length:-1},{length:1000001}])
  assert.deepEqual(FB.sampleIndependentAnchors(x),[]);
});
test("Build 352: ordinary recognized post and app version unchanged",()=>{
 const s=require("node:fs").readFileSync(require("node:path").join(__dirname,"../src/facebook-ads.js"),"utf8");
 assert.match(s,/if\(card\.matches\?\.\('\[role="article"\]/);
 assert.equal(require("../src/manifest.json").version,require("../package.json").version);
});
