"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict");
const FB=require("../src/facebook-ads.js");
function fixture(ad){
 const body={nodeType:1},doc={body,documentElement:{},location:{hostname:"www.facebook.com"}},win={location:{hostname:"www.facebook.com",pathname:"/"},innerWidth:1300};
 const style={value:"",priority:"",getPropertyValue(){return this.value;},getPropertyPriority(){return this.priority;},setProperty(_,v,p){this.value=v;this.priority=p||"";},removeProperty(){this.value="";this.priority="";}};
 const card={nodeType:1,isConnected:true,style,parentElement:body,children:[],matches:s=>s.includes('[role="article"]')&&!s.startsWith("main"),closest:()=>null,contains:()=>false,
  querySelector:s=>ad&&s.includes("/ads/about/")?{}:null,querySelectorAll:()=>[],
  getClientRects:()=>[{}],getBoundingClientRect:()=>({width:550,height:360,top:100,left:350})};
 doc.querySelectorAll=()=>{throw Error("global scan forbidden");};return {body,doc,win,style,card};
}
const noise=n=>Array.from({length:n},()=>({nodeType:1,isConnected:true,children:[],querySelectorAll:()=>[]}));
test("Build 311: malformed string and hostile length are rejected",()=>{
 for(const bad of ["hello",null,undefined,{length:-1},{length:1000001},{length:NaN}])
  assert.deepEqual(FB.sampleAddedNodes(bad),[]);
 assert.deepEqual(FB.sampleAddedNodes(noise(20),64),[]);
});
test("Build 311: 32 prior inserted roots cannot crowd out one late ad label",()=>{
 const f=fixture(true),batch=Array.from({length:39},()=>({type:"childList",target:f.body,addedNodes:noise(8)}));
 batch.push({type:"characterData",target:{nodeType:3,parentElement:f.card,textContent:"Sponsored"}});
 const d=FB.create(f.doc,f.win);assert.equal(d.scanInserted(batch),1);
 assert.equal(f.style.value,"none");d.restore();assert.equal(f.style.value,"");
});
test("Build 311: last explicit aria-label is prioritized within same bound",()=>{
 const f=fixture(true),batch=Array.from({length:39},()=>({type:"childList",target:f.body,addedNodes:noise(8)}));
 batch.push({type:"attributes",attributeName:"aria-label",target:f.card});
 assert.equal(FB.create(f.doc,f.win).scanInserted(batch),1);
});
test("Build 311: last ordinary labelled card remains safe",()=>{
 const f=fixture(false),batch=Array.from({length:39},()=>({type:"childList",target:f.body,addedNodes:noise(8)}));
 batch.push({type:"attributes",attributeName:"aria-label",target:f.card});
 assert.equal(FB.create(f.doc,f.win).scanInserted(batch),0);assert.equal(f.style.value,"");
});
test("Build 311: version, work budget and safe fallback retained",()=>{
 const m=require("../src/manifest.json");assert.equal(m.version,require("../package.json").version);
 assert.equal(FB.sampleAddedNodes(noise(500)).length,8);
 assert.equal(FB.sampleAddedNodes(noise(40)).length,8);
});