"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
const root=path.resolve(__dirname,"../src");
const manifest=JSON.parse(fs.readFileSync(path.join(root,"manifest.json"),"utf8"));
function on(listeners,name){return {addListener(fn){listeners[name]=fn;},removeListener(fn){if(listeners[name]===fn)delete listeners[name];}};}
async function setup(){
 const listeners={},badges=[],backgrounds=[];
 let site="https://site.test/",saved={settings:{autoUpdate:false,requestLog:false}};
 const browser={
  webRequest:{onBeforeRequest:on(listeners,"request"),onErrorOccurred:on(listeners,"failed"),
   onCompleted:on(listeners,"completed"),onBeforeRedirect:on(listeners,"redirect")},
  proxy:{onRequest:on(listeners,"proxy"),onError:on(listeners,"proxyError")},
  webNavigation:{onCreatedNavigationTarget:on(listeners,"popup")},
  dns:{resolve:async()=>({addresses:["203.0.113.5"]})},
  tabs:{onUpdated:on(listeners,"updated"),onRemoved:on(listeners,"removed"),
   query:async()=>[{id:1,url:site}],get:async id=>({id,url:site}),
   sendMessage:async()=>({}),remove:async()=>{},reload:async()=>{}},
  alarms:{onAlarm:on(listeners,"alarm"),create:async()=>{}},
  runtime:{onMessage:on(listeners,"message")},
  browserAction:{setBadgeText:async data=>{badges.push(data);},
   setBadgeBackgroundColor:async d=>backgrounds.push(d),setBadgeTextColor:async()=>{}},
  storage:{local:{get:async()=>saved,set:async v=>{saved={...saved,...v};}}}
 };
 const wait=(fn,ms,...args)=>{const timer=setTimeout(fn,ms,...args);if(ms>=60000)timer.unref();return timer;};
 const context=vm.createContext({browser,URL,TextEncoder,TextDecoder,console,Date,
  AbortController,setTimeout:wait,clearTimeout,fetch:async()=>{throw Error("Unexpected network fetch");}});
 for(const file of manifest.background.scripts)
  vm.runInContext(fs.readFileSync(path.join(root,file),"utf8"),context,{filename:file});
 await new Promise(resolve=>setTimeout(resolve,25));
 return {listeners,badges,backgrounds,setSite:s=>site=s};
}
test("Build 35 captures allowed, blocked and failed requests and keeps icon badge counting",async()=>{
 const {listeners,badges,backgrounds}=await setup();
 listeners.updated(1,{url:"https://site.test/",status:"loading"},{url:"https://site.test/"});
 assert.equal((await listeners.message({action:"startNetworkMonitor",tabId:1})).ok,true);
 const bad={requestId:"bad1",url:"https://doubleclick.net/ads.js?token=SECRET",type:"script",
  documentUrl:"https://site.test/",tabId:1,method:"GET"};
 assert.equal(listeners.request(bad).cancel,true);
 listeners.failed({...bad,error:"NS_ERROR_ABORT"});
 const good={requestId:"good1",url:"https://site.test/content.png?user=PRIVATE",type:"image",
  documentUrl:"https://site.test/",tabId:1,method:"GET"};
 assert.equal(listeners.request(good).cancel,undefined);
 listeners.completed({...good,statusCode:200});
 const snapshot=await listeners.message({action:"getNetworkMonitor",tabId:1});
 assert.equal(snapshot.seen,2);
 assert.equal(snapshot.counts.blocked,1);
 assert.equal(snapshot.counts.allowed,1);
 assert.equal(snapshot.rows[1].httpStatus,200);
 assert.doesNotMatch(JSON.stringify(snapshot),/SECRET|PRIVATE|\/ads.js|\/content.png/);
 assert.equal(badges.at(-1).text,"1");
 assert.ok(backgrounds.some(b=>b.color==="#c13f3f"));
 assert.equal((await listeners.message({action:"status",tabId:1,url:"https://site.test/"})).tabBlocked,1);
});
test("Build 35 monitor cannot be controlled by content scripts, and stops on navigation",async()=>{
 const {listeners,setSite}=await setup();
 listeners.updated(1,{url:"https://site.test/",status:"loading"},{url:"https://site.test/"});
 assert.equal((await listeners.message({action:"startNetworkMonitor",tabId:1},
  {tab:{id:1,url:"https://site.test/"}})).error.includes("extension"),true);
 assert.equal((await listeners.message({action:"startNetworkMonitor",tabId:1})).ok,true);
 listeners.request({requestId:"a",url:"https://cdn.site.test/image",tabId:1,type:"image",
  documentUrl:"https://site.test/"});
 listeners.updated(1,{status:"loading"},{url:"https://site.test/"});
 assert.equal((await listeners.message({action:"getNetworkMonitor",tabId:1})).seen,1);
 setSite("https://another.test/");
 listeners.updated(1,{url:"https://another.test/"},{url:"https://another.test/"});
 assert.equal((await listeners.message({action:"getNetworkMonitor",tabId:1})).seen,0);
 assert.equal((await listeners.message({action:"getNetworkMonitor",tabId:1})).active,false);
});
