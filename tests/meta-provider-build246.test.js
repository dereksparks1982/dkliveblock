"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path");
const bg=fs.readFileSync(path.join(__dirname,"../src/background.js"),"utf8");
const manifest=require("../src/manifest.json");
test("Build 246 inspect and clear actions are confined to extension UI",()=>{
 assert.match(bg,/msg.action==="getMetaProviderIntel"\|\|msg.action==="clearMetaProviderIntel"/);
 assert.match(bg,/if\(fromContent\|\|!Number.isInteger\(id\)\|\|id<0\)/);
 assert.match(bg,/DKCompanyModules.companyFor\(site\)!=="meta"/);
 assert.match(bg,/metaProviderEvidence.clear\(\);return \{ok:true,cleared:true\}/);
 assert.match(bg,/observations:data.settings.requestLog\?metaProviderEvidence.list\(\).slice\(0,100\):\[\]/);
});
test("Build 246 extension version bumped",()=>{
 assert.equal(manifest.version,"0.3.216");
});
