"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict"),
 fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
const TEAM=require("../src/nesty-team.js");
const Trap=require("../src/popup-trap.js");
const Original=require("../src/original-tab-guard.js");
const Meta=require("../src/meta-agent-nesty.js");
const CookieIntel=require("../src/cookie-intelligence.js");
const P="..";
function read(p){return fs.readFileSync(path.join(__dirname,P,p),"utf8");}
test("Build 275: three named specialists own distinct areas and IDs are unique",()=>{
 assert.deepEqual(TEAM.all().map(x=>x.title),[
  "Nesty Cookie Watch","Nesty Popup Guard","Nesty Meta Ad Scout"]);
 assert.equal(new Set(TEAM.all().map(x=>x.id)).size,3);
 assert.equal(new Set(TEAM.all().map(x=>x.key)).size,3);
 assert.ok(TEAM.all().every(x=>Object.isFrozen(x)&&Object.isFrozen(x.methods)&&Object.isFrozen(x.legacyIds)));
 assert.equal(Object.isFrozen(TEAM.all()),true);
 assert.equal(TEAM.byKey("made-up"),null);
 assert.equal(TEAM.byId("agent_nesty_999"),null);
});
test("Build 275: all eleven legacy numeric IDs map to exactly one named specialist",()=>{
 for(let i=1;i<=5;i++)
  assert.equal(TEAM.byId("agent_nesty_"+i)?.key,i<=3?"cookie":"popup");
 for(let i=1;i<=6;i++)
  assert.equal(TEAM.byId("agent_nesty_meta_"+String(i).padStart(2,"0"))?.key,"meta");
 assert.equal(TEAM.byId("nesty_popup_guard"),TEAM.byKey("popup"));
});
test("Build 275: compatibility exports stay stable while public names are role based",()=>{
 assert.equal(Trap.NESTY_4.id,"agent_nesty_4");
 assert.equal(Original.NESTY_5.id,"agent_nesty_5");
 assert.equal(Trap.SPECIALIST.title,"Nesty Popup Guard");
 assert.equal(Original.SPECIALIST.title,"Nesty Popup Guard");
 assert.equal(Meta.SPECIALIST.title,"Nesty Meta Ad Scout");
 for(let i=1;i<=6;i++)assert.ok(Meta.agents.some(x=>x.id==="agent_nesty_meta_"+String(i).padStart(2,"0")));
});
test("Build 275: Cookie Watch keeps three independent event inputs and only actual armed states",()=>{
 const sandbox={module:{exports:{}},globalThis:{DKCookieIntelligence:CookieIntel,DKNestyTeam:TEAM}};
 vm.runInNewContext(read("src/cookie-sentinels.js"),sandbox);
 const Cookie=sandbox.module.exports;
 assert.deepEqual(Array.from(Cookie.AGENTS,x=>x.id),["agent_nesty_1","agent_nesty_2","agent_nesty_3"]);
 const watch=Cookie.create(()=>true);
 assert.equal(watch.specialist().title,"Nesty Cookie Watch");
 assert.deepEqual(Array.from(watch.handlers(),x=>x.armed),[true,false,false]);
});
test("Build 275: original-tab takeover has one verdict and retains safety conditions",()=>{
 const t=1700000000000,map=new Map();
 const base=(url,extra={})=>({type:"main_frame",tabId:11,url,method:"GET",...extra});
 assert.equal(Original.evaluateTakeover(map,base("https://ad.example/"),"xnxx.com",true,true,false,t),null);
 Original.note(map,11,12,"xnxx.com","about:blank",t);
 assert.equal(Original.evaluateTakeover(map,base("https://stripchat.com/"),"xnxx.com",true,false,false,t+100),"known-destination");
 assert.equal(Original.evaluateTakeover(map,base("https://new-ad.example/"),"xnxx.com",true,true,false,t+100),null);
 assert.equal(Original.confirmVideo(map,12,"https://www.xnxx.com/video-123",t+200),true);
 assert.equal(Original.evaluateTakeover(map,base("https://new-ad.example/"),"xnxx.com",true,true,false,t+300),"confirmed-video");
 assert.equal(Original.evaluateTakeover(map,base("https://new-ad.example/"),"xnxx.com",true,false,false,t+300),null);
 assert.equal(Original.evaluateTakeover(map,base("https://new-ad.example/"),"xnxx.com",true,true,true,t+300),null);
 assert.equal(Original.evaluateTakeover(map,base("https://new-ad.example/",{type:"sub_frame"}),"xnxx.com",true,true,false,t+300),null);
 assert.equal(Original.evaluateTakeover(map,base("https://new-ad.example/",{originUrl:"https://news.example.org/"}),"xnxx.com",true,true,false,t+300),null);
 assert.equal(Original.evaluateTakeover(map,base("https://new-ad.example/"),"xnxx.com",true,true,false,t+5000),null);
});
test("Build 275: runtime manifest orders the catalog before both cookie and Meta consumers",()=>{
 const manifest=require("../src/manifest.json");
 const b=manifest.background.scripts,c=manifest.content_scripts[0].js;
 assert.ok(b.indexOf("nesty-team.js")>=0&&b.indexOf("nesty-team.js")<b.indexOf("cookie-sentinels.js"));
 assert.ok(c.indexOf("nesty-team.js")>=0&&c.indexOf("nesty-team.js")<c.indexOf("meta-agent-nesty.js"));
 assert.equal(manifest.version,require("../package.json").version);
});
test("Build 275: numbered runtime log labels are retired; old APIs and settings untouched",()=>{
 const background=read("src/background.js"),cookieUI=read("src/cookie-agents-ui.js");
 assert.doesNotMatch(background,/Agent Nesty [45] (?:source-linked|popup)|\[Agent Nesty 5:/);
 assert.match(background,/Nesty Popup Guard: source-linked foreign popup/);
 assert.match(cookieUI,/d\.specialist\?\.title/);
 for(const action of ["getAgentNestyCookieIntel","clearAgentNestyCookieIntel","permitNextPopupTab"])
  assert.ok(background.includes(action));
 for(const key of ["strictPopupSites","popupTrapPermits","originalTabGuard","nestyPopupLinks"])
  assert.ok(background.includes(key));
});
