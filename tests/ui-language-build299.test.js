"use strict";
const {test}=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const UI=require("../src/ui-language.js");

const src=name=>fs.readFileSync(path.join(__dirname,"..","src",name),"utf8");
const exempt=new Set(["DK LIVE BLOCK","LIVE BLOCK","elderredsoftworks@proton.me","~/.local/share/dk-live-block/dependencies/"]);
function displayedEnglish(html){
  const body=html.slice(html.indexOf("<body")+5)
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,"")
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi,"");
  return [...new Set([...body.matchAll(/>([^<>]+)</g)].map(m=>m[1]
    .replace(/&amp;/g,"&").replace(/&nbsp;/g," ")
    .replace(/&quot;/g,'"').trim()).filter(s=>s&&/[A-Za-z]/.test(s)))];
}
test("Build 299: Russian covers all settings, popup and dashboard static text fragments",()=>{
  const expected={"options.html":201,"popup.html":62,"site-dashboard.html":85};
  for(const [name,min] of Object.entries(expected)){
    const original=displayedEnglish(src(name));
    const untranslated=original.filter(s=>!exempt.has(s)&&UI.translate(s,"ru")===s);
    assert.deepEqual(untranslated,[],name+" still contains English-only interface labels");
    assert.ok(original.length>=min,name+" unexpectedly lost UI copy");
  }
});
test("Build 299: language affects text, not protection, filters, or the selected domains",()=>{
  assert.deepEqual(Array.from(UI.SUPPORTED),["en","ru"]);
  assert.equal(UI.translate("Experimental","ru"),"Экспериментальные функции");
  assert.equal(UI.translate("Development build","ru"),"Тестовая версия");
  assert.equal(UI.translate("Protection settings","en"),"Protection settings");
  assert.equal(UI.translate("listed-hostname.example.net","ru"),"listed-hostname.example.net");
  assert.match(src("site-dashboard.html"),/<script src="ui-language\.js"><\/script>/);
  const engine=src("ui-language.js");
  assert.match(engine,/if\(select\)select\.value=current/);
  assert.match(engine,/if\(select\)select\.addEventListener/);
  assert.doesNotMatch(engine,/const EXCLUDED=new Set\([^)]*"OPTION"/);
});
test("Build 299: brown warning is replaced without altering approved settings geometry",()=>{
  const css=src("style.css");
  assert.match(css,/\.options \.warning\{border-left:4px solid #00e8eb;padding:12px;background:#102830;color:#edf8f9\}/);
  assert.doesNotMatch(css,/background:#51452e/);
  assert.equal((src("options.html").match(/class="settings-group tone-/g)||[]).length,8);
});
