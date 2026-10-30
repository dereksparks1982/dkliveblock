"use strict";
const test=require("node:test"),assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
test("content script cannot mutate settings, proxy policy or logs",async()=>{
 const handles={},reg=n=>({addListener:f=>{handles[n]=f;},removeListener:f=>{if(handles[n]===f)delete handles[n];}});
 let saved={settings:{autoUpdate:false}};
 const browser={
  webRequest:{onBeforeRequest:reg("before"),onErrorOccurred:reg("error")},
  webNavigation:{onCreatedNavigationTarget:reg("popup")},
  proxy:{onRequest:reg("proxy"),onError:reg("proxyError")},dns:{resolve:async()=>({addresses:[]})},
  tabs:{onUpdated:reg("update"),onRemoved:reg("removed"),query:async()=>[{id:1,url:"https://site.example"}],sendMessage:async()=>{}},
  alarms:{onAlarm:reg("alarm"),create:async()=>{}},
  browserAction:{setBadgeText:async()=>{}},
  runtime:{onMessage:reg("message")},
  storage:{local:{get:async()=>saved,set:async x=>{saved={...saved,...x}}}}
 };
 const setTimeoutSafe=(f,n)=>{const t=setTimeout(f,n);if(n>=60000)t.unref();return t;};
 const ctx=vm.createContext({browser,URL,console,AbortController,Date,fetch:async()=>{throw Error("Offline")},setTimeout:setTimeoutSafe,clearTimeout});
 for(const name of ["public-suffix.js","rules.js","engine.js","privacy.js","subscriptions.js","manual-rules.js","network-recovery.js","list-io.js","subscription-cache.js","settings.js","video-assist.js","auth-protection.js","background.js"])
  vm.runInContext(fs.readFileSync(path.join(__dirname,"../src",name),"utf8"),ctx,{filename:name});
 await new Promise(resolve=>setTimeout(resolve,20));
 const frame={tab:{id:1,url:"https://site.example/"},url:"https://site.example/article"};
 for(const action of ["getSettings","status","saveSettings","saveNetwork","networkStatus","dnsLookup","toggleSite","setGlobal","getLog","getNetworkIssues","updateLists","clearLog","resetStatistics","toggleTabPause","undoElementRule","toggleMediaRecovery","toggleSitePopupProtection","allowHost"]){
  const response=await handles.message({action,url:"https://other.example",tabId:100,enabled:false,settings:{enabled:false}},frame);
  assert.match(response.error,/extension interface/,action);
 }
 assert.equal(saved.settings.enabled,undefined);
 const style=await handles.message({action:"getStyle",url:"https://other.example",tabId:200},frame);
 assert.equal(typeof style.active,"boolean");
 const invalidReport=await handles.message({action:"reportPopupCleanup",count:100000,kind:"paywall"},frame);
 assert.match(invalidReport.error,/Invalid popup report/);
 const invalidKind=await handles.message({action:"reportPopupCleanup",count:1,kind:"other"},frame);
 assert.match(invalidKind.error,/Invalid popup report/);
 const rule=await handles.message({action:"addElementRule",selector:".sponsored"},frame);
 assert.equal(rule.ok,true);
 assert.match(saved.settings.customRules,/site\.example##\.sponsored/);
 assert.equal(saved.settings.customRules.includes("other.example"),false);
});
