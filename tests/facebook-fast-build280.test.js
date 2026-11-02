"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict"),
 fs=require("node:fs"),path=require("node:path");
const FB=require("../src/facebook-ads.js");
function fixture(ad){
 const body={nodeType:1},doc={body,documentElement:{},location:{hostname:"www.facebook.com"}},
 win={location:{hostname:"www.facebook.com",pathname:"/"},innerWidth:1300};
 const style={value:"",priority:"",getPropertyValue(){return this.value;},
  getPropertyPriority(){return this.priority;},
  setProperty(_,v,p){this.value=v;this.priority=p||"";},
  removeProperty(){this.value="";this.priority="";}};
 const card={nodeType:1,isConnected:true,style,parentElement:body,children:[],
  matches:s=>s.includes('[role="article"]')&&!s.startsWith("main"),
  closest:()=>null,contains:()=>false,querySelector:s=>ad&&s.includes("/ads/about/")?{}:null,
  querySelectorAll:()=>[],getClientRects:()=>[{}],
  getBoundingClientRect:()=>({width:550,height:360,top:100,left:350})};
 doc.querySelectorAll=()=>{throw Error("Fast path must not scan the entire document");};
 return {card,doc,win};
}
test("Build 280: newly inserted Sponsored article is hidden immediately, no global DOM walk",()=>{
 const {card,doc,win}=fixture(true),detector=FB.create(doc,win);
 assert.equal(detector.scanInserted([{type:"childList",target:doc.body,addedNodes:[card]}]),1);
 assert.equal(card.style.value,"none");
 assert.equal(detector.diagnostics().fastHidden,1);
 detector.restore();assert.equal(card.style.value,"");
});
test("Build 280: organic article and malformed events are preserved",()=>{
 const {card,doc,win}=fixture(false),detector=FB.create(doc,win);
 assert.equal(detector.scanInserted([{type:"childList",target:doc.body,addedNodes:[card]}]),0);
 assert.equal(detector.scanInserted(null),0);
 assert.equal(card.style.value,"");
});
test("Build 280: mutation scan is exposed through Meta adapter, with timed broad fallback",()=>{
 const moduleSource=fs.readFileSync(path.join(__dirname,"../src/meta-module.js"),"utf8");
 const content=fs.readFileSync(path.join(__dirname,"../src/content.js"),"utf8");
 assert.match(moduleSource,/scanInserted:records=>facebook\?\.scanInserted\?\.\(records\)/);
 assert.match(content,/facebookRecognizer\?\.scanInserted\?\.\(facebookChanges\)/);
 assert.match(content,/Math\.max\(40,160-\(Date\.now\(\)-lastAdScan\)\)/);
 assert.match(content,/\):450/);
 assert.match(content,/if\(isFacebookHost&&active&&adRecognition&&!picking/);
});
