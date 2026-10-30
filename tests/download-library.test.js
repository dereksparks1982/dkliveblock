"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path");
const root=path.join(__dirname,"../src");
test("Downloads inventory is explicit, read only, and optional",()=>{
 const html=fs.readFileSync(path.join(root,"downloads.html"),"utf8");
 const script=fs.readFileSync(path.join(root,"downloads.js"),"utf8");
 const popup=fs.readFileSync(path.join(root,"popup.html"),"utf8");
 const manifest=JSON.parse(fs.readFileSync(path.join(root,"manifest.json"),"utf8"));
 assert.match(html,/id="scanDownloads"/);
 assert.match(html,/id="downloadRows"/);
 assert.match(popup,/id="myDownloads"/);
 assert.match(script,/browser\.permissions\.request/);
 assert.match(script,/action:"listDownloads"/);
 assert.match(script,/textContent/);
 assert.doesNotMatch(script,/innerHTML|fetch\(|eval\(|downloads\.download/);
 assert.ok(manifest.optional_permissions.includes("nativeMessaging"));
 assert.ok(!manifest.permissions.includes("nativeMessaging"));
});
