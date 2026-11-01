"use strict";
const test=require("node:test"),assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path");
const root=path.resolve(__dirname,"..");
test("release automation is local only, never CI or auto-publishing",()=>{
 assert.equal(fs.existsSync(path.join(root,".github/workflows")),false);
 const build=fs.readFileSync(path.join(root,"scripts/package-firefox.py"),"utf8");
 assert.match(build,/--candidate/);
 assert.match(build,/scripts\/test-local.sh/);
 assert.doesNotMatch(build,/(?:gh workflow|actions\/checkout|wrangler deploy|npm publish)/);
});
test("public release disclosures explain proxy and filter-list limitations",()=>{
 const privacy=fs.readFileSync(path.join(root,"docs/PRIVACY.md"),"utf8");
 const checklist=fs.readFileSync(path.join(root,"docs/FIREFOX_MARKETPLACE.md"),"utf8");
 assert.match(privacy,/EasyList/);
 assert.match(privacy,/proxy API is \*\*not a kill switch\*\*/);
 assert.match(checklist,/Mozilla/);
 assert.match(checklist,/Not released/);
});

test("Build 219 candidate ZIP always requires source preflight and owner license",()=>{
 const build=fs.readFileSync(path.join(root,"scripts/package-firefox.py"),"utf8");
 assert.match(build,/amo-preflight\.py/);
 assert.match(build,/--strict/);
 assert.match(build,/owner_license/);
 assert.match(build,/manifest\.json/);
 const license=fs.readFileSync(path.join(root,"LICENSE"),"utf8");
 assert.match(license,/NO MONETIZATION OF DK LIVE BLOCK ITSELF/);
 const bible=fs.readFileSync(path.join(root,"COMPANY_BIBLE.md"),"utf8");
 assert.match(bible,/Exactly ONE Git branch is allowed/);
});
