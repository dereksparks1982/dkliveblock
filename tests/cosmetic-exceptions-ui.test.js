"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path"),root=path.resolve(__dirname,"../src");
test("Build 52 only adds strict exact-host cosmetic exceptions",()=>{
 const m=JSON.parse(fs.readFileSync(path.join(root,"manifest.json"),"utf8"));
 const bg=fs.readFileSync(path.join(root,"background.js"),"utf8");
 assert.equal(m.version,"0.3.23");
 assert.ok(m.background.scripts.indexOf("cosmetic-exceptions.js")<
  m.background.scripts.indexOf("background.js"));
 const start=bg.indexOf('if(msg.action==="getCosmeticSiteExceptions"');
 const end=bg.indexOf('if(msg.action==="getCosmeticDebugSelectors"',start);
 const code=bg.slice(start,end);
 assert.match(code,/browser\.tabs\.get\(id\)/);
 assert.match(code,/DKSiteAllowlist\.host\(page\)/);
 assert.match(code,/DKCosmeticExceptions\.valid/);
 assert.match(code,/DKCosmeticExceptions\.change/);
 assert.match(code,/if\(fromContent/);
 assert.doesNotMatch(code,/allowHost|DKRequestControls|streamingAllowances/);
});
test("debug inspector scans at most 160 DOM candidates, protects visible styles",()=>{
 const src=fs.readFileSync(path.join(root,"cosmetic-debug.js"),"utf8");
 assert.match(src,/\+\+scanned>160/);
 assert.match(src,/MAX_HIGHLIGHT=12/);
 assert.match(src,/style\.setProperty\("outline"/);
 assert.doesNotMatch(src,/style\.setProperty\("display"/);
});
