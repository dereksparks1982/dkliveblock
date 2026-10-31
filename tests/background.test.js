"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
const backgroundScripts=JSON.parse(fs.readFileSync(path.join(__dirname,"../src/manifest.json"),"utf8")).background.scripts;
test("background blocks seeded ads, logs host-only requests, then pauses the site",async()=>{
 const listeners={},reg=name=>({addListener(fn){listeners[name]=fn;},removeListener(fn){if(listeners[name]===fn)delete listeners[name];}});
 let stored={settings:{autoUpdate:false,customRules:"||ads-pop.test^$popup\n*$removeparam=utm_source"}};
 const removedTabs=[];
 const browser={
  webRequest:{onBeforeRequest:reg("network"),onErrorOccurred:reg("networkError")},proxy:{onRequest:reg("proxy"),onError:reg("proxyError")},dns:{resolve:async host=>({addresses:["203.0.113.10"]})},
  webNavigation:{onCreatedNavigationTarget:reg("popup")},
  tabs:{onUpdated:reg("updated"),onRemoved:reg("removed"),query:async()=>[{id:1,url:"https://site.test"}],get:async id=>({id,url:"https://site.test"}),remove:async id=>{removedTabs.push(id);},sendMessage:async()=>({}),reload:async()=>{}},
  alarms:{onAlarm:reg("alarm"),create:async()=>{}},
  runtime:{onMessage:reg("message")},
  browserAction:{setBadgeText:async()=>{},setBadgeBackgroundColor:async()=>{}},
  storage:{local:{get:async()=>stored,set:async x=>{stored={...stored,...x};}}}
 };
 const context=vm.createContext({browser,URL,TextEncoder,TextDecoder,console,Date,AbortController,setTimeout:(fn,ms,...args)=>{const timer=setTimeout(fn,ms,...args);if(ms>=60000)timer.unref();return timer;},clearTimeout,fetch:async()=>{throw Error("unexpected list fetch");}});
 for(const name of backgroundScripts){
  vm.runInContext(fs.readFileSync(path.resolve(__dirname,"../src",name),"utf8"),context,{filename:name});
 }
 await new Promise(resolve=>setTimeout(resolve,20));
 const request={url:"https://doubleclick.net/pixel",type:"image",documentUrl:"https://site.test/",tabId:1};
 assert.equal(listeners.network(request).cancel,true);
 const state=await listeners.message({action:"status",tabId:1,url:"https://site.test"});
 assert.equal(state.tabBlocked,1);
 const cleaned=listeners.network({url:"https://site.test/?utm_source=mail&post=42",type:"main_frame",tabId:1});
 assert.equal(cleaned.redirectUrl,"https://site.test/?post=42");
 assert.equal(listeners.network({url:"https://site.test/?utm_source=x",tabId:1,
  type:"main_frame",method:"POST"}).redirectUrl,undefined);
 assert.equal(listeners.network({url:"https://site.test/?sig=abc&utm_source=x",tabId:1,
  type:"main_frame",method:"GET"}).redirectUrl,undefined);
 assert.equal(listeners.network({url:"https://site.test/?X-Amz-Signature=signed&utm_source=x",
  tabId:1,type:"main_frame",method:"GET"}).redirectUrl,undefined);
 assert.equal(listeners.network({url:"https://site.test/?token=signed&utm_source=x",
  tabId:1,type:"main_frame",method:"GET"}).redirectUrl,undefined);
 assert.equal(state.ready,true);
 listeners.networkError({requestId:"unrelated",url:"https://img.site.test/photo.png?private=secret",type:"image",error:"NS_ERROR_UNKNOWN_HOST",tabId:1});
 const issueStatus=await listeners.message({action:"status",tabId:1,url:"https://site.test"});
 assert.equal(issueStatus.networkIssueCount,1);
 const log=await listeners.message({action:"getLog",tabId:1});
 assert.equal(log.length,1);
 assert.equal(log[0].host,"doubleclick.net");
 assert.equal(JSON.stringify(log).includes("/pixel"),false);
 const unsafe=await listeners.message({action:"allowHost",url:"https://site.test/",host:"bad^$important"});
 assert.match(unsafe.error,/Invalid/);
 const safe=await listeners.message({action:"allowHost",url:"https://site.test/",host:"doubleclick.net"});
 assert.equal(safe.ok,true);
 assert.equal(listeners.network(request).cancel,undefined);
 const siteRules=await listeners.message({action:"getSiteExceptions",url:"https://site.test/"});
 assert.deepEqual(Array.from(siteRules),["doubleclick.net"]);
 const revoked=await listeners.message({action:"removeSiteException",url:"https://site.test/",host:"doubleclick.net"});
 assert.equal(revoked.ok,true);
 assert.equal(listeners.network(request).cancel,true);
 const nonexistent=await listeners.message({action:"removeSiteException",url:"https://site.test/",host:"doubleclick.net"});
 assert.match(nonexistent.error,/No matching/);
 await listeners.message({action:"allowHost",url:"https://site.test/",host:"doubleclick.net"});
 assert.equal(listeners.network(request).cancel,undefined);
 const another={url:"https://googlesyndication.com/ad",tabId:1,type:"image",documentUrl:"https://site.test/"};
 assert.equal(listeners.network(another).cancel,true);
 await listeners.message({action:"toggleTabPause",tabId:1,url:"https://site.test/",paused:true});
 assert.equal(listeners.network(another).cancel,undefined);
 const pausedTab=await listeners.message({action:"status",tabId:1,url:"https://site.test/"});
 assert.equal(pausedTab.temporarilyPaused,true);
 assert.equal(pausedTab.sitePaused,false);
 await listeners.message({action:"toggleTabPause",tabId:1,url:"https://site.test/",paused:false});
 assert.equal(listeners.network(another).cancel,true);
 await listeners.popup({tabId:4,sourceTabId:1,url:"https://ads-pop.test/window"});
 assert.equal(removedTabs.length,1);
 assert.equal(removedTabs[0],4);
 const afterPopup=await listeners.message({action:"getLog",tabId:1});
 assert.equal(afterPopup[0].type,"popup");
 await listeners.popup({tabId:5,sourceTabId:1,url:"https://other.test/window"});
 assert.equal(removedTabs.length,1);
 await listeners.message({action:"toggleSite",tabId:1,url:"https://site.test",disable:true});
 assert.equal((await listeners.message({action:"status",tabId:1,url:"https://site.test/"})).sitePaused,true);
 assert.equal(listeners.network(request).cancel,undefined);
 assert.equal(listeners.network({url:"https://site.test/?fbclid=abc",type:"main_frame",tabId:1}).redirectUrl,undefined);
 await listeners.popup({tabId:6,sourceTabId:1,url:"https://ads-pop.test/window"});
 assert.equal(removedTabs.length,1);
 const rejected=await listeners.message({action:"saveSettings",settings:{customSubscriptions:["http://insecure.test/list.txt"]}});
 assert.match(rejected.error,/HTTPS/);
 const updated=await listeners.message({action:"updateLists"});
 assert.equal(updated.updated,0);
 assert.ok(updated.errors.some(x=>x.includes("EasyList")));
 const health=await listeners.message({action:"getSettings"});
 assert.match(health.listState.easylist.error,/unexpected list fetch/);
 const beforeClear=await listeners.message({action:"getLog",tabId:1});
 assert.ok(beforeClear.length>0);
 await listeners.message({action:"clearLog",tabId:1});
 assert.equal((await listeners.message({action:"getLog",tabId:1})).length,0);
 const privacy=await listeners.message({action:"saveSettings",settings:{requestLog:false}});
 assert.equal(privacy.ok,true);
 assert.equal(listeners.network(request).cancel,undefined);
 await listeners.message({action:"resetStatistics"});
 assert.equal((await listeners.message({action:"status",tabId:1,url:"https://site.test"})).totalBlocked,0);
 const styleBefore=await listeners.message({action:"getStyle",url:"https://site.test"},{tab:{id:1},url:"https://site.test"});
 assert.equal(styleBefore.antiAdblock,true);
 assert.equal(styleBefore.paywallPopups,true);
 const setting=await listeners.message({action:"saveSettings",settings:{antiAdblock:false}});
 assert.equal(setting.ok,true);
 const styleAfter=await listeners.message({action:"getStyle",url:"https://site.test"},{tab:{id:1},url:"https://site.test"});
 assert.equal(styleAfter.antiAdblock,false);
 const disablePaywall=await listeners.message({action:"saveSettings",settings:{paywallPopups:false}});
 assert.equal(disablePaywall.ok,true);
 const paywallOff=await listeners.message({action:"getStyle",url:"https://site.test"},{tab:{id:1},url:"https://site.test"});
 assert.equal(paywallOff.paywallPopups,false);
 assert.equal(styleAfter.active,false);
 // Guard genuine streaming player containers, but retain advertising slots.
 const streamingRules=[
  "youtube.com##video","youtube.com###movie_player",
  "youtube.com##.html5-video-player","youtube.com##ytd-ad-slot-renderer",
  "youtube.com##.sponsored",
  "disneyplus.com##video","disneyplus.com##.video-stream",
  "disneyplus.com##.sponsored"
 ].join("\n");
 const addedStreaming=await listeners.message({action:"saveSettings",settings:{customRules:streamingRules}});
 assert.equal(addedStreaming.ok,true);
 const youtube=await listeners.message({action:"getStyle",url:"https://www.youtube.com/watch?v=abc"},
  {tab:{id:30,url:"https://www.youtube.com/watch?v=abc"},url:"https://www.youtube.com/watch?v=abc"});
 assert.equal(youtube.active,true);
 assert.equal(youtube.youtubeSkip,true);
 assert.match(youtube.css,/ytd-ad-slot-renderer/);
 assert.match(youtube.css,/\.sponsored/);
 assert.doesNotMatch(youtube.css,/video\s*\{/);
 assert.doesNotMatch(youtube.css,/#movie_player\s*\{/);
 const disney=await listeners.message({action:"getStyle",url:"https://www.disneyplus.com/video/abc"},
  {tab:{id:31,url:"https://www.disneyplus.com/video/abc"},url:"https://www.disneyplus.com/video/abc"});
 assert.match(disney.css,/\.sponsored/);
 assert.doesNotMatch(disney.css,/video\s*\{/);
 assert.doesNotMatch(disney.css,/\.video-stream\s*\{/);
 const mediaRequest={url:"https://r1---sn.googlevideo.com/videoplayback",
  tabId:30,type:"media",documentUrl:"https://www.youtube.com/watch?v=test"};
 const normalRules=await listeners.message({action:"saveSettings",settings:{
  customRules:"||googlevideo.com^$media"
 }});
 assert.equal(normalRules.ok,true);
 assert.equal(listeners.network(mediaRequest).cancel,true);
 const enabledMedia=await listeners.message({action:"toggleMediaRecovery",
  url:"https://www.youtube.com/watch?v=test",tabId:30,enabled:true});
 assert.equal(enabledMedia.mediaRecoveryEnabled,true);
 assert.equal(enabledMedia.mediaRecoveryAvailable,true);
 assert.equal(listeners.network(mediaRequest).cancel,undefined);
 assert.equal(listeners.network({url:"https://doubleclick.net/script.js",
  tabId:30,type:"script",documentUrl:"https://www.youtube.com/"}).cancel,true);
 assert.equal(listeners.network({...mediaRequest,
  tabId:33,documentUrl:"https://news.example/story"}).cancel,true);
 const unsafeMedia=await listeners.message({action:"toggleMediaRecovery",
  url:"https://news.example/story",tabId:33,enabled:true});
 assert.match(unsafeMedia.error,/supported streaming/);
 const disabledMedia=await listeners.message({action:"toggleMediaRecovery",
  url:"https://www.youtube.com/watch?v=test",tabId:30,enabled:false});
 assert.equal(disabledMedia.mediaRecoveryEnabled,false);
 assert.equal(listeners.network(mediaRequest).cancel,true);
 // Popup cleanup can be paused without disabling network advertisements or cosmetics.
 const page="https://www.youtube.com/watch?v=abc";
 const first=await listeners.message({action:"getStyle",url:page},{tab:{id:30,url:page},url:page});
 assert.equal(first.antiAdblock,false); // global anti-adblock previously disabled in this test
 const enabled=await listeners.message({action:"saveSettings",settings:{antiAdblock:true,paywallPopups:true}});
 assert.equal(enabled.ok,true);
 const popupOff=await listeners.message({action:"toggleSitePopupProtection",url:page,tabId:30,pause:true});
 assert.equal(popupOff.popupProtectionPaused,true);
 const pausedStyle=await listeners.message({action:"getStyle",url:page},{tab:{id:30,url:page},url:page});
 assert.equal(pausedStyle.active,true);
 assert.equal(pausedStyle.antiAdblock,false);
 assert.equal(pausedStyle.paywallPopups,false);
 assert.match(pausedStyle.css,/\.adsbygoogle/); // cosmetic filtering continues
 assert.equal(listeners.network({url:"https://doubleclick.net/pixel",type:"image",tabId:30,documentUrl:page}).cancel,true);
 const other=await listeners.message({action:"getStyle",url:"https://news.example/",tabId:60},
  {tab:{id:60,url:"https://news.example/"},url:"https://news.example/"});
 assert.equal(other.antiAdblock,true);
 assert.equal(other.paywallPopups,true);
 const resumed=await listeners.message({action:"toggleSitePopupProtection",url:page,tabId:30,pause:false});
 assert.equal(resumed.popupProtectionPaused,false);
 const activeStyle=await listeners.message({action:"getStyle",url:page},{tab:{id:30,url:page},url:page});
 assert.equal(activeStyle.antiAdblock,true);
 assert.equal(activeStyle.paywallPopups,true);
 const report=await listeners.message({action:"reportPopupCleanup",kind:"antiAdblock",count:2},
  {tab:{id:30,url:page},url:page});
 assert.equal(report.ok,true);
 const tally=await listeners.message({action:"status",url:page,tabId:30});
 assert.equal(tally.popupHiddenCount,2);
 const invalid=await listeners.message({action:"reportPopupCleanup",kind:"antiAdblock",count:999},
  {tab:{id:30,url:page},url:page});
 assert.match(invalid.error,/Invalid popup report/);
 const noExtension=await listeners.message({action:"reportPopupCleanup",kind:"antiAdblock",count:1});
 assert.match(noExtension.error,/Invalid popup report/);
 const stillTwo=await listeners.message({action:"status",url:page,tabId:30});
 assert.equal(stillTwo.popupHiddenCount,2);
 listeners.updated(30,{status:"loading"},{url:page});
 assert.equal((await listeners.message({action:"status",url:page,tabId:30})).popupHiddenCount,0);
});
