"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
test("real OAuth popups remain open and Google sign-in resources are not blocked",async()=>{
 const listeners={},removed=[],reg=name=>({
  addListener:fn=>{listeners[name]=fn;},
  removeListener:fn=>{if(listeners[name]===fn)delete listeners[name];}
 });
 let stored={settings:{autoUpdate:false,customRules:[
  "||accounts.google.com^$popup",
  "||accounts.google.com^$script",
  "||www.google.com^$script",
  "||accounts.google.com.evil.test^$popup",
  "||doubleclick.net^$popup"
 ].join("\n")}};
 const browser={
  webRequest:{onBeforeRequest:reg("network"),onErrorOccurred:reg("networkError")},
  webNavigation:{onCreatedNavigationTarget:reg("popup")},
  proxy:{onRequest:reg("proxy"),onError:reg("proxyError")},
  dns:{resolve:async()=>({addresses:[]})},
  tabs:{onUpdated:reg("updated"),onRemoved:reg("removed"),query:async()=>[],
   get:async id=>({id,url:"https://news.test/article"}),
   remove:async id=>{removed.push(id);},sendMessage:async()=>{}},
  alarms:{onAlarm:reg("alarm"),create:async()=>{}},
  browserAction:{setBadgeText:async()=>{}},
  runtime:{onMessage:reg("message")},
  storage:{local:{get:async()=>stored,set:async data=>{stored={...stored,...data};}}}
 };
 const timer=(fn,ms)=>{const t=setTimeout(fn,ms);if(ms>=60000)t.unref();return t;};
 const context=vm.createContext({browser,URL,TextEncoder,TextDecoder,console,Date,AbortController,setTimeout:timer,clearTimeout,fetch:async()=>{throw Error("offline");}});
 for(const name of ["public-suffix.js","rules.js","engine.js","privacy.js","subscriptions.js","manual-rules.js","network-recovery.js","list-io.js","subscription-cache.js","settings.js","video-assist.js","streaming-diagnostics.js","streaming-repair.js","request-monitor.js","request-controls.js","popup-trap.js","popup-history.js","auth-protection.js","youtube-maintenance.js","video-library.js","ghostery-vendor.js","hybrid-engine.js","background.js"])
  vm.runInContext(fs.readFileSync(path.join(__dirname,"../src",name),"utf8"),context,{filename:name});
 await new Promise(resolve=>setTimeout(resolve,25));
 const make=url=>({url,tabId:1,type:"script",documentUrl:"https://news.test/article"});
 assert.equal(listeners.network(make("https://accounts.google.com/gsi/client")).cancel,undefined);
 assert.equal(listeners.network(make("https://www.google.com/pagead/script.js")).cancel,true);
 assert.equal(listeners.network(make("https://doubleclick.net/ads")).cancel,true);
 await listeners.popup({tabId:41,sourceTabId:1,url:"https://accounts.google.com/o/oauth2/v2/auth?client_id=x"});
 await listeners.popup({tabId:42,sourceTabId:1,url:"https://github.com/login/oauth/authorize?client_id=x"});
 assert.deepEqual(removed,[]);
 await listeners.popup({tabId:43,sourceTabId:1,url:"https://doubleclick.net/ads"});
 await listeners.popup({tabId:44,sourceTabId:1,url:"https://accounts.google.com.evil.test/ads"});
 assert.deepEqual(removed,[43,44]);
});
