"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
const root=path.resolve(__dirname,"../src"),manifest=JSON.parse(fs.readFileSync(path.join(root,"manifest.json"),"utf8"));
async function setup(){
 const events={},reg=n=>({addListener:f=>events[n]=f,removeListener:()=>{}});
 let stored={settings:{autoUpdate:false,autoYouTubeRules:false}},tabs=new Map([
  [1,"https://news.example.org/article?secret=PRIVATE"],
  [2,"https://second.example.net/page"],
  [3,"https://shop.news.example.org/"]]),reloads=0;
 const browser={webRequest:{onBeforeRequest:reg("before"),onErrorOccurred:reg("error"),
  onCompleted:reg("completed"),onBeforeRedirect:reg("redirect")},
  proxy:{onRequest:reg("proxy"),onError:reg("proxyError")},
  dns:{resolve:async()=>({addresses:[]})},
  webNavigation:{onCreatedNavigationTarget:reg("newTab")},
  tabs:{onUpdated:reg("updated"),onRemoved:reg("removed"),onCreated:reg("created"),
   query:async()=>[...tabs].map(([id,url])=>({id,url})),
   get:async id=>{if(!tabs.has(id))throw Error("Tab closed");return {id,url:tabs.get(id)};},
   sendMessage:async()=>{},reload:async()=>{reloads++;},remove:async()=>{}},
  alarms:{onAlarm:reg("alarm"),create:async()=>{}},
  contextMenus:{create:()=>{},onClicked:reg("context"),update:async()=>{}},
  browserAction:{setBadgeText:async()=>{},setBadgeBackgroundColor:async()=>{}},
  runtime:{onMessage:reg("message")},
  storage:{local:{get:async()=>stored,set:async x=>{stored={...stored,...x};}}}};
 const timeout=(fn,ms,...args)=>{const t=setTimeout(fn,ms,...args);if(ms>=60000)t.unref();return t;};
 const context=vm.createContext({browser,URL,console,Date,AbortController,TextEncoder,TextDecoder,
  setTimeout:timeout,clearTimeout,fetch:async()=>{throw Error("No live network in tests");}});
 for(const script of manifest.background.scripts)
  vm.runInContext(fs.readFileSync(path.join(root,script),"utf8"),context,{filename:script});
 await new Promise(resolve=>setTimeout(resolve,35));
 return {events,tabs,stored:()=>stored};
}
const source={tab:{id:1,url:"https://news.example.org/article?secret=PRIVATE"},url:"https://news.example.org/article?secret=PRIVATE",frameId:0};
test("pausing optional cookie cleanup on one site leaves network ads blocked elsewhere and on this site",async()=>{
 const {events,stored}=await setup();
 const before=events.before({requestId:"a",tabId:1,type:"script",
  url:"https://doubleclick.net/ad.js",documentUrl:source.url});
 assert.equal(before.cancel,true);
 const r=await events.message({action:"setSiteFeaturePaused",tabId:1,
  feature:"cookieReject",paused:true,url:"https://evil.example/"});
 assert.equal(r.ok,true);
 assert.deepEqual(Array.from(stored().settings.cookieRejectPaused),["news.example.org"]);
 assert.doesNotMatch(JSON.stringify(stored().settings.cookieRejectPaused),/PRIVATE|evil|article/);
 const after=await events.message({action:"getStyle"},source);
 assert.equal(after.cookieReject,false);
 assert.equal(after.distractionControl,true);
 assert.equal(after.active,true);
 const other=await events.message({action:"getStyle"},{
  tab:{id:2,url:"https://second.example.net/"},url:"https://second.example.net/",frameId:0});
 assert.equal(other.cookieReject,true);
 assert.equal(events.before({requestId:"b",tabId:1,type:"script",
  url:"https://doubleclick.net/other.js",documentUrl:source.url}).cancel,true);
});
test("distraction pause applies to subdomains and can be reverted independently",async()=>{
 const {events}=await setup();
 const first=await events.message({action:"setSiteFeaturePaused",tabId:1,feature:"distractionControl",paused:true});
 assert.equal(first.ok,true);
 const shop=await events.message({action:"getStyle"},{
  tab:{id:3,url:"https://shop.news.example.org/"},url:"https://shop.news.example.org/",frameId:0});
 assert.equal(shop.distractionControl,false);
 assert.equal(shop.cookieReject,true);
 const all=await events.message({action:"getSiteFeatureExceptions"});
 assert.deepEqual(Array.from(all.distractionControl),["news.example.org"]);
 const reset=await events.message({action:"setSiteFeaturePaused",tabId:3,feature:"distractionControl",paused:false});
 assert.equal(reset.ok,true);
 assert.equal((await events.message({action:"getStyle"},{
  tab:{id:3,url:"https://shop.news.example.org/"},url:"https://shop.news.example.org/",frameId:0})).distractionControl,true);
});
test("site scripts cannot change exceptions, and forged or internal URLs are rejected",async()=>{
 const {events,tabs}=await setup();
 for(const action of ["setSiteFeaturePaused","getSiteFeatureExceptions","removeSiteFeatureException"]){
  const r=await events.message({action,tabId:1,feature:"cookieReject",paused:true,site:"news.example.org"},source);
  assert.match(r.error,/extension interface/i);
 }
 tabs.set(1,"about:config");
 const result=await events.message({action:"setSiteFeaturePaused",tabId:1,
  feature:"cookieReject",paused:true,url:"https://news.example.org/"});
 assert.match(result.error,/regular websites/i);
 assert.equal((await events.message({action:"setSiteFeaturePaused",tabId:2,
  feature:"unknown",paused:true})).ok,undefined);
});
test("settings API can remove exactly one site exception",async()=>{
 const {events}=await setup();
 for(const feature of ["cookieReject","distractionControl"])
  await events.message({action:"setSiteFeaturePaused",tabId:1,feature,paused:true});
 const result=await events.message({action:"removeSiteFeatureException",
  feature:"cookieReject",site:"news.example.org"});
 assert.equal(result.ok,true);
 const remaining=await events.message({action:"getSiteFeatureExceptions"});
 assert.deepEqual(Array.from(remaining.cookieReject),[]);
 assert.deepEqual(Array.from(remaining.distractionControl),["news.example.org"]);
});

test("Build 59 dashboard snapshot uses actual tab, host-only entries and current settings",async()=>{
 const {events,tabs}=await setup();
 const current=await events.message({action:"getSiteDashboard",tabId:1,
  url:"https://evil.test/private?SECRET=1"});
 assert.equal(current.ok,true);
 assert.equal(current.site,"news.example.org");
 assert.equal(current.globalEnabled,true);
 assert.equal(current.cookieRejectEnabled,true);
 assert.equal(current.siteActive,true);
 assert.deepEqual(Array.from(current.recentBlocks),[]);
 assert.equal(JSON.stringify(current).includes("SECRET"),false);
 assert.equal(JSON.stringify(current).includes("private?"),false);
 const paused=await events.message({action:"setSiteFeaturePaused",tabId:1,
  feature:"cookieReject",paused:true});
 assert.equal(paused.ok,true);
 const updated=await events.message({action:"getSiteDashboard",tabId:1});
 assert.equal(updated.cookieRejectPaused,true);
});
test("Build 59 dashboard cannot be spoofed by a page script or stale internal tab",async()=>{
 const {events,tabs}=await setup();
 const sender={tab:{id:1,url:"https://news.example.org/"},
  url:"https://news.example.org/"};
 const forbidden=await events.message({action:"getSiteDashboard",tabId:1},sender);
 assert.match(forbidden.error,/extension interface/i);
 tabs.set(1,"about:config");
 const internal=await events.message({action:"getSiteDashboard",tabId:1,
  url:"https://news.example.org/private"});
 assert.match(internal.error,/HTTP\(S\)/);
});
test("Build 59 dashboard inventory reflects narrow request and explicit host exceptions",async()=>{
 const {events}=await setup();
 const allowed=await events.message({action:"allowHost",url:"https://news.example.org/",
  host:"ads.example.org"});
 assert.equal(allowed.ok,true);
 const snap=await events.message({action:"getSiteDashboard",tabId:1});
 assert.deepEqual(Array.from(snap.customAllowances),["ads.example.org"]);
 assert.deepEqual(Array.from(snap.requestAllowances),[]);
 assert.equal(snap.requestLog,true);
});
