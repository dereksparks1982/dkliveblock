"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path");
const src=fs.readFileSync(path.join(__dirname,"../src/facebook-full-core.js"),"utf8");
function harness(){
 const instances=[],body={nodeType:1,querySelectorAll:()=>[],classList:{contains:()=>false},matches:()=>false};
 const doc={body,documentElement:{nodeType:1},addEventListener(){}};
 const win={location:{hostname:"www.facebook.com",pathname:"/"},addEventListener(){}};
 const browser={runtime:{getManifest:()=>({version:"fixture"}),sendMessage:async()=>({}),onMessage:{addListener(){}}},storage:{onChanged:{addListener(){}},local:{get:async d=>d,set:async()=>{}}}};
 class O{constructor(){this.active=false;instances.push(this)}observe(){this.active=true}disconnect(){this.active=false}}
 const run=new Function("globalThis","document","window","MutationObserver","performance","Node",
 "setTimeout","setInterval","clearInterval","getComputedStyle","location",
 src+"\nreturn globalThis.DKFacebookFullCore;");
 const api=run({browser},doc,win,O,{now:()=>0},{ELEMENT_NODE:1,TEXT_NODE:3},()=>0,()=>0,()=>{},()=>({}),win.location);
 return {api,instances};
}
test("Build 363: paused startup does not observe page mutations",async()=>{
 const h=harness();await Promise.resolve();await Promise.resolve();
 assert.equal(h.api.diagnostics().observerActive,0);
 assert.equal(h.instances[0].active,false);
});
test("Build 363: enable attaches observer, pause disconnects",async()=>{
 const h=harness();await Promise.resolve();await Promise.resolve();
 h.api.setEnabled(true);assert.equal(h.api.diagnostics().observerActive,1);
 assert.equal(h.instances[0].active,true);
 h.api.setEnabled(false);assert.equal(h.api.diagnostics().observerActive,0);
 assert.equal(h.instances[0].active,false);
});
test("Build 363: repeated enable is idempotent; resume reconnects",async()=>{
 const h=harness();await Promise.resolve();await Promise.resolve();
 h.api.setEnabled(true);h.api.setEnabled(true);
 assert.equal(h.api.diagnostics().observerActive,1);
 h.api.setEnabled(false);h.api.setEnabled(true);
 assert.equal(h.api.diagnostics().observerActive,1);
});
test("Build 363: mobile child observers are disconnected on pause",()=>{
 assert.match(src,/revealObserver\?\.disconnect\(\); feedChildObserver\?\.disconnect\(\)/);
 assert.match(src,/mobileFeed = null; feedChildObserver = null/);
});
test("Build 363: full upstream capabilities and version are retained",()=>{
 assert.ok(src.includes("function retryPendingLabels("));
 assert.ok(src.includes("function sweepUnlabeledAds("));
 assert.equal(require("../src/manifest.json").version,require("../package.json").version);
});
