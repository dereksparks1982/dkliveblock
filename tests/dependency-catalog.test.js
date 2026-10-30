"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path");
const root=path.join(__dirname,".."),src=path.join(root,"src");
const C=require("../src/dependency-catalog.js");
const read=file=>fs.readFileSync(path.join(src,file),"utf8");
test("dependency catalog uses a fixed HTTPS allowlist, unique IDs and no remote executable JS",()=>{
 assert.ok(C.ITEMS.length>=8);
 assert.equal(new Set(C.ITEMS.map(x=>x.id)).size,C.ITEMS.length);
 for(const item of C.ITEMS){
  assert.match(item.id,/^[a-z][a-z0-9-]{0,30}$/);
  assert.ok(C.isTrustedLink(item.url),item.url);
  assert.ok(["tool","application"].includes(item.group));
 }
 assert.equal(C.isTrustedLink("javascript:alert(1)"),false);
 assert.equal(C.isTrustedLink("http://example.org"),false);
 assert.equal(C.isTrustedLink("https://user:pass@example.org/"),false);
 assert.equal(C.isTrustedLink("https://example.org/#attack"),false);
 assert.equal(C.ITEMS.find(x=>x.id==="sublime").group,"application");
});
test("native companion permission is optional, not a basic protection dependency",()=>{
 const m=JSON.parse(read("manifest.json"));
 assert.ok(m.optional_permissions?.includes("nativeMessaging"));
 assert.ok(!m.permissions.includes("nativeMessaging"));
 assert.ok(m.background.scripts.includes("ghostery-vendor.js"));
 assert.ok(!m.background.scripts.includes("dependency-catalog.js"));
 const html=read("options.html");
 assert.ok(html.includes('id="dependencies"'));
 assert.ok(html.includes('src="dependency-catalog.js"'));
 assert.ok(html.indexOf('src="dependency-catalog.js"')<html.indexOf('src="dependencies.js"'));
});
test("dependencies UI uses explicit user activation and no file downloads/execution",()=>{
 const js=read("dependencies.js");
 assert.match(js,/checkDependencies/);
 assert.match(js,/browser\.permissions\.request/);
 assert.match(js,/browser\.runtime\.sendNativeMessage/);
 assert.match(js,/\.textContent=/);
 assert.doesNotMatch(js,/innerHTML|eval\(|fetch\(|downloads\.download|executeScript/);
 assert.match(js,/\.local\/share\/dk-live-block\/dependencies/);
});


test("Build 23 requires checked companion and explicit user consent for pinned install",()=>{
 const js=read("dependencies.js");
 assert.match(js,/installYtDlp/);
 assert.match(js,/removeYtDlp/);
 assert.match(js,/window\.confirm\(prompt\)/);
 assert.match(js,/PINNED_YT_DLP="2026\.10\.26"/);
 assert.match(js,/confirmation:"explicit-user-action"/);
 assert.match(js,/action,protocol:catalog\.PROTOCOL,toolId:"yt-dlp"/);
 assert.doesNotMatch(js,/innerHTML|eval\(|fetch\(|downloads\.download|executeScript/);
 const html=read("options.html");
 assert.match(html,/yt-dlp for Linux x86_64/);
 assert.match(html,/official links only/);
});
