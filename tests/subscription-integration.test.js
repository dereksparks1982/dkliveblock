"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
test("conditional 304 updates reuse valid cached lists, preserve last-good on errors",async()=>{
 const handlers={},on=name=>({addListener:f=>{handlers[name]=f;},removeListener:f=>{if(handlers[name]===f)delete handlers[name];}});
 // Exercise just two known lists without changing the five-list production defaults.
 let saved={settings:{autoUpdate:false,autoYouTubeRules:false,
  listEnabled:{easylist:true,easyprivacy:true,cookies:false,annoyances:false,social:false}}},calls=[],mode="fresh";
 const doc="[Adblock Plus 2.0]\n! Title: Network test\n"+"||ad.example.net^\n".repeat(30);
 const fetch=async (url,opts)=>{
  calls.push({url,headers:opts.headers});
  if(mode==="error")throw Error("simulated offline");
  if(mode==="unsafe")return {ok:true,status:200,url:"http://insecure.example/list.txt",headers:{get:name=>name==="etag"?'"v2"':null},text:async()=>doc};
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
 const context=vm.createContext({browser,URL,TextEncoder,TextDecoder,AbortController,Date,console,fetch,setTimeout:st,clearTimeout});
 for(const name of JSON.parse(
  fs.readFileSync(path.join(__dirname,"../src/manifest.json"),"utf8")).background.scripts)
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
 mode="unsafe";
 response=await handlers.message({action:"updateLists"});
 assert.equal(response.updated,0);
 assert.equal(response.errors.length,2);
 assert.equal(saved.lists.easylist.text,cached);
 assert.match(response.errors[0],/Insecure filter list redirect/);
});

test("Build 197 list refresh refuses corrupt, oversized and excessive-line updates",()=>{
 const G=require("../src/subscription-update-guard.js");
 const old={text:"||old.example^\n".repeat(150)};
 assert.equal(G.check(old,"||new.example^\n".repeat(150)).accept,true);
 assert.equal(G.check(old,"||new.example^\n".repeat(20)).accept,false);
 assert.equal(G.check(old,"||new.example^\u0000\n".repeat(150)).accept,false);
 assert.match(G.check(old,"||new.example^\u0000\n".repeat(150)).reason,/Invalid/);
 assert.equal(G.check(old,"x".repeat(G.MAX_CHARS+1)).accept,false);
 assert.equal(G.check(old,"\n".repeat(G.MAX_LINES+1)).accept,false);
});

test("Build 201 refuses HTML, XML and JSON errors without corrupting list cache",()=>{
 const G=require("../src/subscription-update-guard.js");
 const previous={text:"||ads.example^\n".repeat(150)};
 for(const body of ["<!doctype html><html>503</html>","<html><body>bad</body></html>",
  '{"error":"unavailable"}',"<?xml version='1.0'?><error/>"]){
  assert.equal(G.check(previous,body).accept,false,body);
  assert.match(G.check(previous,body).reason,/error page/);
 }
 assert.equal(G.check(previous,"! metadata only").accept,false);
 assert.equal(G.check(previous,"||new.example^\n".repeat(150)).accept,true);
 assert.equal(G.check(null,"<html>bad</html>").accept,false);
});

test("Build 204 refuses apparently healthy counts of error text and embedded markup",()=>{
 const G=require("../src/subscription-update-guard.js");
 const old={text:"[Adblock Plus 2.0]\n! Title: Previous\n"+
  "||ads.example^$script\n".repeat(200)};
 const garbage="[Adblock Plus 2.0]\n! Title: Outage\n"+
  "Service temporarily unavailable\n".repeat(200);
 const unsafe=G.check(old,garbage);
 assert.equal(unsafe.accept,false);
 assert.match(unsafe.reason,/recognizable filter syntax/);
 const embedded="[Adblock Plus 2.0]\n! Title: CDN\n"+
  "||ads.example^\n".repeat(200)+"<html>failure</html>\n";
 assert.equal(G.check(old,embedded).accept,false);
 assert.match(G.check(old,embedded).reason,/error page/);
 assert.equal(G.check(old,"||fresh.example^\n".repeat(190)).accept,true);
 assert.equal(G.check(null,"someword\n".repeat(10)).accept,true,
  "do not forbid new deliberate literal custom subscriptions");
 const report=G.check(old,garbage);
 assert.equal(JSON.stringify(report).includes("Service"),false);
 assert.equal(G.profile(old.text).structured,200);
 assert.equal(G.profile(garbage).structured,0);
 const padded="[Adblock Plus 2.0]\n! Title: Broken with padding\n"+
  "||real-ad.example^\n".repeat(30)+
  "Service temporarily unavailable\n".repeat(170);
 assert.equal(G.check(old,padded).accept,false,
  "a sprinkling of real rules must not mask catastrophic lost rules");
});
