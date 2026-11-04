"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict");
const FB=require("../src/facebook-ads.js"),Report=require("../src/facebook-diagnostic-report.js");
function fixture(n){
 const nodes=Array.from({length:n},()=>({nodeType:1,tagName:"SPAN",textContent:"Ordinary",
  childNodes:[],children:[],getAttribute:()=>null,closest:()=>null}));
 const body={nodeType:1,classList:{contains:name=>name==="html-renderer"}};
 const doc={body,documentElement:{},querySelectorAll:s=>s==='span,a,[aria-label],[aria-labelledby],use,text'?nodes:[]};
 return FB.create(doc,{location:{hostname:"m.facebook.com",pathname:"/"},innerWidth:390});
}
test("Build 345: virtualized mobile feed rotates beyond first five thousand",()=>{
 const d=fixture(5400);assert.equal(d.scan(),0);assert.equal(d.diagnostics().mobileCursor,5000);
 d.scan();assert.equal(d.diagnostics().mobileCursor,4600);
});
test("Build 345: short mobile feed wraps to cursor zero",()=>{
 const d=fixture(120);d.scan();assert.equal(d.diagnostics().mobileCursor,0);
});
test("Build 345: ordinary mobile feed content never hidden",()=>{
 const d=fixture(6000);d.scan();d.scan();assert.equal(d.diagnostics().hidden,0);
});
test("Build 345: mobile cursor exported only as sanitized integer",()=>{
 const d=fixture(6000);d.scan();
 const r=Report.build({ok:true,active:true,adRecognition:true,adapterLoaded:true,detector:d.diagnostics()},null);
 assert.equal(r.detector.mobileCursor,5000);assert.equal(r.schema,2);
});
test("Build 345: special mobile guard and extension version retained",()=>{
 const src=require("node:fs").readFileSync(require("node:path").join(__dirname,"../src/facebook-ads.js"),"utf8");
 assert.match(src,/first\.contains\?\.\(label\)/);
 assert.equal(require("../package.json").version,require("../src/manifest.json").version);
});
