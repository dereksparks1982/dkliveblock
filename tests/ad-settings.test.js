"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
test("automatic ad detection can be disabled without disabling normal blocking",async()=>{
 const handlers={},listen=n=>({addListener:fn=>handlers[n]=fn,removeListener:()=>{}});
 let stored={settings:{autoUpdate:false}},events=[];
 const browser={
  proxy:{onRequest:listen("proxy"),onError:listen("proxyError")},
  dns:{resolve:async()=>({addresses:[]})},
  webRequest:{onBeforeRequest:listen("request"),onErrorOccurred:listen("failure")},
  webNavigation:{onCreatedNavigationTarget:listen("popup")},
  tabs:{onUpdated:listen("updated"),onRemoved:listen("removed"),query:async()=>[],sendMessage:async()=>{}},
  alarms:{onAlarm:listen("alarm"),create:async()=>{}},browserAction:{setBadgeText:async()=>{}},
  runtime:{onMessage:listen("message")},
  storage:{local:{get:async()=>stored,set:async x=>{stored={...stored,...x};}}}
 };
 const timer=(fn,ms)=>{const t=setTimeout(fn,ms);if(ms>=60000)t.unref();return t;};
 const context=vm.createContext({browser,console,URL,Date,AbortController,TextEncoder,TextDecoder,
  fetch:async()=>{throw Error("offline test");},setTimeout:timer,clearTimeout});
 for(const name of ["public-suffix.js","rules.js","engine.js","privacy.js","subscriptions.js",
  "manual-rules.js","network-recovery.js","list-io.js","subscription-cache.js",
  "settings.js","video-assist.js","auth-protection.js","youtube-maintenance.js",
  "ghostery-vendor.js","hybrid-engine.js","background.js"]){
  vm.runInContext(fs.readFileSync(path.join(__dirname,"../src",name),"utf8"),context,{filename:name});
 }
 await new Promise(resolve=>setTimeout(resolve,30));
 const tab={tab:{id:7,url:"https://news.example/article"},url:"https://news.example/article"};
 let first=await handlers.message({action:"getStyle"},tab);
 assert.equal(first.adRecognition,true);
 assert.equal(first.active,true);
 let save=await handlers.message({action:"saveSettings",settings:{adRecognition:false}});
 assert.equal(save.ok,true);
 assert.equal(stored.settings.adRecognition,false);
 let off=await handlers.message({action:"getStyle"},tab);
 assert.equal(off.adRecognition,false);
 assert.equal(off.active,true);
 // Other network filtering must stay enabled.
 assert.equal(handlers.request({url:"https://doubleclick.net/banner.js",tabId:7,type:"script",documentUrl:"https://news.example/article"}).cancel,true);
 save=await handlers.message({action:"saveSettings",settings:{adRecognition:true}});
 assert.equal(save.ok,true);
 assert.equal((await handlers.message({action:"getStyle"},tab)).adRecognition,true);
});
test("automatic ad option appears exactly once and is saved by settings logic",()=>{
 const root=path.join(__dirname,"../src"),html=fs.readFileSync(path.join(root,"options.html"),"utf8");
 const options=fs.readFileSync(path.join(root,"options.js"),"utf8");
 assert.equal((html.match(/id="adRecognition"/g)||[]).length,1);
 assert.match(options,/"adRecognition"/);
});
