"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path");
const root=path.resolve(__dirname,"..");
test("All Firefox manifest assets are available locally",()=>{
 const m=JSON.parse(fs.readFileSync(path.join(root,"src/manifest.json"),"utf8"));
 assert.equal(m.name,"DK Live Block");
 assert.equal(m.manifest_version,2);
 assert.ok(m.permissions.includes("webRequestBlocking"));
 assert.ok(m.optional_permissions.includes("nativeMessaging"));
 assert.ok(!m.permissions.includes("nativeMessaging"));
 assert.ok(m.background.scripts.indexOf("public-suffix.js")>=0);
 assert.ok(m.background.scripts.indexOf("auth-protection.js")<m.background.scripts.indexOf("background.js"));
 assert.ok(m.background.scripts.indexOf("public-suffix.js")<m.background.scripts.indexOf("rules.js"));
 assert.ok(fs.existsSync(path.join(root,"src/LICENSE-PSL.txt")));
 const contentScripts=m.content_scripts[0].js;
 assert.ok(contentScripts.indexOf("video-assist.js")<contentScripts.indexOf("streaming-watch.js"));
 assert.ok(contentScripts.indexOf("streaming-watch.js")<contentScripts.indexOf("content.js"));
 assert.ok(contentScripts.indexOf("auth-protection.js")>=0);
 assert.ok(contentScripts.indexOf("auth-protection.js")<contentScripts.indexOf("popup-guard.js"));
 assert.ok(contentScripts.indexOf("popup-guard.js")>=0);
 assert.ok(contentScripts.indexOf("popup-guard.js")<contentScripts.indexOf("content.js"));
 const assets=[...m.background.scripts,...m.content_scripts.flatMap(c=>c.js),m.browser_action.default_popup,m.options_ui.page];
 for(const file of assets)assert.ok(fs.existsSync(path.join(root,"src",file)),"Missing "+file);
 for(const file of [m.browser_action.default_popup,m.options_ui.page]){
  const html=fs.readFileSync(path.join(root,"src",file),"utf8");
  for(const match of html.matchAll(/<script[^>]+src="([^"]+)"/g))
   assert.ok(fs.existsSync(path.join(root,"src",match[1])),"Missing script "+match[1]);
 }
});
test("No GitHub Actions and no remote executable scripts",()=>{
 assert.equal(fs.existsSync(path.join(root,".github/workflows")),false);
 const m=JSON.parse(fs.readFileSync(path.join(root,"src/manifest.json"),"utf8"));
 assert.equal(m.content_security_policy?.includes("unsafe-eval")||false,false);
 assert.equal(m.content_security_policy?.includes("https://")||false,false);
});
