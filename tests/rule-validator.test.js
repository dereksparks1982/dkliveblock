"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict");
require("../src/rules.js");
const V=require("../src/rule-validator.js");
test("validate supported network, cosmetic and procedural filters without changing them",()=>{
 const input=["! My local filters","||ads.example^","news.example##.ad-slot",
  "news.example#@#.ad-slot","news.example#?#div:has-text(Sponsored)"].join("\n");
 const result=V.validate(input);
 assert.equal(result.ok,true);
 assert.equal(result.counts.network,1);
 assert.equal(result.counts.cosmetic,2);
 assert.equal(result.counts.procedural,1);
 assert.equal(result.counts.comments,1);
 assert.equal(result.counts.unsupported,0);
 assert.equal(input.includes("||ads.example^"),true);
});
test("flags duplicates, scriptlets and malformed filters without quoting user rules",()=>{
 const text=["||ads.example^","||ads.example^","news.example##.ad",
  "news.example##.ad","news.example#%#some-scriptlet","||ads.example^$unsupported-option"].join("\n");
 const result=V.validate(text);
 assert.equal(result.counts.duplicates,2);
 assert.equal(result.counts.unsupported,2);
 assert.deepEqual(result.examples.map(x=>x.line),[2,4,5,6]);
 assert.doesNotMatch(JSON.stringify(result.examples),/scriptlet|ads\.example|\.ad/);
});
test("bounds input, line count and diagnostics output",()=>{
 assert.match(V.validate("x".repeat(V.MAX_INPUT+1)).error,/1 MB/);
 assert.match(V.validate("\n".repeat(V.MAX_LINES)).error,/20,000/);
 const result=V.validate(Array.from({length:70},()=>"invalid words").join("\n"));
 assert.ok(result.examples.length<=V.MAX_EXAMPLES);
});

test("Build 90 validator categorizes uBO literal has-text and rejects generic use",()=>{
 const v=V.validate(["news.example##div:has-text(Sponsored)",
  "news.example#@#div:has-text(Sponsored)","news.example##.advert",
  "##div:has-text(Sponsored)"].join("\n"));
 assert.equal(v.counts.procedural,2);
 assert.equal(v.counts.cosmetic,1);
 assert.equal(v.counts.unsupported,1);
});

test("Build 98 validator reports unsupported advanced cosmetics accurately",()=>{
 const r=V.validate(["news.example##div:matches-css(color:red)",
  "news.example##div:upward(2)","news.example##.normal"].join("\n"));
 assert.equal(r.counts.unsupported,2);
 assert.equal(r.counts.cosmetic,1);
});

test("Build 100 multi-site exclusions classify as supported, negative-only does not",()=>{
 const r=V.validate("news.example,~pay.news.example##article:has-text(Sponsored)"+
  "\n~pay.news.example##article:has-text(Sponsored)");
 assert.equal(r.counts.procedural,1);
 assert.equal(r.counts.unsupported,1);
});

test("Build 101 quoted text accepted; regex-like text flagged unsupported",()=>{
 const r=V.validate('news.example##div:has-text("Sponsored")'+
  "\nnews.example##div:has-text(/Sponsored/)");
 assert.equal(r.counts.procedural,1);
 assert.equal(r.counts.unsupported,1);
});

test("Build 102 site-scoped contains aliases classify as procedural not CSS",()=>{
 const r=V.validate("news.example##article:contains(Advert)"+
  "\n##article:contains(Advert)");
 assert.equal(r.counts.procedural,1);
 assert.equal(r.counts.unsupported,1);
});

test("Build 119 malformed quoted and regex-like cosmetics are reported unsupported",()=>{
 const result=V.validate(["news.example##article:has-text('/Sponsored/i')",
  'news.example##article:has-text("Sponsored)',
  'news.example##article:has-text("Sponsored")'].join("\n"));
 assert.equal(result.counts.procedural,1);
 assert.equal(result.counts.unsupported,2);
});

test("Build 137 class/ID procedural selectors are counted accurately",()=>{
 const v=V.validate("news.example##.card:has-text(Sponsored)"+
  "\nnews.example#?##promo:has(.paid)");
 assert.equal(v.counts.procedural,2);
 assert.equal(v.counts.unsupported,0);
});
