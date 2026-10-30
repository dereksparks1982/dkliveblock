"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
async function start(){
 const events={},reg=n=>({addListener:fn=>events[n]=fn,removeListener:()=>{}});
 let stored={settings:{autoUpdate:false}};
 const browser={
  webRequest:{onBeforeRequest:reg("request"),onErrorOccurred:reg("err")},
  webNavigation:{onCreatedNavigationTarget:reg("popup")},
  proxy:{onRequest:reg("proxy"),onError:reg("proxyError")},
  dns:{resolve:async()=>({addresses:[]})},
  tabs:{onUpdated:reg("update"),onRemoved:reg("remove"),query:async()=>[],sendMessage:async()=>{}},
  alarms:{onAlarm:reg("alarm"),create:async()=>{}},
  browserAction:{setBadgeText:async()=>{}},
  runtime:{onMessage:reg("message")},
  storage:{local:{get:async()=>stored,set:async value=>{stored={...stored,...value};}}}
 };
 const timeout=(f,ms)=>{const t=setTimeout(f,ms);if(ms>=60000)t.unref();return t;};
 const ctx=vm.createContext({browser,URL,Date,AbortController,console,TextEncoder,TextDecoder,
  fetch:async()=>{throw Error("offline")},setTimeout:timeout,clearTimeout});
 for(const name of JSON.parse(
  fs.readFileSync(path.join(__dirname,"../src/manifest.json"),"utf8")).background.scripts)
  vm.runInContext(fs.readFileSync(path.join(__dirname,"../src",name),"utf8"),ctx,{filename:name});
 await new Promise(resolve=>setTimeout(resolve,20));
 const status=async()=>events.message({action:"status",url:"https://news.example",tabId:1});
 const save=async settings=>events.message({action:"saveSettings",settings});
 return {status,save,events};
}
test("unrelated preferences do not reparse downloaded filtering rules",async()=>{
 const x=await start();
 const first=await x.status(),revision=first.filterRevision;
 assert.equal(revision,1);
 assert.equal((await x.save({adRecognition:false})).ok,true);
 assert.equal((await x.status()).filterRevision,revision);
 assert.equal((await x.save({youtubeSkip:false,antiAdblock:false})).ok,true);
 assert.equal((await x.status()).filterRevision,revision);
 assert.equal((await x.save({customRules:"||new-ad-network.example^"})).ok,true);
 const next=await x.status();
 assert.equal(next.filterRevision,revision+1);
 assert.equal(x.events.request({url:"https://new-ad-network.example/banner",
  type:"image",tabId:1,documentUrl:"https://news.example/"}).cancel,true);
 assert.equal((await x.save({adRecognition:true})).ok,true);
 assert.equal((await x.status()).filterRevision,next.filterRevision);
 assert.equal((await x.save({customRules:"||new-ad-network.example^"})).ok,true);
 assert.equal((await x.status()).filterRevision,next.filterRevision);
});
test("removing a custom rule recompiles and unblocks only that resource",async()=>{
 const x=await start();
 await x.save({customRules:"||new-ad-network.example^"});
 const a=(await x.status()).filterRevision;
 await x.save({customRules:""});
 const b=(await x.status()).filterRevision;
 assert.equal(b,a+1);
 assert.equal(x.events.request({url:"https://new-ad-network.example/banner",
  type:"image",tabId:1,documentUrl:"https://news.example/"}).cancel,undefined);
 assert.equal(x.events.request({url:"https://doubleclick.net/banner",
  type:"image",tabId:1,documentUrl:"https://news.example/"}).cancel,true);
});
