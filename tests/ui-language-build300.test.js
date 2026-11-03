"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path");
const EXTRA=require("../src/ui-language-tools.js"),UI=require("../src/ui-language.js");
const src=n=>fs.readFileSync(path.join(__dirname,"..","src",n),"utf8");
const exempt=new Set(["DK LIVE BLOCK","elderredsoftworks@proton.me","~/.local/share/dk-live-block/downloads/","Phishing Army"]);
function texts(html){const b=html.slice(html.indexOf("<body")+5).replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,"").replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi,"");return [...new Set([...b.matchAll(/>([^<>]+)</g)].map(m=>m[1].replace(/&amp;/g,"&").replace(/&nbsp;/g," ").replace(/&quot;/g,'"').trim()).filter(s=>s&&/[A-Za-z]/.test(s)))];}
test("Build 300: static Russian coverage on four utility and security pages",()=>{
 const mins={library:23,downloads:9,report:26,blocked:20};
 for(const [page,min] of Object.entries(mins)){const html=src(page+".html");assert.ok(texts(html).length>=min,page+" lost copy");assert.deepEqual(texts(html).filter(s=>!exempt.has(s)&&UI.translate(s,"ru")===s),[],page+" untranslated");assert.ok(html.includes('<script src="ui-language-tools.js"></script><script src="ui-language.js"></script>'));}});
test("Build 300: phishing warning keeps explicit acknowledgment and exact-host decisions",()=>{
 const html=src("blocked.html");for(const id of ["proceed","acknowledge","blockedHost","override","leave"])assert.ok(html.includes('id="'+id+'"'));
 assert.equal(EXTRA["Continue despite the warning"],"Продолжить, несмотря на предупреждение");
 assert.match(UI.translate("I understand the risk and want to allow this exact hostname.","ru"),/понимаю риск/);
 assert.ok(html.includes('src="blocked.js"'));
});
test("Build 300: translations do not alter data, protection or browser permissions",()=>{
 assert.equal(UI.translate("example.test","ru"),"example.test");
 assert.equal(UI.translate("Phishing","en"),"Phishing");
 assert.equal(UI.translate("Phishing","ru"),"Фишинг");
 assert.doesNotMatch(src("ui-language-tools.js"),/fetch\(|XMLHttpRequest|browser\.webRequest/);
 const m=require("../src/manifest.json");for(const row of m.content_scripts)assert.ok(!row.js.includes("ui-language-tools.js"));for(const js of m.background.scripts)assert.notEqual(js,"ui-language-tools.js");
 assert.equal(m.version,require("../package.json").version);
});