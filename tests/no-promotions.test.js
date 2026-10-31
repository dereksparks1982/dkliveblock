"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path");
const root=path.join(__dirname,"../src");
test("no premium, Acceptable Ads or promotional-message controls exist",()=>{
 const settings=fs.readFileSync(path.join(root,"settings.js"),"utf8"),
  page=fs.readFileSync(path.join(root,"options.html"),"utf8"),
  logic=fs.readFileSync(path.join(root,"options.js"),"utf8");
 const manifest=JSON.parse(fs.readFileSync(path.join(root,"manifest.json"),"utf8"));
 assert.doesNotMatch(settings,/allowPromotionalMessages|acceptableAds|showMarketing|premiumUnlock/);
 assert.doesNotMatch(logic,/allowPromotionalMessages|acceptableAds|showMarketing|premiumUnlock/);
 assert.doesNotMatch(page,/id="(?:allowPromotionalMessages|acceptableAds|showMarketing|premiumUnlock)"/);
 assert.match(page,/never shows paid promotions/);
 assert.ok(!manifest.permissions.includes("notifications"));
 assert.equal(manifest.version,JSON.parse(fs.readFileSync(require("node:path").join(__dirname,"../package.json"),"utf8")).version);
});
