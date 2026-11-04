"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path");
const source=fs.readFileSync(path.join(__dirname,"../src/meta-module.js"),"utf8");
const Report=require("../src/facebook-diagnostic-report.js");
function meta(full){
 const root={DKCompanyModules:{profileFor:()=>({company:"meta",platform:"facebook"})},
  DKFacebookFullCore:full,DKFacebookAds:{create:()=>{throw Error("LEGACY SCANNER MUST NOT RUN")}}};
 new Function("globalThis",source)(root);
 return root.DKMetaModule.create({}, {location:{hostname:"www.facebook.com"}});
}
test("Build 367: full core takes sole ownership of Facebook DOM hiding",()=>{
 const calls=[];
 const o=meta({create:()=>({scan:()=>3,setEnabled:v=>calls.push(v),
  restore:()=>calls.push("restore"),setExceptions:()=>{},
  diagnostics:()=>({platform:"facebook",coreFull:1,hidden:3})})});
 assert.equal(o.scan(),3);
 o.setEnabled(true);o.setEnabled(false);o.restore();
 assert.deepEqual(calls,[true,false,"restore"]);
 assert.equal(o.diagnostics().coreFull,1);
});
test("Build 367: full core absent does not activate old partial scanner",()=>{
 const o=meta(undefined);
 assert.equal(o.scan(),0);
 assert.equal(o.diagnostics().coreMissing,1);
 assert.equal(o.diagnostics().mode,"full-facebook-engine-unavailable");
});
test("Build 367: diagnostic triage identifies missing core ahead of no-scans",()=>{
 const d=Report.build({ok:true,active:true,adRecognition:true,adapterLoaded:true,
  picking:false,detector:{coreMissing:1,hidden:0,scans:0}},null);
 assert.equal(d.triage.code,"facebook-full-core-missing");
 assert.equal(d.detector.coreMissing,1);
});
test("Build 367: legacy fallback is not referenced from active Meta adapter",()=>{
 assert.doesNotMatch(source,/DKFacebookAds\?\.create/);
 assert.match(source,/DKFacebookFullCore\?\.create/);
});
test("Build 367: package matches manifest and core is injected first",()=>{
 const m=require("../src/manifest.json"),p=require("../package.json");
 assert.equal(m.version,p.version);
 assert.ok(m.content_scripts[0].js.includes("facebook-full-core.js"));
});
