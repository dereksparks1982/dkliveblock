"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path");
const dir=path.join(__dirname,"../src");
test("DevTools is optional and panel is self-contained",()=>{
 const m=JSON.parse(fs.readFileSync(path.join(dir,"manifest.json"),"utf8"));
 assert.ok(m.optional_permissions.includes("devtools"));
 assert.ok(!m.permissions.includes("devtools"));
 assert.equal(m.devtools_page,"devtools.html");
 const page=fs.readFileSync(path.join(dir,"devtools.html"),"utf8");
 const panel=fs.readFileSync(path.join(dir,"devtools-panel.html"),"utf8");
 const js=fs.readFileSync(path.join(dir,"devtools-panel.js"),"utf8");
 assert.match(page,/src="devtools.js"/);
 assert.match(panel,/src="devtools-panel.js"/);
 for(const id of ["start","stop","refresh","clear","summary","rows"])assert.ok(panel.includes('id="'+id+'"'));
 for(const command of ["getNetworkMonitor","startNetworkMonitor","stopNetworkMonitor","clearNetworkMonitor"])
  assert.ok(js.includes(command));
 assert.doesNotMatch(js,/fetch\(|XMLHttpRequest|eval\(/);
 assert.doesNotMatch(panel,/<script[^>]*https?:/);
});
test("optional panel is not created until enabled by user",async()=>{
 const code=fs.readFileSync(path.join(dir,"devtools.js"),"utf8");
 let created=0,enabled=false;
 const browser={devtools:{panels:{create:async()=>{created++;}}},runtime:{sendMessage:async()=>({settings:{showDevtoolsPanel:enabled}})}};
 new Function("browser",code)(browser);
 await new Promise(resolve=>setTimeout(resolve,0));
 assert.equal(created,0);
 enabled=true;new Function("browser",code)(browser);
 await new Promise(resolve=>setTimeout(resolve,0));
 assert.equal(created,1);
});
