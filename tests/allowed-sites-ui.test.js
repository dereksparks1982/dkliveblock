"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path");
const root=path.join(__dirname,"../src");
test("toolbar has a one-click, reversible allowed website control",()=>{
 const html=fs.readFileSync(path.join(root,"popup.html"),"utf8");
 const js=fs.readFileSync(path.join(root,"popup.js"),"utf8");
 assert.match(html,/id="allowlistNotice"/);
 assert.match(html,/id="toggle"/);
 assert.match(js,/Allowlist this website/);
 assert.match(js,/Remove from allowlist/);
 assert.match(js,/action:"setSiteAllowed"/);
});
test("settings manage one shared list, with input and Remove controls",()=>{
 const html=fs.readFileSync(path.join(root,"options.html"),"utf8");
 const js=fs.readFileSync(path.join(root,"options.js"),"utf8");
 for(const id of ["allowedWebsites","allowedSiteInput","allowedSiteAdd","allowedSitesRows","paused"])
  assert.ok(html.includes('id="'+id+'"'),"Missing "+id);
 for(const op of ["addAllowedSite","removeAllowedSite","renderAllowedSites"])
  assert.ok(js.includes(op),op);
 assert.match(html,/no paid whitelist/i);
 assert.doesNotMatch(js,/fetch\(|XMLHttpRequest|sendNativeMessage/);
});
