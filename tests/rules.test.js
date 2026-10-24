"use strict";
const test=require("node:test"),assert=require("node:assert/strict");
const R=require("../src/rules.js");
const {FilterEngine}=require("../src/engine.js");
test("anchored hosts and subdomains, never lookalike domains",()=>{
 const f=new FilterEngine("||ads.test^");
 assert.equal(f.shouldBlock("https://ads.test/a","image","page.test"),true);
 assert.equal(f.shouldBlock("https://sub.ads.test/a","image","page.test"),true);
 assert.equal(f.shouldBlock("https://ads.test.evil.org/a","image","page.test"),false);
});
test("exceptions override standard blocks",()=>{
 const f=new FilterEngine("||ads.test^\n@@||ads.test/ok*");
 assert.equal(f.shouldBlock("https://ads.test/ok.js","script","page.test"),false);
 assert.equal(f.shouldBlock("https://ads.test/no.js","script","page.test"),true);
});
test("important blocks override exceptions",()=>{
 const f=new FilterEngine("||ads.test^$important\n@@||ads.test^");
 assert.equal(f.shouldBlock("https://ads.test/a","image","page.test"),true);
});
test("resource-type restrictions",()=>{
 const f=new FilterEngine("||ads.test^$script");
 assert.equal(f.shouldBlock("https://ads.test/a","image","page.test"),false);
 assert.equal(f.shouldBlock("https://ads.test/a","script","page.test"),true);
});
test("domain option and negative exceptions",()=>{
 const f=new FilterEngine("||ads.test^$domain=page.test|~safe.page.test");
 assert.equal(f.shouldBlock("https://ads.test/a","image","page.test"),true);
 assert.equal(f.shouldBlock("https://ads.test/a","image","safe.page.test"),false);
 assert.equal(f.shouldBlock("https://ads.test/a","image","elsewhere.test"),false);
});
test("third-party option",()=>{
 const f=new FilterEngine("||cdn.site.test^$third-party");
 assert.equal(f.shouldBlock("https://cdn.site.test/a","image","shop.site.test"),false);
 assert.equal(f.shouldBlock("https://cdn.site.test/a","image","different.test"),true);
});
test("badfilter disables exact rule",()=>{
 const f=new FilterEngine("||ads.test^\n||ads.test^$badfilter");
 assert.equal(f.shouldBlock("https://ads.test/a","image","page.test"),false);
});
test("page-level document exceptions",()=>{
 const f=new FilterEngine("||ads.test^\n@@||page.test^$document");
 const policy=f.getPagePolicy("https://page.test/");
 assert.equal(policy.document,true);
 assert.equal(f.shouldBlock("https://ads.test/a","image","page.test",policy),false);
});
test("CSS hiding exceptions and page-specific scope",()=>{
 const f=new FilterEngine("##.banner\npage.test#@#.banner\npage.test##.sponsored");
 assert.deepEqual(f.getSelectors("page.test"),[".sponsored"]);
 assert.deepEqual(f.getSelectors("elsewhere.test"),[".banner"]);
});
test("generichide disables global cosmetic rules only",()=>{
 const f=new FilterEngine("##.generic\npage.test##.local");
 assert.deepEqual(f.getSelectors("page.test",{generichide:true}),[".local"]);
});
test("reject unimplemented remote script or redirect rules",()=>{
 assert.equal(R.network("||ads.test^$redirect=noop.js"),null);
 assert.equal(R.cosmetic("page.test##+js(foo)"),null);
});
test("domain suffix approximation and hostname",()=>{
 assert.equal(R.site("cdn.example.co.uk"),"example.co.uk");
 assert.equal(R.host("https://EXAMPLE.test/"),"example.test");
});

test("text-only procedural cosmetics and exceptions",()=>{
 const f=new FilterEngine("page.test#?#div.ad:-abp-contains(Sponsored)\npage.test#@?#div.ad:-abp-contains(Sponsored)");
 assert.deepEqual(f.getProcedural("page.test"),[]);
 const g=new FilterEngine("page.test#?#div.ad:-abp-contains(Sponsored)");
 assert.deepEqual(g.getProcedural("page.test"),[{selector:"div.ad",text:"Sponsored"}]);
 assert.deepEqual(g.getProcedural("other.test"),[]);
});
test("elemhide exception cancels style and procedural hiding",()=>{
 const f=new FilterEngine("##.ad\npage.test#?#div.ad:-abp-contains(Sponsored)\n@@||page.test^$elemhide");
 const p=f.getPagePolicy("https://page.test/");
 assert.equal(p.elemhide,true);
 assert.deepEqual(f.getSelectors("page.test",p),[]);
 assert.deepEqual(f.getProcedural("page.test",p),[]);
});

test("unanchored literal rules remain indexed and effective",()=>{
 const f=new FilterEngine("*/bannerads/*");
 assert.equal(f.shouldBlock("https://cdn.test/x/bannerads/a","image","page.test"),true);
 assert.equal(f.shouldBlock("https://cdn.test/x/organic/a","image","page.test"),false);
});
test("wildcard and separator anchors remain correct",()=>{
 const f=new FilterEngine("/ads/*/banner^");
 assert.equal(f.shouldBlock("https://cdn.test/ads/3/banner?x=1","image","page.test"),true);
 assert.equal(f.shouldBlock("https://cdn.test/ads/3/bannerd.jpg","image","page.test"),false);
});
