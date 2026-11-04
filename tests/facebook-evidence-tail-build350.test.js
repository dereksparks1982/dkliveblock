"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict");
const FB=require("../src/facebook-ads.js");
function card(lastAd){
 const normal=Array.from({length:999},()=>({tagName:"SPAN",children:[],textContent:"Normal",getAttribute:()=>null,closest:()=>null}));
 normal.push({tagName:"BUTTON",children:[],textContent:lastAd?"Sponsored":"Ordinary",
  getAttribute:name=>name==="aria-label"?(lastAd?"open menu for sponsored content":"ordinary button"):null,closest:()=>null});
 return {querySelector:()=>null,querySelectorAll:()=>normal};
}
test("Build 350: 850-work budget spans beginning and last 200 labels",()=>{
 const result=FB.sampleEvidenceNodes(Array.from({length:1000},(_,i)=>i));
 assert.equal(result.length,850);assert.equal(result[0],0);assert.equal(result[649],649);
 assert.equal(result[650],800);assert.equal(result.at(-1),999);
});
test("Build 350: late explicit sponsored action is detected past 850 nodes",()=>{
 assert.equal(FB.hasAdEvidence(card(true),{},null,new Map()),true);
});
test("Build 350: late ordinary button is not an advertisement",()=>{
 assert.equal(FB.hasAdEvidence(card(false),{},null,new Map()),false);
});
test("Build 350: small lists remain identical and malformed lists rejected",()=>{
 assert.deepEqual(FB.sampleEvidenceNodes([1,2,3]),[1,2,3]);
 for(const x of [null,"bad",{length:-1},{length:1000001}])
  assert.deepEqual(FB.sampleEvidenceNodes(x),[]);
});
test("Build 350: safety gates and current source versions retained",()=>{
 const s=require("node:fs").readFileSync(require("node:path").join(__dirname,"../src/facebook-ads.js"),"utf8");
 assert.match(s,/inByline\(el,card\)/);
 assert.equal(require("../src/manifest.json").version,require("../package.json").version);
});
