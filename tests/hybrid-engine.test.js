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
test("Build 163 Ghostery exceptions rescue ordinary native subscription blocks",()=>{
 const override={FiltersEngine:{parse:()=>({match:()=>({match:false,exception:{}})})},
  Request:{fromRawDetails:x=>x}};
 const engine=Hybrid.create("||legacy.example^",override);
 const decision=engine.checkRequest("https://legacy.example/a.js","script","site.example");
 assert.equal(decision.block,false);
 assert.equal(decision.rule.exception,true);
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
test("Build 163 native blocks consult Ghostery for possible exceptions",()=>{
 let calls=0;
 const spy={...vendor,FiltersEngine:{parse:()=>({match:()=>{calls++;return {match:false};}})}};
 const e=Hybrid.create("||legacy.example^",spy);
 assert.equal(e.checkRequest("https://legacy.example/a.js","script","site.example").block,true);
 assert.equal(calls,1);
});

test("Build 81 hybrid forwards request method and keeps native method restrictions",()=>{
 const seen=[];
 const provider={FiltersEngine:{parse:()=>({match:req=>{seen.push(req.method);return {match:false};}})},
  Request:{fromRawDetails:x=>x}};
 const e=Hybrid.create("||ads.example^$xmlhttprequest,method=POST",provider);
 assert.equal(e.checkRequest("https://ads.example/a","xmlhttprequest","news.example",{},"POST").block,true);
 assert.equal(e.checkRequest("https://ads.example/a","xmlhttprequest","news.example",{},"GET").block,false);
 assert.deepEqual(seen,["POST","GET"]);
});

test("Build 163 explicit manual blocks outrank Ghostery exceptions",()=>{
 const allow={FiltersEngine:{parse:()=>({match:()=>({match:false,exception:{}})})},
  Request:{fromRawDetails:x=>x}};
 const e=Hybrid.create("||ads.example^",allow,"||ads.example^$script");
 assert.equal(e.checkRequest("https://ads.example/a.js","script","site.example").block,true);
 assert.equal(e.checkRequest("https://ads.example/a.png","image","site.example").block,false);
});
test("Build 163 explicit manual exceptions outrank vendor-only blocking",()=>{
 const block={FiltersEngine:{parse:()=>({match:()=>({match:true})})},
  Request:{fromRawDetails:x=>x}};
 const e=Hybrid.create("||ads.example^",block,"@@||ads.example^$domain=site.example");
 const decision=e.checkRequest("https://ads.example/a.js","script","site.example");
 assert.equal(decision.block,false);
 assert.equal(decision.rule.exception,true);
 assert.equal(e.checkRequest("https://ads.example/a.js","script","elsewhere.example").block,true);
});
test("Build 163 native important rules and page allows keep existing safety contract",()=>{
 let calls=0;
 const allow={FiltersEngine:{parse:()=>({match:()=>{calls++;return {match:false,exception:{}};}})},
  Request:{fromRawDetails:x=>x}};
 const e=Hybrid.create("||ads.example^$important",allow);
 assert.equal(e.checkRequest("https://ads.example/a.js","script","site.example").block,true);
 assert.equal(e.checkRequest("https://ads.example/a.js","script","site.example",{document:true}).block,false);
 assert.equal(calls,0);
});
test("Build 163 malformed vendor matches fail back to native blocking",()=>{
 const bad={FiltersEngine:{parse:()=>({match(){throw Error("broken")}})},
  Request:{fromRawDetails:x=>x}};
 const e=Hybrid.create("||ads.example^",bad);
 assert.equal(e.checkRequest("https://ads.example/a.js","script","site.example").block,true);
 assert.match(e.diagnostic,/matching error/);
});

test("Build 178 maps only Ghostery-vetted inert redirect resources",()=>{
 const Redirect=require("../src/redirect-resources.js");
 const provider=name=>({FiltersEngine:{parse:()=>({match:()=>({
  match:true,redirect:{filename:"MIME_TYPE_STUB.js",dataUrl:"data:text/javascript,evil()"},
  filter:{isRedirect:()=>true,getRedirect:()=>name}
 })})},Request:{fromRawDetails:x=>x}});
 for(const [name,type,expected] of [
  ["noop.js","script","redirect/noop.js"],
  ["empty.css","stylesheet","redirect/empty.css"],
  ["noopjs","script",""],
  ["https://evil.invalid/script.js","script",""],
  ["../secret.js","script",""],
  ["noop.js","image",""],
  ["empty.css","script",""]
 ]){
  const engine=Hybrid.create("",provider(name));
  const result=engine.checkRequest("https://ads.example/file",type,"news.example");
  const resolved=Redirect.path(result.rule,type);
  assert.equal(resolved,expected,name+" / "+type);
  if(expected){
   assert.equal(result.block,true);
   assert.equal(Redirect.url(result.rule,type,{getURL:p=>"moz-extension://instance/"+p}),
    "moz-extension://instance/"+expected);
   assert.equal(JSON.stringify(result).includes("data:text/javascript"),false);
  }else assert.equal(result.block,false,"unsupported redirect must fail open");
 }
});
test("Build 178 vendor redirect exceptions and manual choice retain precedence",()=>{
 const provider={FiltersEngine:{parse:()=>({match:request=>request.url.includes("/keep")?
  {match:false,exception:{}}:{match:true,redirect:{filename:"MIME_TYPE_STUB.js"},
   filter:{isRedirect:()=>true,getRedirect:()=>"noop.js"}}})},
  Request:{fromRawDetails:x=>x}};
 const e=Hybrid.create("",provider,"@@||ads.example^$script,domain=news.example");
 assert.equal(e.checkRequest("https://ads.example/file.js","script","news.example").block,false);
 assert.equal(e.checkRequest("https://ads.example/keep","script","other.example").block,false);
 assert.equal(e.checkRequest("https://ads.example/file.js","script","other.example").rule.redirect,"noop.js");
});
test("Build 183 native entity scopes and vetted Ghostery redirects agree",()=>{
 const {loadEnvironment}=require("../scripts/engine-verdict-audit.js");
 const env=loadEnvironment();
 const line="||ads.example^$script,redirect=noop.js,domain=news.*";
 assert.ok(env.DKRules.network(line),"native entity scope must now be parsed");
 assert.equal(env.DKRules.network(line).scope,"news.*");
 const hybrid=env.DKHybridEngine.create(line);
 assert.equal(hybrid.backend,"hybrid");
 const result=hybrid.checkRequest("https://ads.example/ad.js","script","news.example");
 assert.equal(result.rule?.redirect,"noop.js");
 assert.equal(result.block,true);
 const outside=hybrid.checkRequest("https://ads.example/ad.js","script","other.example");
 assert.equal(outside.rule?.redirect||"","");
});

test("Build 183 native and Ghostery agree on entity-domain important precedence",()=>{
 const {loadEnvironment}=require("../scripts/engine-verdict-audit.js");
 const ctx=loadEnvironment();
 const text=[
  "@@||ads.example^$script",
  "||ads.example^$important,script,domain=news.*"
 ].join("\n");
 const native=new ctx.DKFilter.FilterEngine(text);
 const x=native.checkRequest("https://ads.example/ad.js","script","news.example");
 assert.equal(x.block,true,"native parser now understands entity-domain important");
 assert.equal(x.rule?.important,true);
 const engine=ctx.DKHybridEngine.create(text);
 assert.equal(engine.backend,"hybrid");
 const decision=engine.checkRequest("https://ads.example/ad.js","script","news.example");
 assert.equal(decision.block,true);
 assert.equal(decision.rule.important,true);
 assert.equal(decision.rule.important,true);
 assert.equal(decision.block,x.block);
 assert.equal(engine.checkRequest("https://ads.example/ad.js","script","other.example").block,
  false,"domain-scoped important rule must not apply outside allowed site");
});
test("Build 181 user manual exceptions outrank Ghostery important list blocks",()=>{
 const {loadEnvironment}=require("../scripts/engine-verdict-audit.js");
 const ctx=loadEnvironment();
 const source="||ads.example^$important,script,domain=news.*";
 const engine=ctx.DKHybridEngine.create(source,undefined,
  "@@||ads.example^$script,domain=news.example");
 assert.equal(engine.checkRequest("https://ads.example/ad.js","script","news.example").block,false);
 const other=ctx.DKHybridEngine.create(source,undefined,
  "||ads.example^$script,domain=news.example");
 assert.equal(other.checkRequest("https://ads.example/ad.js","script","news.example").block,true);
});
test("Build 181 ordinary Ghostery block never cancels an existing native exception",()=>{
 const vendor={FiltersEngine:{parse:()=>({match:()=>({match:true,
  filter:{isImportant:()=>false}})})},Request:{fromRawDetails:x=>x}};
 const e=Hybrid.create("@@||ads.example^$script",vendor);
 assert.equal(e.checkRequest("https://ads.example/ad.js","script","news.example").block,false);
});

test("Build 183 entity-scoped manual exceptions work without vendor matching",()=>{
 const {loadEnvironment}=require("../scripts/engine-verdict-audit.js");
 const ctx=loadEnvironment();
 const engine=ctx.DKHybridEngine.create("||ads.example^$script",undefined,
  "@@||ads.example^$script,domain=news.*");
 for(const host of ["news.com","www.news.com","news.co.uk","sub.news.co.uk"])
  assert.equal(engine.checkRequest("https://ads.example/ad.js","script",host).block,
   false,host);
 for(const host of ["other.com","news.evil.com","notnews.com"])
  assert.equal(engine.checkRequest("https://ads.example/ad.js","script",host).block,
   true,host);
});

test("Build 183 real bundled Ghostery and native entity scopes agree on 72 cases",()=>{
 const {loadEnvironment}=require("../scripts/engine-verdict-audit.js");
 const env=loadEnvironment();
 const scopes=[
  "news.*","~news.*","news.*|trusted.example",
  "news.*|~safe.example","news.example|~news.*","~news.*|trusted.example"
 ];
 const origins=[
  "news.com","www.news.com","news.co.uk","sub.news.co.uk",
  "news.evil.com","notnews.com","trusted.example","safe.news.com",
  "safe.example","news.example","news.example.co.uk","else.example"
 ];
 let checked=0;
 for(const scope of scopes){
  const list="||ads.example^$script,domain="+scope;
  const e=env.DKHybridEngine.create(list);
  assert.equal(e.native.networkCount,1);
  for(const origin of origins){
   const req=env.DKGhosteryVendor.Request.fromRawDetails({
    url:"https://ads.example/a.js",type:"script",sourceUrl:"https://"+origin+"/"
   });
   const vendor=e.vendor.match(req);
   const native=e.native.checkRequest(req.url,"script",origin);
   assert.equal(native.block,!!vendor.match,scope+" / "+origin);
   assert.equal(e.checkRequest(req.url,"script",origin).block,!!vendor.match);
   checked++;
  }
 }
 assert.equal(checked,72);
});
