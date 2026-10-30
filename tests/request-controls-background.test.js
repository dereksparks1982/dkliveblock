"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
const source=path.resolve(__dirname,"../src");
const manifest=JSON.parse(fs.readFileSync(path.join(source,"manifest.json"),"utf8"));
async function setup(){
 const hooks={},listeners=name=>({addListener:fn=>{hooks[name]=fn;},removeListener:()=>{}});
 let stored={settings:{autoUpdate:false,requestLog:false}};
 const targets=new Map([[1,"https://site.test/a"],[2,"https://site.test/b"],[3,"https://other.test/"]]);
 const browser={
  webRequest:{onBeforeRequest:listeners("before"),onErrorOccurred:listeners("error"),
   onCompleted:listeners("completed"),onBeforeRedirect:listeners("redirect")},
  webNavigation:{onCreatedNavigationTarget:listeners("popup")},
  proxy:{onRequest:listeners("proxy"),onError:listeners("proxyerror")},
  dns:{resolve:async()=>({addresses:[]})},
  tabs:{onCreated:listeners("created"),onUpdated:listeners("updated"),onRemoved:listeners("removed"),
   query:async()=>[...targets].map(([id,url])=>({id,url})),
   get:async id=>{if(!targets.has(id))throw Error("unknown tab");return {id,url:targets.get(id)};},
   sendMessage:async()=>{},remove:async()=>{},reload:async()=>{}},
  alarms:{onAlarm:listeners("alarm"),create:async()=>{}},
  runtime:{onMessage:listeners("message")},
  browserAction:{setBadgeText:async()=>{},setBadgeBackgroundColor:async()=>{},
   setBadgeTextColor:async()=>{}},
  storage:{local:{get:async()=>stored,set:async x=>{stored={...stored,...x};}}}
 };
 const timeout=(fn,ms,...args)=>{const t=setTimeout(fn,ms,...args);if(ms>=60000)t.unref();return t;};
 const context=vm.createContext({browser,URL,TextEncoder,TextDecoder,console,Date,AbortController,
  setTimeout:timeout,clearTimeout,fetch:async()=>{throw Error("Unexpected list fetch");}});
 for(const filename of manifest.background.scripts)
  vm.runInContext(fs.readFileSync(path.join(source,filename),"utf8"),context,{filename});
 await new Promise(resolve=>setTimeout(resolve,25));
 return {hooks,stored:()=>stored,targets};
}
function request(tabId=1,type="image",url="https://doubleclick.net/ad.gif"){
 return {requestId:"id"+Date.now()+Math.random(),tabId,type,url,method:"GET",
  documentUrl:"https://site.test/a"};
}
test("active blocked evidence, one tab, one resource type, revoke and restored default blocking",async()=>{
 const {hooks}=await setup();
 assert.equal((await hooks.message({action:"startNetworkMonitor",tabId:1})).ok,true);
 const first=request();
 assert.equal(hooks.before(first).cancel,true);
 const forged=await hooks.message({action:"allowMonitoredRequest",
  tabId:1,host:"othertracker.test",type:"image",scope:"temporary",confirm:true});
 assert.match(forged.error,/not recorded as blocked/);
 const noConsent=await hooks.message({action:"allowMonitoredRequest",
  tabId:1,host:"doubleclick.net",type:"image",scope:"temporary"});
 assert.match(noConsent.error,/confirmation/);
 const allowed=await hooks.message({action:"allowMonitoredRequest",
  tabId:1,host:"doubleclick.net",type:"image",scope:"temporary",confirm:true});
 assert.equal(allowed.ok,true);
 assert.equal(hooks.before(request(1,"image")).cancel,undefined);
 assert.equal(hooks.before(request(1,"script","https://doubleclick.net/ad.js")).cancel,true);
 assert.equal(hooks.before(request(2,"image")).cancel,true);
 const list=await hooks.message({action:"getRequestAllowances",tabId:1});
 assert.equal(list.length,1);assert.equal(list[0].type,"image");
 const revoked=await hooks.message({action:"revokeMonitoredRequest",
  tabId:1,host:"doubleclick.net",type:"image",scope:"temporary"});
 assert.equal(revoked.ok,true);
 assert.equal(hooks.before(request(1,"image")).cancel,true);
});
test("saved allow rule persists only site/host/type and is limited to the source site",async()=>{
 const {hooks,stored}=await setup();
 await hooks.message({action:"startNetworkMonitor",tabId:1});
 assert.equal(hooks.before(request()).cancel,true);
 const ok=await hooks.message({action:"allowMonitoredRequest",tabId:1,
  host:"doubleclick.net",type:"image",scope:"remember",confirm:true});
 assert.equal(ok.ok,true);
 assert.deepEqual(JSON.parse(JSON.stringify(stored().requestAllowances)),
  [{site:"site.test",host:"doubleclick.net",type:"image",scope:"remember"}]);
 assert.equal(hooks.before(request(2)).cancel,undefined);
 // Change context hostname and verify source-site scoping.
 assert.equal(hooks.before({...request(3),documentUrl:"https://other.test/a"}).cancel,true);
});
test("content scripts cannot inspect or change request exceptions",async()=>{
 const {hooks}=await setup();
 const sender={tab:{id:1,url:"https://site.test/a"},url:"https://site.test/a"};
 for(const action of ["getRequestAllowances","allowMonitoredRequest","revokeMonitoredRequest"]){
  const reply=await hooks.message({action,tabId:1,host:"doubleclick.net",
   type:"image",scope:"remember",confirm:true},sender);
  assert.match(reply.error,/extension interface/i);
 }
});
test("site navigation drops short-term allowance while preserving saved scope",async()=>{
 const {hooks,targets}=await setup();
 await hooks.message({action:"startNetworkMonitor",tabId:1});
 assert.equal(hooks.before(request()).cancel,true);
 assert.equal((await hooks.message({action:"allowMonitoredRequest",tabId:1,
  host:"doubleclick.net",type:"image",scope:"temporary",confirm:true})).ok,true);
 targets.set(1,"https://other.test/");
 hooks.updated(1,{url:"https://other.test/",status:"loading"},{url:"https://other.test/"});
 targets.set(1,"https://site.test/a");
 hooks.updated(1,{url:"https://site.test/a",status:"loading"},{url:"https://site.test/a"});
 assert.equal(hooks.before(request()).cancel,true);
});
