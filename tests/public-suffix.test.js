"use strict";
const test=require("node:test"),assert=require("node:assert/strict");
const PSL=require("../src/public-suffix.js");
const R=require("../src/rules.js");
const {FilterEngine}=require("../src/engine.js");
test("complete PSL includes ICANN private wildcard exception and IDN rules",()=>{
 assert.ok(PSL.ruleCounts.normal>=10000);
 assert.ok(PSL.ruleCounts.wildcard>=300);
 assert.ok(PSL.ruleCounts.exception>=8);
});
test("real registrable domains across multi-label public suffixes",()=>{
 const examples=[
  ["www.example.com","example.com"],
  ["a.b.example.co.uk","example.co.uk"],
  ["cdn.news.com.au","news.com.au"],
  ["sub.mail.example.co.jp","example.co.jp"],
  ["www.gov.uk","www.gov.uk"],
  ["example.co.uk","example.co.uk"],
  ["co.uk","co.uk"],
  ["localhost","localhost"],
  ["127.0.0.1","127.0.0.1"],
  ["s1.s2.alice.github.io","alice.github.io"],
  ["user1.blogspot.com","user1.blogspot.com"],
  ["files.company.pages.dev","company.pages.dev"],
  ["docs.company.vercel.app","company.vercel.app"],
  ["img.foo.s3.amazonaws.com","foo.s3.amazonaws.com"],
  ["test.unknownbrandnewtld","test.unknownbrandnewtld"]
 ];
 for(const [input,expected] of examples){
  assert.equal(PSL.registrable(input),expected,input);
  assert.equal(R.site(input),expected,input);
 }
});
test("wildcard rules and exceptions use longest-match precedence",()=>{
 for(const [host,expected] of [
  ["a.ck","a.ck"],
  ["foo.a.ck","foo.a.ck"],
  ["www.ck","www.ck"],
  ["sub.www.ck","www.ck"],
  ["foo.kawasaki.jp","foo.kawasaki.jp"],
  ["city.kawasaki.jp","city.kawasaki.jp"],
  ["www.city.kawasaki.jp","city.kawasaki.jp"],
  ["foo.www.ck","www.ck"]
 ])assert.equal(PSL.registrable(host),expected,host);
});
test("internationalized suffix and punycode names normalize as same site",()=>{
 assert.equal(PSL.registrable("www.食狮.中国"),"xn--85x722f.xn--fiqs8s");
 assert.equal(PSL.registrable("www.xn--85x722f.xn--fiqs8s"),"xn--85x722f.xn--fiqs8s");
 assert.equal(PSL.registrable("www.пример.рф"),"xn--e1afmkfd.xn--p1ai");
});
test("third-party filtering respects private-registrant isolation",()=>{
 const f=new FilterEngine("||alice.github.io^$third-party");
 assert.equal(f.shouldBlock("https://alice.github.io/ads.js","script","bob.github.io"),true);
 assert.equal(f.shouldBlock("https://alice.github.io/ads.js","script","shop.alice.github.io"),false);
});
test("normalizes case, trailing dots and unusual malformed hosts safely",()=>{
 assert.equal(PSL.registrable("SUB.Example.CO.UK."),"example.co.uk");
 assert.equal(PSL.registrable("foo..example.com"),"foo..example.com");
 assert.equal(PSL.registrable("::1"),"::1");
});

test("cached hostname classification stays bounded during long browsing sessions",()=>{
 for(let i=0;i<6000;i++)PSL.registrable("test"+i+".company.co.uk");
 assert.ok(PSL.cacheSize<=4096);
 assert.equal(PSL.registrable("docs.company.co.uk"),"company.co.uk");
});
