"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path");
const s=fs.readFileSync(path.join(__dirname,"../src/youtube-lab-ui.js"),"utf8");
test("Build 354: stale YouTube file read errors require valid selection",()=>{
 assert.match(s,/catch\(error\)\{\s*\/\/ A newer reset or selection owns the UI/);
 assert.match(s,/if\(selectionGate\.valid\(revision\)\)show\(error\?\.message/);
});
test("Build 354: result remains guarded by same-file revision check",()=>{
 assert.match(s,/if\(!selectionGate\.valid\(revision\)\)throw Error\("Selected reports changed/);
});
test("Build 354: Clear invalidates outstanding local file work",()=>{
 assert.match(s,/function reset\(\)\{\s*selectionGate\.invalidate\(\)/);
 assert.match(s,/comparison=null;projected=null/);
});
test("Build 354: no network or raw selected report payload export",()=>{
 assert.doesNotMatch(s,/fetch\s*\(|XMLHttpRequest|sendBeacon\s*\(|innerHTML\s*=/);
 assert.match(s,/verifiedAdFree:false/);
});
test("Build 354: manifest and package version remain consistent",()=>{
 assert.equal(require("../src/manifest.json").version,require("../package.json").version);
});
