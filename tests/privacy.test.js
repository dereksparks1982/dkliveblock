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
