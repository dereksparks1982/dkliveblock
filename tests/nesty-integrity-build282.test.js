"use strict";
// Build 282: shared Nesty review-only safety and compatibility regressions.
const {test}=require("node:test"),assert=require("node:assert/strict"),
 fs=require("node:fs"),path=require("node:path");
const Company=require("../src/company-modules.js");
const Team=require("../src/nesty-team.js");
const Catalog=require("../src/meta-delivery-catalog.js");
const Dispatcher=require("../src/adaptive-dispatcher.js");
const Providers=require("../src/provider-intelligence.js");
const Model=require("../src/adaptive-model.js");
const Core=require("../src/nesty-intelligence.js");
const Compat=require("../src/browser-compat.js");
const deps={DKCompanyModules:Company,DKNestyTeam:Team,
 DKMetaDeliveryCatalog:Catalog,DKAdaptiveDispatcher:Dispatcher,
 DKProviderIntelligence:Providers,DKAdaptiveModel:Model};
const create=()=>Core.create(deps);
test("Build 282 admits known evidence only, not arbitrary strings or names",()=>{
 const signals=Core.signalsOf(["sponsor_label","post_boundary","private_message_123",
  "user_id_42","account_email","host_my_bank","sponsor_label",
  "https://example.org/secret","my post content"],Catalog);
 assert.deepEqual([...signals],["sponsor_label","post_boundary"]);
 assert.ok(Object.isFrozen(signals));
 assert.equal(Core.signalsOf("sponsor_label",Catalog).length,0);
 const extended=Core.signalsOf(["ad_endpoint","request_context"],Catalog);
 assert.deepEqual([...extended],["ad_endpoint","request_context"]);
});
test("Build 282 protected contexts veto all proposed matches and reviews",()=>{
 const i=create();
 for(const host of ["facebook.com","instagram.com","youtube.com"]){
  const v=i.inspect(host,["sponsor_label","post_boundary","ad_break_metadata",
   "player_ad_slot","ad_destination","unwanted_navigation","protected_context"]);
  assert.equal(v.action,"review-only");
  assert.deepEqual([...v.matches],[]);
  assert.deepEqual([...v.reviews],[]);
  assert.equal(v.ranking.assessment,"unconfirmed");
 }
});
test("Build 282 no unverified Meta-side hiding or unrelated site matching",()=>{
 const i=create();
 for(const host of ["instagram.com","threads.net","whatsapp.com"]){
  const v=i.inspect(host,["sponsor_label","post_boundary"]);
  assert.equal(v.mode,"observe-only");
  assert.ok(v.matches.every(x=>x.action==="observe"));
  assert.ok(v.reviews.every(x=>x.action==="observe"));
 }
 for(const host of ["reddit.com","youtube.com"]){
  const v=i.inspect(host,["sponsor_label","post_boundary"]);
  assert.deepEqual([...v.matches],[]);
 }
 for(const host of ["fakefacebook.com","reddit.com.bad.example","facebook.com.evil.net"])
  assert.equal(i.route(host),null);
});
test("Build 282 dispatcher registrations happen once per instance, not per signal",()=>{
 let created=0,registrations=0;
 const wrap={create(){created++;const d=Dispatcher.create();return {
  register(id,fn){registrations++;return d.register(id,fn);},
  inspect:ctx=>d.inspect(ctx)};}};
 const coordinator=Core.create({...deps,DKAdaptiveDispatcher:wrap});
 for(let k=0;k<30;k++)
  assert.equal(coordinator.inspect("facebook.com",["sponsor_label","post_boundary"]).reviews.length,1);
 assert.equal(created,1);
 assert.equal(registrations,3);
});
test("Build 282 analysis yields no autonomous blocking control",()=>{
 const i=create(),v=i.inspect("facebook.com",["sponsor_label","post_boundary"]);
 assert.equal(v.action,"review-only");
 assert.equal(v.reviews[0].action,"review");
 for(const key of ["block","hide","remove","install","installRule","pushRule","send"])
  assert.equal(typeof i[key],"undefined");
 assert.equal(typeof i.observeProvider,"function");
});
test("Build 282 request observations are opt-in, bounded and separated",()=>{
 const i=create();
 assert.equal(i.observeProvider("facebook.com","stats.example.org","blocked",false),null);
 assert.equal(i.observeProvider("facebook.com","https://stats.example.org/test","blocked",true),null);
 assert.equal(i.observeProvider("facebook.com","fbcdn.net","blocked",true),null);
 assert.equal(i.observeProvider("facebook.com","stats.example.org","blocked",true).blocked,1);
 assert.equal(i.observeProvider("instagram.com","stats.example.org","allowed",true).allowed,1);
 assert.equal(i.snapshot("facebook.com",true).providers.length,1);
 assert.equal(i.snapshot("instagram.com",true).providers.length,1);
 assert.equal(i.snapshot("facebook.com",false).providers.length,0);
 assert.equal(i.snapshot("youtube.com",true).providers.length,0);
 assert.equal(i.clear("facebook.com"),true);
 assert.equal(i.snapshot("facebook.com",true).providers.length,0);
 assert.equal(i.snapshot("instagram.com",true).providers.length,1);
 for(let k=0;k<180;k++)i.observeProvider("reddit.com","cdn"+k+".example.org","allowed",true);
 assert.ok(i.snapshot("reddit.com",true).providers.length<=60);
 assert.ok(i.snapshot("reddit.com",true).providers.every(row=>row.type==="unknown"));
});
test("Build 282 Yandex identification does not enable unsupported APIs",()=>{
 const f=(ua,dnr)=>({chrome:{runtime:{getManifest:()=>({manifest_version:3})},
  declarativeNetRequest:dnr?{updateDynamicRules(){}}:undefined},
  navigator:{userAgent:ua}});
 const only=Compat.inspect(f("YaBrowser/24.10",false));
 assert.equal(only.browser,"yandex");
 assert.equal(only.family,"chromium");
 assert.equal(only.networkBackend,"unavailable");
 assert.equal(Compat.requireNetworkBackend(only).ready,false);
 const eligible=Compat.inspect(f("Chrome/123 YaBrowser/24",true));
 assert.equal(eligible.browser,"yandex");
 assert.equal(eligible.networkBackend,"declarative-net-request");
 const ff={browser:{runtime:{getBrowserInfo(){},getManifest:()=>({
  manifest_version:2,permissions:["webRequestBlocking"]})},
  webRequest:{onBeforeRequest:{addListener(){}}}}};
 assert.equal(Compat.inspect(ff).networkBackend,"blocking-webrequest");
});
test("Build 282 integrated files stay in the one Firefox source",()=>{
 const manifest=require("../src/manifest.json"),pkg=require("../package.json");
 const background=manifest.background.scripts,content=manifest.content_scripts[0].js;
 assert.equal(manifest.version,pkg.version);
 assert.equal(pkg.version,"0.3.252");
 assert.ok(background.indexOf("nesty-intelligence.js")<background.indexOf("background.js"));
 assert.ok(background.indexOf("adaptive-dispatcher.js")<background.indexOf("nesty-intelligence.js"));
 assert.ok(content.indexOf("nesty-intelligence.js")<content.indexOf("meta-module.js"));
 assert.ok(!manifest.permissions.includes("declarativeNetRequest"));
 const candidate=fs.readFileSync(path.resolve(__dirname,"../scripts/package-orion-candidate.py"),"utf8");
 assert.match(candidate,/"nesty-intelligence.js"/);
 const targets=require("../platform/targets.json");
 assert.equal(targets.experimental_targets["yandex-desktop"].status,"adapter-required-unverified");
 assert.equal(targets.experimental_targets["orion-ios"].mode,"dom-only");
});
