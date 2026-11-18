"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
const src=name=>fs.readFileSync(path.join(__dirname,"../src",name),"utf8");
function boot(){
 class Clock extends Date {static t=100000;static now(){return Clock.t;}}
 const visits={diagnostics:0,legacy:0,scans:0},win={location:{hostname:"www.facebook.com"},
  setTimeout:()=>1,clearTimeout:()=>{}};win.top=win;
 let missed=0,enabled=true;
 const ctx=vm.createContext({Date:Clock,console,setTimeout:()=>1,clearTimeout:()=>{},
  DKCompanyModules:{profileFor:()=>({company:"meta",platform:"facebook"})},
  DKFacebookFullCore:{create:()=>({
   scan:()=>{visits.scans++;return 0;},scanInserted:()=>0,scanVisible:()=>0,
   diagnostics:()=>{visits.diagnostics++;return {
     coreFull:1,coreEnabled:enabled?1:0,settingsReady:1,observerActive:enabled?1:0,
     labelsUnanchored:missed,tooWideRefused:0,hidden:0};},
   canFallbackHide:()=>true,setEnabled:e=>{enabled=e;},
   restore:()=>{},setExceptions:()=>{},observeMutation:()=>false,get hiddenCount(){return 0;}})},
  DKFacebookAds:{create:()=>{visits.legacy++;return {
   scan:()=>1,scanInserted:()=>1,scanVisible:()=>0,setExceptions:()=>{},
   restore:()=>{},get hiddenCount(){return 0;}}}}
 });
 vm.runInContext(src("meta-strategy-nesty.js"),ctx);
 vm.runInContext(src("meta-module.js"),ctx);
 const mod=ctx.DKMetaModule.create({},win);
 const ordinary={type:"attributes",attributeName:"class",
  target:{nodeType:1,textContent:"ordinary",isConnected:true,closest:()=>null}};
 return {Clock,visits,mod,ordinary,setMisses:n=>{missed=n;}};
}
test("Build 388: a burst of 1000 Facebook mutations does not allocate 1000 core snapshots",()=>{
 const v=boot();v.mod.setEnabled(true);
 for(let i=0;i<1000;i++)v.mod.observeMutation(v.ordinary);
 assert.equal(v.visits.diagnostics,1);
 v.Clock.t+=119;
 for(let i=0;i<1000;i++)v.mod.observeMutation(v.ordinary);
 assert.equal(v.visits.diagnostics,1);
 v.Clock.t+=1;v.mod.observeMutation(v.ordinary);
 assert.equal(v.visits.diagnostics,2);
 assert.equal(v.visits.legacy,0);
});
test("Build 388: persistent real misses still wake fallback after 1.5 seconds",()=>{
 const v=boot();v.mod.setEnabled(true);
 v.mod.observeMutation(v.ordinary);
 v.setMisses(4);
 v.Clock.t+=120;v.mod.observeMutation(v.ordinary);
 assert.equal(v.visits.legacy,0);
 v.Clock.t+=1600;v.mod.observeMutation(v.ordinary);
 assert.equal(v.visits.legacy,1);
 assert.equal(v.mod.diagnostics().legacyActive,1);
 v.mod.setEnabled(false);
 assert.equal(v.mod.diagnostics().legacyActive,0);
});
test("Build 388: reset allows immediate fresh Nesty sample after site reenable",()=>{
 const v=boot();v.mod.setEnabled(true);v.mod.observeMutation(v.ordinary);
 v.mod.setEnabled(false);v.mod.setEnabled(true);
 v.mod.observeMutation(v.ordinary);
 assert.equal(v.visits.diagnostics,2);
});
test("Build 388: disabled Facebook core never activates retained scanner",()=>{
 const v=boot();v.mod.setEnabled(false);v.setMisses(8);
 v.mod.observeMutation(v.ordinary);
 v.Clock.t+=3000;v.mod.scan();
 assert.equal(v.visits.legacy,0);
});
test("Build 388: no added timer, observer, privilege or external service",()=>{
 const code=src("meta-module.js");
 assert.match(code,/SUPERVISOR_SAMPLE_MS=120/);
 assert.equal((code.match(/new MutationObserver/g)||[]).length,0);
 assert.equal((code.match(/setInterval\(/g)||[]).length,0);
 assert.ok(!code.includes("fetch("));
 assert.equal(require("../src/manifest.json").version,require("../package.json").version);
});
