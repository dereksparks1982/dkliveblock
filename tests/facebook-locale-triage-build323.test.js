"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path");
require("../src/ui-language-tools.js");const UI=require("../src/ui-language.js");
const Report=require("../src/facebook-diagnostic-report.js");
const src=n=>fs.readFileSync(path.join(__dirname,"../src",n),"utf8");
test("Build 323: Facebook triage codes and advice have local Russian translations",()=>{
 const r=Report.build({ok:true,active:true,adRecognition:true,adapterLoaded:true,
  detector:{scans:2,hidden:0}},null);
 assert.equal(r.triage.code,"no-hides-recorded");
 assert.equal(UI.translate(r.triage.code,"ru"),"скрытие рекламы не зафиксировано");
 assert.notEqual(UI.translate(r.triage.next,"ru"),r.triage.next);
});
test("Build 323: all fixed triage categories are covered",()=>{
 for(const key of ["invalid-evidence","protection-inactive","recognition-disabled",
  "scanner-unavailable","picker-active","no-scans-recorded","dom-hide-observed",
  "graphql-modification-observed","no-hides-recorded"])assert.notEqual(UI.translate(key,"ru"),key);
});
test("Build 323: local output and export are separately rendered",()=>{
 const js=src("meta-intelligence-ui.js");
 assert.ok(js.includes('JSON.stringify(facebookReport,null,2)'));
 assert.ok(js.includes('local(state.code)'));assert.ok(js.includes('local(state.next)'));
 assert.ok(js.includes('panel.textContent')===false||js.includes('renderFacebook()'));
 assert.ok(js.includes("browser.storage.onChanged?.addListener"));
});
test("Build 323: exported Facebook report schema is language-independent",()=>{
 const r=Report.build({ok:true,active:true,adRecognition:true,adapterLoaded:true,
  detector:{scans:1,hidden:1,privateUrl:"https://facebook.com/private"}},null);
 assert.equal(r.schema,2);assert.equal(r.triage.code,"dom-hide-observed");
 assert.equal(JSON.stringify(r).includes("privateUrl"),false);
 assert.equal(UI.translate("www.facebook.com","ru"),"www.facebook.com");
});
test("Build 323: no remote translation, new permissions or page geometry changes",()=>{
 const js=src("meta-intelligence-ui.js");
 assert.doesNotMatch(js,/fetch\s*\(|XMLHttpRequest|sendBeacon|innerHTML\s*=/);
 assert.equal(require("../package.json").version,require("../src/manifest.json").version);
});