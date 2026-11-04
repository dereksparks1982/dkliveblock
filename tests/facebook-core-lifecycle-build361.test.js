"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path");
const source=fs.readFileSync(path.join(__dirname,"../src/facebook-full-core.js"),"utf8");
function boot(){
 let release;const prefs=new Promise(done=>{release=done;});
 const doc={body:null,documentElement:{nodeType:1},addEventListener(){}};
 const win={addEventListener(){},location:{hostname:"www.facebook.com",pathname:"/",origin:"https://www.facebook.com"}};
 const browser={runtime:{getManifest:()=>({version:"fixture"}),sendMessage:async()=>({}),onMessage:{addListener(){}}},
  storage:{local:{get:async defaults=>{await prefs;return {...defaults,hideSuggested:false};},set:async()=>{}},onChanged:{addListener(){}}}};
 class Observer{observe(){}disconnect(){}}
 const run=new Function("globalThis","document","window","MutationObserver","performance",
  "Node","setTimeout","setInterval","clearInterval","getComputedStyle","location",
  source+"\nreturn globalThis.DKFacebookFullCore;");
 const api=run({browser},doc,win,Observer,{now:()=>0},{ELEMENT_NODE:1,TEXT_NODE:3},
  ()=>0,()=>0,()=>{},()=>({}),win.location);
 return {api,release};
}
test("Build 361: enable request waits for saved settings",async()=>{
 const f=boot();f.api.setEnabled(true);
 assert.equal(f.api.diagnostics().coreEnabled,0);
 f.release();await Promise.resolve();await Promise.resolve();await Promise.resolve();
 assert.equal(f.api.diagnostics().coreEnabled,1);
 f.api.setEnabled(false);assert.equal(f.api.diagnostics().coreEnabled,0);
});
test("Build 361: pause before preferences resolve remains paused",async()=>{
 const f=boot();f.api.setEnabled(true);f.api.setEnabled(false);f.release();
 await Promise.resolve();await Promise.resolve();await Promise.resolve();
 assert.equal(f.api.diagnostics().coreEnabled,0);assert.equal(f.api.scan(),0);
});
test("Build 361: complete original functions are still executable source",()=>{
 for(const f of ["sweepUnlabeledAds","retryPendingLabels","resolveViaReferrer",
 "wholePost","labelVariants","buildDiagnostics","addToPageList","sweepSections"])
  assert.ok(source.includes("function "+f+"("),f);
});
test("Build 361: triage identifies no label vs unmatched post boundary",()=>{
 const R=require("../src/facebook-diagnostic-report.js");
 const wrap=d=>({kind:"dk-facebook-aggregate-diagnostics",schema:2,active:true,
  adRecognition:true,adapterLoaded:true,picking:false,detector:d,graphql:{available:false}});
 assert.equal(R.triage(wrap({coreFull:1,scans:2,labelsClassified:3,labelsAnchored:0})).code,"ad-label-not-anchored");
 assert.equal(R.triage(wrap({coreFull:1,scans:2,observerCalls:4,labelsClassified:0})).code,"no-ad-label-matched");
 assert.equal(R.triage(wrap({coreFull:1,scans:2,labelsClassified:3,labelsAnchored:2,hidden:1})).code,"dom-hide-observed");
});
test("Build 361: original standalone MIT engine remains Facebook-only",()=>{
 const manifest=require("../src/manifest.json"),pkg=require("../package.json");
 assert.equal(pkg.version,manifest.version);
 const fb=manifest.content_scripts.find(c=>c.js.includes("facebook-full-core.js"));
 assert.ok(fb&&!fb.all_frames&&fb.matches.every(m=>m.includes("facebook.com")));
});
