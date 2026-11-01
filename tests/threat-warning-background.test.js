"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
const {webcrypto}=require("node:crypto");
test("Build 217 phishing warning redirects are tab-bound and explicit exact-host proceeds only",async()=>{
 const handlers={},on=k=>({addListener:f=>{handlers[k]=f;},removeListener:()=>{}});
 const feed="# phishing test feed\n"+Array.from({length:100},(_,i)=>
  "phish"+i+".testdomain.net").join("\n")+"\n";
 let saved={settings:{autoUpdate:false},threatCache:{text:feed,updated:Date.now()}};
 const tab={id:10,url:"https://legitimate.testdomain.net/"};
 const navigations=[],closes=[],ext="moz-extension://dk-lab/";
 const browser={
  webRequest:{onBeforeRequest:on("request"),onErrorOccurred:on("error")},
  webNavigation:{onCreatedNavigationTarget:on("popup")},
  proxy:{onRequest:on("proxy"),onError:on("proxyError")},
  tabs:{onUpdated:on("updated"),onRemoved:on("removed"),onCreated:on("created"),
   query:async()=>[tab],get:async id=>id===tab.id?{...tab}:Promise.reject(Error("gone")),
   update:async(id,patch)=>{assert.equal(id,10);tab.url=patch.url;navigations.push(patch.url);return {...tab};},
   remove:async id=>{closes.push(id);},sendMessage:async()=>{}},
  alarms:{onAlarm:on("alarm"),create:async()=>{}},
  browserAction:{setBadgeText:async()=>{}},
  runtime:{id:"dk-live-block@elderred-softworks.local",getURL:p=>ext+p,onMessage:on("message")},
  storage:{local:{get:async()=>saved,set:async v=>{saved={...saved,...v};}}}
 };
 const timer=(fn,ms)=>{const t=setTimeout(fn,ms);if(ms>=60000)t.unref();return t;};
 const ctx=vm.createContext({browser,URL,TextEncoder,TextDecoder,console,Date,crypto:webcrypto,
  AbortController,fetch:async()=>{throw Error("Unexpected network request");},
  setTimeout:timer,clearTimeout});
 const src=path.resolve(__dirname,"../src");
 const manifest=JSON.parse(fs.readFileSync(path.join(src,"manifest.json"),"utf8"));
 for(const script of manifest.background.scripts)
  vm.runInContext(fs.readFileSync(path.join(src,script),"utf8"),ctx,{filename:script});
 await new Promise(resolve=>setTimeout(resolve,35));
 const attempt=(hostname,type,method="GET",requestId="r1")=>handlers.request({
  tabId:10,type,method,requestId,
  url:"https://"+hostname+"/private?secret=DO_NOT_EXPOSE",
  documentUrl:"https://legitimate.testdomain.net/"
 });
 const victim="phish4.testdomain.net";
 assert.equal(attempt(victim,"script").cancel,true);
 assert.equal(attempt(victim,"main_frame","POST","r2").cancel,true);
 const warning=attempt(victim,"main_frame","GET","r3");
 assert.match(warning.redirectUrl,/^moz-extension:\/\/dk-lab\/blocked\.html#[0-9a-f]{32}$/);
 assert.equal(warning.redirectUrl.includes("DO_NOT_EXPOSE"),false);
 tab.url=warning.redirectUrl;
 const nonce=tab.url.split("#")[1];
 const sender={id:browser.runtime.id,url:tab.url,frameId:0,tab:{id:10,url:tab.url}};
 const good=await handlers.message({action:"getThreatWarning",nonce},sender);
 assert.equal(good.host,victim);
 assert.equal(good.source,"Phishing Army");
 for(const invalid of [
  {...sender,url:"https://phish4.testdomain.net/"},
  {...sender,tab:{id:99,url:tab.url}},
  {...sender,frameId:1}
 ]){
  assert.ok((await handlers.message({action:"getThreatWarning",nonce},invalid)).error);
 }
 assert.ok((await handlers.message({action:"getThreatWarning",nonce:"f".repeat(32)},sender)).error);
 assert.ok((await handlers.message({action:"proceedThreatWarning",nonce},sender)).error);
 assert.equal((saved.settings.threatOverrides||[]).includes(victim),false);
 assert.equal((await handlers.message({action:"proceedThreatWarning",nonce,confirm:true},sender)).ok,true);
 assert.deepEqual(Array.from(saved.settings.threatOverrides),[victim]);
 assert.deepEqual(navigations,["https://"+victim+"/"]);
 assert.equal(attempt(victim,"main_frame","GET","r4").cancel,undefined);
 assert.ok((await handlers.message({action:"getThreatWarning",nonce},sender)).error);
 const next=attempt("phish5.testdomain.net","main_frame","GET","r5");
 tab.url=next.redirectUrl;
 const nonce2=tab.url.split("#")[1],sender2={...sender,url:tab.url,tab:{id:10,url:tab.url}};
 assert.equal((await handlers.message({action:"closeThreatWarning",nonce:nonce2,confirm:true},sender2)).ok,true);
 assert.deepEqual(closes,[10]);
 assert.deepEqual(Array.from(saved.settings.threatOverrides),[victim]);
});
