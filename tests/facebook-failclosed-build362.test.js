"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path");
const src=fs.readFileSync(path.join(__dirname,"../src/facebook-full-core.js"),"utf8");
function setup(fail){
 let done;const wait=new Promise(resolve=>{done=resolve;});
 const doc={body:null,documentElement:{nodeType:1},addEventListener(){}};
 const win={location:{hostname:"www.facebook.com",pathname:"/"},addEventListener(){}};
 const browser={runtime:{getManifest:()=>({version:"fixture"}),sendMessage:async()=>({}),onMessage:{addListener(){}}},storage:{onChanged:{addListener(){}},local:{
  get:async defaults=>{await wait;if(fail)throw Error("offline");return defaults;},
  set:async()=>{}}}};
 class MutationObserver{observe(){}disconnect(){}}
 const run=new Function("globalThis","document","window","MutationObserver","performance","Node",
 "setTimeout","setInterval","clearInterval","getComputedStyle","location",
 src+"\nreturn globalThis.DKFacebookFullCore;");
 const api=run({browser},doc,win,MutationObserver,{now:()=>0},{ELEMENT_NODE:1,TEXT_NODE:3},
  ()=>0,()=>0,()=>{},()=>({}),win.location);
 return {api,done};
}
test("Build 362: failed preference storage remains disabled even after enable request",async()=>{
 const f=setup(true);f.api.setEnabled(true);f.done();
 await Promise.resolve();await Promise.resolve();await Promise.resolve();
 assert.equal(f.api.diagnostics().coreEnabled,0);
 assert.equal(f.api.diagnostics().settingsError,1);
 assert.equal(f.api.diagnostics().settingsReady,0);
});
test("Build 362: healthy preference storage enables only after readiness",async()=>{
 const f=setup(false);f.api.setEnabled(true);assert.equal(f.api.diagnostics().coreEnabled,0);
 f.done();await Promise.resolve();await Promise.resolve();await Promise.resolve();
 assert.equal(f.api.diagnostics().coreEnabled,1);
 assert.equal(f.api.diagnostics().settingsError,0);
});
test("Build 362: saved settings error and stale policy failure triaged separately",()=>{
 const R=require("../src/facebook-diagnostic-report.js");
 const wrap=d=>({kind:"dk-facebook-aggregate-diagnostics",schema:2,active:true,
 adRecognition:true,adapterLoaded:true,picking:false,detector:d,graphql:{}});
 assert.equal(R.triage(wrap({coreFull:1,settingsError:1})).code,"facebook-settings-unavailable");
 assert.equal(R.triage(wrap({coreFull:1,settingsReady:1,coreEnabled:0})).code,"facebook-core-disabled");
});
test("Build 362: controller fail-closes Facebook engine after refresh rejection",()=>{
 const text=fs.readFileSync(path.join(__dirname,"../src/content.js"),"utf8");
 assert.match(text,/if\(isFacebookHost\)facebookRecognizer\?\.setEnabled\?\.\(false\)/);
});
test("Build 362: full engine retained and version synced",()=>{
 assert.ok(src.includes("function sweepUnlabeledAds("));
 assert.ok(src.includes("function retryPendingLabels("));
 assert.equal(require("../src/manifest.json").version,require("../package.json").version);
});
