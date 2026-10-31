"use strict";
const test=require("node:test"),assert=require("node:assert/strict");
const {stripTrackingParameters}=require("../src/privacy.js");
test("remove marketing identifiers but preserve useful parameters and fragments",()=>{
 assert.equal(stripTrackingParameters("https://news.example/article?utm_source=mail&view=full&fbclid=abc#section"),"https://news.example/article?view=full#section");
});
test("leave normal links and signed resource URLs alone",()=>{
 assert.equal(stripTrackingParameters("https://cdn.example/video?token=SECRET&expires=200"),null);
 assert.equal(stripTrackingParameters("https://site.example/search?q=ads&session=test"),null);
});
test("remove duplicate and mixed-case marketing keys",()=>{
 assert.equal(stripTrackingParameters("https://shop.example/?UTM_SOURCE=a&utm_source=b&product=shirt"),"https://shop.example/?product=shirt");
});
test("ignore nonweb and invalid URLs",()=>{
 assert.equal(stripTrackingParameters("file:///tmp/log?utm_source=hi"),null);
 assert.equal(stripTrackingParameters("javascript:alert(1)"),null);
 assert.equal(stripTrackingParameters(""),null);
});

test("Build 58 leaves signed and authentication query strings intact",()=>{
 for(const url of ["https://cdn.test/?X-Amz-Signature=abc&utm_source=x",
  "https://login.test/callback?code=abc&state=xyz&fbclid=1",
  "https://sso.test/?SAMLResponse=xyz&RelayState=one&utm_campaign=ad",
  "https://files.test/?sig=abc&utm_medium=ad"])
  assert.equal(stripTrackingParameters(url),null,url);
 assert.equal(stripTrackingParameters("https://news.test/?utm_source=x&article=3"),
  "https://news.test/?article=3");
});

test("Build 61 protects signed navigation before any filter-rule query rewrite",()=>{
 const {preserveNavigation}=require("../src/privacy.js");
 for(const url of [
  "https://downloads.example/?X-Amz-Signature=HMAC&utm_source=email",
  "https://cdn.example/video?token=opaque&expires=123&utm_campaign=social",
  "https://idp.example/callback?code=secret&state=opaque&fbclid=123",
  "https://asset.example/?X-Goog-Signature=abcd&gclid=123",
  "https://user:pass@example.test/?utm_source=email"
 ])assert.equal(preserveNavigation(url),true,url);
 assert.equal(preserveNavigation("https://news.example/?utm_source=mail"),false);
 assert.equal(preserveNavigation("file:///tmp/test"),true);
 assert.equal(preserveNavigation("not a URL"),true);
});

test("Build 131 privacy and network tracking layers both preserve UTM-adjacent signed links",()=>{
 const {preserveNavigation}=require("../src/privacy.js");
 const {FilterEngine}=require("../src/engine.js");
 const engine=new FilterEngine("*$removeparam=utm_*\n*$removeparam=clickid");
 for(const key of ["utm_signature","UTM_TOKEN","utm_session","utm_nonce",
  "utm_auth","X-Goog-Algorithm","X-Amz-Algorithm"]){
  const url="https://downloads.example/object?utm_source=advert&"+key+"=opaque&clickid=ad";
  assert.equal(preserveNavigation(url),true,key);
  assert.equal(stripTrackingParameters(url),null,key);
  assert.equal(engine.cleanNavigation(url),null,key);
 }
 const normal="https://news.example/story?utm_source=advert&view=full";
 assert.equal(preserveNavigation(normal),false);
 assert.equal(stripTrackingParameters(normal),"https://news.example/story?view=full");
});

test("Build 132 never strips marketing query tags on fragment-based login callbacks",()=>{
 const {preserveNavigation}=require("../src/privacy.js");
 for(const url of [
  "https://login.example/#access_token=opaque&utm_source=ad",
  "https://login.example/callback?utm_source=ad#id_token=opaque",
  "https://login.example/#/callback?state=opaque&step=done",
  "https://account.example/?utm_campaign=mail#code=opaque"
 ]){
  assert.equal(preserveNavigation(url),true,url);
  assert.equal(stripTrackingParameters(url),null,url);
 }
 assert.equal(preserveNavigation("https://news.example/story?utm_source=ad#section"),false);
 assert.equal(stripTrackingParameters("https://news.example/story?utm_source=ad#section"),
  "https://news.example/story#section");
});
