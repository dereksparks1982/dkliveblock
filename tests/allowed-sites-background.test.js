"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
const root=path.resolve(__dirname,"../src");
const manifest=JSON.parse(fs.readFileSync(path.join(root,"manifest.json"),"utf8"));
async function setup(){
 const hooks={},reg=name=>({addListener(fn){hooks[name]=fn;},removeListener(){}});
 let persisted={settings:{autoUpdate:false,autoYouTubeRules:false}},tabs=new Map([
  [1,"https://www.example.org/news?token=PRIVATE"],
  [2,"https://unrelated.test/page"],
  [3,"https://shop.example.org/"]]);
 const browser={
  webRequest:{onBeforeRequest:reg("before"),onErrorOccurred:reg("error"),
   onCompleted:reg("completed"),onBeforeRedirect:reg("redirect")},
  proxy:{onRequest:reg("proxy"),onError:reg("proxyError")},
  dns:{resolve:async()=>({addresses:[]})},
  webNavigation:{onCreatedNavigationTarget:reg("nav")},
  tabs:{onCreated:reg("created"),onUpdated:reg("updated"),onRemoved:reg("removed"),
   get:async id=>{if(!tabs.has(id))throw Error("missing tab");return {id,url:tabs.get(id)};},
   query:async()=>[...tabs].map(([id,url])=>({id,url})),
   sendMessage:async()=>{},reload:async()=>{},remove:async()=>{}},
  alarms:{onAlarm:reg("alarm"),create:async()=>{}},
  runtime:{onMessage:reg("message")},
  contextMenus:{create:()=>{},update:async()=>{},onClicked:reg("menu")},
  browserAction:{setBadgeText:async()=>{},setBadgeBackgroundColor:async()=>{}},
  storage:{local:{get:async()=>persisted,set:async x=>{persisted={...persisted,...x};}}}
 };
 const timeout=(fn,ms,...a)=>{const t=setTimeout(fn,ms,...a);if(ms>=60000)t.unref();return t;};
 const context=vm.createContext({browser,URL,TextEncoder,TextDecoder,console,Date,AbortController,
  setTimeout:timeout,clearTimeout,fetch:async()=>{throw Error("No test internet");}});
 for(const source of manifest.background.scripts)
  vm.runInContext(fs.readFileSync(path.join(root,source),"utf8"),context,{filename:source});
 await new Promise(r=>setTimeout(r,30));
 return {hooks,tabs,persisted:()=>persisted};
}
function req(tabId,pageHost){return {tabId,type:"image",requestId:"block"+Math.random(),
 url:"https://doubleclick.net/ad.gif",documentUrl:"https://"+pageHost+"/"};}
test("one-click allowlist persists and does not disable unrelated websites",async()=>{
 const {hooks,persisted}=await setup();
 assert.equal(hooks.before(req(1,"www.example.org")).cancel,true);
 assert.equal(hooks.before(req(2,"unrelated.test")).cancel,true);
 const added=await hooks.message({action:"setSiteAllowed",tabId:1,allowed:true,url:"https://evil.test/"});
 assert.equal(added.ok,true);
 assert.equal(added.sitePaused,true);
 assert.equal(added.allowlistMatch,"www.example.org");
 assert.deepEqual(Array.from(persisted().settings.paused),["www.example.org"]);
 assert.equal(hooks.before(req(1,"www.example.org")).cancel,undefined);
 assert.equal(hooks.before(req(2,"unrelated.test")).cancel,true);
 const saved=await hooks.message({action:"getAllowedSites"});
 assert.deepEqual(Array.from(saved),["www.example.org"]);
 const restored=await hooks.message({action:"setSiteAllowed",tabId:1,allowed:false});
 assert.equal(restored.ok,true);
 assert.equal(hooks.before(req(1,"www.example.org")).cancel,true);
});
test("manage allowed sites by URL strips private path and covers subdomains",async()=>{
 const {hooks,persisted,tabs}=await setup();
 const added=await hooks.message({action:"addAllowedSite",site:"https://example.org/private?token=KEEP_SECRET"});
 assert.equal(added.ok,true);
 assert.deepEqual(Array.from(added.sites),["example.org"]);
 assert.doesNotMatch(JSON.stringify(persisted().settings.paused),/private|KEEP_SECRET/);
 assert.equal(hooks.before(req(3,"shop.example.org")).cancel,undefined);
 assert.equal(hooks.before(req(2,"unrelated.test")).cancel,true);
 const sub=await hooks.message({action:"setSiteAllowed",tabId:3,allowed:false});
 assert.equal(sub.ok,true);
 assert.deepEqual(Array.from(sub.allowlistMatch||""),[]);
 assert.equal(hooks.before(req(3,"shop.example.org")).cancel,true);
});
test("content scripts and nonweb tab URLs cannot mutate site allowances",async()=>{
 const {hooks,tabs}=await setup();
 const sender={tab:{id:1,url:"https://www.example.org/"},url:"https://www.example.org/"};
 for(const action of ["getAllowedSites","addAllowedSite","removeAllowedSite","setSiteAllowed"]){
  const result=await hooks.message({action,tabId:1,site:"example.org",allowed:true},sender);
  assert.match(result.error,/extension interface/i);
 }
 tabs.set(1,"about:config");
 const attempt=await hooks.message({action:"setSiteAllowed",tabId:1,allowed:true,url:"https://www.example.org/"});
 assert.match(attempt.error,/HTTP\(S\)/);
 const removed=await hooks.message({action:"removeAllowedSite",site:"example.org"});
 assert.match(removed.error,/not in the allowlist/i);
});

test("allowlisted GitHub-style requests are counted; observed exact host/type can be blocked and unblocked",async()=>{
 const {hooks,tabs,persisted}=await setup();
 tabs.set(1,"https://github.com/dereksparks1982/dkliveblock");
 hooks.updated(1,{url:tabs.get(1),status:"loading"},{url:tabs.get(1)});
 assert.equal((await hooks.message({action:"setSiteAllowed",tabId:1,allowed:true})).ok,true);
 const resource={requestId:"github-pixel-1",tabId:1,type:"image",
  url:"https://avatars.githubusercontent.com/u/42.png?token=SECRET",documentUrl:tabs.get(1),method:"GET"};
 assert.equal(hooks.before(resource).cancel,undefined);
 hooks.completed({...resource,statusCode:200});
 const stats=await hooks.message({action:"status",tabId:1,url:tabs.get(1)});
 assert.equal(stats.allowedRequests,1);
 const dashboard=await hooks.message({action:"getSiteDashboard",tabId:1});
 assert.equal(dashboard.allowedRequests,1);
 assert.equal(dashboard.allowedGroups[0].host,"avatars.githubusercontent.com");
 assert.equal(dashboard.allowedGroups[0].count,1);
 assert.doesNotMatch(JSON.stringify(dashboard.allowedGroups),/SECRET|42\.png/);
 const unobserved=await hooks.message({action:"setSelectiveBlock",tabId:1,
  expectedSite:"github.com",host:"doubleclick.net",type:"script",block:true,confirm:true});
 assert.match(unobserved.error,/not observed/i);
 const allowed=await hooks.message({action:"setSelectiveBlock",tabId:1,
  expectedSite:"github.com",host:"avatars.githubusercontent.com",type:"image",block:true,confirm:true});
 assert.equal(allowed.ok,true);
 assert.equal(persisted().manualBlocks.length,1);
 assert.equal(hooks.before({...resource,requestId:"github-pixel-2"}).cancel,true);
 assert.equal(hooks.before({...resource,requestId:"github-js-3",type:"script"}).cancel,undefined);
 assert.equal(hooks.before({...resource,requestId:"github-nav-4",type:"main_frame"}).cancel,undefined);
 const rev=await hooks.message({action:"setSelectiveBlock",tabId:1,
  expectedSite:"github.com",host:"avatars.githubusercontent.com",type:"image",block:false});
 assert.equal(rev.ok,true);
 assert.equal(hooks.before({...resource,requestId:"github-pixel-5"}).cancel,undefined);
 const invalid=await hooks.message({action:"setSelectiveBlock",tabId:1,
  expectedSite:"evil.github.com",host:"avatars.githubusercontent.com",type:"image",block:true,confirm:true});
 assert.match(invalid.error,/changed websites/i);
});
