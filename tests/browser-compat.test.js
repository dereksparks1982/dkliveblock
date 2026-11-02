"use strict";
const {test}=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path");
const compat=require("../src/browser-compat.js");
const root=path.join(__dirname,"..");
const fixture=(family,ua,version,features={})=>{
 const api={
  runtime:{getManifest:()=>({manifest_version:version,
   permissions:family==="firefox"?["webRequestBlocking","webRequest"]:["declarativeNetRequest"]})},
  webRequest:features.webRequest?{onBeforeRequest:{addListener(){}},
   filterResponseData(){}}:undefined,
  declarativeNetRequest:features.dnr?{updateDynamicRules(){}}:undefined
 };
 if(family==="firefox")api.runtime.getBrowserInfo=()=>({name:"Firefox"});
 return {browser:family==="firefox"?api:undefined,
  chrome:family==="firefox"?undefined:api,navigator:{userAgent:ua}};
};
test("Build 239: Firefox retains blocking webRequest on MV2",()=>{
 const env=fixture("firefox","Firefox/159.0",2,{webRequest:true});
 const info=compat.inspect(env);
 assert.equal(info.browser,"firefox");
 assert.equal(info.family,"gecko");
 assert.equal(info.manifestVersion,2);
 assert.equal(info.networkBackend,"blocking-webrequest");
 assert.equal(info.capabilities.responseData,true);
 assert.equal(compat.requireNetworkBackend(info).ready,true);
});
test("Build 239: Chrome and Edge use one Chromium backend selection",()=>{
 const a=fixture("chrome","Mozilla/5.0 Chrome/159.0",3,{dnr:true});
 const b=fixture("edge","Mozilla/5.0 Chrome/159.0 Edg/159.0",3,{dnr:true});
 for(const [env,name] of [[a,"chrome"],[b,"edge"]]){
  const info=compat.inspect(env);
  assert.equal(info.browser,name);
  assert.equal(info.family,"chromium");
  assert.equal(info.networkBackend,"declarative-net-request");
 }
});
test("Build 239: no unsupported blocking implied by API names",()=>{
 const mv3=fixture("chrome","Chrome/159.0",3,{webRequest:true});
 const unknown=compat.inspect(mv3);
 assert.equal(unknown.capabilities.blockingWebRequest,false);
 assert.equal(unknown.networkBackend,"unavailable");
 assert.equal(compat.requireNetworkBackend(unknown).ready,false);
 const mv2=fixture("firefox","Firefox/159.0",2,{dnr:true});
 assert.equal(compat.inspect(mv2).networkBackend,"unavailable");
});
test("Build 239: immutable and non-elevating capability report",()=>{
 const report=compat.inspect(fixture("edge","Chrome/159.0 Edg/159.0",3,{dnr:true}));
 assert.equal(Object.isFrozen(report),true);
 assert.equal(Object.isFrozen(report.capabilities),true);
 assert.equal(Object.hasOwn(report,"permissionsToGrant"),false);
});
test("Build 239: one source, three targets, explicit blocked port gates",()=>{
 const plan=JSON.parse(fs.readFileSync(path.join(root,"platform/targets.json"),"utf8"));
 assert.deepEqual(Object.keys(plan.targets).sort(),["chrome","edge","firefox"]);
 assert.equal(plan.single_source,"src");
 assert.equal(plan.targets.firefox.manifest,2);
 for(const name of ["chrome","edge"]){
  assert.equal(plan.targets[name].manifest,3);
  assert.equal(plan.targets[name].status,"adapter-required");
  assert.equal(plan.targets[name].network_backend,"declarative-net-request");
 }
 const builder=fs.readFileSync(path.join(root,"scripts/build-browsers.py"),"utf8");
 assert.match(builder,/if args\.browser != "firefox":/);
 assert.match(builder,/--candidate/);
 assert.match(builder,/subprocess\.call/);
 assert.doesNotMatch(builder,/os\.system|shell=True|git clone/);
 const manifest=JSON.parse(fs.readFileSync(path.join(root,"src/manifest.json"),"utf8"));
 const scripts=manifest.background.scripts;
 assert.ok(scripts.includes("browser-compat.js"));
 assert.ok(scripts.indexOf("browser-compat.js")<scripts.indexOf("background.js"));
 assert.equal(manifest.manifest_version,2);
});
