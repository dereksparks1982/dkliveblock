"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict");
const FB=require("../src/facebook-ads.js");
function fixture(pathname="/"){
 const body={nodeType:1},doc={body,documentElement:{nodeType:1},location:{hostname:"www.facebook.com"}},win={location:{hostname:"www.facebook.com",pathname},innerWidth:1250};
 const style={value:"",priority:"",getPropertyValue(){return this.value;},getPropertyPriority(){return this.priority;},setProperty(_,v,p){this.value=v;this.priority=p||"";},removeProperty(){this.value="";this.priority="";}};
 const card={nodeType:1,isConnected:true,children:[],style,closest:()=>null,
  matches:s=>s.includes('[role="article"]')&&!s.startsWith("main"),
  querySelector:s=>s.includes("/ads/about/")?{}:null,querySelectorAll:()=>[],getClientRects:()=>[{}],
  getBoundingClientRect:()=>({width:510,height:300,top:50,left:250})};
 doc.querySelectorAll=()=>{throw Error("fast pass cannot scan full doc");};
 return {d:FB.create(doc,win),card,style,body};
}
const batch=f=>[{type:"childList",target:f.body,addedNodes:[f.card]}];
test("Build 334: Marketplace roots cannot be hidden by feed fast path",()=>{
 for(const pathname of ["/marketplace","/marketplace/","/marketplace/category/furniture","/marketplace/item/11"]){
  const f=fixture(pathname);assert.equal(f.d.scanInserted(batch(f)),0,pathname);
  assert.equal(f.style.value,"");assert.equal(f.d.diagnostics().fastScans,0);
 }
});
test("Build 334: regular Facebook feed still retains fast sponsored scan",()=>{
 const f=fixture("/");assert.equal(f.d.scanInserted(batch(f)),1);
 assert.equal(f.style.value,"none");f.d.restore();assert.equal(f.style.value,"");
});
test("Build 334: Facebook pagelets outside Marketplace still fast scan",()=>{
 const f=fixture("/groups/test");assert.equal(f.d.scanInserted(batch(f)),1);
});
test("Build 334: Marketplace-specific scan remains the owner of promoted tiles",()=>{
 const src=require("node:fs").readFileSync(require("node:path").join(__dirname,"../src/facebook-ads.js"),"utf8");
 assert.ok(src.includes("if(marketplacePage(win)){"));
 assert.ok(src.includes("marketplaceTileFrom(label,doc)"));
 assert.ok(src.includes('hide(tile,label,"marketplace")'));
});
test("Build 334: version and permission surface unchanged",()=>{
 const m=require("../src/manifest.json"),p=require("../package.json");
 assert.equal(m.version,p.version);assert.match(p.version,/^0\.3\.\d+$/);
});
