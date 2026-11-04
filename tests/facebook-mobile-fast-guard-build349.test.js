"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict");
const FB=require("../src/facebook-ads.js");
function fixture(mobile){
 const body={nodeType:1,classList:{contains:t=>mobile&&t==="html-renderer"}};
 const doc={body,documentElement:{},querySelectorAll:()=>{throw Error("fast path cannot inspect full document")}};
 const style={value:"",priority:"",getPropertyValue(){return this.value},getPropertyPriority(){return this.priority},setProperty(_,v,p){this.value=v;this.priority=p||""},removeProperty(){this.value="";this.priority=""}};
 const card={nodeType:1,isConnected:true,children:[],style,closest:()=>null,
  matches:s=>s.includes('[role="article"]')&&!s.startsWith("main"),
  querySelector:s=>s.includes("/ads/about/")?{}:null,querySelectorAll:()=>[],getClientRects:()=>[{}],
  getBoundingClientRect:()=>({width:500,height:350,top:100,left:300})};
 const d=FB.create(doc,{location:{hostname:mobile?"m.facebook.com":"www.facebook.com",pathname:"/"},innerWidth:1200});
 return {body,card,style,d};
}
test("Build 349: mobile html-renderer cannot be hidden by desktop fast card rules",()=>{
 const f=fixture(true);
 assert.equal(f.d.scanInserted([{type:"childList",target:f.body,addedNodes:[f.card]}]),0);
 assert.equal(f.style.value,"");assert.equal(f.d.diagnostics().fastScans,0);
});
test("Build 349: ordinary Facebook feed retains immediate sponsored hiding",()=>{
 const f=fixture(false);
 assert.equal(f.d.scanInserted([{type:"childList",target:f.body,addedNodes:[f.card]}]),1);
 assert.equal(f.style.value,"none");f.d.restore();assert.equal(f.style.value,"");
});
test("Build 349: mobile author-row own-post guard remains in special scanner",()=>{
 const s=require("node:fs").readFileSync(require("node:path").join(__dirname,"../src/facebook-ads.js"),"utf8");
 assert.match(s,/!first\.contains\?\.\(label\)/);
 assert.match(s,/mobilePostFrom\(label,doc,win,watchMobileFeed\)/);
});
test("Build 349: explicit Marketplace and mobile isolation both remain",()=>{
 const s=require("node:fs").readFileSync(require("node:path").join(__dirname,"../src/facebook-ads.js"),"utf8");
 assert.match(s,/marketplacePage\(win\)\|\|mobileLayout\(doc\)/);
});
test("Build 349: version and permission set consistent",()=>{
 const p=require("../package.json"),m=require("../src/manifest.json");assert.equal(p.version,m.version);
});
