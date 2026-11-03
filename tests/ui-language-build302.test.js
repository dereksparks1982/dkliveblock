"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path");
require("../src/ui-language-tools.js");const UI=require("../src/ui-language.js");
const src=n=>fs.readFileSync(path.join(__dirname,"..","src",n),"utf8");
const extract=h=>{const b=h.slice(h.indexOf("<body")+5).replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,"").replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi,"");return [...new Set([...b.matchAll(/>([^<>]+)</g)].map(m=>m[1].replace(/&amp;/g,"&").replace(/&nbsp;/g," ").replace(/&quot;/g,'"').trim()).filter(s=>s&&/[A-Za-z]/.test(s)))];};
test("Build 302: Meta, Cookie, cosmetic, and DevTools static Russian coverage",()=>{
 const min={"cookie-agents":19,"cosmetic-debug":10,"meta-intelligence":24,"devtools-panel":13};
 for(const [p,n] of Object.entries(min)){const h=src(p+".html");assert.ok(extract(h).length>=n);assert.deepEqual(extract(h).filter(s=>s!=="DK LIVE BLOCK"&&UI.translate(s,"ru")===s),[],p+" untranslated");assert.ok(h.includes('<script src="ui-language-tools.js"></script><script src="ui-language.js"></script>'));}});
test("Build 302: Meta experiment copy describes the saved switch accurately",()=>{
 const h=src("meta-intelligence.html");assert.ok(h.includes("The saved experimental switch controls this filter; full Firefox acceptance is pending."));
 assert.ok(!h.includes("Off by default pending Firefox acceptance."));assert.equal(UI.translate("Cookie","ru"),"Файл cookie");});
test("Build 302: no filtering or browser site data tied to translation",()=>{
 const m=require("../src/manifest.json");for(const row of m.content_scripts)assert.ok(!row.js.includes("ui-language-tools.js"));for(const s of m.background.scripts)assert.notEqual(s,"ui-language-tools.js");
 assert.equal(UI.translate("www.facebook.com","ru"),"www.facebook.com");assert.equal(UI.translate("www.facebook.com","en"),"www.facebook.com");assert.equal(m.version,require("../package.json").version);
});