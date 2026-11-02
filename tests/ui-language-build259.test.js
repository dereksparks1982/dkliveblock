"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path");
const UI=require("../src/ui-language.js");
function read(name){return fs.readFileSync(path.join(__dirname,"../src",name),"utf8");}
test("Build 259: Russian is first additional interface language, with English fallback",()=>{
 assert.deepEqual(Array.from(UI.SUPPORTED),["en","ru"]);
 assert.deepEqual(Array.from(UI.PLANNED),["ar","tr","ur","fa"]);
 assert.equal(UI.supported("ru"),"ru");
 assert.equal(UI.supported("fa"),"en");
 assert.equal(UI.supported("es"),"en");
 assert.equal(UI.translate("View blocked","ru"),"Заблокированные");
 assert.equal(UI.translate("Protection settings","ru"),"Настройки защиты");
 assert.equal(UI.translate("Protection settings","en"),"Protection settings");
 assert.equal(UI.translate("Phrase awaiting translation","ru"),"Phrase awaiting translation");
});
test("Build 259: language selector exists in popup and Settings, never changes filter list selections",()=>{
 for(const page of ["popup.html","options.html"]){
  const html=read(page);
  assert.match(html,/<select id="dkUiLanguage"/);
  assert.match(html,/<option value="ru">Russian \(Русский\)<\/option>/);
  assert.match(html,/<option value="en">English<\/option>/);
  assert.match(html,/<script src="ui-language.js"><\/script>/);
 }
 assert.match(read("ui-language.js"),/browser\.storage\.local\.set/);
 assert.match(read("ui-language.js"),/const KEY="dkUiLanguage"/);
 assert.doesNotMatch(read("background.js"),/dkUiLanguage|DKUILanguage/);
 const manifest=require("../src/manifest.json");
 assert.equal(manifest.version,require("../package.json").version);
});
test("Build 259: only extension UI loads language module",()=>{
 const manifest=require("../src/manifest.json");
 for(const row of manifest.content_scripts)
  assert.ok(!row.js.includes("ui-language.js"));
 for(const row of manifest.background.scripts)
  assert.ok(row!=="ui-language.js");
});
