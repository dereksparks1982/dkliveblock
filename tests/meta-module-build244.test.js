"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict");
const Modules=require("../src/company-modules.js"),Meta=require("../src/meta-module.js");
const Providers=require("../src/provider-intelligence.js"),Adaptive=require("../src/adaptive-dispatcher.js");
test("Build 244 Meta platform adapters do not pretend Instagram is Facebook",()=>{
 const doc={};
 const mk=hostname=>({location:{hostname},top:null});
 const old={DKCompanyModules:globalThis.DKCompanyModules,DKAdaptiveDispatcher:globalThis.DKAdaptiveDispatcher};
 globalThis.DKCompanyModules=Modules;globalThis.DKAdaptiveDispatcher=Adaptive;
 try{
  assert.equal(Meta.create(doc,mk("youtube.com")),null);
  const ig=Meta.create(doc,mk("www.instagram.com"));
  assert.equal(ig.platform,"instagram");
  assert.equal(ig.scan(),0);
  assert.equal(ig.hiddenCount,0);
  assert.equal(ig.review({getAttribute:()=> "Sponsored"})[0].action,"review");
  assert.equal(ig.review({getAttribute:()=> "ordinary"}).length,0);
 }finally{
  globalThis.DKCompanyModules=old.DKCompanyModules;
  globalThis.DKAdaptiveDispatcher=old.DKAdaptiveDispatcher;
 }
});
test("Build 244 manifest order loads Meta router before content",()=>{
 const manifest=require("../src/manifest.json");
 const names=manifest.content_scripts[0].js;
 for(const name of ["company-modules.js","provider-intelligence.js",
  "adaptive-dispatcher.js","facebook-ads.js","meta-module.js"])
  assert.ok(names.indexOf(name)>=0&&names.indexOf(name)<names.indexOf("content.js"),name);
 assert.ok(names.indexOf("facebook-ads.js")<names.indexOf("meta-module.js"));
 assert.equal(manifest.version,"0.3.214");
});
