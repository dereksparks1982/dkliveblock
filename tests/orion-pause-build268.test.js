"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path");
const root=path.join(__dirname,"..");
test("Build 268: Orion pause script is packaged before the DOM scanner",()=>{
 const p=fs.readFileSync(path.join(root,"scripts/package-orion-candidate.py"),"utf8");
 assert.ok(p.indexOf('"orion-pause.js"')<p.indexOf('"orion-dom.js"'));
 assert.ok(p.includes('"tabs", "storage"'));assert.ok(p.includes('orion-popup.js'));
 assert.ok(!p.includes('webRequestBlocking'));
});
test("Build 268: paused page does not scan before saved state is read",()=>{
 const s=fs.readFileSync(path.join(root,"src/orion-dom.js"),"utf8");
 assert.ok(s.includes("let paused=false,ready=!root.DKOrionPause"));
 assert.ok(s.includes("if(active||paused||!ready)return"));
 assert.ok(s.includes("if(paused)stop();else start()"));
});
test("Build 268: bounded persisted site decisions do not include URL paths",()=>{
 const s=fs.readFileSync(path.join(root,"src/orion-pause.js"),"utf8");
 assert.ok(s.includes("dkOrionPausedHosts"));assert.ok(s.includes("MAX=100"));
 assert.ok(s.includes("location?.hostname"));assert.ok(!s.includes("location.href"));
 assert.ok(!s.includes("document.cookie"));
});
test("Build 268: invalid control message types are refused",()=>{
 const s=fs.readFileSync(path.join(root,"src/orion-pause.js"),"utf8");
 assert.ok(s.includes('typeof message.paused!=="boolean"'));
 assert.ok(s.includes('message.action!=="dk-orion-set-pause"'));
});
test("Build 268: storage failure does not override a previously saved pause",()=>{
 const s=fs.readFileSync(path.join(root,"src/orion-pause.js"),"utf8");
 assert.ok(s.includes("saved=false;apply(true)"));
});
test("Build 268: popup is Orion-only and accessible",()=>{
 const html=fs.readFileSync(path.join(root,"src/orion-status.html"),"utf8");
 assert.ok(html.includes('role="status"'));assert.ok(html.includes('id="site-pause"'));
 assert.ok(html.includes('src="orion-popup.js"'));
 const firefox=JSON.parse(fs.readFileSync(path.join(root,"src/manifest.json"),"utf8"));
 assert.equal(firefox.version,require("../package.json").version);
 assert.ok(!firefox.content_scripts[0].js.includes("orion-pause.js"));
});
