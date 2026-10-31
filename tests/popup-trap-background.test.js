"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
const dir=path.resolve(__dirname,"../src");
const manifest=JSON.parse(fs.readFileSync(path.join(dir,"manifest.json"),"utf8"));
async function environment(){
 const callbacks={},removed=[],badges=[];
 const reg=name=>({addListener(fn){callbacks[name]=fn;},removeListener(){}});
 let settings={autoUpdate:false,strictPopupSites:true};
 const originalUrls=new Map([[1,"https://thepiratebay.org/search/linux"],
  [2,"https://news.example.org/"],[3,"https://1337x.to/category/Movies/"]]);
 const browser={
  tabs:{onCreated:reg("created"),onUpdated:reg("updated"),onRemoved:reg("removed"),
   query:async()=>[...originalUrls].map(([id,url])=>({id,url})),
   get:async id=>{if(!originalUrls.has(id))throw Error("tab not found");return {id,url:originalUrls.get(id)};},
   remove:async id=>removed.push(id),sendMessage:async()=>{},reload:async()=>{}},
  webNavigation:{onCreatedNavigationTarget:reg("navigation")},
  webRequest:{onBeforeRequest:reg("request"),onErrorOccurred:reg("failure"),
   onCompleted:reg("completed"),onBeforeRedirect:reg("redirect")},
  proxy:{onRequest:reg("proxy"),onError:reg("proxyError")},
  dns:{resolve:async()=>({addresses:[]})},
  alarms:{onAlarm:reg("alarm"),create:async()=>{}},
  runtime:{onMessage:reg("message")},
  browserAction:{setBadgeText:async args=>badges.push(args),
   setBadgeBackgroundColor:async()=>{},setBadgeTextColor:async()=>{}},
  storage:{local:{get:async()=>({settings}),set:async payload=>{if(payload.settings)settings=payload.settings;}}}
 };
 const timeout=(fn,ms,...args)=>{const timer=setTimeout(fn,ms,...args);if(ms>=60000)timer.unref();return timer;};
 const ctx=vm.createContext({browser,URL,console,AbortController,Date,
  TextEncoder,TextDecoder,fetch:async()=>{throw Error("Unexpected list fetch")},
  setTimeout:timeout,clearTimeout});
 for(const script of manifest.background.scripts)
  vm.runInContext(fs.readFileSync(path.join(dir,script),"utf8"),ctx,{filename:script});
 await new Promise(resolve=>setTimeout(resolve,25));
 const flush=()=>new Promise(resolve=>setTimeout(resolve,1));
 return {callbacks,removed,badges,flush,originalUrls};
}
test("Pirate Bay blank popunder is closed and counted once, with early network cancellation",async()=>{
 const {callbacks,removed,badges,flush}=await environment();
 callbacks.created({id:12,openerTabId:1,url:"about:blank"});
 const blocked=callbacks.request({requestId:"r12",url:"https://scam.example/new?secret=1",
  tabId:12,type:"main_frame"});
 assert.equal(blocked.cancel,true);
 await flush();
 assert.deepEqual(removed,[12]);
 await callbacks.navigation({sourceTabId:1,tabId:12,url:"https://different-scam.example/"});
 await flush();
 assert.deepEqual(removed,[12]);
 const stat=await callbacks.message({action:"status",tabId:1,url:"https://thepiratebay.org/"});
 assert.equal(stat.strictPopupEnabled,true);
 assert.equal(stat.strictPopupBlocked,1);
 assert.equal(stat.tabBlocked,1);
 assert.ok(badges.some(item=>item.tabId===1&&item.text==="1"));
});
test("1337x opens an unrelated tab only when user explicitly grants one next tab",async()=>{
 const {callbacks,removed,flush}=await environment();
 assert.equal((await callbacks.message({action:"permitNextPopupTab",tabId:3})).ok,true);
 callbacks.created({id:20,openerTabId:3,url:"about:blank"});
 await callbacks.navigation({sourceTabId:3,tabId:20,url:"https://legitimate.example/documentation"});
 await flush();
 assert.equal(removed.includes(20),false);
 callbacks.created({id:21,openerTabId:3,url:"about:blank"});
 await flush();
 assert.equal(removed.includes(21),true);
 const stat=await callbacks.message({action:"status",tabId:3,url:"https://1337x.to"});
 assert.equal(stat.strictPopupBlocked,1);
});
test("ordinary website tabs and source-less browser tabs remain untouched",async()=>{
 const {callbacks,removed,flush}=await environment();
 callbacks.created({id:30,openerTabId:2,url:"https://legitimate.example"});
 callbacks.created({id:31,url:"about:blank"});
 await flush();
 assert.deepEqual(removed,[]);
 const response=await callbacks.message({action:"permitNextPopupTab",tabId:2});
 assert.match(response.error,/not active/);
});
test("global setting and site pause disable site-specific aggressive protection",async()=>{
 const {callbacks,removed,flush}=await environment();
 const changed=await callbacks.message({action:"saveSettings",settings:{strictPopupSites:false}});
 assert.equal(changed.ok,true);
 callbacks.created({id:40,openerTabId:1,url:"about:blank"});
 await flush();
 assert.deepEqual(removed,[]);
 const reenabled=await callbacks.message({action:"saveSettings",settings:{strictPopupSites:true}});
 assert.equal(reenabled.ok,true);
 await callbacks.message({action:"toggleTabPause",tabId:1,url:"https://thepiratebay.org",paused:true});
 callbacks.created({id:41,openerTabId:1,url:"about:blank"});
 await flush();
 assert.deepEqual(removed,[]);
});
test("navigation-target fallback catches popups without opener metadata",async()=>{
 const {callbacks,removed,flush}=await environment();
 await callbacks.navigation({sourceTabId:1,tabId:50,url:"https://rotating-ad.example/"});
 await flush();
 assert.deepEqual(removed,[50]);
});
test("a content script cannot grant a popup exception",async()=>{
 const {callbacks}=await environment();
 const result=await callbacks.message({action:"permitNextPopupTab",tabId:1},
  {tab:{id:1,url:"https://thepiratebay.org/"},url:"https://thepiratebay.org/"});
 assert.match(result.error,/extension interface/i);
});

test("blocked popunder history records only observed host and allows privacy clearing",async()=>{
 const {callbacks,flush}=await environment();
 callbacks.created({id:111,openerTabId:1,url:"about:blank"});
 await flush();
 let rows=await callbacks.message({action:"getPopupHistory",tabId:1});
 assert.equal(rows.length,1);
 assert.equal(rows[0].destinationHost,"");
 assert.match(rows[0].detail,/Destination not observed/);
 await callbacks.navigation({sourceTabId:1,tabId:111,url:"https://rotating-ad.test/go?PRIVATE_TOKEN=1"});
 rows=await callbacks.message({action:"getPopupHistory",tabId:1});
 assert.equal(rows.length,1);
 assert.equal(rows[0].destinationHost,"rotating-ad.test");
 assert.doesNotMatch(JSON.stringify(rows),/PRIVATE_TOKEN|\/go\?/);
 const other=await callbacks.message({action:"getPopupHistory",tabId:2});
 assert.equal(other.length,0);
 const cleared=await callbacks.message({action:"clearPopupHistory",tabId:1});
 assert.equal(cleared.ok,true);
 assert.equal((await callbacks.message({action:"getPopupHistory",tabId:1})).length,0);
});
test("private request logging disabled prevents popup history recording",async()=>{
 const {callbacks,flush}=await environment();
 await callbacks.message({action:"saveSettings",settings:{requestLog:false}});
 callbacks.created({id:112,openerTabId:3,url:"about:blank"});
 await flush();
 const rows=await callbacks.message({action:"getPopupHistory",tabId:3});
 assert.deepEqual(Array.from(rows),[]);
});
test("content scripts cannot read or erase popup history",async()=>{
 const {callbacks}=await environment();
 const sender={tab:{id:1,url:"https://thepiratebay.org/"},url:"https://thepiratebay.org/"};
 for(const action of ["getPopupHistory","clearPopupHistory"]){
  const result=await callbacks.message({action,tabId:1},sender);
  assert.match(result.error,/extension interface/i);
 }
});

test("Build 58 stale cached source cannot authorize closing new tab",async()=>{
 const {callbacks,originalUrls,removed,flush}=await environment();
 originalUrls.set(1,"https://news.example.org/");
 callbacks.created({id:145,openerTabId:1,url:"about:blank"});
 await flush();
 assert.equal(removed.includes(145),false);
});
test("Build 58 strict blocked count persists across same-site reload",async()=>{
 const {callbacks,originalUrls,flush}=await environment();
 callbacks.created({id:146,openerTabId:1,url:"about:blank"});
 await flush();
 let s=await callbacks.message({action:"status",tabId:1,url:originalUrls.get(1)});
 assert.equal(s.strictPopupBlocked,1);
 callbacks.updated(1,{status:"loading"},{url:originalUrls.get(1)});
 s=await callbacks.message({action:"status",tabId:1,url:originalUrls.get(1)});
 assert.equal(s.strictPopupBlocked,1);
});

test("Build 113 tab closure invalidates old strict-popunder claim before ID reuse",async()=>{
 const {callbacks,removed,flush}=await environment();
 callbacks.created({id:75,openerTabId:1,url:"about:blank"});
 await flush();
 assert.ok(removed.includes(75));
 callbacks.removed(75);
 const outcome=callbacks.request({requestId:"reuse-75",
  url:"https://ordinary.example/start",tabId:75,type:"main_frame"});
 assert.notEqual(outcome.cancel,true,
  "reused tab ID must not inherit the already closed popunder's claim");
});
test("Build 113 a closed tab cannot keep an old one-time popup grant",async()=>{
 const {callbacks,removed,flush,originalUrls}=await environment();
 originalUrls.delete(3);
 callbacks.removed(3);
 callbacks.created({id:76,openerTabId:3,url:"about:blank"});
 await flush();
 assert.equal(removed.includes(76),false,
  "closed source must not permit or block new tabs without a live protected source");
});
