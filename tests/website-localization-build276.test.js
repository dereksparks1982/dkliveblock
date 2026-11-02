"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path");
const site=fs.readFileSync(path.join(__dirname,"../index.html"),"utf8");
const l=require("../assets/site-localization.js");
test("Website has one source of truth and preserves 12 clickable cards",()=>{
 assert.equal(fs.existsSync(path.join(__dirname,"../docs/index.html")),false);
 assert.equal((site.match(/class="feature-card-link"/g)||[]).length,12);
 assert.equal((site.match(/<dialog class="lesson-dialog/g)||[]).length,12);
 assert.match(site,/dialog\.showModal\(\)/);
 assert.match(site,/document\.querySelectorAll\("\.feature-card-link\[data-lesson\]"\)/);
 assert.doesNotMatch(site,/DKSiteLocalization\.reflow\s*=/);
 assert.match(site,/document\.addEventListener\("dk-site-language-changed",queueCardHeights\)/);
});
test("Language selection prefers Russian browser locale, retains user override and reverts",()=>{
 assert.equal(l.preferred(["en-US","ru-RU"]),"ru");
 assert.equal(l.preferred(["ru"]),"ru");
 assert.equal(l.preferred(["en-US"]),"en");
 assert.equal(l.language("ru"),"ru");
 assert.equal(l.language("fr"),"en");
 assert.equal(l.localized("Take back your browser.","ru"),"Ваш браузер. Ваши правила.");
 assert.equal(l.localized("Take back your browser.","en"),"Take back your browser.");
 assert.match(site,/localStorage\.getItem\("dkWebsiteLanguage"\)/);
 assert.match(site,/<select id="dkWebsiteLanguage"/);
 assert.match(site,/assets\/site-localization\.js/);
 assert.match(site,/id="dkSiteBanner"/);
});
test("Approved Russian banner and four button color order stay in the site",()=>{
 assert.match(l.ICON_RU,/%D0%94%D0%9A/);
 assert.match(site,/html\[data-site-language="ru"\] \.links \.button:nth-child\(1\)\{background:#101116/);
 assert.match(site,/html\[data-site-language="ru"\] \.links \.button:nth-child\(2\)\{background:#d1a143/);
 assert.match(site,/html\[data-site-language="ru"\] \.links \.button:nth-child\(3\)\{background:#e4e5e7/);
 assert.match(site,/html\[data-site-language="ru"\] \.links \.button:nth-child\(4\)\{background:#ba202b/);
 assert.match(site,/\.links \.button\{white-space:normal;min-width:0;overflow-wrap:break-word/);
 assert.equal((site.match(/class="button (?:ink|cyan|white)/g)||[]).length,4);
});
test("Feature cards show the original hover brightness at rest; hover highlights their borders",()=>{
 assert.match(site,/\.feature-grid \.feature-card\{background:#14404b\}/);
 assert.match(site,/\.feature-card:hover,\.feature-card:focus-within\{border-color:var\(--a\);background:#14404b\}/);
 assert.match(site,/html\[data-site-language="ru"\] \.feature-grid \.feature-card\{background:#60262a/);
 assert.match(site,/html\[data-site-language="ru"\] \.feature-card:hover,html\[data-site-language="ru"\] \.feature-card:focus-within\{background:#60262a/);
});
test("Both feature-only READMEs have no build log or identity story",()=>{
 const en=fs.readFileSync(path.join(__dirname,"../README.md"),"utf8");
 const ru=fs.readFileSync(path.join(__dirname,"../README.ru.md"),"utf8");
 assert.match(en,/\[Русский\]\(README\.ru\.md\)/);
 assert.match(ru,/\[English\]\(README\.md\)/);
 assert.match(ru,/## Возможности/);
 assert.match(en,/## What it does/);
 for(const t of [en,ru]){
  assert.doesNotMatch(t,/Build 27[0-9]|House of Culture|## Development and testing/);
  assert.ok(t.length<7500);
  assert.match(t,/elderredsoftworks@proton\.me/);
 }
});
