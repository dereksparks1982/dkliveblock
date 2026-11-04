"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
const N=require("../src/meta-strategy-nesty.js");
const load=pathName=>fs.readFileSync(path.join(__dirname,"..",pathName),"utf8");
const healthy=changes=>({coreFull:1,coreEnabled:1,settingsReady:1,observerActive:1,
 labelsClassified:0,labelsUnanchored:0,hidden:0,tooWideRefused:0,...changes});
test("Build 382: Nesty needs repeated independent evidence and warm-up before activating fallback",()=>{
 const nesty=N.create(),a=healthy({labelsUnanchored:2});
 assert.equal(nesty.update(a,false,1000).active,false);
 assert.equal(nesty.update(a,false,2499).active,false);
 const wake=nesty.update(a,false,2500);
 assert.equal(wake.active,true);assert.equal(wake.changed,true);
 assert.equal(nesty.snapshot().wakeups,1);
 assert.equal(nesty.update(a,false,2600).changed,false);
 assert.equal(nesty.update(a,false,32501).active,false);
 assert.equal(nesty.snapshot().active,false);
 assert.equal(nesty.update(a,false,32600).reason,"cooldown");
 assert.equal(nesty.update(a,false,40000).active,false,"stale evidence never wakes again");
});
test("Build 382: full-engine success and inactive/absent engine clear fallback",()=>{
 const nesty=N.create();
 const d=healthy({labelsUnanchored:3});
 nesty.update(d,false,1000);
 assert.equal(nesty.update(healthy({labelsUnanchored:3,hidden:1}),false,2600).active,false,
  "successful full-engine hiding cancels initial fallback evidence");
 assert.equal(nesty.update(healthy({labelsUnanchored:3,hidden:1}),false,2700).active,false);
 nesty.update(healthy({labelsUnanchored:7,hidden:1}),false,5000);
 assert.equal(nesty.update(healthy({labelsUnanchored:7,hidden:1}),false,7000).active,true);
 assert.equal(nesty.update(healthy({coreEnabled:0}),false,7100).active,false);
 assert.equal(nesty.update(null,true,8200).active,false);
 assert.equal(nesty.snapshot().active,false);
});
test("Build 382: legitimate label-like text in a post paragraph cannot wake legacy",()=>{
 const parent={nodeType:1,isConnected:true,textContent:"Ad",
   closest:q=>q.includes("p,")?{}:{}};
 assert.equal(N.explicitLabelMutation({type:"characterData",target:{nodeType:3,parentElement:parent}}),false);
 const badge={...parent,closest:q=>q.includes("p,")?null:{},getAttribute:()=> "Sponsored"};
 assert.equal(N.explicitLabelMutation({type:"attributes",attributeName:"aria-label",target:badge}),true);
 assert.equal(N.explicitLabelMutation({type:"attributes",attributeName:"class",target:badge}),false);
 assert.equal(N.explicitLabelMutation({type:"attributes",attributeName:"aria-label",target:{...badge,textContent:"Ordinary"}}),true);
});
test("Build 382: status exposes only bounded, content-free strategy counters",()=>{
 const nesty=N.create();
 nesty.update(healthy({labelsUnanchored:1}),true,1000);
 const info=nesty.snapshot();
 assert.deepEqual(Object.keys(info).sort(),["active","evidence","expires","lastReason","waiting","wakeups"]);
 assert.doesNotMatch(JSON.stringify(info),/https|post|profile|cookie|userId|watch/);
});
test("Build 382: Meta adapter stays full-first and creates legacy only after Nesty evidence",()=>{
 const script=load("src/meta-module.js"),runtime=load("src/meta-strategy-nesty.js");
 const state={counts:{create:0,legacyScan:0,fullScan:0,restored:0,enabled:0},diag:healthy({labelsUnanchored:0})};
 const source={location:{hostname:"www.facebook.com"},setTimeout:()=>12,clearTimeout:()=>{}};
 source.top=source;
 const ctx=vm.createContext({console,Date,window:source,setTimeout:source.setTimeout,clearTimeout:source.clearTimeout,
  DKCompanyModules:{profileFor:()=>({company:"meta",platform:"facebook"})},
  DKFacebookFullCore:{create:()=>({
   setEnabled:()=>{state.counts.enabled++;},scan:()=>{state.counts.fullScan++;return 0;},
   diagnostics:()=>({...state.diag}),scanInserted:()=>0,scanVisible:()=>0,
   observeMutation:()=>false,restore:()=>{},setExceptions:()=>{},get hiddenCount(){return 0;}})},
  DKFacebookAds:{create:()=>{state.counts.create++;return {
   scan:()=>{state.counts.legacyScan++;return 1;},scanVisible:()=>1,
   scanInserted:()=>1,restore:()=>{state.counts.restored++;},
   setExceptions:()=>{},get hiddenCount(){return 1;}}}}
 });
 vm.runInContext(runtime,ctx);
 vm.runInContext(script,ctx);
 const module=ctx.DKMetaModule.create({},source);
 module.setEnabled(true);module.scan();
 assert.equal(state.counts.create,0);
 state.diag=healthy({labelsUnanchored:3});
 module.scan();
 assert.equal(state.counts.create,0,"first sighting must not start the old engine");
 // Replace Date.now in the module's VM (not host test clock) to mature the evidence.
 const oldDate=ctx.Date;
 ctx.Date=class extends oldDate{static now(){return oldDate.now()+2500;}};
 module.scan();
 assert.equal(state.counts.create,1,"dormant legacy scanner should wake after persistent misses");
 assert.equal(state.counts.legacyScan,1);
 assert.equal(module.diagnostics().nestyFallback.active,true);
 module.setEnabled(false);
 assert.equal(state.counts.restored,1,"site pause must restore legacy hides");
 assert.equal(module.diagnostics().nestyFallback.active,false);
});
test("Build 382: manifest and offline suite register strategy supervisor",()=>{
 const manifest=JSON.parse(load("src/manifest.json"));
 const scripts=manifest.content_scripts[1].js;
 const n=scripts.indexOf("meta-strategy-nesty.js"),m=scripts.indexOf("meta-module.js");
 assert.ok(n>=0&&m>n);
 assert.match(load("scripts/test-local.sh"),/meta-strategy-nesty-build382\.test\.js/);
});
