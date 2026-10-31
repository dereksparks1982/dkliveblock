"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path");
const root=path.resolve(__dirname,"..");
test("Build 57 browser VM fixtures supply the content-script dependencies",()=>{
 const manifest=JSON.parse(fs.readFileSync(path.join(root,"src/manifest.json"),"utf8"));
 const loaded=manifest.content_scripts[0].js;
 assert.ok(loaded.indexOf("cosmetic-debug.js")>=0);
 assert.ok(loaded.indexOf("cosmetic-debug.js")<loaded.indexOf("content.js"));
 for(const file of ["video-dom","overlay-observer","popup-refresh","anti-adblock-dom","paywall-dom","ad-observer"]){
  const text=fs.readFileSync(path.join(root,"tests",file+".test.js"),"utf8");
  assert.match(text,/DKCosmeticDebug:/,file+" has a cosmetic-debug VM stub");
 }
 const anti=fs.readFileSync(path.join(root,"tests/anti-adblock-dom.test.js"),"utf8");
 assert.match(anti,/DKStreamingWatch:/);
});
