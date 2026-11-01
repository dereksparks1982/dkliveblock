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
  runtime:{onMessage:reg("message"),getURL:p=>"moz-extension://dk-test/"+p},
  storage:{local:{get:async()=>saved,set:async x=>{saved={...saved,...x}}}}
 };
 const setTimeoutSafe=(f,n)=>{const t=setTimeout(f,n);if(n>=60000)t.unref();return t;};
 const ctx=vm.createContext({browser,URL,console,AbortController,TextEncoder,TextDecoder,Date,fetch:async()=>{throw Error("Offline")},setTimeout:setTimeoutSafe,clearTimeout});
 for(const name of JSON.parse(
  fs.readFileSync(path.join(__dirname,"../src/manifest.json"),"utf8")).background.scripts)
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

 // Build 174: sender.url from a non-extension caller without sender.tab
 // must never be interpreted as a trusted extension interface.
 const foreign={url:"https://untrusted.example/popup.html"};
 for(const action of ["getSettings","saveSettings","setGlobal","getLog",
   "getSiteDashboard","setBlockedRequestAllowed","toggleSite"]){
  const response=await handles.message({action,tabId:1,enabled:false,
   settings:{enabled:false},expectedSite:"site.example",host:"ads.example",
   type:"script",allow:true,confirm:true},foreign);
  assert.match(response.error,/extension interface/,action);
 }
 const internal=await handles.message({action:"getSettings"},{
  url:"moz-extension://dk-test/options.html"});
 assert.equal(typeof internal.settings,"object");

 // Build 174: invalid settings fields must fail before touching any
 // earlier option, cached subscription choice, or request logging.
 const beforeSettings=JSON.stringify((await handles.message({action:"getSettings"})).settings);
 const beforeSaved=JSON.stringify(saved.settings);
 for(const input of [
  {autoUpdate:true,adRecognition:false,requestLog:false,paused:["invalid/host"]},
  {autoUpdate:true,youtubeResponseFilter:false,cookieRejectPaused:["bad.example/path"]},
  {autoUpdate:true,strictPopupSites:false,distractionPaused:["bad..example"]},
  {autoUpdate:true,adRecognition:false,paused:["bad.example/"],customSubscriptions:[]}
 ]){
  const response=await handles.message({action:"saveSettings",settings:input});
  assert.match(response.error,/valid hostnames/,JSON.stringify(input));
  assert.equal(JSON.stringify((await handles.message({action:"getSettings"})).settings),
   beforeSettings,"invalid update must not mutate live settings");
  assert.equal(JSON.stringify(saved.settings),beforeSaved,
   "invalid update must not write to storage");
 }
 const invalidObject=await handles.message({action:"saveSettings",settings:[]});
 assert.match(invalidObject.error,/object/);
 assert.equal(JSON.stringify((await handles.message({action:"getSettings"})).settings),
  beforeSettings);
});
