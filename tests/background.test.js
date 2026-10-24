"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
test("background blocks seeded ads, logs host-only requests, then pauses the site",async()=>{
 const listeners={},reg=name=>({addListener(fn){listeners[name]=fn;}});
 let stored={settings:{autoUpdate:false,customRules:"||ads-pop.test^$popup"}};
 const removedTabs=[];
 const browser={
  webRequest:{onBeforeRequest:reg("network")},
  webNavigation:{onCreatedNavigationTarget:reg("popup")},
  tabs:{onUpdated:reg("updated"),onRemoved:reg("removed"),query:async()=>[{id:1,url:"https://site.test"}],get:async id=>({id,url:"https://site.test"}),remove:async id=>{removedTabs.push(id);},sendMessage:async()=>({}),reload:async()=>{}},
  alarms:{onAlarm:reg("alarm"),create:async()=>{}},
  runtime:{onMessage:reg("message")},
  browserAction:{setBadgeText:async()=>{},setBadgeBackgroundColor:async()=>{}},
  storage:{local:{get:async()=>stored,set:async x=>{stored={...stored,...x};}}}
 };
 const context=vm.createContext({browser,URL,console,Date,setTimeout:(fn,ms,...args)=>{const timer=setTimeout(fn,ms,...args);if(ms>=60000)timer.unref();return timer;},clearTimeout,fetch:async()=>{throw Error("unexpected list fetch");}});
 for(const name of ["rules.js","engine.js","privacy.js","background.js"]){
  vm.runInContext(fs.readFileSync(path.resolve(__dirname,"../src",name),"utf8"),context,{filename:name});
 }
 await new Promise(resolve=>setTimeout(resolve,20));
 const request={url:"https://doubleclick.net/pixel",type:"image",documentUrl:"https://site.test/",tabId:1};
 assert.equal(listeners.network(request).cancel,true);
 const state=await listeners.message({action:"status",tabId:1,url:"https://site.test"});
 assert.equal(state.tabBlocked,1);
 const cleaned=listeners.network({url:"https://site.test/?utm_source=mail&post=42",type:"main_frame",tabId:1});
 assert.equal(cleaned.redirectUrl,"https://site.test/?post=42");
 assert.equal(state.ready,true);
 const log=await listeners.message({action:"getLog",tabId:1});
 assert.equal(log.length,1);
 assert.equal(log[0].host,"doubleclick.net");
 assert.equal(JSON.stringify(log).includes("/pixel"),false);
 await listeners.popup({tabId:4,sourceTabId:1,url:"https://ads-pop.test/window"});
 assert.equal(removedTabs.length,1);
 assert.equal(removedTabs[0],4);
 const afterPopup=await listeners.message({action:"getLog",tabId:1});
 assert.equal(afterPopup[0].type,"popup");
 await listeners.popup({tabId:5,sourceTabId:1,url:"https://other.test/window"});
 assert.equal(removedTabs.length,1);
 await listeners.message({action:"toggleSite",tabId:1,url:"https://site.test",disable:true});
 assert.equal(listeners.network(request).cancel,undefined);
 assert.equal(listeners.network({url:"https://site.test/?fbclid=abc",type:"main_frame",tabId:1}).redirectUrl,undefined);
 await listeners.popup({tabId:6,sourceTabId:1,url:"https://ads-pop.test/window"});
 assert.equal(removedTabs.length,1);
 const css=await listeners.message({action:"getStyle",url:"https://site.test"},{tab:{id:1},url:"https://site.test"});
 assert.equal(css.active,false);
});
