"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path"),crypto=require("node:crypto");
const root=path.join(__dirname,".."),read=p=>fs.readFileSync(path.join(root,p),"utf8");
const L=require("../assets/site-localization.js"),site=read("index.html"),ru=read("README.ru.md");
test("Build 396: Russian README uses only the approved Cyrillic banner",()=>{
 assert.ok(ru.includes(L.ICON_RU_LOCAL));assert.equal(ru.includes(L.ICON_EN),false);
 const b=fs.readFileSync(path.join(root,decodeURIComponent(L.ICON_RU_LOCAL)));
 const blob=Buffer.concat([Buffer.from("blob "+b.length),Buffer.from([0]),b]);
 assert.equal(crypto.createHash("sha1").update(blob).digest("hex"),"1ee6d3265a5f29c5d9656f74a0b427120887ffd3");
 assert.ok(read("README.md").includes(L.ICON_EN));
});
test("Build 396: local Russian banner is primary and immutable history is a recovery source",()=>{
 const src=read("assets/site-localization.js");
 assert.ok(src.includes('const primary=wanted==="ru"?ICON_RU_LOCAL:ICON_EN'));
 assert.ok(src.includes('const fallback=wanted==="ru"?ICON_RU:'));
 assert.ok(site.includes('banner.src="assets/images/Metallic%20Cyrillic%20Emblem%20and%20Gold%20Live%20Block%20Title.png"'));
});
test("Build 396: Russian README has no visible English text outside technical literals",()=>{
 assert.ok(ru.includes("[Английский](README.md)"));
 assert.ok(ru.includes("## ДК Софтворкс · Дом культуры"));
 const visible=ru.replace(/!\[([^\]]*)\]\([^)]+\)/g,"$1")
  .replace(/\[([^\]]+)\]\([^)]+\)/g,"$1").replace(/`[^`]+`/g,"")
  .replace(/elderredsoftworks@proton\.me/g,"");
 assert.doesNotMatch(visible,/[A-Za-z]/);
});
test("Build 396: translated content is Russian and unchanged English source is reversible",()=>{
 const english="Free Firefox ad blocking, tracker protection, popup prevention, and control over unwanted page clutter. From Elderred Softworks LLC.";
 const translated=L.localized(english,"ru");
 assert.match(translated,/Файрфокс/);assert.match(translated,/Элдерред Софтворкс/);
 assert.doesNotMatch(translated,/[A-Za-z]/);assert.equal(L.localized(english,"en"),english);
});
test("Build 396: all public site text nodes are localized, excluding explicit UI language switch and machine IDs",()=>{
 const content=site.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,"")
  .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi,"")
  .replace(/<!--[\s\S]*?-->/g,"").replace(/<svg\b[^>]*>[\s\S]*?<\/svg>/gi,"");
 const ui=new Set(["🌐 Language / Язык","English","DK Live Block | Free Firefox Ad Blocker"]);
 const tech=new Set(["about:debugging","src/manifest.json","elderredsoftworks@proton.me"]);
 for(const raw of content.split(/<[^>]*>/)){
  const original=raw.replace(/&middot;/g,"·").replace(/&amp;/g,"&").trim();
  if(!original||!/[A-Za-z]/.test(original)||ui.has(original))continue;
  const translated=L.localized(original,"ru");
  if(tech.has(translated))continue;
  assert.notEqual(translated,original,"Missing locale for: "+original.slice(0,80));
  assert.doesNotMatch(translated,/[A-Za-z]/,"Untranslated English in: "+original.slice(0,80));
 }
});
test("Build 396: language switch restores English and Russian controls without touching page links",()=>{
 const prev=global.NodeFilter;global.NodeFilter={SHOW_TEXT:4};
 try{
  const bodyNode={nodeValue:"Take back your browser.",parentElement:{closest:()=>false}};
  const en={textContent:"English"},label={textContent:"🌐 Language / Язык"};
  const select={value:"en",querySelector:()=>en,setAttribute(name,value){this[name]=value}};
  const banner={dataset:{},src:"",alt:"",onerror:null};
  const rootElement={dataset:{},lang:"en"},body={};
  const doc={documentElement:rootElement,body,title:"",
   createTreeWalker(){let n=0;return {nextNode:()=>n++?null:bodyNode}},
   querySelector:()=>null,querySelectorAll:()=>[],
   getElementById:id=>id==="dkSiteBanner"?banner:id==="dkWebsiteLanguage"?select:
    id==="siteLanguageBar"?{querySelector:()=>label}:null};
  assert.equal(L.render(doc,"ru"),"ru");
  assert.equal(banner.src,L.ICON_RU_LOCAL);assert.equal(en.textContent,"Английский");
  assert.equal(label.textContent,"🌐 Язык");assert.equal(bodyNode.nodeValue,"Ваш браузер. Ваши правила.");
  assert.equal(L.render(doc,"en"),"en");
  assert.equal(banner.src,L.ICON_EN);assert.equal(en.textContent,"English");
  assert.equal(label.textContent,"🌐 Language / Язык");
  assert.equal(bodyNode.nodeValue,"Take back your browser.");
 }finally{if(prev===undefined)delete global.NodeFilter;else global.NodeFilter=prev;}
});
