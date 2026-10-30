"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
test("versioned YouTube rules update, survive failure, roll back, and never reinstall rejected version",async()=>{
 const listeners={},on=name=>({
  addListener:fn=>{listeners[name]=fn;},
  removeListener:fn=>{if(listeners[name]===fn)delete listeners[name];}
 });
 let stored={settings:{autoUpdate:false}},mode="v1",requests=[];
 const pack=fs.readFileSync(path.join(__dirname,"../filters/youtube.txt"),"utf8");
 const version=(n,extra="")=>pack.replace("! DKLB-YouTube-Pack: 2","! DKLB-YouTube-Pack: "+n)+extra;
 const fetch=async(url,opts)=>{
  requests.push({url,options:opts});
  if(mode==="offline")throw Error("simulated offline");
  if(mode==="bad")return {ok:true,status:200,url,headers:{get:()=>null},
   text:async()=>version(4,"youtube.com##video\n")};
  if(mode==="304")return {ok:false,status:304,url,headers:{get:()=>null}};
  const text=mode==="v1"?pack:mode==="v2"?version(3,"youtube.com##.ytp-sponsored-display\n"):
   version(4,"youtube.com##.ytp-sponsored-display\n");
  return {ok:true,status:200,url,headers:{get:key=>key==="etag"?'"pack-'+mode+'"':null},text:async()=>text};
 };
 const browser={
  proxy:{onRequest:on("proxy"),onError:on("proxyError")},
  dns:{resolve:async()=>({addresses:[]})},
  webRequest:{onBeforeRequest:on("network"),onErrorOccurred:on("networkError")},
  webNavigation:{onCreatedNavigationTarget:on("popup")},
  tabs:{onUpdated:on("updated"),onRemoved:on("removed"),query:async()=>[],
   get:async id=>({id,url:"https://www.youtube.com/watch?v=x"}),sendMessage:async()=>{}},
  alarms:{onAlarm:on("alarm"),create:async()=>{}},
  browserAction:{setBadgeText:async()=>{}},
  runtime:{onMessage:on("message")},
  storage:{local:{get:async()=>stored,set:async x=>{stored={...stored,...x};}}}
 };
 const timers=(fn,ms)=>{const t=setTimeout(fn,ms);if(ms>=60000)t.unref();return t;};
 const ctx=vm.createContext({browser,URL,console,Date,AbortController,TextDecoder,
  fetch,setTimeout:timers,clearTimeout});
 for(const name of ["public-suffix.js","rules.js","engine.js","privacy.js","subscriptions.js",
  "manual-rules.js","network-recovery.js","list-io.js","subscription-cache.js","settings.js",
  "video-assist.js","auth-protection.js","youtube-maintenance.js","background.js"])
  vm.runInContext(fs.readFileSync(path.join(__dirname,"../src",name),"utf8"),ctx,{filename:name});
 await new Promise(resolve=>setTimeout(resolve,25));
 assert.equal((await listeners.message({action:"status",url:"https://www.youtube.com",tabId:1})).youtubeRules.version,0);
 const result1=await listeners.message({action:"updateYouTubePack"});
 assert.equal(result1.changed,true);
 assert.equal(stored.settings.autoYouTubeRules,true);
 assert.equal(result1.version,2);
 assert.equal(requests.at(-1).url,"https://raw.githubusercontent.com/dereksparks1982/dkliveblock/main/filters/youtube.txt");
 assert.equal(stored.youtubeRules.version,2);
 mode="304";
 const unchanged=await listeners.message({action:"updateYouTubePack"});
 assert.equal(unchanged.changed,false);
 assert.equal(unchanged.checked,true);
 assert.equal(stored.youtubeRules.version,2);
 assert.equal(requests.at(-1).options.headers["If-None-Match"],'"pack-v1"');
 mode="v2";
 const updated=await listeners.message({action:"updateYouTubePack"});
 assert.equal(updated.version,3);
 assert.equal(stored.youtubePrevious.version,2);
 const style=await listeners.message({action:"getStyle",url:"https://www.youtube.com/watch?v=123"},
  {tab:{id:1,url:"https://www.youtube.com/watch?v=123"},url:"https://www.youtube.com/watch?v=123"});
 assert.match(style.css,/ytp-sponsored-display/);
 mode="bad";
 const bad=await listeners.message({action:"updateYouTubePack"});
 assert.match(bad.error,/Unsafe|unsupported/);
 assert.equal(stored.youtubeRules.version,3);
 mode="offline";
 const failed=await listeners.message({action:"updateYouTubePack"});
 assert.match(failed.error,/offline/);
 assert.equal(stored.youtubeRules.version,3);
 const revoked=await listeners.message({action:"rollbackYouTubePack"});
 assert.equal(revoked.ok,true);
 assert.equal(revoked.version,2);
 assert.equal(revoked.heldVersion,3);
 assert.equal(stored.youtubeRules.version,2);
 mode="v2";
 const reject=await listeners.message({action:"updateYouTubePack"});
 assert.match(reject.error,/rolled back/);
 assert.equal(stored.youtubeRules.version,2);
 // Disable automatic YouTube updates independently of other filter subscriptions.
 const change=await listeners.message({action:"saveSettings",settings:{autoYouTubeRules:false}});
 assert.equal(change.ok,true);
 assert.equal(stored.settings.autoYouTubeRules,false);
 assert.equal((await listeners.message({action:"getSettings"})).youtubeRules.remoteEnabled,false);
 mode="v3";
 const newVersion=await listeners.message({action:"updateYouTubePack"});
 assert.equal(newVersion.version,4);
 const contentFrame={tab:{id:1,url:"https://www.youtube.com/"},url:"https://www.youtube.com/"};
 for(const action of ["updateYouTubePack","rollbackYouTubePack"]){
  const response=await listeners.message({action},contentFrame);
  assert.match(response.error,/extension interface/);
 }
});
