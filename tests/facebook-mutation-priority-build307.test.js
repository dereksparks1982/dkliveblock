"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path");
const FB=require("../src/facebook-ads.js"),Meta=require("../src/meta-module.js");
function fixture(ad=true){
 const body={nodeType:1},doc={body,documentElement:{},location:{hostname:"www.facebook.com"}},
 win={location:{hostname:"www.facebook.com",pathname:"/"},innerWidth:1300};
 const style={value:"",priority:"",getPropertyValue(){return this.value;},
  getPropertyPriority(){return this.priority;},setProperty(_,v,p){this.value=v;this.priority=p||"";},
  removeProperty(){this.value="";this.priority="";}};
 const card={nodeType:1,isConnected:true,style,parentElement:body,children:[],
  matches:s=>s.includes('[role="article"]')&&!s.startsWith("main"),
  closest:()=>null,contains:()=>false,querySelector:s=>ad&&s.includes("/ads/about/")?{}:null,
  querySelectorAll:()=>[],getClientRects:()=>[{}],
  getBoundingClientRect:()=>({width:550,height:360,top:100,left:350})};
 doc.querySelectorAll=()=>{throw Error("full document scan forbidden in fast path");};
 return {body,doc,win,card};
}
function noise(n){return Array.from({length:n},()=>({type:"attributes",attributeName:"class",target:{nodeType:1,isConnected:true,children:[],querySelectorAll:()=>[]}}));}
test("Build 307: new late sponsored post is processed before 39 irrelevant style changes",()=>{
 const f=fixture();const records=noise(39);records.push({type:"childList",target:f.body,addedNodes:[f.card]});
 const detector=FB.create(f.doc,f.win);assert.equal(detector.scanInserted(records),1);
 assert.equal(f.card.style.value,"none");detector.restore();assert.equal(f.card.style.value,"");
});
test("Build 307: sampled very large burst preserves late ad and same capped scan",()=>{
 const f=fixture();const records=noise(175);records.push({type:"childList",target:f.body,addedNodes:[f.card]});
 const detector=FB.create(f.doc,f.win);assert.equal(detector.scanInserted(Meta.sampleMutations(records)),1);
 assert.equal(f.card.style.value,"none");
});
test("Build 307: late text label change outranks early irrelevant class changes",()=>{
 const f=fixture();const records=noise(39);
 records.push({type:"characterData",target:{nodeType:3,parentElement:f.card,textContent:"Sponsored"}});
 assert.equal(FB.create(f.doc,f.win).scanInserted(records),1);
});
test("Build 307: identical late ordinary post survives and still has no global document scan",()=>{
 const f=fixture(false),records=noise(39);
 records.push({type:"childList",target:f.body,addedNodes:[f.card]});
 assert.equal(FB.create(f.doc,f.win).scanInserted(records),0);
 assert.equal(f.card.style.value,"");
});
test("Build 307: fast path prioritization remains bounded and protects the chosen site",()=>{
 const c=fs.readFileSync(path.join(__dirname,"../src/facebook-ads.js"),"utf8");
 assert.match(c,/const batch=records\.slice\(0,40\)/);
 assert.match(c,/for\(const r of batch\)if\(r\?\.type==="childList"\)/);
 assert.match(c,/r\?\.type==="characterData"/);
 assert.ok(c.indexOf("for(const r of batch)if(r?.type===\"childList\")")<
   c.indexOf("r?.type===\"attributes\"||r?.type===\"characterData\"||r?.type===\"childList\""));
 const manifest=require("../src/manifest.json");assert.equal(manifest.version,require("../package.json").version);
});