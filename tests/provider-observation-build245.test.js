"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path");
const bg=fs.readFileSync(path.join(__dirname,"../src/background.js"),"utf8");
const manifest=require("../src/manifest.json");
test("Build 245 background loads company providers ahead of request logging",()=>{
 const js=manifest.background.scripts;
 assert.ok(js.indexOf("company-modules.js")>=0);
 assert.ok(js.indexOf("provider-intelligence.js")>js.indexOf("company-modules.js"));
 assert.ok(js.indexOf("provider-intelligence.js")<js.indexOf("background.js"));
});
test("Build 245 provider observations exclude raw URLs and private request fields",()=>{
 assert.match(bg,/const metaProviderEvidence=DKProviderIntelligence\.create\(\)/);
 assert.match(bg,/metaProviderEvidence\.observe\(\{host:destination,type:"unknown"/);
 assert.match(bg,/metaProviderEvidence\.clear\(\)/);
 assert.match(bg,/if\(!data\.settings\.requestLog/);
});
test("Build 245 observations are limited to Meta-originated third-party hosts",()=>{
 assert.match(bg,/DKCompanyModules\.companyFor\(site\)!=="meta"/);
 assert.match(bg,/DKCompanyModules\.companyFor\(destination\)==="meta"/);
});
