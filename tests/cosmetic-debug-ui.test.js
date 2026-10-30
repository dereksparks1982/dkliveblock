"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path"),dir=path.resolve(__dirname,"../src");
test("debugger is a user-opened bundled extension page",()=>{
 const m=JSON.parse(fs.readFileSync(path.join(dir,"manifest.json"),"utf8"));
 const html=fs.readFileSync(path.join(dir,"cosmetic-debug.html"),"utf8");
 const js=fs.readFileSync(path.join(dir,"cosmetic-debug-page.js"),"utf8");
 const popup=fs.readFileSync(path.join(dir,"popup.js"),"utf8");
 assert.ok(fs.existsSync(path.join(dir,"cosmetic-debug.js")));
 assert.match(html,/src="cosmetic-debug-page.js"/);
 assert.match(html,/id="debugClear"/);
 assert.match(html,/id="debugScan"/);
 assert.match(js,/getCosmeticDebugSelectors/);
 assert.match(js,/inspectCosmeticDebug/);
 assert.match(js,/clearCosmeticDebug/);
 assert.match(popup,/cosmeticDebugger/);
 assert.ok(m.content_scripts[0].js.indexOf("cosmetic-debug.js")<
  m.content_scripts[0].js.indexOf("content.js"));
 assert.doesNotMatch(js,/fetch\(|eval\(|XMLHttpRequest\(/);
});
test("debugger background fetch requires real protected HTTP(S) tab",()=>{
 const bg=fs.readFileSync(path.join(dir,"background.js"),"utf8");
 const block=bg.slice(bg.indexOf('if(msg.action==="getCosmeticDebugSelectors")'),
  bg.indexOf('if(msg.action==="getStyle")'));
 assert.match(block,/fromContent/);
 assert.match(block,/browser\.tabs\.get\(id\)/);
 assert.match(block,/activeTab\(id,site\)/);
 assert.match(block,/policy\.document/);
 assert.match(block,/safeCosmetics/);
 assert.doesNotMatch(block,/data\.settings\.customRules\s*=/);
});
