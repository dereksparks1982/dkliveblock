"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path");
const EXTRA=require("../src/ui-language-tools.js"),UI=require("../src/ui-language.js");
const src=n=>fs.readFileSync(path.join(__dirname,"..","src",n),"utf8");
const examples=[
 ["report.js","Draft prepared locally. Nothing has been sent."],
 ["report.js","Report copied locally. You choose where to send it."],
 ["downloads.js","Checking optional native companion…"],
 ["library.js","Resume"],["library.js","★ Unfavorite"],
 ["blocked.js","Warning unavailable"],["blocked.js","Saving the exact-host exception…"],
 ["network-monitor.js","Exception revoked. Future matching requests follow normal blocking rules."],
 ["youtube-lab-ui.js","The video types differ. This can explain changed ads or playback and is not a controlled A/B test."]
];
test("Build 304: fixed dynamic user-visible statuses receive Russian translations",()=>{
 for(const [file,text] of examples){assert.ok(src(file).includes(text),file+" source changed");assert.ok(EXTRA[text],text+" missing");assert.notEqual(UI.translate(text,"ru"),text,text+" untranslated");assert.equal(UI.translate(text,"en"),text);}
});
test("Build 304: a dynamic tool status visibly renders Russian and restores English",()=>{
 const p={tagName:"P",parentElement:null,isContentEditable:false};
 const n={nodeType:3,parentElement:p,nodeValue:"Draft prepared locally. Nothing has been sent."};
 UI.apply(n,"ru");assert.equal(n.nodeValue,"Черновик подготовлен локально. Ничего не отправлено.");
 UI.apply(n,"en");assert.equal(n.nodeValue,"Draft prepared locally. Nothing has been sent.");
});
test("Build 304: user content and external addresses stay unchanged",()=>{
 for(const s of ["www.facebook.com","user@site.test","Saved custom note","https://example.com/private"])assert.equal(UI.translate(s,"ru"),s);
 assert.equal(UI.translate("Revoke","ru"),"Отозвать");
 const manifest=require("../src/manifest.json");assert.equal(manifest.version,require("../package.json").version);
});