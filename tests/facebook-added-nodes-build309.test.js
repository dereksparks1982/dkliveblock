"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict");
const FB=require("../src/facebook-ads.js");
function fixture(ad){
 const body={nodeType:1},doc={body,documentElement:{},location:{hostname:"www.facebook.com"}},win={location:{hostname:"www.facebook.com",pathname:"/"},innerWidth:1300};
 const style={value:"",priority:"",getPropertyValue(){return this.value;},getPropertyPriority(){return this.priority;},setProperty(_,v,p){this.value=v;this.priority=p||"";},removeProperty(){this.value="";this.priority="";}};
 const card={nodeType:1,isConnected:true,style,parentElement:body,children:[],matches:s=>s.includes('[role="article"]')&&!s.startsWith("main"),closest:()=>null,contains:()=>false,querySelector:s=>ad&&s.includes("/ads/about/")?{}:null,querySelectorAll:()=>[],getClientRects:()=>[{}],getBoundingClientRect:()=>({width:550,height:360,top:100,left:350})};
 doc.querySelectorAll=()=>{throw Error("global scan forbidden");};return {body,doc,win,style,card};
}
const noise=n=>Array.from({length:n},()=>({nodeType:1,isConnected:true,children:[],querySelectorAll:()=>[]}));
test("Build 309: short insertion batches are copied intact",()=>{
 for(const n of [0,1,2,7,8]){const a=noise(n);assert.deepEqual(FB.sampleAddedNodes(a),a);assert.notEqual(FB.sampleAddedNodes(a),a);}
});
test("Build 309: large insertion batches include four head and four tail nodes",()=>{
 for(const n of [9,12,70,1000]){const a=Array.from({length:n},(_,i)=>({i}));assert.deepEqual(FB.sampleAddedNodes(a).map(v=>v.i),[0,1,2,3,n-4,n-3,n-2,n-1]);}
});
test("Build 309: late inserted Sponsored card hides within the bounded fast pass",()=>{
 const f=fixture(true),nodes=[...noise(30),f.card],d=FB.create(f.doc,f.win);
 assert.equal(d.scanInserted([{type:"childList",target:f.body,addedNodes:nodes}]),1);
 assert.equal(f.style.value,"none");d.restore();assert.equal(f.style.value,"");
});
test("Build 309: late ordinary posts remain visible",()=>{
 const f=fixture(false);
 assert.equal(FB.create(f.doc,f.win).scanInserted([{type:"childList",target:f.body,addedNodes:[...noise(30),f.card]}]),0);
 assert.equal(f.style.value,"");
});
test("Build 309: invalid input bounded and version consistency",()=>{
 for(const x of [null,undefined,{length:-1},{length:1000001},{length:NaN},"hi"])assert.deepEqual(FB.sampleAddedNodes(x),[]);
 assert.deepEqual(FB.sampleAddedNodes(noise(15),64),[]);
 assert.equal(require("../package.json").version,require("../src/manifest.json").version);
});