"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict");
const FB=require("../src/facebook-ads.js");
function setup(positive){
 const body={nodeType:1},doc={body,documentElement:{}};
 function card(ad){
  const style={value:"",priority:"",getPropertyValue(){return this.value},getPropertyPriority(){return this.priority},setProperty(_,v,p){this.value=v;this.priority=p||""},removeProperty(){this.value="";this.priority=""}};
  return {nodeType:1,isConnected:true,children:[],style,
   matches:s=>s.includes('[role="article"]')&&!s.startsWith("main"),
   closest:()=>null,querySelector:s=>ad&&s.includes("/ads/about/")?{}:null,
   querySelectorAll:()=>[],getClientRects:()=>[{}],
   getBoundingClientRect:()=>({width:510,height:320,top:100,left:300})};
 }
 const articles=[...Array.from({length:27},()=>card(false)),card(positive)];
 const root={nodeType:1,isConnected:true,children:[],matches:()=>false,closest:()=>null,
  querySelectorAll:s=>s.includes('[role="article"]')?articles:[]};
 doc.querySelectorAll=()=>{throw Error("full page walk forbidden")};
 return {d:FB.create(doc,{location:{hostname:"www.facebook.com",pathname:"/"}}),body,root,last:articles.at(-1)};
}
test("Build 348: 18-item sample retains first nine and last nine",()=>{
 const values=Array.from({length:28},(_,i)=>i);
 assert.deepEqual(FB.sampleFastArticles(values),[0,1,2,3,4,5,6,7,8,19,20,21,22,23,24,25,26,27]);
});
test("Build 348: last sponsored article within large subtree is processed",()=>{
 const f=setup(true);
 assert.equal(f.d.scanInserted([{type:"childList",target:f.body,addedNodes:[f.root]}]),1);
 assert.equal(f.last.style.value,"none");
});
test("Build 348: last ordinary article is never hidden by the sample",()=>{
 const f=setup(false);
 assert.equal(f.d.scanInserted([{type:"childList",target:f.body,addedNodes:[f.root]}]),0);
 assert.equal(f.last.style.value,"");
});
test("Build 348: short lists and bad array inputs remain bounded",()=>{
 assert.deepEqual(FB.sampleFastArticles([1,2,3]),[1,2,3]);
 for(const x of [null,"bad",undefined,{length:-1},{length:1000001}])
  assert.deepEqual(FB.sampleFastArticles(x),[]);
});
test("Build 348: 32-root and article caps remain strict",()=>{
 const src=require("node:fs").readFileSync(require("node:path").join(__dirname,"../src/facebook-ads.js"),"utf8");
 assert.match(src,/cards\.size>=28/);assert.match(src,/roots\.size>=32/);
 assert.equal(require("../src/manifest.json").version,require("../package.json").version);
});
