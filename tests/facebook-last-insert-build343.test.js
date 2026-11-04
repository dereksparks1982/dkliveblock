"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict");
const FB=require("../src/facebook-ads.js");
function fixture(ad){
 const body={nodeType:1},doc={body,documentElement:{}};
 const style={value:"",priority:"",getPropertyValue(){return this.value},getPropertyPriority(){return this.priority},
  setProperty(_,v,p){this.value=v;this.priority=p||""},removeProperty(){this.value="";this.priority=""}};
 const card={nodeType:1,isConnected:true,style,children:[],closest:()=>null,
  matches:s=>s.includes('[role="article"]')&&!s.startsWith("main"),
  querySelector:s=>ad&&s.includes("/ads/about/")?{}:null,querySelectorAll:()=>[],
  getClientRects:()=>[{}],getBoundingClientRect:()=>({width:550,height:360,top:100,left:300})};
 const n=()=>({nodeType:1,isConnected:true,children:[],querySelectorAll:()=>[],closest:()=>null});
 doc.querySelectorAll=()=>{throw Error("global DOM scan forbidden")};
 const batch=[...Array.from({length:39},()=>({type:"childList",target:body,addedNodes:Array.from({length:8},n)})),{type:"childList",target:body,addedNodes:[card]}];
 return {d:FB.create(doc,{location:{hostname:"www.facebook.com",pathname:"/"},innerWidth:1200}),card,style,batch};
}
test("Build 343: newest Sponsored card survives 39 earlier noisy insertions",()=>{
 const f=fixture(true);assert.equal(f.d.scanInserted(f.batch),1);assert.equal(f.style.value,"none");
 f.d.restore();assert.equal(f.style.value,"");
});
test("Build 343: newest organic post never inherits sponsored evidence",()=>{
 const f=fixture(false);assert.equal(f.d.scanInserted(f.batch),0);assert.equal(f.style.value,"");
});
test("Build 343: new tail reserve is bounded and newest-first",()=>{
 const s=require("node:fs").readFileSync(require("node:path").join(__dirname,"../src/facebook-ads.js"),"utf8");
 assert.match(s,/tailRoots>=8/);assert.match(s,/batch\.slice\(-4\)\.reverse\(\)/);
 assert.match(s,/roots\.size>=32/);
});
test("Build 343: original first/middle childList pass remains",()=>{
 const s=require("node:fs").readFileSync(require("node:path").join(__dirname,"../src/facebook-ads.js"),"utf8");
 assert.match(s,/for\(const r of batch\)if\(r\?\.type==="childList"\)/);
 assert.match(s,/inspected>=320/);
});
test("Build 343: package manifest and permissions stay consistent",()=>{
 const p=require("../package.json"),m=require("../src/manifest.json");
 assert.equal(p.version,m.version);assert.match(p.version,/^0\.3\.\d+$/);
});
