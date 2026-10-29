"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
test("conditional 304 updates reuse valid cached lists, preserve last-good on errors",async()=>{
 const handlers={},on=name=>({addListener:f=>{handlers[name]=f;}});
 let saved={settings:{autoUpdate:false}},calls=[],mode="fresh";
 const doc="[Adblock Plus 2.0]\n! Title: Network test\n"+"||ad.example.net^\n".repeat(30);
 const fetch=async (url,opts)=>{
  calls.push({url,headers:opts.headers});
  if(mode==="error")throw Error("simulated offline");
  if(mode==="cached")return {ok:false,status:304,headers:{get:name=>name==="etag"?'"v1"':null}};
  return {ok:true,status:200,headers:{get:name=>name==="etag"?'"v1"':null},text:async()=>doc};
 };
 const browser={
  webRequest:{onBeforeRequest:on("request"),onErrorOccurred:on("error")},
  webNavigation:{onCreatedNavigationTarget:on("popup")},
  proxy:{onRequest:on("proxy"),onError:on("proxyError")},
  dns:{resolve:async()=>({addresses:[]})},
  tabs:{onUpdated:on("updated"),onRemoved:on("removed"),query:async()=>[{id:1,url:"https://site.example"}],sendMessage:async()=>{}},
  alarms:{onAlarm:on("alarm"),create:async()=>{}},
  browserAction:{setBadgeText:async()=>{}},
  runtime:{onMessage:on("message")},
  storage:{local:{get:async()=>saved,set:async value=>{saved={...saved,...value};}}}
 };
 const st=(fn,ms)=>{const timer=setTimeout(fn,ms);if(ms>=60000)timer.unref();return timer;};
 const context=vm.createContext({browser,URL,TextDecoder,AbortController,Date,console,fetch,setTimeout:st,clearTimeout});
 for(const name of ["rules.js","engine.js","privacy.js","subscriptions.js","manual-rules.js","network-recovery.js","list-io.js","subscription-cache.js","settings.js","background.js"])
  vm.runInContext(fs.readFileSync(path.join(__dirname,"../src",name),"utf8"),context,{filename:name});
 await new Promise(resolve=>setTimeout(resolve,20));
 let response=await handlers.message({action:"updateLists"});
 assert.equal(response.updated,2);
 assert.equal(response.checked,2);
 assert.equal(response.errors.length,0);
 const cached=saved.lists.easylist.text;
 assert.equal(cached,doc);
 assert.equal(saved.lists.easylist.etag,'"v1"');
 const initialTime=saved.lists.easylist.updated;
 mode="cached";response=await handlers.message({action:"updateLists"});
 assert.equal(response.updated,0);
 assert.equal(response.checked,2);
 assert.equal(saved.lists.easylist.text,cached);
 assert.equal(saved.lists.easylist.updated,initialTime);
 assert.equal(calls[2].headers["If-None-Match"],'"v1"');
 mode="error";response=await handlers.message({action:"updateLists"});
 assert.equal(response.checked,0);
 assert.equal(response.errors.length,2);
 assert.equal(saved.lists.easylist.text,cached);
 const health=await handlers.message({action:"getSettings"});
 assert.match(health.listState.easylist.error,/simulated offline/);
});
