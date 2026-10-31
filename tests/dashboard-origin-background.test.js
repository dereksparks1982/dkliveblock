"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
test("extension-tab dashboard reads each of three YouTube blocks, while content scripts cannot",async()=>{
 const handlers={},reg=name=>({addListener(fn){handlers[name]=fn;},removeListener(){}});
 let stored={settings:{autoUpdate:false,autoYouTubeRules:false}};
 const page={id:15,url:"https://www.youtube.com/watch?v=example"};
 const origin="moz-extension://dk-test-uuid/";
 const browser={
  webRequest:{onBeforeRequest:reg("network"),onErrorOccurred:reg("networkError")},
  webNavigation:{onCreatedNavigationTarget:reg("popup")},
  proxy:{onRequest:reg("proxy"),onError:reg("proxyError")},dns:{resolve:async()=>({addresses:[]})},
  tabs:{onUpdated:reg("updated"),onRemoved:reg("removed"),query:async()=>[page],
   get:async id=>id===15?page:{id:80,url:origin+"site-dashboard.html?tab=15"},
   sendMessage:async()=>{},reload:async()=>{}},
  alarms:{onAlarm:reg("alarm"),create:async()=>{}},
  browserAction:{setBadgeText:async()=>{},setBadgeBackgroundColor:async()=>{}},
  runtime:{getURL:relative=>origin+relative,onMessage:reg("message")},
  storage:{local:{get:async()=>stored,set:async value=>{stored={...stored,...value};}}}
 };
 const timer=(fn,ms,...args)=>{const t=setTimeout(fn,ms,...args);if(ms>=60000)t.unref();return t;};
 const ctx=vm.createContext({browser,URL,TextEncoder,TextDecoder,console,Date,AbortController,
  setTimeout:timer,clearTimeout,fetch:async()=>{throw Error("Unexpected network access");}});
 const root=path.resolve(__dirname,"../src");
 const manifest=JSON.parse(fs.readFileSync(path.join(root,"manifest.json"),"utf8"));
 for(const filename of manifest.background.scripts)
  vm.runInContext(fs.readFileSync(path.join(root,filename),"utf8"),ctx,{filename});
 await new Promise(resolve=>setTimeout(resolve,50));
 for(const [url,type] of [
  ["https://doubleclick.net/one.js","script"],
  ["https://googlesyndication.com/two.png","image"],
  ["https://doubleclick.net/three.js","script"]]){
  assert.equal(handlers.network({tabId:15,url,type,documentUrl:page.url}).cancel,true);
 }
 const extensionSender={tab:{id:80,url:origin+"site-dashboard.html?tab=15"},
  url:origin+"site-dashboard.html?tab=15"};
 const view=await handlers.message({action:"getSiteDashboard",tabId:15},extensionSender);
 assert.equal(view.ok,true,view.error);
 assert.equal(view.site,"www.youtube.com");
 assert.equal(view.blocked,3);
 assert.equal(view.tabId,15);
 assert.equal(view.requestLog,true);
 assert.equal(view.recentBlocks.length,3);
 assert.deepEqual(Array.from(view.recentBlocks,row=>row.sequence),[3,2,1]);
 assert.equal(view.recentBlocks[0].ruleEvidence.pattern,"||doubleclick.net^");
 assert.match(view.recentBlocks[1].ruleEvidence.source,/Native network filter/);
 assert.deepEqual(Array.from(view.recentBlocks,row=>row.host),
  ["doubleclick.net","googlesyndication.com","doubleclick.net"]);
 assert.equal(JSON.stringify(view.recentBlocks).includes("one.js"),false);
 const websiteSender={tab:{id:15,url:page.url},url:page.url};
 assert.match((await handlers.message({action:"getSiteDashboard",tabId:15},websiteSender)).error,/extension interface/);
 assert.match((await handlers.message({action:"lookupBlockedDomain",tabId:15,
  host:"doubleclick.net",expectedSite:"www.youtube.com"},websiteSender)).error,/extension interface/);
 const forged={tab:{id:15,url:origin+"site-dashboard.html"},url:page.url};
 assert.match((await handlers.message({action:"getSiteDashboard",tabId:15,url:origin},forged)).error,/extension interface/);
 assert.match((await handlers.message({action:"getSiteDashboard",tabId:15},
  {tab:{id:100},url:"moz-extension://different-extension/site-dashboard.html"})).error,/extension interface/);
});
