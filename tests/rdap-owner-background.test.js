"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
test("opt-in RDAP registration lookup is restricted to actually blocked live-tab hostname",async()=>{
 const handlers={},on=name=>({addListener:fn=>{handlers[name]=fn;},removeListener:()=>{}});
 let saved={settings:{autoUpdate:false}},calls=[];
 const browser={
  webRequest:{onBeforeRequest:on("request"),onErrorOccurred:on("error")},
  webNavigation:{onCreatedNavigationTarget:on("popup")},
  proxy:{onRequest:on("proxy"),onError:on("proxyError")},dns:{resolve:async()=>({addresses:[]})},
  tabs:{onUpdated:on("updated"),onRemoved:on("removed"),
   query:async()=>[{id:1,url:"https://rutube.ru/"}],
   get:async()=>({id:1,url:"https://rutube.ru/"}),sendMessage:async()=>{}},
  alarms:{onAlarm:on("alarm"),create:async()=>{}},browserAction:{setBadgeText:async()=>{}},
  runtime:{onMessage:on("message")},
  storage:{local:{get:async()=>saved,set:async x=>{saved={...saved,...x};}}}
 };
 const rdap={entities:[
  {roles:["registrant"],vcardArray:["vcard",[["org",{},"text","Registrant Example LLC"]]]},
  {roles:["registrar"],vcardArray:["vcard",[["fn",{},"text","Sample Registrar"]]]}
 ],events:[{eventAction:"expiration",eventDate:"2030-01-01T00:00:00Z"}]};
 const fetch=async(url,options)=>{
  calls.push({url,options});return {ok:true,status:200,url:"https://rdap.example/api/domain/doubleclick.net",
   headers:{get:()=>null},text:async()=>JSON.stringify(rdap)};
 };
 const st=(fn,ms)=>{const t=setTimeout(fn,ms);if(ms>=60000)t.unref();return t;};
 const ctx=vm.createContext({browser,URL,TextEncoder,TextDecoder,console,Date,AbortController,fetch,setTimeout:st,clearTimeout});
 const root=path.resolve(__dirname,"../src");
 for(const name of JSON.parse(fs.readFileSync(path.join(root,"manifest.json"),"utf8")).background.scripts){
  vm.runInContext(fs.readFileSync(path.join(root,name),"utf8"),ctx,{filename:name});
 }
 await new Promise(resolve=>setTimeout(resolve,30));
 const msg={action:"lookupBlockedDomain",tabId:1,host:"doubleclick.net",expectedSite:"rutube.ru"};
 assert.equal((await handlers.message(msg)).error!==undefined,true);
 assert.equal(calls.length,0);
 // A real ad block is required before the hostname can be queried.
 handlers.request({url:"https://doubleclick.net/ad.js",type:"script",tabId:1,
  documentUrl:"https://rutube.ru/"});
 const allowed=await handlers.message(msg);
 assert.equal(allowed.ok,true);
 assert.equal(allowed.domain,"doubleclick.net");
 assert.equal(allowed.organization,"Registrant Example LLC");
 assert.equal(allowed.registrar,"Sample Registrar");
 assert.equal(calls.length,1);
 assert.equal(calls[0].url,"https://rdap.org/domain/doubleclick.net");
 assert.equal(calls[0].options.credentials,"omit");
 assert.equal((await handlers.message({...msg,host:"not-listed.example"})).error!==undefined,true);
 assert.equal(calls.length,1);
 assert.equal((await handlers.message(msg,{tab:{id:1,url:"https://rutube.ru/"}})).error!==undefined,true);
 assert.equal(calls.length,1);
});
