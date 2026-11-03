"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict");
const FB=require("../src/facebook-ads.js");
function detector(){
 const body={nodeType:1},doc={body,documentElement:{nodeType:1},location:{hostname:"www.facebook.com"}};
 return FB.create(doc,{location:{hostname:"www.facebook.com",pathname:"/"},innerWidth:1250});
}
function portal(id,text){return {nodeType:1,id,tagName:"SPAN",children:[],childNodes:[],textContent:text,getAttribute:()=>null,querySelectorAll:()=>[]};}
test("Build 326: 12-node budget retains both ends",()=>{
 const nodes=Array.from({length:40},(_,i)=>({i}));
 assert.deepEqual(FB.sampleChangedNodes(nodes).map(x=>x.i),[0,1,2,3,4,5,34,35,36,37,38,39]);
});
test("Build 326: short lists copied intact",()=>{
 for(const n of [0,1,6,12]){
  const nodes=Array.from({length:n},(_,i)=>i);
  assert.deepEqual(FB.sampleChangedNodes(nodes),nodes);
  assert.notEqual(FB.sampleChangedNodes(nodes),nodes);
 }
});
test("Build 326: late removed Sponsored portal cached without hiding",()=>{
 const d=detector(),noise=Array.from({length:30},(_,i)=>portal("noise"+i,"Hello"));
 assert.equal(d.observeMutation({type:"childList",target:{},addedNodes:[],removedNodes:[...noise,portal("ad-slot","Sponsored")]}),true);
 assert.equal(d.diagnostics().cachedLabels,1);assert.equal(d.diagnostics().hidden,0);
});
test("Build 326: trailing organic words cannot seed advertising evidence",()=>{
 const d=detector(),noise=Array.from({length:30},(_,i)=>portal("noise"+i,"Normal"));
 d.observeMutation({type:"childList",target:{},addedNodes:[...noise,portal("end","Sponsorship")],removedNodes:[]});
 assert.equal(d.diagnostics().cachedLabels,0);assert.equal(d.diagnostics().hidden,0);
});
test("Build 326: malformed inputs rejected and versions agree",()=>{
 for(const x of [null,undefined,"test",{length:-1},{length:1000001},{length:Infinity}])
  assert.deepEqual(FB.sampleChangedNodes(x),[]);
 assert.deepEqual(FB.sampleChangedNodes(Array.from({length:18}),100),[]);
 assert.equal(require("../src/manifest.json").version,require("../package.json").version);
});
