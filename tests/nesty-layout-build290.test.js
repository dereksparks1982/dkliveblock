"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict"),
 fs=require("node:fs"),path=require("node:path");
const Team=require("../src/nesty-team.js"),Scout=require("../src/nesty-layout-scout.js");
const ROOT=path.resolve(__dirname,"..");
function metrics(extra={}){return {supportedPage:true,scannedLists:2,
 eligibleLists:1,videoTiles:3,emptyAdSlots:1,mixedLists:1,shortLists:0,
 oversizedLists:0,appliedLists:0,appliedSlots:0,scans:2,...extra};}
function scout(){return Scout.create({location:{hostname:"www.pornhub.com"}},Team);}
test("Build 290: distinct fourth specialist, original eleven legacy aliases stable",()=>{
 assert.equal(Team.all().length,4);
 assert.equal(Team.all().reduce((n,x)=>n+x.legacyIds.length,0),11);
 assert.equal(Team.byKey("layout").id,"nesty_layout_scout");
 assert.equal(Team.byId("nesty_layout_scout").title,"Nesty Layout Scout");
 assert.equal(Team.byKey("meta").id,"nesty_meta_ad_scout");
});
test("Build 290: exact-site isolated, no script for lookalikes, other services or frames",()=>{
 assert.equal(Scout.supports("pornhub.com"),true);
 for(const site of ["fakepornhub.com","pornhub.com.evil.test","xnxx.com","youtube.com"])
  assert.equal(Scout.supports(site),false);
 assert.equal(Scout.create({location:{hostname:"pornhub.com.evil.test"}},Team),null);
 const win={location:{hostname:"pornhub.com"},top:{}};
 assert.equal(Scout.create(win,Team),null);
 assert.equal(Scout.create({location:{hostname:"pornhub.com"}},{byKey:()=>null}),null);
});
test("Build 290: invalid, hostile and inconsistent metrics fail closed",()=>{
 for(const item of [null,[],{},metrics({emptyAdSlots:-1}),
  metrics({videoTiles:14000}),metrics({eligibleLists:"1"}),
  metrics({scannedLists:100}),metrics({eligibleLists:0,videoTiles:3}),
  metrics({eligibleLists:2,mixedLists:3,scannedLists:2})])
  assert.equal(Scout.normalize(item),null);
 assert.equal(scout().review(metrics({emptyAdSlots:"secret"}),{active:true}),null);
});
test("Build 290: recognized ad spaces propose existing opt-in control, never create rules",()=>{
 const s=scout(),view=s.review(metrics(),{active:true,enabled:false,picking:false});
 assert.equal(view.specialist,"nesty_layout_scout");
 assert.equal(view.finding,"manual-opt-in-candidate");
 assert.equal(view.nextStep,"consider-existing-setting");
 assert.equal(view.mode,"review-only");
 for(const key of ["executable","automaticRules","trainedModel"])
  assert.equal(view[key],false);
 assert.equal(view.visualVerificationRequired,true);
 assert.equal(typeof s.installRule,"undefined");
 assert.equal(typeof s.applyCSS,"undefined");
 assert.ok(Object.isFrozen(view));
});
test("Build 290: repeated manual counts get a capped label, not a gap victory claim",()=>{
 const s=scout();const c={active:true,enabled:false};
 for(let j=1;j<=7;j++){
  const r=s.review(metrics({scans:j}),c);
  assert.equal(r.repeatCount,Math.min(4,j));
  assert.equal(r.checks,j);
  assert.equal(r.visualVerificationRequired,true);
 }
 assert.equal(s.review(metrics({emptyAdSlots:0}),c).repeatCount,1);
 s.reset();assert.equal(s.review(metrics(),c).checks,1);
});
test("Build 290: protected states and unknown markup produce no execution authority",()=>{
 const s=scout(),m=metrics();
 assert.equal(s.review(m,{active:false}).finding,"protection-paused");
 assert.equal(s.review(m,{active:true,picking:true}).finding,"picker-active");
 assert.equal(s.review(metrics({eligibleLists:0,videoTiles:0,
  emptyAdSlots:0,mixedLists:2}),{active:true}).finding,"review-unsupported-markup");
 assert.equal(s.review(metrics({appliedLists:1,appliedSlots:1}),
  {active:true,enabled:true}).finding,"verify-visible-spacing");
 assert.equal(s.review(metrics({inspectionUnavailable:true}),
  {active:true}).finding,"inspection-unavailable");
 assert.equal(s.review(metrics({supportedPage:false,eligibleLists:0,videoTiles:0,
  emptyAdSlots:0}),{active:true}).finding,"unsupported-page");
});
test("Build 290: feature loads before content and private dashboard displays fixed recommendations",()=>{
 const manifest=require("../src/manifest.json");
 const contents=manifest.content_scripts[0].js;
 assert.ok(contents.indexOf("nesty-team.js")<contents.indexOf("nesty-layout-scout.js"));
 assert.ok(contents.indexOf("nesty-layout-scout.js")<contents.indexOf("content.js"));
 const content=fs.readFileSync(path.join(ROOT,"src/content.js"),"utf8");
 const bg=fs.readFileSync(path.join(ROOT,"src/background.js"),"utf8");
 const page=fs.readFileSync(path.join(ROOT,"src/site-dashboard.html"),"utf8");
 const js=fs.readFileSync(path.join(ROOT,"src/site-dashboard.js"),"utf8");
 assert.match(content,/layoutScout\?\.review\(summary/);
 assert.match(content,/layoutScout\?\.reset\?\.\(\)/);
 assert.match(bg,/review:response\.review\|\|null/);
 assert.equal((page.match(/id="dashboardLayoutNesty"/g)||[]).length,1);
 assert.match(js,/review\.executable===false/);
 assert.match(js,/Object\.prototype\.hasOwnProperty\.call\(reasons,review\.finding\)/);
 assert.doesNotMatch(js,/innerHTML\s*=|fetch\(|XMLHttpRequest/);
});
