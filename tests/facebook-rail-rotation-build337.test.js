"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict");
const FB=require("../src/facebook-ads.js"),Report=require("../src/facebook-diagnostic-report.js");
function fixture(a=0,b=0,c=0){
 const body={nodeType:1},doc={body,documentElement:{},location:{hostname:"www.facebook.com"}};
 const headings=Array.from({length:a},()=>({textContent:"Friends"}));
 const labels=Array.from({length:b},()=>({tagName:"SPAN",children:[],textContent:"Ordinary",getBoundingClientRect:()=>({left:0,width:75,height:20})}));
 const links=Array.from({length:c},()=>({tagName:"A",getAttribute:()=>null}));
 doc.querySelectorAll=s=>s==='h1,h2,h3,h4,h5,h6,[role="heading"]'?headings:
 s.startsWith('span,[role="complementary"] div,')?labels:
 s.startsWith('a[target="rhcad2"]')?links:[];
 return FB.create(doc,{location:{hostname:"www.facebook.com",pathname:"/"},innerWidth:1300});
}
test("Build 337: heading scanning rotates past first 260",()=>{
 const d=fixture(600);assert.equal(d.scan(),0);
 assert.equal(d.diagnostics().railHeadingCursor,260);
 d.scan();assert.equal(d.diagnostics().railHeadingCursor,520);
});
test("Build 337: label and link scan rotate inside prior bounds",()=>{
 const d=fixture(0,6000,500);d.scan();
 assert.equal(d.diagnostics().railLabelCursor,5500);
 assert.equal(d.diagnostics().railLinkCursor,220);
 d.scan();assert.equal(d.diagnostics().railLabelCursor,5000);
 assert.equal(d.diagnostics().railLinkCursor,440);
});
test("Build 337: ordinary rail stays visible after multiple scans",()=>{
 const d=fixture(500,6000,500);
 for(let i=0;i<3;i++)assert.equal(d.scan(),0);
 assert.equal(d.diagnostics().hidden,0);
});
test("Build 337: cursors are numeric only in explicit sanitized report",()=>{
 const d=fixture(520,5600,300);d.scan();
 const report=Report.build({ok:true,active:true,adRecognition:true,adapterLoaded:true,detector:d.diagnostics()},null);
 assert.equal(report.detector.railHeadingCursor,260);
 assert.equal(report.detector.railLabelCursor,5500);
 assert.equal(report.detector.railLinkCursor,220);
 assert.equal(report.schema,2);
});
test("Build 337: empty rail and version scope safe",()=>{
 const d=fixture();d.scan();
 for(const k of ["railHeadingCursor","railLabelCursor","railLinkCursor"])assert.equal(d.diagnostics()[k],0);
 assert.equal(require("../src/manifest.json").version,require("../package.json").version);
});
