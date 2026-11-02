"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict"),
 fs=require("node:fs"),path=require("node:path");
const C=require("../src/company-modules.js");
const N=require("../src/nesty-team.js");
const Catalog=require("../src/meta-delivery-catalog.js");
const Dispatcher=require("../src/adaptive-dispatcher.js");
const Providers=require("../src/provider-intelligence.js");
const Model=require("../src/adaptive-model.js");
const Core=require("../src/nesty-intelligence.js");
const Meta=require("../src/meta-module.js");
const Compat=require("../src/browser-compat.js");
const root=path.join(__dirname,"..");
const env={DKCompanyModules:C,DKNestyTeam:N,DKMetaDeliveryCatalog:Catalog,
 DKAdaptiveDispatcher:Dispatcher,DKProviderIntelligence:Providers,DKAdaptiveModel:Model};
test("Build 281: existing three specialists and 11 aliases remain canonical",()=>{
 assert.deepEqual(N.all().map(x=>x.title),
  ["Nesty Cookie Watch","Nesty Popup Guard","Nesty Meta Ad Scout"]);
 assert.equal(N.all().reduce((n,x)=>n+x.legacyIds.length,0),11);
});
test("Build 281: one shared company router, no suffix spoofing or Meta overreach",()=>{
 const i=Core.create(env);
 assert.equal(i.route("facebook.com").mode,"existing-facebook-dom");
 assert.equal(i.route("m.instagram.com").mode,"observe-only");
 assert.equal(i.route("threads.net").mode,"observe-only");
 assert.equal(i.route("web.whatsapp.com").mode,"observe-only");
 assert.equal(i.route("youtube.com").mode,"existing-youtube-engines");
 assert.equal(i.route("www.reddit.com").mode,"observe-only");
 assert.equal(i.route("facebook.com.evil.test"),null);
 assert.equal(i.route(""),null);
 assert.equal(i.route("https://facebook.com/"),null);
 assert.ok(i.route("facebook.com").specialists.includes("nesty_meta_ad_scout"));
 assert.ok(!i.route("reddit.com").specialists.includes("nesty_meta_ad_scout"));
});
test("Build 281: signals are token-only and capped; no text or account identifiers",()=>{
 const data=Core.signalsOf(["sponsor_label","post_boundary","sponsor_label",
  "https://private.example/path?secret=1","my free-form post","user_id=123",3,
  ...Array.from({length:70},(_,n)=>"custom_"+n)]);
 assert.equal(Object.isFrozen(data),true);
 assert.deepEqual([...data].slice(0,2),["sponsor_label","post_boundary"]);
 assert.ok(data.length<=40);
 assert.ok(data.every(x=>/^[a-z][a-z0-9_]{2,47}$/.test(x)));
});
test("Build 281: independent corroboration and review-only gating across platforms",()=>{
 const i=Core.create(env);
 assert.equal(i.inspect("facebook.com",["sponsor_label"]).matches.length,0);
 const facebook=i.inspect("facebook.com",["sponsor_label","post_boundary"]);
 assert.equal(facebook.action,"review-only");
 assert.equal(facebook.matches.find(x=>x.id==="server-rendered").action,"review");
 assert.equal(facebook.reviews.find(x=>x.id==="explicit-sponsored").action,"review");
 const instagram=i.inspect("instagram.com",["sponsor_label","post_boundary"]);
 assert.ok(instagram.matches.every(x=>x.action==="observe"));
 assert.ok(instagram.reviews.every(x=>x.action==="observe"));
 assert.equal(i.inspect("reddit.com",["sponsor_label","post_boundary"]).matches.length,0);
 assert.equal(i.inspect("youtube.com",["ad_break_metadata","player_ad_slot"])
  .reviews.find(x=>x.id==="bounded-video-break").action,"review");
 assert.equal(i.inspect("youtube.com",["normal_post","author_name"]).reviews.length,0);
 assert.equal(i.inspect("unlisted.test",["sponsor_label","post_boundary"]).recognized,false);
});
test("Build 281: synthetic ranking is non-authoritative and protects contexts",()=>{
 const i=Core.create(env),input=["ad_slot","sponsor_menu","protected_context"];
 const result=i.inspect("facebook.com",input);
 assert.equal(result.ranking.assessment,"unconfirmed");
 assert.equal(result.action,"review-only");
 assert.ok(!Object.hasOwn(result,"blocked"));
 assert.ok(!Object.hasOwn(result,"installRule"));
});
test("Build 281: opt-in hostname-only provider counts, separate platforms",()=>{
 const i=Core.create(env);
 assert.equal(i.observeProvider("facebook.com","ads.example.net","blocked",false),null);
 assert.equal(i.observeProvider("facebook.com","https://ads.example.net/path","blocked",true),null);
 assert.equal(i.observeProvider("facebook.com","fbcdn.net","blocked",true),null);
 assert.equal(i.observeProvider("facebook.com","ads.example.net","blocked",true).blocked,1);
 assert.equal(i.observeProvider("facebook.com","ads.example.net","allowed",true).allowed,1);
 assert.equal(i.snapshot("facebook.com",false).providers.length,0);
 assert.equal(i.snapshot("facebook.com",true).providers[0].type,"unknown");
 assert.equal(i.snapshot("instagram.com",true).providers.length,0);
 assert.equal(i.observeProvider("reddit.com","ads.example.net","blocked",true).blocked,1);
 assert.equal(i.snapshot("reddit.com",true).providers.length,1);
 assert.equal(i.clear("facebook.com"),true);
 assert.equal(i.snapshot("facebook.com",true).providers.length,0);
 assert.equal(i.snapshot("reddit.com",true).providers.length,1);
});
test("Build 281: legacy Meta scanner remains separate from review coordinator",()=>{
 const old={DKCompanyModules:globalThis.DKCompanyModules,
  DKAdaptiveDispatcher:globalThis.DKAdaptiveDispatcher,
  DKNestyIntelligence:globalThis.DKNestyIntelligence};
 globalThis.DKCompanyModules=C;
 globalThis.DKAdaptiveDispatcher=Dispatcher;
 globalThis.DKNestyIntelligence=Core;
 try{
  const win={location:{hostname:"www.instagram.com"}};win.top=win;
  const adapter=Meta.create({},win);
  assert.equal(adapter.platform,"instagram");
  assert.equal(adapter.scan(),0);
  assert.equal(adapter.inspectSignals(["sponsor_label","post_boundary"]).mode,"observe-only");
  assert.equal(adapter.intelligenceProfile().providers.length,0);
  assert.equal(adapter.review({getAttribute:()=> "Sponsored"})[0].action,"review");
 }finally{Object.assign(globalThis,old);}
});
test("Build 281: Yandex detection is descriptive; unsupported blocking fails shut",()=>{
 const f=(dnr)=>({chrome:{runtime:{getManifest:()=>({manifest_version:3})},
  declarativeNetRequest:dnr?{updateDynamicRules(){}}:undefined},
  navigator:{userAgent:"Mozilla/5.0 Chrome/129.0 YaBrowser/24.10"}});
 assert.equal(Compat.inspect(f(true)).browser,"yandex");
 assert.equal(Compat.inspect(f(true)).networkBackend,"declarative-net-request");
 assert.equal(Compat.inspect(f(false)).networkBackend,"unavailable");
 assert.equal(Compat.requireNetworkBackend(Compat.inspect(f(false))).ready,false);
});
test("Build 281: all browser packagers reuse one Nesty module, no premature parity",()=>{
 const manifest=require("../src/manifest.json"),targets=require("../platform/targets.json");
 const bg=manifest.background.scripts,content=manifest.content_scripts[0].js;
 assert.ok(bg.indexOf("nesty-intelligence.js")>bg.indexOf("adaptive-dispatcher.js"));
 assert.ok(bg.indexOf("nesty-intelligence.js")<bg.indexOf("background.js"));
 assert.ok(content.indexOf("nesty-intelligence.js")<content.indexOf("meta-module.js"));
 const orion=fs.readFileSync(path.join(root,"scripts/package-orion-candidate.py"),"utf8");
 assert.match(orion,/"nesty-intelligence.js"/);
 assert.match(orion,/"meta-delivery-catalog.js"/);
 assert.equal(targets.experimental_targets["orion-ios"].mode,"dom-only");
 assert.equal(targets.experimental_targets["yandex-desktop"].status,"adapter-required-unverified");
 assert.equal(targets.experimental_targets["yandex-android"].status,"adapter-required-unverified");
 assert.ok(!manifest.permissions.includes("declarativeNetRequest"));
 assert.equal(manifest.version,require("../package.json").version);
});
test("Build 281: diagnostics remain extension-only and opt-out clears observations",()=>{
 const b=fs.readFileSync(path.join(root,"src/background.js"),"utf8");
 assert.match(b,/msg.action==="getNestyIntelligence"/);
 assert.match(b,/if\(fromContent\|\|!Number.isInteger\(id\)\|\|id<0\)/);
 assert.match(b,/nestyIntelligence\.observeProvider\(site,destination,status,true\)/);
 assert.match(b,/nestyIntelligence\.clear\(name\)/);
 assert.match(b,/metaProviderEvidence\.clear\(\);return \{ok:true,cleared:true\}/);
});
test("Build 281: Russian and English favicons match selected language",()=>{
 const s=require("../assets/site-localization.js");
 assert.equal(s.FAVICON_EN,"apple-touch-icon.png");
 assert.ok(decodeURIComponent(s.FAVICON_RU).includes("Metallic ДК Hammer and Sickle Emblem.png"));
 assert.ok(fs.existsSync(path.join(root,decodeURIComponent(s.FAVICON_RU))));
 let href="",old=globalThis.NodeFilter;
 globalThis.NodeFilter={SHOW_TEXT:4};
 const doc={documentElement:{},body:{},querySelector:selector=>
  selector==='link[rel="icon"]'?{setAttribute:(name,value)=>{if(name==="href")href=value;}}:null,
  querySelectorAll:()=>[],createTreeWalker:()=>({nextNode:()=>null}),getElementById:()=>null,
  dispatchEvent(){}};
 try{
  s.render(doc,"ru");assert.equal(href,s.FAVICON_RU);
  s.render(doc,"en");assert.equal(href,s.FAVICON_EN);
 }finally{globalThis.NodeFilter=old;}
});
