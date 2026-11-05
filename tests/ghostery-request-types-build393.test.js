"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict");
require("../src/rules.js");require("../src/engine.js");
const Hybrid=require("../src/hybrid-engine.js");
function stub(){const seen=[];const api={FiltersEngine:{parse:()=>({match:r=>{seen.push(r);return {match:r.type==="image"||r.type==="ping"};}})},Request:{fromRawDetails:d=>d}};return {api,seen};}
test("Build 393: Firefox only aliases confirmed Ghostery filter types",()=>{
 for(const [inType,out] of [["imageset","image"],["beacon","ping"],
 ["image","image"],["ping","ping"],["script","script"],["xmlhttprequest","xmlhttprequest"],
 ["sub_frame","sub_frame"],["csp_report","csp_report"],["json","json"]])
  assert.equal(Hybrid.ghosteryType(inType),out);
});
test("Build 393: bundled vendor receives normalized responsive image and beacon requests",()=>{
 const {api,seen}=stub(),e=Hybrid.create("",api);
 assert.equal(e.checkRequest("https://ads.example/picture","imageset","news.example").block,true);
 assert.equal(e.checkRequest("https://track.example/pixel","beacon","news.example").block,true);
 assert.deepEqual(seen.map(x=>x.type),["image","ping"]);
 assert.deepEqual(seen.map(x=>x.sourceUrl),["https://news.example/","https://news.example/"]);
});
test("Build 393: exceptions and explicit user override have final say",()=>{
 const {api}=stub();
 const allowed=Hybrid.create("",api,"@@||track.example^$domain=news.example");
 assert.equal(allowed.checkRequest("https://track.example/pixel","beacon","news.example").block,false);
 const important=Hybrid.create("||track.example^$important,ping",api);
 assert.equal(important.checkRequest("https://track.example/pixel","beacon","news.example").block,true);
});
test("Build 393: popup and document exemptions do not enter the vendor",()=>{
 const {api,seen}=stub(),e=Hybrid.create("",api);
 assert.equal(e.checkRequest("https://track.example/","popup","news.example").block,false);
 assert.equal(e.checkRequest("https://track.example/","beacon","news.example",{document:true}).block,false);
 assert.equal(seen.length,0);
});
test("Build 393: network methods and unsupported request types remain unchanged",()=>{
 const {api,seen}=stub(),e=Hybrid.create("",api);
 assert.equal(e.checkRequest("https://ads.example/test","csp_report","news.example",{},"POST").block,false);
 assert.equal(seen[0].method,"POST");assert.equal(seen[0].type,"csp_report");
});
