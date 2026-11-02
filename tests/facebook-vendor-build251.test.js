"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path");
const base=path.join(__dirname,"../src");
const upstream=fs.readFileSync(path.join(base,"vendor/facebook-sponsored-upstream.js"),"utf8");
const license=fs.readFileSync(path.join(base,"vendor/LICENSE-FACEBOOK-SPONSORED-MIT.txt"),"utf8");
const manifest=require("../src/manifest.json");
test("Build 251 contains complete credited MIT source and license",()=>{
 assert.ok(upstream.length>100000);
 assert.match(upstream,/function wholePost/);
 assert.match(upstream,/function sweepUnlabeledAds/);
 assert.match(license,/MIT License/);
 assert.match(license,/Copyright \(c\) 2026 Inky/);
});
test("Build 251 does not silently run second standalone blocker or unsolicited categories",()=>{
 assert.equal(manifest.version,"0.3.221");
 assert.ok(manifest.content_scripts.every(row=>!row.js.includes("vendor/facebook-sponsored-upstream.js")));
 assert.ok(manifest.content_scripts[0].js.includes("meta-module.js"));
});
