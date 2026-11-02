"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict");
const FB=require("../src/facebook-ads.js");
function fixture(headingText){
 const doc={body:{},documentElement:{}},win={location:{hostname:"www.facebook.com"},innerWidth:1200};
 const rail={parentElement:doc.body,contains:()=>true};
 const label={nodeType:1,tagName:"SPAN",children:[],textContent:"Sponsored",
  childNodes:[{nodeType:3,textContent:"Sponsored"}],
  getBoundingClientRect:()=>({left:800,width:95,height:20,top:80}),
  closest:s=>s==='[role="complementary"]'?rail:null};
 const container={
  isConnected:true,matches:()=>false,parentElement:rail,contains:()=>true,
  getBoundingClientRect:()=>({left:760,width:360,height:400}),
  getClientRects:()=>[{}],
  querySelector:s=>s==="img"?{}:null,
  querySelectorAll:()=>[{textContent:headingText}],
  style:{getPropertyValue:()=>"",getPropertyPriority:()=>"",
   setProperty(name,value,priority){this.record=[name,value,priority]},removeProperty(){}}
 };
 label.parentElement=container;
 doc.querySelectorAll=s=>s==='span,[role="complementary"] div,aside div'?[label]:[];
 return {doc,win,container};
}
test("Build 253 hides a bounded right rail with a plain Sponsored span",()=>{
 const f=fixture("Sponsored"),detector=FB.create(f.doc,f.win);
 assert.equal(detector.scan(),1);
 assert.deepEqual(f.container.style.record,["display","none","important"]);
 assert.equal(detector.hiddenCount,1);
});
test("Build 253 does not hide Contacts even with an ambiguous Sponsored span",()=>{
 const f=fixture("Contacts"),detector=FB.create(f.doc,f.win);
 assert.equal(detector.scan(),0);
 assert.equal(f.container.style.record,undefined);
});
test("Build 253 never activates vendored standalone Facebook blocker",()=>{
 const manifest=require("../src/manifest.json");
 assert.ok(manifest.content_scripts[0].js.includes("facebook-ads.js"));
 assert.ok(!manifest.content_scripts[0].js.includes("vendor/facebook-sponsored-upstream.js"));
 assert.equal(manifest.version,"0.3.223");
});
