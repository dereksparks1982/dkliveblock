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
 assert.deepEqual(g.getProcedural("page.test"),[{selector:"div.ad",mode:"text",text:"Sponsored"}]);
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

test("URL normalization and missing document context",()=>{
 assert.equal(R.host("https://EXAMPLE.TEST./a"),"example.test");
 assert.equal(R.site("192.168.11.42"),"192.168.11.42");
 const f=new FilterEngine("||ads.test^$third-party");
 assert.equal(f.shouldBlock("https://ads.test/script","script",""),false);
});
test("case-sensitive filters and unsupported cosmetic syntax",()=>{
 const f=new FilterEngine("|https://cdn.test/Ad.js|$match-case");
 assert.equal(f.shouldBlock("https://cdn.test/Ad.js","script","page.test"),true);
 assert.equal(f.shouldBlock("https://cdn.test/ad.js","script","page.test"),false);
 assert.equal(R.network("site.test#@?#div:-abp-contains(ad)"),null);
 assert.equal(R.network("site.test#$#div{display:none}"),null);
});
test("reject costly regexp constructs",()=>{
 assert.equal(R.regex("/(a+)+/"),null);
 assert.equal(R.regex("/(foo)\\1/"),null);
});

test("popup rules only affect explicit popup requests",()=>{
 const f=new FilterEngine("||popup.test^$popup\n||ads.test^\n@@||popup.test/allow*$popup");
 assert.equal(f.shouldBlock("https://popup.test/x","popup","page.test"),true);
 assert.equal(f.shouldBlock("https://popup.test/x","script","page.test"),false);
 assert.equal(f.shouldBlock("https://ads.test/x","popup","page.test"),false);
 assert.equal(f.shouldBlock("https://popup.test/allow-me","popup","page.test"),false);
});

test("named removeparam rules clean top-level navigation only",()=>{
 const f=new FilterEngine("*$removeparam=clickid");
 assert.equal(f.cleanNavigation("https://shop.example/item?clickid=123&product=boots#details"),"https://shop.example/item?product=boots#details");
 assert.equal(f.cleanNavigation("https://shop.example/item?product=boots"),null);
 assert.equal(f.shouldBlock("https://shop.example/item?clickid=123","script","site.example"),false);
});
test("removeparam respects site restrictions, exceptions and important signed keys",()=>{
 const f=new FilterEngine("*$removeparam=clickid,domain=shop.example\n@@||shop.example/private^$removeparam=clickid\n*$removeparam=signature");
 assert.equal(f.cleanNavigation("https://shop.example/item?clickid=123&signature=x"),null);
 assert.equal(f.cleanNavigation("https://shop.example/private?clickid=123"),null);
 assert.equal(f.cleanNavigation("https://other.example/item?clickid=123"),null);
 assert.equal(R.network("*$removeparam=/unsafe-regexp/"),null);
});

test("site-scoped ABP has selector identifies sponsored cards",()=>{
 const rules="page.test#?#div.card:-abp-has(.sponsored-label)";
 const f=new FilterEngine(rules);
 assert.deepEqual(f.getProcedural("page.test"),[{selector:"div.card",mode:"has",target:".sponsored-label"}]);
 assert.deepEqual(f.getProcedural("elsewhere.test"),[]);
});
test("procedural has exceptions work without overriding text filters",()=>{
 const f=new FilterEngine("page.test#?#div.card:-abp-has(.sponsored-label)\npage.test#@?#div.card:-abp-has(.sponsored-label)\npage.test#?#div.ad:-abp-contains(Sponsored)");
 assert.deepEqual(f.getProcedural("page.test"),[{selector:"div.ad",mode:"text",text:"Sponsored"}]);
});
test("scriptlets and malformed procedural filters are rejected",()=>{
 assert.equal(R.procedural("page.test#?#div:-abp-has(+js(code))"),null);
 assert.equal(R.procedural("page.test#?#div:-abp-has(.ad;body)"),null);
});

test("common third-party and resource aliases",()=>{
 const one=new FilterEngine("||cdn.test^$1p,~script");
 assert.equal(one.shouldBlock("https://cdn.test/x","image","cdn.test"),true);
 assert.equal(one.shouldBlock("https://cdn.test/x","script","cdn.test"),false);
 assert.equal(one.shouldBlock("https://cdn.test/x","image","other.test"),false);
 const three=new FilterEngine("||cdn.test^$3p,xhr");
 assert.equal(three.shouldBlock("https://cdn.test/x","xmlhttprequest","other.test"),true);
 assert.equal(three.shouldBlock("https://cdn.test/x","xmlhttprequest","cdn.test"),false);
 const img=new FilterEngine("||cdn.test^$image");
 assert.equal(img.shouldBlock("https://cdn.test/x","imageset","other.test"),true);
 const css=new FilterEngine("||cdn.test^$css");
 assert.equal(css.shouldBlock("https://cdn.test/x","stylesheet","other.test"),true);
});

test("from and to match requester and destination separately",()=>{
 const f=new FilterEngine("||cdn.example^$from=news.example,to=ads.cdn.example");
 assert.equal(f.shouldBlock("https://ads.cdn.example/a","script","news.example"),true);
 assert.equal(f.shouldBlock("https://cdn.example/a","script","news.example"),false);
 assert.equal(f.shouldBlock("https://ads.cdn.example/a","script","other.example"),false);
});
test("denyallow keeps selected CDN endpoints available under a site rule",()=>{
 const f=new FilterEngine("*$domain=publisher.example,denyallow=safe.cdn.example|news.cdn.example");
 assert.equal(f.shouldBlock("https://ads.other.example/ad","script","publisher.example"),true);
 assert.equal(f.shouldBlock("https://safe.cdn.example/script","script","publisher.example"),false);
 assert.equal(f.shouldBlock("https://news.cdn.example/photo","image","publisher.example"),false);
 assert.equal(f.shouldBlock("https://safe.cdn.example.evil.org/p","image","publisher.example"),true);
});
test("reject invalid domain lists, duplicate scopes and denyallow without requester",()=>{
 for(const src of ["*$denyallow=cdn.example","*$domain=bad..host","*$domain=~","*$to=.invalid.com",
  "*$domain=site.example,from=other.example","*$to=good.example,to=evil.example",
  "*$domain=page.example,denyallow=~safe.example","*$domain=site.example,denyallow=foo..example"])
  assert.equal(R.network(src),null,src);
});
test("denyallow works with exceptions and important priorities",()=>{
 const f=new FilterEngine("||ads.example^$important,domain=site.example,denyallow=safe.ads.example\n@@||ads.example^$domain=site.example");
 assert.equal(f.shouldBlock("https://ads.example/a","script","site.example"),true);
 assert.equal(f.shouldBlock("https://safe.ads.example/a","script","site.example"),false);
});


test("indexed cosmetics honor negative-only scopes, generic exceptions, and nested domains",()=>{
 const f=new FilterEngine("##.global\n~private.example##.except-private\nexample##.parent\napp.example##.child\nexample,~blocked.example##.scoped\napp.example#@#.global");
 assert.deepEqual(f.getSelectors("app.example").sort(),[".except-private",".parent",".child",".scoped"].sort());
 assert.ok(!f.getSelectors("private.example").includes(".except-private"));
 assert.ok(!f.getSelectors("blocked.example").includes(".scoped"));
 assert.ok(f.getSelectors("other.example").includes(".global"));
});
test("domain index still returns precise procedural rules",()=>{
 const f=new FilterEngine("a.example#?#div.ad:-abp-contains(Sponsored)\nb.example#?#div.ad:-abp-contains(Paid)");
 assert.deepEqual(f.getProcedural("a.example"),[{selector:"div.ad",mode:"text",text:"Sponsored"}]);
 assert.deepEqual(f.getProcedural("b.example"),[{selector:"div.ad",mode:"text",text:"Paid"}]);
 assert.deepEqual(f.getProcedural("other.example"),[]);
});

test("obvious catastrophic regex structures fail closed",()=>{
 for(const p of ["/(a|aa)+$/","/(?:a|aa)+$/","/.*.*foo/","/(a+)+/","/(abc)++/"]){
  assert.equal(R.regex(p),null,p);
  assert.equal(R.network(p),null,p);
 }
 const f=new FilterEngine("/ad(?:one|two)/");
 assert.equal(f.shouldBlock("https://example.test/adone","script","site.test"),true);
});
test("oversized request URLs cannot trigger unbounded regular expression matching",()=>{
 const f=new FilterEngine("||ads.test^");
 const huge="https://ads.test/"+("a".repeat(20000));
 assert.equal(f.shouldBlock(huge,"script","site.test"),false);
 assert.equal(f.shouldBlock("https://ads.test/ad","script","site.test"),true);
});

test("common multi-level country domains classify registrable sites accurately",()=>{
 for(const [host,site] of [
  ["cdn.example.com.au","example.com.au"],["cdn.example.co.za","example.co.za"],
  ["mail.example.com.mx","example.com.mx"],["img.example.com.tr","example.com.tr"],
  ["cdn.example.co.id","example.co.id"],["a.example.ac.uk","example.ac.uk"],
  ["cdn.example.com.sg","example.com.sg"],["i.example.co.il","example.co.il"]
 ])assert.equal(R.site(host),site,host);
});
test("separately hosted web pages count as distinct first parties",()=>{
 for(const base of ["github.io","pages.dev","blogspot.com","workers.dev","netlify.app","vercel.app"]){
  assert.equal(R.site("alice."+base),"alice."+base);
  assert.equal(R.site("sub.alice."+base),"alice."+base);
  assert.notEqual(R.site("bob."+base),R.site("alice."+base));
 }
 const f=new FilterEngine("||alice.github.io^$3p");
 assert.equal(f.shouldBlock("https://alice.github.io/ad.js","script","bob.github.io"),true);
 assert.equal(f.shouldBlock("https://alice.github.io/ad.js","script","docs.alice.github.io"),false);
});

test("Build 34 safe site-scoped has-text aliases reuse text predicate",()=>{
 const rules="page.test#?#div.offer:has-text(Sponsored)\n"+
  "page.test#?#div.offer:-abp-has-text(Promoted)";
 const f=new FilterEngine(rules);
 assert.deepEqual(f.getProcedural("page.test"),[
  {selector:"div.offer",mode:"text",text:"Sponsored"},
  {selector:"div.offer",mode:"text",text:"Promoted"}
 ]);
 assert.deepEqual(f.getProcedural("unrelated.test"),[]);
 assert.equal(R.procedural("page.test#?#div:has-text(alert(1))"),null);
 assert.equal(R.procedural("page.test#?#div:has-text(foo;body)"),null);
});
test("Build 34 safe descendant has alias remains site-scoped and reversible",()=>{
 const f=new FilterEngine("page.test#?#div.card:has(.sponsored)\n"+
  "page.test#@?#div.card:has(.sponsored)\n"+
  "page.test#?#div.card:has(.advertisement)");
 assert.deepEqual(f.getProcedural("page.test"),[
  {selector:"div.card",mode:"has",target:".advertisement"}
 ]);
 assert.deepEqual(f.getProcedural("unrelated.test"),[]);
 assert.equal(R.procedural("page.test#?#div:has(+js(evil))"),null);
 assert.equal(R.procedural("page.test#?#div:has(.ad;body)"),null);
});

test("Build 81 method rules apply only to known matching HTTP methods and honor exceptions",()=>{
 const f=new FilterEngine("||ads.example^$xmlhttprequest,method=POST"+
  "\n@@||ads.example/allow^$xmlhttprequest,method=POST");
 assert.equal(f.shouldBlock("https://ads.example/pixel","xmlhttprequest","news.example",{},"POST"),true);
 assert.equal(f.shouldBlock("https://ads.example/pixel","xmlhttprequest","news.example",{},"GET"),false);
 assert.equal(f.shouldBlock("https://ads.example/pixel","xmlhttprequest","news.example"),false);
 assert.equal(f.shouldBlock("https://ads.example/allow?x=1","xmlhttprequest","news.example",{},"POST"),false);
});
test("Build 81 includes and excludes HTTP methods with safe bounds",()=>{
 const f=new FilterEngine("||ads.example^$method=POST|PUT|~DELETE,script");
 for(const method of ["POST","PUT"])assert.equal(f.shouldBlock("https://ads.example/x","script","news.example",{},method),true);
 for(const method of ["GET","DELETE","HEAD",""])assert.equal(f.shouldBlock("https://ads.example/x","script","news.example",{},method),false);
 const neg=new FilterEngine("||ads.example^$method=~GET");
 assert.equal(neg.shouldBlock("https://ads.example/x","image","news.example",{},"POST"),true);
 assert.equal(neg.shouldBlock("https://ads.example/x","image","news.example",{},"GET"),false);
});
test("Build 81 rejects invalid, contradictory or non-request method options",()=>{
 for(const line of ["||ads.example^$method=TRACE","||ads.example^$method=",
  "||ads.example^$method=POST|~POST","||ads.example^$method=POST,method=GET",
  "||ads.example^$~method=GET","@@||ads.example^$document,method=GET",
  "*$removeparam=utm_source,method=GET"])assert.equal(R.network(line),null,line);
});

test("Build 90 recognizes scoped literal has-text and matching exceptions",()=>{
 const f=new FilterEngine("news.example##article:has-text(Sponsored)"+
  "\nnews.example#@#article:has-text(Sponsored)"+
  "\nnews.example##article:has-text(Promoted)");
 assert.deepEqual(f.getProcedural("news.example"),[
  {selector:"article",mode:"text",text:"Promoted"}]);
 assert.deepEqual(f.getProcedural("other.example"),[]);
 assert.equal(R.cosmetic("news.example##article:has-text(Promoted)"),null);
 assert.equal(R.procedural("##article:has-text(Sponsored)"),null);
 assert.equal(R.procedural("news.example##article:has-text(alert(1))"),null);
 const native=new FilterEngine("news.example##article:has(.sponsor)");
 assert.deepEqual(native.getProcedural("news.example"),[]);
 assert.deepEqual(native.getSelectors("news.example"),["article:has(.sponsor)"]);
});

test("Build 95 UTM family stripping preserves product and signed data",()=>{
 const f=new FilterEngine("*$removeparam=utm_*");
 assert.equal(f.cleanNavigation("https://shop.example/?utm_source=a&utm_medium=b&sku=10&signature=signed"),null);
 assert.equal(R.network("*$removeparam=*"),null);
 assert.equal(R.network("*$removeparam=token*"),null);
});
test("Build 95 UTM family respects exact and site exceptions",()=>{
 const f=new FilterEngine("*$removeparam=utm_*"+
  "\n@@*$removeparam=utm_source"+
  "\n@@||shop.example/private^$removeparam=utm_*");
 assert.equal(f.cleanNavigation("https://shop.example/?utm_source=a&utm_medium=b&sku=1"),
  "https://shop.example/?utm_source=a&sku=1");
 assert.equal(f.cleanNavigation("https://shop.example/private?utm_medium=b"),null);
 const x=new FilterEngine("*$removeparam=utm_source\n@@*$removeparam=utm_*");
 assert.equal(x.cleanNavigation("https://shop.example/?utm_source=x"),null);
});

test("Build 98 refuses advanced pseudo-classes that Firefox CSS does not implement",()=>{
 for(const expression of [":matches-css(color:red)",":matches-attr(data-x=1)",
  ":upward(2)",":xpath(//div)",":contains(Advert)",":watch-attr(style)"]){
  assert.equal(R.cosmetic("news.example##div"+expression),null,expression);
 }
 assert.ok(R.cosmetic("news.example##div:has(.paid)"));
 assert.ok(R.cosmetic("news.example##div:not(.editorial)"));
});

test("Build 99 procedural domain lists and scoped exceptions",()=>{
 const f=new FilterEngine("news.example,media.example##div:has-text(Sponsored)"+
 "\nmedia.example#@#div:has-text(Sponsored)");
 assert.equal(f.getProcedural("news.example").length,1);
 assert.equal(f.getProcedural("media.example").length,0);
 assert.equal(f.getProcedural("other.example").length,0);
 assert.equal(R.procedural("news.example,##div:has-text(Sponsored)"),null);
});

test("Build 100 procedural site exclusions protect opted-out subdomains",()=>{
 const f=new FilterEngine("news.example,~pay.news.example##article:has-text(Sponsored)");
 assert.equal(f.getProcedural("news.example").length,1);
 assert.equal(f.getProcedural("www.news.example").length,1);
 assert.equal(f.getProcedural("pay.news.example").length,0);
 assert.equal(f.getProcedural("sub.pay.news.example").length,0);
});
test("Build 100 negative-only scopes remain unsupported to avoid global text scans",()=>{
 assert.equal(R.procedural("~pay.news.example##article:has-text(Sponsored)"),null);
 assert.equal(R.procedural("news.example,~##article:has-text(Sponsored)"),null);
 const f=new FilterEngine("news.example,~pay.news.example##article:has-text(Sponsored)"+
  "\npay.news.example##article:has-text(Sponsored)");
 assert.equal(f.getProcedural("pay.news.example").length,1);
});

test("Build 101 quoted literal text selectors match their content, not quote characters",()=>{
 const a=R.procedural('news.example##article:has-text("Sponsored")');
 const b=R.procedural("news.example##article:has-text('Promoted')");
 assert.equal(a.text,"Sponsored");
 assert.equal(b.text,"Promoted");
 const f=new FilterEngine('news.example##article:has-text("Sponsored")');
 assert.deepEqual(f.getProcedural("news.example"),[
  {selector:"article",mode:"text",text:"Sponsored"}]);
 assert.equal(R.procedural("news.example##article:has-text(/Sponsored/)"),null);
 assert.equal(R.procedural("news.example##article:has-text(  )"),null);
});

test("Build 102 supports literal :contains without accepting generic global text matching",()=>{
 const f=new FilterEngine("news.example##article:contains(Sponsored)"+
  "\nnews.example#@#article:contains(Sponsored)"+
  "\nnews.example##section:contains('Promoted')");
 assert.deepEqual(f.getProcedural("news.example"),[
  {selector:"section",mode:"text",text:"Promoted"}]);
 assert.deepEqual(f.getProcedural("unrelated.example"),[]);
 assert.equal(R.procedural("##article:contains(Sponsored)"),null);
 assert.equal(R.procedural("news.example##article:contains(/Sponsor/)"),null);
});

test("Build 104 UTM exceptions also preserve case-varied query keys",()=>{
 const f=new FilterEngine("*$removeparam=utm_*\n@@*$removeparam=utm_source");
 assert.equal(f.cleanNavigation("https://shop.example/?UTM_SOURCE=allowed&UtM_Medium=removed&sku=17"),
  "https://shop.example/?UTM_SOURCE=allowed&sku=17");
});

test("Build 106 blocks nested counted regex groups that may backtrack excessively",()=>{
 for(const filter of ["/^(a{1,10}){2,10}$/",
  "/^(ab{2,8})+$/","/^(a{1,8}b){1,10}$/"]){
  assert.equal(R.network(filter),null,filter);
 }
 assert.ok(R.network("/^ads?[0-9]+$/"));
 assert.ok(R.network("||ads.example^"));
});

test("Build 111 campaign family cleanup retains signed and session-like fields",()=>{
 const f=new FilterEngine("*$removeparam=utm_*");
 const url="https://shop.example/continue?utm_source=remove&utm_campaign=remove"+
  "&utm_token=keep&utm_signature=keep&utm_session=keep&UTM_NONCE=keep&sku=15";
 assert.equal(f.cleanNavigation(url),null,
  "a potentially signed link must remain byte-for-byte unchanged");
 assert.equal(f.cleanNavigation("https://shop.example/?utm_code=keep&utm_auth=keep"),null);
});

test("Build 116 deduplicates repeated procedural rules before page scan budget",()=>{
 const repeated=Array.from({length:100},()=> "news.example##article:has-text(Sponsored)").join("\n");
 const f=new FilterEngine(repeated+"\nnews.example##div:has-text(Promoted)");
 assert.deepEqual(f.getProcedural("news.example"),[
  {selector:"article",mode:"text",text:"Sponsored"},
  {selector:"div",mode:"text",text:"Promoted"}
 ]);
});
test("Build 116 exceptions still remove duplicated scoped rules",()=>{
 const f=new FilterEngine("news.example##div:has-text(Ad)"+
  "\nnews.example##div:has-text(Ad)"+
  "\nnews.example#@#div:has-text(Ad)");
 assert.deepEqual(f.getProcedural("news.example"),[]);
});
test("Build 116 per-site scan output is bounded before background serialization",()=>{
 const f=new FilterEngine(Array.from({length:340},(_,i)=>
  "news.example##article:has-text(Advert "+i+")").join("\n"));
 const rules=f.getProcedural("news.example");
 assert.equal(rules.length,300);
 assert.equal(rules[0].text,"Advert 0");
});

test("Build 117 keeps complete signed download and checkout query strings intact",()=>{
 const f=new FilterEngine("*$removeparam=utm_*\n*$removeparam=clickid");
 const cases=[
  "https://cdn.example/object?utm_source=promo&X-Amz-Signature=abc&X-Amz-Credential=k",
  "https://video.example/play?utm_medium=email&X-Goog-Signature=abc",
  "https://shop.example/checkout?clickid=123&signature=abc&total=99",
  "https://login.example/callback?utm_source=ref&state=opaque&code=abc",
  "https://site.example/file?utm_source=ad&UTM_TOKEN=secret"
 ];
 for(const url of cases)assert.equal(f.cleanNavigation(url),null,url);
 assert.equal(f.cleanNavigation("https://shop.example/item?clickid=123&utm_source=ad&sku=7"),
  "https://shop.example/item?sku=7");
});

test("Build 119 text predicates reject mismatched quotes and regex flags",()=>{
 for(const body of ['"Sponsored', "Sponsored'", "'Sponsored",
  '"Sponsored\'', "/Sponsored/i", "/Sponsored/g", "/Sponsor.*/iu"]){
  assert.equal(R.procedural("news.example##article:has-text("+body+")"),null,body);
 }
 assert.equal(R.procedural("news.example##article:has-text('Sponsored')").text,"Sponsored");
 assert.equal(R.procedural('news.example##article:has-text("Promoted")').text,"Promoted");
});

test("Build 128 offline fallback AMP ad selectors remain simple reversible CSS",()=>{
 const f=new FilterEngine("##amp-ad\n##amp-auto-ads\n##ins.adsbygoogle");
 const selectors=f.getSelectors("news.example");
 assert.ok(selectors.includes("amp-ad"));
 assert.ok(selectors.includes("amp-auto-ads"));
 assert.ok(selectors.includes("ins.adsbygoogle"));
 assert.equal(f.getProcedural("news.example").length,0);
});

test("Build 137 accepts class/ID literal text rules without global selectors",()=>{
 const f=new FilterEngine("news.example##.ad-card:has-text(Sponsored)"+
  "\nnews.example###promo:contains(Promoted)");
 assert.deepEqual(f.getProcedural("news.example"),[
  {selector:".ad-card",mode:"text",text:"Sponsored"},
  {selector:"#promo",mode:"text",text:"Promoted"}]);
 assert.deepEqual(f.getProcedural("other.example"),[]);
 for(const rule of ["news.example##.:has-text(Sponsored)",
  "news.example###:has-text(Sponsored)"])assert.equal(R.procedural(rule),null);
});
test("Build 137 class/ID descendant rules still respect exact site exceptions",()=>{
 const f=new FilterEngine("news.example#?#.ad-card:has(.paid-label)"+
  "\nnews.example#@?#.ad-card:has(.paid-label)"+
  "\nnews.example#?##sponsor:has(.disclosure)");
 assert.deepEqual(f.getProcedural("news.example"),[
  {selector:"#sponsor",mode:"has",target:".disclosure"}]);
});

test("Build 144 reject navigation tracking rules with unsupported target modifiers",()=>{
 for(const rule of [
  "*$removeparam=utm_source,to=cdn.example",
  "*$removeparam=clickid,domain=shop.example,denyallow=secure.example",
  "||ads.example^$removeparam=utm_source,to=cdn.example",
  "*$removeparam=utm_*,domain=shop.example,to=cdn.example"
 ])assert.equal(R.network(rule),null,rule);
 const allowed=new FilterEngine("*$removeparam=utm_*,domain=shop.example");
 assert.equal(allowed.cleanNavigation("https://shop.example/?utm_source=campaign&sku=1"),
  "https://shop.example/?sku=1");
 assert.equal(allowed.cleanNavigation("https://other.example/?utm_source=campaign"),null);
});

test("Build 149 rejects request-only options on navigation query cleaners",()=>{
 for(const text of ["*$removeparam=utm_source,script",
  "*$removeparam=utm_source,third-party",
  "*$removeparam=utm_source,3p",
  "*$removeparam=utm_source,~document",
  "*$removeparam=utm_source,document,script",
  "*$removeparam=utm_source,denyallow=cdn.example,domain=shop.example"])
  assert.equal(R.network(text),null,text);
 const allowed=new FilterEngine("*$removeparam=utm_source,document"+
  "\n*$removeparam=utm_medium,first-party");
 assert.equal(allowed.cleanNavigation("https://shop.example/?utm_source=a&utm_medium=b&sku=19"),
  "https://shop.example/?sku=19");
});
