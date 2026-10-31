"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict");
require("../src/rules.js");
const {FilterEngine}=require("../src/engine.js");
const DKPrivacy=require("../src/privacy.js");

test("Build 61 guards signed URLs before the separate ABP removeparam path",()=>{
 const engine=new FilterEngine("*$removeparam=utm_source");
 const normal="https://files.example/download?utm_source=news&asset=42";
 const signed="https://files.example/download?X-Amz-Signature=HMAC&utm_source=news&asset=42";
 assert.equal(engine.cleanNavigation(normal),"https://files.example/download?asset=42");
 // Demonstrate why the background must check this before entering the engine.
 assert.equal(engine.cleanNavigation(signed),"https://files.example/download?X-Amz-Signature=HMAC&asset=42");
 assert.equal(DKPrivacy.preserveNavigation(signed),true);
 assert.equal(DKPrivacy.stripTrackingParameters(signed),null);
});
test("Build 61 ordinary unsiged marketing URLs remain cleanable",()=>{
 const engine=new FilterEngine("*$removeparam=clickid");
 const url="https://shop.example/product?clickid=123&sku=4";
 assert.equal(DKPrivacy.preserveNavigation(url),false);
 assert.equal(engine.cleanNavigation(url),"https://shop.example/product?sku=4");
 assert.equal(DKPrivacy.stripTrackingParameters("https://shop.example/product?utm_source=mail&sku=4"),
  "https://shop.example/product?sku=4");
});
test("Build 61 refuses to rewrite protected media tokens or OAuth flows",()=>{
 for(const query of ["token=SECRET&utm_medium=mail",
  "expires=12345&fbclid=abc",
  "code=ONE&state=TWO&utm_campaign=news",
  "x-amz-date=20261030T000000Z&fbclid=abc"]){
  assert.equal(DKPrivacy.preserveNavigation("https://example.test/?"+query),true);
 }
});
