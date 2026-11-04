"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict");
const FB=require("../src/facebook-ads.js");
function setup(kind=""){
 const body={nodeType:1},doc={body,documentElement:{nodeType:1},location:{hostname:"www.facebook.com"}};
 const style={value:"",getPropertyValue(){return this.value},getPropertyPriority(){return ""},setProperty(_,v){this.value=v},removeProperty(){this.value=""}};
 const c={nodeType:1,isConnected:true,children:[],style,closest:()=>null,
  matches:s=>s.includes('[role="article"]')&&!s.startsWith("main"),
  querySelector:s=>s.includes("/ads/about/")?{}:s.includes(kind)&&kind?{}:null,
  querySelectorAll:()=>[],getClientRects:()=>[{}],
  getBoundingClientRect:()=>({width:550,height:350,top:100,left:400})};
 doc.querySelectorAll=()=>{throw Error("fast path cannot walk entire document")};
 return {c,doc,style,d:FB.create(doc,{location:{hostname:"www.facebook.com",pathname:"/"},innerWidth:1250}),body};
}
const run=f=>f.d.scanInserted([{type:"childList",target:f.body,addedNodes:[f.c]}]);
test("Build 335: sponsored card containing a live input is protected",()=>{
 const f=setup("input:not");assert.equal(FB.safeCard(f.c,f.doc),false);
 assert.equal(run(f),0);assert.equal(f.style.value,"");
});
test("Build 335: embedded composer and textbox are protected",()=>{
 for(const kind of ["contenteditable","textbox","searchbox","textarea"]){
  const f=setup(kind);assert.equal(FB.safeCard(f.c,f.doc),false,kind);
  assert.equal(run(f),0);
 }
});
test("Build 335: ordinary advertisement without editor remains eligible",()=>{
 const f=setup("no-editor-here");assert.equal(FB.safeCard(f.c,f.doc),true);
 assert.equal(run(f),1);f.d.restore();assert.equal(f.style.value,"");
});
test("Build 335: dialog and root guards remain intact",()=>{
 const f=setup("dialog");assert.equal(FB.safeCard(f.c,f.doc),false);
});
test("Build 335: scope remains Facebook-only, permissions and version stable",()=>{
 const m=require("../src/manifest.json"),p=require("../package.json");
 assert.equal(m.version,p.version);assert.equal(p.version,"0.3.305");
 assert.ok(m.content_scripts[0].js.includes("facebook-ads.js"));
});
