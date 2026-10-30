"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict");
const L=require("../src/language-lists.js");
test("catalog is curated HTTPS, unique and no Acceptable Ads URLs",()=>{
 assert.equal(L.catalog.length,6);
 assert.equal(new Set(L.catalog.map(x=>x.key)).size,6);
 for(const item of L.catalog){
  assert.match(item.key,/^lang_[a-z]{2}$/);
  assert.match(item.url,/^https:\/\/easylist-downloads\.adblockplus\.org\//);
  assert.doesNotMatch(item.url,/exceptionrules|acceptable|premium/i);
 }
});
test("browser language recommendations are local, capped and opt-in",()=>{
 assert.deepEqual(L.recommendations(["tr-TR","ru-RU"]),["lang_tr","lang_ru"]);
 assert.deepEqual(L.recommendations(["ar-SA"]),["lang_ar","lang_fr"]);
 assert.deepEqual(L.recommendations(["en-US","en-GB"]),[]);
 assert.deepEqual(L.recommendations(["zh-CN","zh-Hans"]),["lang_zh"]);
 assert.deepEqual(L.recommendations([null,1,{},true,"zz-ZZ"]),[]);
});
