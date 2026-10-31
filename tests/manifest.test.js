"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path");
const root=path.resolve(__dirname,"..");
test("All Firefox manifest assets are available locally",()=>{
 const m=JSON.parse(fs.readFileSync(path.join(root,"src/manifest.json"),"utf8"));
 assert.equal(m.name,"DK Live Block");
 assert.equal(m.manifest_version,2);
 assert.ok(m.permissions.includes("webRequestBlocking"));
 assert.ok(m.permissions.includes("contextMenus"));
 assert.ok(m.permissions.includes("browserSettings"));
 assert.ok(m.background.scripts.indexOf("notification-protection.js")<m.background.scripts.indexOf("background.js"));
 assert.equal(m.devtools_page,"devtools.html");
 assert.ok(m.optional_permissions.includes("devtools"));
 assert.ok(!m.permissions.includes("devtools"));
 assert.ok(m.background.scripts.indexOf("context-menu.js")<m.background.scripts.indexOf("background.js"));
 assert.ok(m.background.scripts.indexOf("site-allowlist.js")<m.background.scripts.indexOf("background.js"));
 assert.ok(m.background.scripts.indexOf("language-lists.js")<m.background.scripts.indexOf("background.js"));
 assert.ok(m.optional_permissions.includes("nativeMessaging"));
 assert.ok(!m.permissions.includes("nativeMessaging"));
 assert.ok(m.background.scripts.indexOf("public-suffix.js")>=0);
 assert.ok(m.background.scripts.indexOf("auth-protection.js")<m.background.scripts.indexOf("background.js"));
 assert.ok(m.background.scripts.indexOf("public-suffix.js")<m.background.scripts.indexOf("rules.js"));
 assert.ok(m.background.scripts.indexOf("video-library.js")<m.background.scripts.indexOf("background.js"));
 assert.ok(m.background.scripts.indexOf("streaming-diagnostics.js")<m.background.scripts.indexOf("background.js"));
 assert.ok(m.background.scripts.indexOf("streaming-repair.js")<m.background.scripts.indexOf("background.js"));
 assert.ok(m.background.scripts.indexOf("request-monitor.js")<m.background.scripts.indexOf("background.js"));
 assert.ok(m.background.scripts.indexOf("popup-trap.js")<m.background.scripts.indexOf("background.js"));
 assert.ok(m.background.scripts.indexOf("popup-history.js")<m.background.scripts.indexOf("background.js"));
 assert.ok(m.background.scripts.indexOf("playback-health.js")<m.background.scripts.indexOf("background.js"));
 const content=m.content_scripts[0].js;
 assert.ok(content.indexOf("playback-health.js")<content.indexOf("content.js"));
 assert.ok(m.background.scripts.indexOf("request-controls.js")<m.background.scripts.indexOf("background.js"));
 assert.ok(fs.existsSync(path.join(root,"src/access-inspector.js")));
 assert.ok(fs.existsSync(path.join(root,"src/network-monitor.html")));
 assert.ok(fs.existsSync(path.join(root,"src/network-monitor.js")));
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

test("Build 24 standalone library assets and popup scripts are packaged",()=>{
 const m=JSON.parse(fs.readFileSync(path.join(root,"src/manifest.json"),"utf8"));
 const popup=fs.readFileSync(path.join(root,"src/popup.html"),"utf8");
 const library=fs.readFileSync(path.join(root,"src/library.html"),"utf8");
 assert.ok(popup.includes('id="videoTools"'));
 assert.ok(popup.includes('src="video-library.js"'));
 assert.ok(fs.existsSync(path.join(root,"src/library.js")));
 assert.ok(library.includes('src="video-library.js"'));
 assert.ok(m.permissions.includes("tabs"));
 assert.ok(m.optional_permissions.includes("nativeMessaging"));
});

test("Build 32 downloads inventory page is packaged with its local script",()=>{
 const page=path.join(root,"src/downloads.html");
 assert.ok(fs.existsSync(page));
 const html=fs.readFileSync(page,"utf8");
 assert.ok(html.includes('src="downloads.js"'));
 assert.ok(fs.existsSync(path.join(root,"src/downloads.js")));
});

test("Build 44 loads distraction classifier before content and retains no Acceptable Ads toggle",()=>{
 const fs=require("node:fs"),path=require("node:path");
 const root=path.resolve(__dirname,"..");
 const manifest=JSON.parse(fs.readFileSync(path.join(root,"src/manifest.json"),"utf8"));
 const scripts=manifest.content_scripts[0].js;
 assert.ok(scripts.indexOf("distractions.js")>=0);
 assert.ok(scripts.indexOf("distractions.js")<scripts.indexOf("content.js"));
 const bg=fs.readFileSync(path.join(root,"src/background.js"),"utf8");
 assert.match(bg,/cookies:true,annoyances:true,social:true/);
 assert.match(bg,/cookieReject:true,distractionControl:true/);
 const html=fs.readFileSync(path.join(root,"src/options.html"),"utf8");
 assert.match(html,/id="distractionControl"/);
 assert.doesNotMatch(html,/id="acceptableAds"/i);
});

test("Build 55 open-shadow consent script loads before the content controller",()=>{
 const m=JSON.parse(fs.readFileSync(path.join(root,"src/manifest.json"),"utf8"));
 const scripts=m.content_scripts[0].js;
 assert.ok(scripts.indexOf("consent-dom.js")>scripts.indexOf("consent.js"));
 assert.ok(scripts.indexOf("consent-dom.js")<scripts.indexOf("content.js"));
 assert.equal(m.version,JSON.parse(fs.readFileSync(path.join(root,"package.json"),"utf8")).version);
});

test("Build 59 dashboard scripts exist, load locally, and keep extension permissions identical",()=>{
 const html=fs.readFileSync(path.join(root,"src/site-dashboard.html"),"utf8");
 for(const match of html.matchAll(/<script[^>]+src="([^"]+)"/g))
  assert.ok(fs.existsSync(path.join(root,"src",match[1])),"Missing local script "+match[1]);
 const manifest=JSON.parse(fs.readFileSync(path.join(root,"src/manifest.json"),"utf8"));
 assert.equal(manifest.version,JSON.parse(fs.readFileSync(path.join(root,"package.json"),"utf8")).version);
 assert.ok(!manifest.permissions.includes("notifications"));
 assert.ok(!manifest.permissions.includes("clipboardRead"));
});

test("approved DK image is used for Firefox toolbar and add-ons icons",()=>{
 const manifest=JSON.parse(fs.readFileSync(path.join(root,"src/manifest.json"),"utf8"));
 assert.equal(manifest.browser_action.default_icon,"icons/dk-live-block.png");
 assert.equal(manifest.icons["48"],"icons/dk-live-block.png");
 assert.equal(manifest.icons["96"],"icons/dk-live-block.png");
 assert.ok(fs.statSync(path.join(root,"src/icons/dk-live-block.png")).size>100000);
});

test("Popup header displays the bundled DK icon before its title",()=>{
 const html=fs.readFileSync(path.join(root,"src/popup.html"),"utf8");
 const css=fs.readFileSync(path.join(root,"src/style.css"),"utf8");
 const manifest=JSON.parse(fs.readFileSync(path.join(root,"src/manifest.json"),"utf8"));
 assert.match(html,/<header><span class="popup-brand"><img src="icons\/dk-live-block\.png"[^>]*><strong>DK LIVE BLOCK<\/strong><\/span><small>Development build<\/small><\/header>/);
 assert.equal(manifest.browser_action.default_icon,"icons/dk-live-block.png");
 assert.ok(fs.statSync(path.join(root,"src/icons/dk-live-block.png")).size>0);
 assert.match(css,/\.popup header \.popup-brand/);
});
