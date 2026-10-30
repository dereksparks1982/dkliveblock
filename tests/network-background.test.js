"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
const sources=["public-suffix.js","rules.js","engine.js","privacy.js","subscriptions.js","manual-rules.js","network-recovery.js","list-io.js","subscription-cache.js","settings.js","video-assist.js","streaming-diagnostics.js","streaming-repair.js","request-monitor.js","popup-trap.js","auth-protection.js","youtube-maintenance.js","video-library.js","ghostery-vendor.js","hybrid-engine.js","background.js"];
async function setup(){
 const handlers={},filters={},on=name=>({addListener:(fn,filter)=>{handlers[name]=fn;filters[name]=filter;},removeListener:fn=>{if(handlers[name]===fn)delete handlers[name];delete filters[name];}});
 let stored={settings:{autoUpdate:false}},queries=0;
 const browser={
  proxy:{onRequest:on("proxy"),onError:on("proxyError")},
  dns:{resolve:async host=>{queries++;return {addresses:["203.0.113.20"]};}},
  webRequest:{onBeforeRequest:on("request"),onErrorOccurred:on("failed")},
  webNavigation:{onCreatedNavigationTarget:on("popup")},
  tabs:{onUpdated:on("updated"),onRemoved:on("removed"),
   query:async()=>[{id:1,url:"https://blocked.example/story"}],
   get:async id=>({id,url:"https://blocked.example/story"}),remove:async()=>{},sendMessage:async()=>{}},
  alarms:{onAlarm:on("alarm"),create:async()=>{}},
  runtime:{onMessage:on("message")},
  browserAction:{setBadgeText:async()=>{}},
  storage:{local:{get:async()=>stored,set:async values=>{stored={...stored,...values};}}}
 };
 const setTimeoutSafe=(fn,ms,...args)=>{const t=setTimeout(fn,ms,...args);if(ms>=60000)t.unref();return t;};
 const context=vm.createContext({browser,URL,TextEncoder,TextDecoder,console,Date,AbortController,fetch:async()=>{throw Error("Unexpected network fetch")},setTimeout:setTimeoutSafe,clearTimeout});
 for(const file of sources)vm.runInContext(fs.readFileSync(path.join(__dirname,"../src",file),"utf8"),context,{filename:file});
 await new Promise(resolve=>setTimeout(resolve,25));
 return {handlers,filters,browser,storage:()=>stored,queries:()=>queries};
}
const config={enabled:true,type:"socks",host:"127.0.0.1",port:9050,proxyDNS:true,mode:"domains",domains:["blocked.example"]};
test("all traffic is untouched until network routing is explicitly enabled",async()=>{
 const {handlers}=await setup();
 assert.equal(typeof handlers.proxy,"undefined");
 assert.equal((await handlers.message({action:"networkStatus"})).config.enabled,false);
});
test("selective proxy routing, remote DNS, no fallback and pause",async()=>{
 const {handlers,filters}=await setup();
 assert.equal((await handlers.message({action:"saveNetwork",config})).ok,true);
 assert.deepEqual(Array.from(filters.proxy.urls),["*://*.blocked.example/*"]);
 const result=handlers.proxy({url:"https://blocked.example/article",type:"main_frame",tabId:1});
 assert.equal(result[0].type,"socks");
 assert.equal(result[0].proxyDNS,true);
 assert.equal(result[1],null);
 assert.equal(handlers.proxy({url:"https://unrelated.example/path",type:"main_frame",tabId:1}),null);
 await handlers.message({action:"toggleTabPause",tabId:1,url:"https://blocked.example/story",paused:true});
 assert.equal(handlers.proxy({url:"https://blocked.example/",type:"main_frame",tabId:1}),null);
});
test("image-only proxy routing never routes other resources or private networks",async()=>{
 const {handlers,filters}=await setup();
 await handlers.message({action:"saveNetwork",config:{...config,mode:"images"}});
 assert.deepEqual(Array.from(filters.proxy.urls),["<all_urls>"]);
 assert.ok(handlers.proxy({url:"https://images.example.net/pic.jpg",type:"image",documentUrl:"https://blocked.example/story",tabId:1}));
 assert.equal(handlers.proxy({url:"https://images.example.net/app.js",type:"script",documentUrl:"https://blocked.example/story",tabId:1}),null);
 assert.equal(handlers.proxy({url:"http://192.168.1.1/private",type:"image",documentUrl:"https://blocked.example/story",tabId:1}),null);
});
test("diagnostics never store the full image URL or report own blocks as ISP failures",async()=>{
 const {handlers}=await setup();
 handlers.failed({requestId:"bad1",url:"https://cdn.example.net/pic.png?private=secret",tabId:1,type:"image",error:"NS_ERROR_UNKNOWN_HOST"});
 let rows=await handlers.message({action:"getNetworkIssues",tabId:1});
 assert.equal(rows.length,1);
 assert.equal(rows[0].host,"cdn.example.net");
 assert.equal(rows[0].category,"dns");
 assert.equal(JSON.stringify(rows).includes("secret"),false);
 const canceled=handlers.request({requestId:"own1",url:"https://doubleclick.net/ads",tabId:1,type:"image",documentUrl:"https://blocked.example"});
 assert.equal(canceled.cancel,true);
 handlers.failed({requestId:"own1",url:"https://doubleclick.net/ads",tabId:1,type:"image",error:"NS_BINDING_ABORTED"});
 rows=await handlers.message({action:"getNetworkIssues",tabId:1});
 assert.equal(rows.length,1);
 await handlers.message({action:"clearNetworkIssues",tabId:1});
 assert.equal((await handlers.message({action:"getNetworkIssues",tabId:1})).length,0);
});
test("DNS checks only happen after an explicit request, and private destinations are rejected",async()=>{
 const {handlers,queries}=await setup();
 assert.equal(queries(),0);
 const checked=await handlers.message({action:"dnsLookup",host:"example.org"});
 assert.equal(checked.host,"example.org");
 assert.equal(queries(),1);
 assert.ok((await handlers.message({action:"dnsLookup",host:"router.local"})).error);
 assert.equal(queries(),1);
});
test("settings validation, content-script access and proxy errors stay isolated",async()=>{
 const {handlers}=await setup();
 assert.ok((await handlers.message({action:"saveNetwork",config:{...config,port:99999}})).error);
 assert.ok((await handlers.message({action:"saveNetwork",config},{tab:{id:1}})).error);
 const valid=await handlers.message({action:"saveNetwork",config});
 assert.equal(valid.ok,true);
 handlers.proxyError({message:"Proxy unavailable"});
 const state=await handlers.message({action:"networkStatus"});
 assert.equal(state.config.enabled,true);
 assert.match(state.proxyErrors[0].error,/unavailable/);
 const disabled=await handlers.message({action:"saveNetwork",config:{...config,enabled:false}});
 assert.equal(disabled.ok,true);
 assert.equal(typeof handlers.proxy,"undefined");
});

test("privacy opt-out stops storing failed host diagnostics",async()=>{
 const {handlers}=await setup();
 const saved=await handlers.message({action:"saveSettings",settings:{requestLog:false}});
 assert.equal(saved.ok,true);
 handlers.failed({requestId:"quiet",url:"https://cdn.example.org/a?private=secret",tabId:1,type:"image",error:"NS_ERROR_UNKNOWN_HOST"});
 assert.equal((await handlers.message({action:"getNetworkIssues",tabId:1})).length,0);
});

test("global protection switch removes the proxy listener, then restores it on enable",async()=>{
 const {handlers,filters}=await setup();
 await handlers.message({action:"saveNetwork",config});
 assert.equal(typeof handlers.proxy,"function");
 const off=await handlers.message({action:"setGlobal",enabled:false});
 assert.equal(off.enabled,false);
 assert.equal(typeof handlers.proxy,"undefined");
 assert.equal(filters.proxy,undefined);
 await handlers.message({action:"setGlobal",enabled:true});
 assert.equal(typeof handlers.proxy,"function");
 assert.deepEqual(Array.from(filters.proxy.urls),["*://*.blocked.example/*"]);
});
