"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict");
const FB=require("../src/facebook-ads.js");
function fixture(ad=true,article=false){
 const body={nodeType:1},doc={body,documentElement:{},querySelectorAll:()=>[]};
 const style={v:"",p:"",getPropertyValue(){return this.v},getPropertyPriority(){return this.p},
  setProperty(_,v,p){this.v=v;this.p=p||""},removeProperty(){this.v="";this.p=""}};
 const rect=(top,left,width,height)=>({top,left,width,height,right:left+width});
 const card={nodeType:1,isConnected:true,style,parentElement:body,children:[],textContent:ad?"ModRetro Ad":"ModRetro",
  matches:s=>article&&s.includes('[role="article"]')&&!s.startsWith("main"),
  closest:()=>null,
  getClientRects:()=>[{}],getBoundingClientRect:()=>rect(175,457,500,900),
  querySelector:s=>null,querySelectorAll:s=>s.includes("span,a")?[label,author]:[]};
 const header={nodeType:1,parentElement:card,children:[],textContent:ad?"ModRetro Ad":"ModRetro",
  getBoundingClientRect:()=>rect(177,465,460,60),querySelector:s=>s.includes("a[role")?author:null,
  querySelectorAll:s=>s.includes("a[role")?[author]:[]};
 const author={nodeType:1,parentElement:header,children:[],textContent:"ModRetro",
  getBoundingClientRect:()=>rect(181,518,75,18)};
 const label={nodeType:1,parentElement:header,tagName:"SPAN",children:[],childNodes:[],textContent:ad?"Ad":"Ordinary",
  closest:()=>null,getAttribute:()=>null,
  getBoundingClientRect:()=>rect(204,518,20,15)};
 const image={nodeType:1,parentElement:card,children:[],textContent:"",
  getBoundingClientRect:()=>rect(255,487,440,530),
  closest:s=>article&&s.includes('[role="article"]')?card:null};
 card.contains=n=>n===label||n===author||n===header||n===image||n===card;
 doc.elementFromPoint=()=>image;
 const win={location:{hostname:"www.facebook.com",pathname:"/"},innerWidth:1353,innerHeight:762};
 return {doc,win,card,style,d:FB.create(doc,win)};
}
test("Build 358: short Ad badge under advertiser in unmarked feed card hides",()=>{
 const f=fixture(true,false);assert.equal(f.d.scanVisible(),1);
 assert.equal(f.style.v,"none");assert.equal(f.d.diagnostics().visibleFallbackHidden,1);
 f.d.restore();assert.equal(f.style.v,"");
});
test("Build 358: matching ordinary post is not hidden",()=>{
 const f=fixture(false,false);assert.equal(f.d.scanVisible(),0);
 assert.equal(f.style.v,"");assert.equal(f.d.diagnostics().visibleFallbackHidden,0);
});
test("Build 358: repeated viewport probes hide a single card only once",()=>{
 const f=fixture(true,false);assert.equal(f.d.scanVisible(),1);
 assert.equal(f.d.scanVisible(),0);assert.equal(f.d.diagnostics().visibleHidden,1);
});
test("Build 358: no DOM, invalid viewport, and Marketplace still fail open",()=>{
 const f=fixture();f.win.innerHeight=0;assert.equal(f.d.scanVisible(),0);
 f.win.innerHeight=762;f.win.location.pathname="/marketplace/";assert.equal(f.d.scanVisible(),0);
});
test("Build 358: mutation and scroll share a bounded viewport queue",()=>{
 const fs=require("node:fs"),path=require("node:path");
 const src=fs.readFileSync(path.join(__dirname,"../src/content.js"),"utf8");
 assert.match(src,/queueFacebookVisibleScan\(0\)/);
 assert.match(src,/queueFacebookVisibleScan\(120\)/);
 assert.match(src,/Math\.max\(delay,120-\(Date\.now\(\)-lastFacebookVisibleAt\),0\)/);
 assert.match(src,/!active\|\|!adRecognition\|\|picking/);
 assert.equal(require("../package.json").version,require("../src/manifest.json").version);
});
