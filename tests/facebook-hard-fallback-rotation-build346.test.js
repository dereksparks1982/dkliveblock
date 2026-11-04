"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict");
const FB=require("../src/facebook-ads.js"),Report=require("../src/facebook-diagnostic-report.js");
function fixture(n){
 const candidates=Array.from({length:n},()=>({getAttribute:()=>"",closest:()=>null}));
 const doc={body:{nodeType:1},documentElement:{},querySelectorAll:s=>s.includes('[aria-label$="sponsored content" i]')?candidates:[]};
 return FB.create(doc,{location:{hostname:"www.facebook.com",pathname:"/"},innerWidth:1250});
}
test("Build 346: fallback position advances beyond first 160",()=>{
 const d=fixture(400);assert.equal(d.scan(),0);assert.equal(d.diagnostics().hardCursor,160);
 d.scan();assert.equal(d.diagnostics().hardCursor,320);
});
test("Build 346: short fallback lists wrap safely",()=>{
 const d=fixture(50);d.scan();assert.equal(d.diagnostics().hardCursor,0);
});
test("Build 346: no Sponsored evidence means no hide",()=>{
 const d=fixture(700);d.scan();d.scan();assert.equal(d.diagnostics().hidden,0);
});
test("Build 346: cursor exported through bounded local report only",()=>{
 const d=fixture(700);d.scan();
 const r=Report.build({ok:true,active:true,adRecognition:true,adapterLoaded:true,detector:d.diagnostics()},null);
 assert.equal(r.detector.hardCursor,160);assert.equal(r.schema,2);
});
test("Build 346: fallback evidence gate and version unchanged",()=>{
 const s=require("node:fs").readFileSync(require("node:path").join(__dirname,"../src/facebook-ads.js"),"utf8");
 assert.match(s,/hardInspected<Math\.min\(160,hard\.length\)/);
 assert.equal(require("../src/manifest.json").version,require("../package.json").version);
});
