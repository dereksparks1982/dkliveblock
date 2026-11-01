"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict");
const S=require("../src/safe-scriptlet-rules.js");
test("Build 203 explicitly user-authored site rules work only for matching hosts",()=>{
 const rule="news.example##+js(set-constant, adblockDetected, false)";
 assert.deepEqual(S.select(rule,"news.example"),[
  {name:"set-constant",path:"adblockDetected",value:"false"}]);
 assert.equal(S.select(rule,"sub.news.example").length,1);
 assert.equal(S.select(rule,"news.example.evil.test").length,0);
 assert.equal(S.select(rule,"another.test").length,0);
});
test("Build 203 manual exceptions can disable one or all vetted scriptlets",()=>{
 const rule="news.example##+js(set-constant, adblockDetected, false)";
 assert.equal(S.select(rule+"\nnews.example#@#+js(set-constant, adblockDetected, false)",
  "news.example").length,0);
 assert.equal(S.select(rule+"\nnews.example#@#+js()","news.example").length,0);
 assert.equal(S.select(rule+"\nother.example#@#+js()","news.example").length,1);
});
test("Build 203 rejects all arbitrary expressions and sensitive page globals",()=>{
 for(const path of ["document.cookie","location.href","__proto__.a",
  "app.constructor.a","fetch","window.localStorage","a.b.c.d"])
  assert.equal(S.select("news.example##+js(set-constant, "+path+", false)",
   "news.example").length,0,path);
 for(const invalid of [
  "news.example##+js(set-constant, adsEnabled, alert(1))",
  "news.example##+js(prevent-fetch, adsEnabled, false)",
  "##+js(set-constant, adsEnabled, false)",
  "news.example##+js(set-constant, x, false);fetch('bad')"])
  assert.equal(S.select(invalid,"news.example").length,0,invalid);
});
test("Build 203 rejects oversized manual rule collections and bounds results",()=>{
 const line="news.example##+js(set-constant, enabled, false)";
 assert.equal(S.select(line.repeat(10000),"news.example").length,0);
 assert.equal(S.select((line+"\n").repeat(100),"news.example").length,1);
});

test("Build 204 exceptions release capacity for later eligible manual shims",()=>{
 const earlier=Array.from({length:24},(_,i)=>
  "news.example##+js(set-constant, blocked"+i+", false)").join("\n");
 const except=Array.from({length:24},(_,i)=>
  "news.example#@#+js(set-constant, blocked"+i+", false)").join("\n");
 const later=Array.from({length:5},(_,i)=>
  "news.example##+js(set-constant, live"+i+", true)").join("\n");
 const active=S.select([earlier,except,later].join("\n"),"news.example");
 assert.deepEqual(active.map(r=>r.path),["live0","live1","live2","live3","live4"]);
 assert.equal(S.select([earlier,later].join("\n"),"news.example").length,24);
});
test("Build 204 one property path receives only one compatible shim",()=>{
 const rules=["news.example##+js(set-constant, same, true)",
  "news.example##+js(set-constant, same, false)",
  "news.example##+js(set-constant, other, false)"].join("\n");
 const selected=S.select(rules,"news.example");
 assert.deepEqual(selected.map(r=>r.path),["same","other"]);
 assert.equal(selected[0].value,"true");
});
