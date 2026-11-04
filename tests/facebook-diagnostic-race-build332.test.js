"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path");
const src=fs.readFileSync(path.join(__dirname,"../src/meta-intelligence-ui.js"),"utf8");
test("Build 332: each scan has a fresh request generation",()=>{
 assert.match(src,/generation=\+\+facebookReportGeneration/);
 assert.match(src,/generation===facebookReportGeneration/);
});
test("Build 332: pending browser tab lookup cannot overwrite later user request",()=>{
 assert.match(src,/const tab=await browser\.tabs\.get\(tabId\);\s*if\(!latest\(\)\)return/);
});
test("Build 332: pending content-script reply and second tab read are guarded",()=>{
 assert.match(src,/\{frameId:0\}\);\s*if\(!latest\(\)\)return/);
 assert.match(src,/const after=await browser\.tabs\.get\(tabId\);\s*if\(!latest\(\)\)return/);
});
test("Build 332: stale network and content errors cannot clobber latest evidence",()=>{
 assert.match(src,/\}catch\(e\)\{\s*if\(!latest\(\)\)return;\s*panel\.textContent/);
 assert.match(src,/if\(after\?\.url!==tab\.url\)/);
});
test("Build 332: reports remain local with unchanged Firefox privileges",()=>{
 assert.doesNotMatch(src,/innerHTML\s*=|fetch\s*\(|sendBeacon\s*\(/);
 const m=require("../src/manifest.json"),p=require("../package.json");
 assert.equal(m.version,p.version);assert.match(p.version,/^0\.3\.\d+$/);
});
