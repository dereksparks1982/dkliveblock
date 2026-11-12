"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict");
require("../src/ghostery-dom.js");
const G=require("../src/ghostery-cosmetics.js");
function vendor(){
 const calls=[];
 return {calls,getCosmeticsFilters(o){
  calls.push(o);
  return o.getRulesFromDOM?
   {active:true,styles:'.dom-ad {display:none!important;}',scripts:["malicious()"]}:
   {active:true,styles:'.base-ad {display:none!important;}',scripts:["malicious()"]};
 }};
}
test("Build 401: upstream MPL engine receives bounded class/id DOM request",()=>{
 const v=vendor(),css=G.styles(v,"news.example",{
  domSignals:{classes:["dom-ad","dom-ad","auth-token"],ids:["promo-slot"]}});
 assert.match(css,/\.base-ad/);assert.match(css,/\.dom-ad/);
 assert.equal(v.calls.length,2);
 assert.equal(v.calls[0].getRulesFromDOM,false);
 assert.equal(v.calls[1].getRulesFromDOM,true);
 assert.deepEqual(v.calls[1].classes,["dom-ad"]);
 assert.deepEqual(v.calls[1].ids,["promo-slot"]);
 assert.deepEqual(v.calls[1].hrefs,[]);
 assert.equal(v.calls[1].getBaseRules,false);
 assert.equal(v.calls[1].getRulesFromHostname,false);
 assert.equal(v.calls[1].getInjectionRules,false);
 assert.doesNotMatch(css,/malicious/);
});
test("Build 401: legacy callers and malformed features never trigger DOM matcher",()=>{
 const v=vendor();
 assert.match(G.styles(v,"news.example"),/base-ad/);
 assert.equal(v.calls.length,1);
 assert.match(G.styles(v,"news.example",{domSignals:{classes:["auth-token"]}}),/base-ad/);
 assert.equal(v.calls.length,2);
});
test("Build 401: user page exceptions and streaming guards prevent all calls",()=>{
 const v=vendor();
 assert.equal(G.styles(v,"news.example",{policy:{document:true},
  domSignals:{classes:["dom-ad"]}}),"");
 assert.equal(G.styles(v,"news.example",{policy:{elemhide:true},
  domSignals:{classes:["dom-ad"]}}),"");
 assert.equal(G.styles(v,"www.youtube.com",{streaming:true,
  domSignals:{classes:["dom-ad"]}}),"");
 assert.equal(v.calls.length,0);
});
test("Build 401: protected selectors and vendor errors preserve base rules",()=>{
 const v=vendor();
 const css=G.styles(v,"news.example",{domSignals:{classes:["dom-ad"]},
  protectSelector:s=>s===".dom-ad"});
 assert.match(css,/base-ad/);assert.doesNotMatch(css,/dom-ad/);
 const broken={getCosmeticsFilters(o){
  if(o.getRulesFromDOM)throw Error("vendor DOM error");
  return {active:true,styles:".base-ad{display:none!important;}"};
 }};
 assert.match(G.styles(broken,"news.example",{domSignals:{ids:["promo-slot"]}}),/base-ad/);
});
test("Build 401: dual manifest entry and browser-supplied sender validation retained",()=>{
 const fs=require("node:fs"),path=require("node:path");
 const root=path.join(__dirname,"..");
 const manifest=require("../src/manifest.json");
 assert.ok(manifest.background.scripts.indexOf("ghostery-dom.js")<
   manifest.background.scripts.indexOf("ghostery-cosmetics.js"));
 const all=manifest.content_scripts.find(x=>x.js.includes("content.js"));
 assert.ok(all.js.indexOf("ghostery-dom.js")<all.js.indexOf("content.js"));
 const bg=fs.readFileSync(path.join(root,"src/background.js"),"utf8");
 const content=fs.readFileSync(path.join(root,"src/content.js"),"utf8");
 assert.match(bg,/fromContent&&sender\.frameId===0/);
 assert.match(bg,/host\(sender\.tab\?\.url\|\|""\)===h\?msg\.domSignals:null/);
 assert.match(content,/ghosteryDOM\?\.observe\(inspected\)/);
 assert.match(content,/!isFacebookHost/);
 assert.match(content,/!DKVideoAssist\.isStreamingHost\(host\)/);
 assert.equal(manifest.version,require("../package.json").version);
});
