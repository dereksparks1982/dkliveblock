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
 assert.equal(l.ICON_RU,"https://raw.githubusercontent.com/dereksparks1982/dkliveblock/2552853711159fdea179aad26efd1391f42c7f92/assets/images/Metallic%20Cyrillic%20Emblem%20and%20Gold%20Live%20Block%20Title.png");
 assert.equal(l.ICON_RU_LOCAL,"assets/images/Metallic%20Cyrillic%20Emblem%20and%20Gold%20Live%20Block%20Title.png");
 assert.ok(l.ICON_RU.startsWith("https://raw.githubusercontent.com/dereksparks1982/dkliveblock/"));
 assert.notEqual(l.ICON_RU,l.ICON_RU_LOCAL);
 assert.equal(l.ICON_EN,"assets/images/DK%20Live%20Block%20Neon%20Banner.png");
 const imagePath=path.join(__dirname,"../",decodeURIComponent(l.ICON_RU_LOCAL));
 const image=fs.readFileSync(imagePath);
 const blob=Buffer.concat([Buffer.from("blob "+image.length),Buffer.from([0]),image]);
 const hash=require("node:crypto").createHash("sha1").update(blob).digest("hex");
 assert.equal(hash,"1ee6d3265a5f29c5d9656f74a0b427120887ffd3","Russian banner must match owner-approved uploaded artwork");
 assert.equal(fs.existsSync(path.join(__dirname,"../",decodeURIComponent("assets/images/%D0%94%D0%9A%20%D0%9B%D0%B0%D0%B9%D0%B2%20%D0%91%D0%BB%D0%BE%D0%BA_%20%D0%92%D0%B0%D1%88%D0%B8%20%D0%BF%D1%80%D0%B0%D0%B2%D0%B8%D0%BB%D0%B0.png"))),false);
 const russianReadme=fs.readFileSync(path.join(__dirname,"../README.ru.md"),"utf8");
 assert.ok(russianReadme.includes(l.ICON_RU_LOCAL));
 assert.match(fs.readFileSync(path.join(__dirname,"../assets/site-localization.js"),"utf8"),/banner\.onerror=\(\)=>/);
 assert.equal(russianReadme.includes("assets/images/%D0%94%D0%9A%20%D0%9B%D0%B0%D0%B9%D0%B2%20%D0%91%D0%BB%D0%BE%D0%BA_%20%D0%92%D0%B0%D1%88%D0%B8%20%D0%BF%D1%80%D0%B0%D0%B2%D0%B8%D0%BB%D0%B0.png"),false);
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
 assert.match(site,/html\[data-site-language="ru"\] \.feature-grid \.feature-card\{background:#181c25/);
 assert.match(site,/html\[data-site-language="ru"\] \.feature-card:hover,html\[data-site-language="ru"\] \.feature-card:focus-within\{background:#181c25/);
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

test("Russian website introduction is natural and preserves exact Latin company name",()=>{
 const english="Free Firefox ad blocking, tracker protection, popup prevention, and control over unwanted page clutter. From Elderred Softworks LLC.";
 const russian="Бесплатное расширение для Firefox, которое блокирует рекламу и отслеживание, защищает от всплывающих окон и скрывает нежелательные элементы страниц. Разработано Elderred Softworks.";
 assert.equal(l.localized(english,"ru"),russian);
 assert.equal(l.localized(english,"en"),english);
 assert.equal(l.localized(english,"ru").includes("Elderred Softworks"),true);
 assert.doesNotMatch(l.localized(english,"ru"),/Элдерред|Софтворкс|Файрфокс|слежки/);
 assert.match(site,/<p class="lead">Free Firefox ad blocking, tracker protection/);
 const ru=fs.readFileSync(path.join(__dirname,"../README.ru.md"),"utf8");
 assert.match(ru,/Разработчик: Elderred Softworks\./);
 assert.doesNotMatch(ru,/Элдерред|Софтворкс/);
 const translationSource=fs.readFileSync(path.join(__dirname,"../assets/site-localization.js"),"utf8");
 assert.doesNotMatch(translationSource,/Элдерред|Софтворкс/);
});

test("README website links explicitly select their own language",()=>{
 const en=fs.readFileSync(path.join(__dirname,"../README.md"),"utf8");
 const ru=fs.readFileSync(path.join(__dirname,"../README.ru.md"),"utf8");
 assert.ok(ru.includes("https://dereksparks1982.github.io/dkliveblock/?lang=ru"));
 assert.ok(en.includes("https://dereksparks1982.github.io/dkliveblock/?lang=en"));
 assert.equal(l.requested("?lang=ru"),"ru");
 assert.equal(l.requested("?lang=en"),"en");
 assert.equal(l.requested("?lang=fr"),null);
 assert.equal(l.requested("?lang=RU"),null);
 assert.equal(l.requested(""),null);
 assert.ok(site.includes('new URLSearchParams(location.search).get("lang")'));
 const source=fs.readFileSync(path.join(__dirname,"../assets/site-localization.js"),"utf8");
 assert.ok(source.includes("const linkLanguage=requested(root.location?.search)"));
 assert.ok(source.includes('url.searchParams.set("lang",choice)'));
 assert.ok(source.includes("root.history?.replaceState"));
});
