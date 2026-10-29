"use strict";
const test=require("node:test"),assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
async function setup(){
 const handlers={},on=name=>({addListener:fn=>{handlers[name]=fn;},removeListener:fn=>{if(handlers[name]===fn)delete handlers[name];}});
 const requests=[];let storage={settings:{autoUpdate:false}},throwNetwork=false;
 const fetch=async(url,options)=>{
  requests.push({url,options:{...options,signal:null}});
  if(throwNetwork)throw Error("proxy target unreachable");
  handlers.proxy({url,tabId:-1,type:"main_frame"});
  return {status:204,ok:true};
 };
 const browser={
  proxy:{onRequest:on("proxy"),onError:on("proxyError")},
  dns:{resolve:async()=>({addresses:[]})},
  webRequest:{onBeforeRequest:on("request"),onErrorOccurred:on("failure")},
  webNavigation:{onCreatedNavigationTarget:on("popup")},
  tabs:{onUpdated:on("updated"),onRemoved:on("removed"),query:async()=>[],sendMessage:async()=>{}},
  alarms:{onAlarm:on("alarm"),create:async()=>{}},browserAction:{setBadgeText:async()=>{}},
  runtime:{onMessage:on("message")},
  storage:{local:{get:async()=>storage,set:async x=>{storage={...storage,...x};}}}
 };
 const st=(fn,ms)=>{const t=setTimeout(fn,ms);if(ms>=60000)t.unref();return t;};
 const ctx=vm.createContext({browser,URL,console,Date,AbortController,TextDecoder,fetch,setTimeout:st,clearTimeout});
 for(const name of ["public-suffix.js","rules.js","engine.js","privacy.js","subscriptions.js","manual-rules.js","network-recovery.js","list-io.js","subscription-cache.js","settings.js","video-assist.js","background.js"])
  vm.runInContext(fs.readFileSync(path.join(__dirname,"../src",name),"utf8"),ctx,{filename:name});
 await new Promise(resolve=>setTimeout(resolve,20));
 return {handlers,requests,fail:()=>{throwNetwork=true;}};
}
const config={enabled:true,type:"socks",mode:"domains",host:"127.0.0.1",port:9050,proxyDNS:true,domains:["selected.example"]};
test("proxy check is opt-in only and requires an explicitly saved site",async()=>{
 const x=await setup();
 assert.equal(x.requests.length,0);
 assert.match((await x.handlers.message({action:"testNetworkProxy",host:"selected.example"})).error,/Enable/);
 assert.equal(x.requests.length,0);
 await x.handlers.message({action:"saveNetwork",config});
 assert.match((await x.handlers.message({action:"testNetworkProxy",host:"not-selected.example"})).error,/Select/);
 assert.equal(x.requests.length,0);
 assert.match((await x.handlers.message({action:"testNetworkProxy",host:"router.local"})).error,/Select/);
 assert.equal(x.requests.length,0);
});
test("explicit HEAD probe omits cookies, avoids redirects and observes routing",async()=>{
 const x=await setup();
 assert.equal((await x.handlers.message({action:"saveNetwork",config})).ok,true);
 const result=await x.handlers.message({action:"testNetworkProxy",host:"selected.example"});
 assert.equal(result.ok,true);
 assert.equal(result.status,204);
 assert.equal(result.routePolicyObserved,true);
 assert.equal(x.requests.length,1);
 assert.equal(x.requests[0].url,"https://selected.example/");
 assert.equal(x.requests[0].options.method,"HEAD");
 assert.equal(x.requests[0].options.credentials,"omit");
 assert.equal(x.requests[0].options.redirect,"manual");
});
test("no automated probe in image-only mode; test failure is reported",async()=>{
 const x=await setup();
 await x.handlers.message({action:"saveNetwork",config:{...config,mode:"images"}});
 assert.match((await x.handlers.message({action:"testNetworkProxy",host:"selected.example"})).error,/domain-routing/);
 assert.equal(x.requests.length,0);
 await x.handlers.message({action:"saveNetwork",config});
 x.fail();
 const result=await x.handlers.message({action:"testNetworkProxy",host:"selected.example"});
 assert.match(result.error,/unreachable/);
});
test("content scripts cannot initiate a proxy probe",async()=>{
 const x=await setup();
 await x.handlers.message({action:"saveNetwork",config});
 const response=await x.handlers.message({action:"testNetworkProxy",host:"selected.example"},{tab:{id:1,url:"https://selected.example"}});
 assert.match(response.error,/extension interface/);
 assert.equal(x.requests.length,0);
});
