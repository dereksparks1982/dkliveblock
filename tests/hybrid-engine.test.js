"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict");
require("../src/rules.js");
require("../src/engine.js");
const Hybrid=require("../src/hybrid-engine.js");
const lines="||ads.example^\n@@||ads.example^$domain=trusted.example\n||legacy.example^";
const vendor={FiltersEngine:{parse:()=>({match:({url})=>url.includes("ghostery-only")?{match:true}:url.includes("vendor-except")?{match:false,exception:{}}:{match:false}})},Request:{fromRawDetails:x=>x}};
test("uses existing engine before optional vendor package is bundled",()=>{
 const e=Hybrid.create(lines,null);
 assert.equal(e.backend,"native");
 assert.equal(e.checkRequest("https://legacy.example/a","script","site.example").block,true);
});
test("hybrid blocks new Ghostery matches while retaining native fallback",()=>{
 const e=Hybrid.create(lines,vendor);
 assert.equal(e.backend,"hybrid");
 assert.equal(e.checkRequest("https://ghostery-only.example/ad","script","site.example").block,true);
 assert.equal(e.checkRequest("https://legacy.example/ad","script","site.example").block,true);
 assert.equal(e.checkRequest("https://vendor-except.example/ad","script","site.example").block,false);
});
test("site-scoped exceptions stay scoped to that site",()=>{
 const e=Hybrid.create(lines,vendor);
 assert.equal(e.checkRequest("https://ads.example/a","script","trusted.example").block,false);
 assert.equal(e.checkRequest("https://ads.example/a","script","unrelated.example").block,true);
});
test("page exemptions override optional engine",()=>{
 const e=Hybrid.create(lines,vendor);
 assert.equal(e.checkRequest("https://ghostery-only.example/a","script","site.example",{document:true}).block,false);
});
test("vendor parser or matcher failures gracefully fall back",()=>{
 const bad={...vendor,FiltersEngine:{parse(){throw Error("bad")}}};
 assert.equal(Hybrid.create(lines,bad).backend,"native");
 const broken={...vendor,FiltersEngine:{parse:()=>({match(){throw Error("bad")}})}};
 assert.equal(Hybrid.create(lines,broken).checkRequest("https://legacy.example/a","script","news.example").block,true);
});
test("ignore vendor redirect and rewrite responses",()=>{
 const unsafe={...vendor,FiltersEngine:{parse:()=>({match:()=>({match:true,redirect:{filename:"script.js"}})})}};
 assert.equal(Hybrid.create("",unsafe).checkRequest("https://any.example/a","script","site.example").block,false);
});

test("Ghostery allow rules cannot override a native important block",()=>{
 const override={FiltersEngine:{parse:()=>({match:()=>({match:false,exception:{}})})},
  Request:{fromRawDetails:x=>x}};
 const engine=Hybrid.create("||ads.example^$important",override);
 assert.equal(engine.checkRequest("https://ads.example/a.js","script","site.example").block,true);
});
test("Ghostery allow rules cannot override a normal native block",()=>{
 const override={FiltersEngine:{parse:()=>({match:()=>({match:false,exception:{}})})},
  Request:{fromRawDetails:x=>x}};
 const engine=Hybrid.create("||legacy.example^",override);
 assert.equal(engine.checkRequest("https://legacy.example/a.js","script","site.example").block,true);
});

test("Ghostery network rules cannot close newly opened tabs",()=>{
 const e=Hybrid.create("||generic-ads.example^$script",vendor);
 assert.equal(e.checkRequest("https://ghostery-only.example/a.js","popup","site.example").block,false);
 assert.equal(e.checkRequest("https://generic-ads.example/a.js","popup","site.example").block,false);
});
test("page generic-block policy stops supplementary matching",()=>{
 const e=Hybrid.create("",vendor);
 assert.equal(e.checkRequest("https://ghostery-only.example/a.js","script","site.example",{genericblock:true}).block,false);
});
test("already-blocked requests never invoke the additional vendor matcher",()=>{
 let calls=0;
 const spy={...vendor,FiltersEngine:{parse:()=>({match:()=>{calls++;return {match:false};}})}};
 const e=Hybrid.create("||legacy.example^",spy);
 assert.equal(e.checkRequest("https://legacy.example/a.js","script","site.example").block,true);
 assert.equal(calls,0);
});

test("Build 81 hybrid forwards request method and keeps native method restrictions",()=>{
 const seen=[];
 const provider={FiltersEngine:{parse:()=>({match:req=>{seen.push(req.method);return {match:false};}})},
  Request:{fromRawDetails:x=>x}};
 const e=Hybrid.create("||ads.example^$xmlhttprequest,method=POST",provider);
 assert.equal(e.checkRequest("https://ads.example/a","xmlhttprequest","news.example",{},"POST").block,true);
 assert.equal(e.checkRequest("https://ads.example/a","xmlhttprequest","news.example",{},"GET").block,false);
 assert.deepEqual(seen,["GET"]);
});
