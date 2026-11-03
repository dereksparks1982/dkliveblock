"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path");
const EXTRA=require("../src/ui-language-tools.js"),UI=require("../src/ui-language.js");
const src=n=>fs.readFileSync(path.join(__dirname,"..","src",n),"utf8");
function textFragments(html){const b=html.slice(html.indexOf("<body")+5).replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,"").replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi,"");return [...new Set([...b.matchAll(/>([^<>]+)</g)].map(m=>m[1].replace(/&amp;/g,"&").replace(/&nbsp;/g," ").replace(/&quot;/g,'"').trim()).filter(s=>s&&/[A-Za-z]/.test(s)))];}
test("Build 301: Network Monitor and YouTube lab static Russian text is covered",()=>{
 for(const [page,min] of [["network-monitor",68],["youtube-lab",45]]){const html=src(page+".html");assert.ok(textFragments(html).length>=min);assert.deepEqual(textFragments(html).filter(s=>s!=="DK LIVE BLOCK"&&s!=="HTTP"&&s!=="YouTube Shorts"&&UI.translate(s,"ru")===s),[],page+" untranslated");assert.ok(html.includes('<script src="ui-language-tools.js"></script><script src="ui-language.js"></script>'));}});
test("Build 301: source-file and source-data boundaries remain unchanged",()=>{
 assert.equal(UI.translate("example.net","ru"),"example.net");
 assert.equal(UI.translate("An ad visibly played","en"),"An ad visibly played");
 assert.equal(UI.translate("An ad visibly played","ru"),"Реклама заметно воспроизводилась");
 assert.equal(EXTRA["Start capture"],"Начать запись");
 assert.equal(EXTRA["Refused / black screen"],"Отказ / чёрный экран");
 const m=require("../src/manifest.json");for(const row of m.content_scripts)assert.ok(!row.js.includes("ui-language-tools.js"));for(const js of m.background.scripts)assert.notEqual(js,"ui-language-tools.js");});
