"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path");
require("../src/ui-language-tools.js");const UI=require("../src/ui-language.js");
const src=n=>fs.readFileSync(path.join(__dirname,"../src",n),"utf8");
test("Build 322: fixed warning and manual outcome phrases render in Russian",()=>{
 for(const key of ["playback-refused","no-ad-observed","Video types differ: this is not a controlled ordinary-video versus movie comparison.",
  "No ad observed during failed or unverified playback is not evidence of successful ad blocking."]){
  assert.notEqual(UI.translate(key,"ru"),key);assert.equal(UI.translate(key,"en"),key);
 }
});
test("Build 322: local reports preserve stable English schema, only display changes",()=>{
 const ui=src("youtube-lab-ui.js");
 assert.ok(ui.includes('local(result.interpretation)'));
 assert.ok(ui.includes('local(manual.baseline)'));
 assert.ok(ui.includes('observations:observations(),manualAssessment:DKYouTubeManualOutcome.assess(observations())'));
 assert.ok(!ui.includes('observations:local('));
});
test("Build 322: dynamic table and warning labels use the same stored UI language",()=>{
 const ui=src("youtube-lab-ui.js");
 for(const phrase of ['local(value)','local(message)','local("Baseline: ")',
   'changes.dkUiLanguage','queueMicrotask'])assert.ok(ui.includes(phrase),phrase);
});
test("Build 322: English, Russian and technical identifiers remain separate",()=>{
 assert.equal(UI.translate("www.youtube.com","ru"),"www.youtube.com");
 assert.equal(UI.translate("unknown-mode","ru"),"unknown-mode");
 assert.equal(UI.translate("not recorded","ru"),"не указано");
});
test("Build 322: privacy, permissions and package version unchanged",()=>{
 const ui=src("youtube-lab-ui.js");
 assert.doesNotMatch(ui,/fetch\s*\(|XMLHttpRequest|sendBeacon|innerHTML\s*=/);
 const m=require("../src/manifest.json");assert.equal(m.version,require("../package.json").version);
});