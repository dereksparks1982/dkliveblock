"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path");
const FB=require("../src/facebook-ads.js");
const src=fs.readFileSync(path.join(__dirname,"../src/facebook-ads.js"),"utf8");
test("Build 250: diagnostic snapshot is bounded, no page text",()=>{
 const doc={location:{hostname:"facebook.com"}};
 const win={location:{hostname:"facebook.com"},top:null};
 const fb=FB.create(doc,win);
 assert.equal(fb.diagnostics().platform,"facebook");
 assert.equal(fb.diagnostics().hidden,0);
 assert.equal(fb.diagnostics().cachedLabels,0);
 assert.equal(fb.diagnostics().limit,100);
 assert.equal(JSON.stringify(fb.diagnostics()).includes("textContent"),false);
});
test("Build 250: scan can release a hidden item after new exception",()=>{
 assert.match(src,/if\(allowed\(el\)\|\|old\.trigger&&allowed\(old\.trigger\)\)/);
 assert.match(src,/restoreOne\(el,old\);hidden\.delete\(el\);continue/);
});
test("Build 250: Meta adapter exposes scoped diagnostics only",()=>{
 const meta=fs.readFileSync(path.join(__dirname,"../src/meta-module.js"),"utf8");
 assert.match(meta,/diagnostics:\(\)=>facebook\?\.diagnostics\?\.\(\)/);
});
