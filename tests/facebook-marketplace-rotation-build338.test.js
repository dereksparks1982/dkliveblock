"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict");
const FB=require("../src/facebook-ads.js"),Report=require("../src/facebook-diagnostic-report.js");
function fixture(n){
 const body={nodeType:1},doc={body,documentElement:{nodeType:1}};
 const labels=Array.from({length:n},()=>({tagName:"SPAN",children:[],textContent:"Ordinary",getAttribute:()=>null}));
 doc.querySelectorAll=s=>s.startsWith('main span,main [aria-label]')?labels:[];
 return FB.create(doc,{location:{hostname:"www.facebook.com",pathname:"/marketplace/category/furniture"}});
}
test("Build 338: Marketplace scan advances beyond 3500 candidates",()=>{
 const d=fixture(3800);assert.equal(d.scan(),0);assert.equal(d.diagnostics().marketplaceCursor,3500);
 assert.equal(d.scan(),0);assert.equal(d.diagnostics().marketplaceCursor,3200);
});
test("Build 338: small Marketplace queues wrap without losing candidates",()=>{
 const d=fixture(17);assert.equal(d.scan(),0);assert.equal(d.diagnostics().marketplaceCursor,0);
});
test("Build 338: no label on an ordinary item triggers deletion",()=>{
 const d=fixture(4000);d.scan();d.scan();assert.equal(d.diagnostics().hidden,0);
});
test("Build 338: safe diagnostic includes only bounded Marketplace cursor",()=>{
 const d=fixture(4000);d.scan();
 const r=Report.build({ok:true,active:true,adRecognition:true,adapterLoaded:true,detector:d.diagnostics()},null);
 assert.equal(r.detector.marketplaceCursor,3500);assert.equal(r.schema,2);
});
test("Build 338: exact Marketplace tile boundary and Firefox versions preserved",()=>{
 const src=require("node:fs").readFileSync(require("node:path").join(__dirname,"../src/facebook-ads.js"),"utf8");
 assert.ok(src.includes('hide(tile,label,"marketplace")'));
 assert.equal(require("../src/manifest.json").version,require("../package.json").version);
});
