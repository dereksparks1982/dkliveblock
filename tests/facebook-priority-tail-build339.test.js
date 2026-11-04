"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict");
const FB=require("../src/facebook-ads.js");
function f(ad=true){
 const body={nodeType:1},doc={body,documentElement:{nodeType:1}},win={location:{hostname:"www.facebook.com",pathname:"/"},innerWidth:1300};
 const style={value:"",getPropertyValue(){return this.value},getPropertyPriority(){return ""},setProperty(_,v){this.value=v},removeProperty(){this.value=""}};
 const card={nodeType:1,isConnected:true,style,children:[],matches:s=>s.includes('[role="article"]')&&!s.startsWith("main"),
  closest:()=>null,querySelector:s=>ad&&s.includes("/ads/about/")?{}:null,querySelectorAll:()=>[],getClientRects:()=>[{}],
  getBoundingClientRect:()=>({width:550,height:400,top:100,left:300})};
 doc.querySelectorAll=()=>{throw Error("fast pass may not scan full document");};
 const noise=i=>({nodeType:1,isConnected:true,children:[],querySelectorAll:()=>[],closest:()=>null});
 const records=Array.from({length:38},(_,i)=>({type:"attributes",attributeName:"aria-label",target:noise(i)}));
 records.push({type:"childList",target:body,addedNodes:Array.from({length:8},(_,i)=>noise(i+40))});
 records.push({type:"attributes",attributeName:"aria-label",target:card});
 return {d:FB.create(doc,win),card,style,records};
}
test("Build 339: last explicit ad label survives an early attribute storm",()=>{
 const v=f(true);assert.equal(v.d.scanInserted(v.records),1);assert.equal(v.style.value,"none");
});
test("Build 339: same late organic post remains visible",()=>{
 const v=f(false);assert.equal(v.d.scanInserted(v.records),0);assert.equal(v.style.value,"");
});
test("Build 339: no full DOM query, preserved 32 roots and 320 inspections",()=>{
 const src=require("node:fs").readFileSync(require("node:path").join(__dirname,"../src/facebook-ads.js"),"utf8");
 assert.match(src,/priorityRecords\.slice\(0,6\)/);
 assert.match(src,/priorityRecords\.slice\(-6\)/);
 assert.match(src,/roots\.size>=32/);assert.match(src,/inspected>=320/);
});
test("Build 339: short label bursts keep natural ordering",()=>{
 const v=f(true);assert.equal(v.d.scanInserted(v.records.slice(-1)),1);
});
test("Build 339: version and rule privileges unchanged",()=>{
 const m=require("../src/manifest.json"),p=require("../package.json");
 assert.equal(m.version,p.version);assert.equal(p.version,"0.3.309");
});
