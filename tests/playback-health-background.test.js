"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
const src=path.resolve(__dirname,"../src");
const manifest=JSON.parse(fs.readFileSync(path.join(src,"manifest.json"),"utf8"));
async function setup(){
 const hooks={},on=name=>({addListener:fn=>hooks[name]=fn,removeListener:()=>{}});
 let stored={settings:{autoUpdate:false,requestLog:true}},tabs=new Map([
  [1,"https://www.youtube.com/watch?v=test-video"],
  [2,"https://news.example.org/article"],
  [3,"https://www.disneyplus.com/play/abcdef"]]);
 const browser={
  webRequest:{onBeforeRequest:on("before"),onErrorOccurred:on("error"),
   onCompleted:on("completed"),onBeforeRedirect:on("redirect")},
  proxy:{onRequest:on("proxy"),onError:on("proxyError")},
  webNavigation:{onCreatedNavigationTarget:on("popup")},
  dns:{resolve:async()=>({addresses:[]})},
  tabs:{onCreated:on("created"),onUpdated:on("updated"),onRemoved:on("removed"),
   query:async()=>[...tabs].map(([id,url])=>({id,url})),
   get:async id=>{if(!tabs.has(id))throw Error("Tab closed");return {id,url:tabs.get(id)};},
   sendMessage:async()=>{},remove:async()=>{},reload:async()=>{}},
  alarms:{onAlarm:on("alarm"),create:async()=>{}},
  runtime:{onMessage:on("message")},
  browserAction:{setBadgeText:async()=>{},setBadgeBackgroundColor:async()=>{},
   setBadgeTextColor:async()=>{}},
  storage:{local:{get:async()=>stored,set:async x=>{stored={...stored,...x};}}}
 };
 const timeout=(fn,ms,...args)=>{const t=setTimeout(fn,ms,...args);if(ms>=60000)t.unref();return t;};
 const ctx=vm.createContext({browser,URL,console,AbortController,Date,TextEncoder,TextDecoder,
  fetch:async()=>{throw Error("No network during tests");},setTimeout:timeout,clearTimeout});
 for(const script of manifest.background.scripts)
  vm.runInContext(fs.readFileSync(path.join(src,script),"utf8"),ctx,{filename:script});
 await new Promise(resolve=>setTimeout(resolve,25));
 return {hooks,browser,tabs,stored:()=>stored};
}
const youtube={url:"https://www.youtube.com/watch?v=test-video",
 tab:{id:1,url:"https://www.youtube.com/watch?v=test-video"},frameId:0};
const disney={url:"https://www.disneyplus.com/play/abcdef",
 tab:{id:3,url:"https://www.disneyplus.com/play/abcdef"},frameId:0};
test("YouTube health is local, read-only and correlates observed blocked media",async()=>{
 const {hooks}=await setup();
 assert.equal(hooks.before({requestId:"blocked-media-1",url:"https://doubleclick.net/ad.mp4?private=yes",
  documentUrl:youtube.url,tabId:1,type:"media"}).cancel,true);
 assert.equal((await hooks.message({action:"reportPlaybackHealth",kind:"buffering"},youtube)).ok,true);
 const rows=await hooks.message({action:"getPlaybackHealth",tabId:1});
 assert.equal(rows.length,1);assert.equal(rows[0].kind,"buffering");
 assert.equal(rows[0].blockedMediaNearby,true);
 assert.doesNotMatch(JSON.stringify(rows),/test-video|private|doubleclick|url|watch/);
 // Health reporting MUST NOT weaken the normal rule.
 assert.equal(hooks.before({requestId:"blocked-media-2",url:"https://doubleclick.net/second.mp4",
  documentUrl:youtube.url,tabId:1,type:"media"}).cancel,true);
});
test("spoofed frames, unrelated sites and invalid event kinds cannot add health signals",async()=>{
 const {hooks,tabs}=await setup();
 for(const sender of [
  {...youtube,frameId:1},
  {url:"https://news.example.org/",tab:{id:2,url:"https://news.example.org/"},frameId:0},
  {...youtube,url:"https://youtube.com.evil.org/"},
  {url:"https://m.youtube.com/",tab:{id:1,url:"https://m.youtube.com/"},frameId:0},
 ]){
  const reply=await hooks.message({action:"reportPlaybackHealth",kind:"buffering"},sender);
  assert.equal(reply.ok,false);
 }
 assert.equal((await hooks.message({action:"reportPlaybackHealth",kind:"not-an-error"},youtube)).ok,false);
 tabs.set(1,"https://other.example/");
 assert.equal((await hooks.message({action:"reportPlaybackHealth",kind:"media-error"},youtube)).ok,false);
 assert.deepEqual(Array.from(await hooks.message({action:"getPlaybackHealth",tabId:1})),[]);
});
test("content cannot read/clear health records, and logging off removes them",async()=>{
 const {hooks}=await setup();
 assert.equal((await hooks.message({action:"reportPlaybackHealth",kind:"buffering"},youtube)).ok,true);
 for(const action of ["getPlaybackHealth","clearPlaybackHealth"]){
  const result=await hooks.message({action,tabId:1},youtube);
  assert.match(result.error,/extension interface/i);
 }
 assert.equal((await hooks.message({action:"saveSettings",settings:{requestLog:false}})).ok,true);
 assert.deepEqual(Array.from(await hooks.message({action:"getPlaybackHealth",tabId:1})),[]);
 assert.equal((await hooks.message({action:"reportPlaybackHealth",kind:"media-error"},youtube)).ok,false);
});
test("user clears history and changing site erases former YouTube health",async()=>{
 const {hooks,tabs}=await setup();
 await hooks.message({action:"reportPlaybackHealth",kind:"media-error"},youtube);
 assert.equal((await hooks.message({action:"clearPlaybackHealth",tabId:1})).ok,true);
 assert.deepEqual(Array.from(await hooks.message({action:"getPlaybackHealth",tabId:1})),[]);
 await hooks.message({action:"reportPlaybackHealth",kind:"buffering"},youtube);
 tabs.set(1,"https://news.example/");
 hooks.updated(1,{url:"https://news.example/",status:"loading"},{url:"https://news.example/"});
 tabs.set(1,youtube.url);
 hooks.updated(1,{url:youtube.url,status:"loading"},{url:youtube.url});
 assert.deepEqual(Array.from(await hooks.message({action:"getPlaybackHealth",tabId:1})),[]);
});
test("getStyle enables monitoring only for active top-level YouTube frame",async()=>{
 const {hooks}=await setup();
 const enabled=await hooks.message({action:"getStyle"},youtube);
 assert.equal(enabled.playbackHealthEnabled,true);
 const sub=await hooks.message({action:"getStyle"},{...youtube,frameId:1});
 assert.equal(sub.playbackHealthEnabled,false);
 const unrelated=await hooks.message({action:"getStyle"},{
  url:"https://news.example.org/article",tab:{id:2,url:"https://news.example.org/article"},frameId:0});
 assert.equal(unrelated.playbackHealthEnabled,false);
});

test("Disney+ main-frame health observes nearby blocked media but never automatically unblocks",async()=>{
 const {hooks}=await setup();
 const style=await hooks.message({action:"getStyle"},disney);
 assert.equal(style.playbackHealthEnabled,true);
 const blocked=hooks.before({requestId:"disney-media-1",tabId:3,
  url:"https://doubleclick.net/ad-media.mp4?PRIVATE_TOKEN=yes",type:"media",
  documentUrl:disney.url});
 assert.equal(blocked.cancel,true);
 assert.equal((await hooks.message({action:"reportPlaybackHealth",kind:"buffering"},disney)).ok,true);
 const rows=await hooks.message({action:"getPlaybackHealth",tabId:3});
 assert.equal(rows.length,1);
 assert.equal(rows[0].kind,"buffering");
 assert.equal(rows[0].blockedMediaNearby,true);
 assert.doesNotMatch(JSON.stringify(rows),/abcdef|PRIVATE_TOKEN|doubleclick|ad-media/);
 // The same traffic remains blocked after reporting.
 assert.equal(hooks.before({requestId:"disney-media-2",tabId:3,
  url:"https://doubleclick.net/other-video.mp4",type:"media",
  documentUrl:disney.url}).cancel,true);
});
test("Disney+ sibling frames and domain lookalikes cannot forge playback reports",async()=>{
 const {hooks}=await setup();
 for(const sender of [
  {...disney,frameId:1},
  {...disney,url:"https://notdisneyplus.com/"},
  {...disney,tab:{id:3,url:"https://disneyplus.com.attacker.net/"}},
  {...disney,url:"https://youtube.com/",frameId:0}
 ]){
  const result=await hooks.message({action:"reportPlaybackHealth",kind:"media-error"},sender);
  assert.equal(result.ok,false);
 }
 assert.equal((await hooks.message({action:"getPlaybackHealth",tabId:3})).length,0);
});
