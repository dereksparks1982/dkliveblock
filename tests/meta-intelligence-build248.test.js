"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path");
const read=p=>fs.readFileSync(path.join(__dirname,"../src",p),"utf8");
test("Build 248 intelligence UI only uses user-selected tab and extension-only messages",()=>{
 const script=read("meta-intelligence-ui.js"),html=read("meta-intelligence.html");
 assert.match(script,/getMetaProviderIntel/);assert.match(script,/clearMetaProviderIntel/);
 assert.match(script,/Number\.isSafeInteger\(tabId\)/);
 assert.match(script,/textContent=String\(value\)/);
 assert.match(html,/No automatic rules are generated/);
 assert.doesNotMatch(script,/innerHTML\s*=/);
});
test("Build 248 site dashboard offers viewer only for selected Meta hosts",()=>{
 const script=read("site-dashboard.js");
 assert.match(script,/dashboardMetaIntel/);
 assert.match(script,/DKMetaDashboardHost\(d\.site\)/);
 assert.equal(require("../src/manifest.json").version,require("../package.json").version);
});
