"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path"),root=path.resolve(__dirname,"../src");
test("toolbar has separate per-site cookie and distraction controls",()=>{
 const html=fs.readFileSync(path.join(root,"popup.html"),"utf8");
 const js=fs.readFileSync(path.join(root,"popup.js"),"utf8");
 for(const id of ["siteCookieReject","siteDistraction","siteProtectionInfo"])
  assert.ok(html.includes('id="'+id+'"'));
 assert.match(js,/setSiteFeaturePaused/);
 assert.match(html,/ad and tracker blocking active/i);
});
test("settings manage site cleanup exceptions with safe text nodes",()=>{
 const html=fs.readFileSync(path.join(root,"options.html"),"utf8"),
  js=fs.readFileSync(path.join(root,"options.js"),"utf8");
 for(const id of ["cookieRejectExceptions","distractionExceptions","cleanupExceptionsRefresh"])
  assert.ok(html.includes('id="'+id+'"'));
 assert.match(js,/getSiteFeatureExceptions/);
 assert.match(js,/removeSiteFeatureException/);
 assert.match(js,/text\.textContent=site/);
 assert.doesNotMatch(js,/insertAdjacentHTML|innerHTML\s*=/);
});
