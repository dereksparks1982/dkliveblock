"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict");
const fs=require("node:fs"),vm=require("node:vm"),path=require("node:path");
const scripts=JSON.parse(fs.readFileSync(path.join(__dirname,"../src/manifest.json"),"utf8")).background.scripts;
test("Build 75 first-party YouTube player call reaches response rewriting, but unrelated requests stay blocked",async()=>{
 const listeners={},reg=name=>({addListener(fn){listeners[name]=fn;},removeListener(){}});
 let stored={settings:{autoUpdate:false,customRules:
  "||www.youtube.com/youtubei/v1/player$xhr\n||www.youtube.com/youtubei/v1/browse$xhr"}};
 let activeFilter=null;
 const browser={
  webRequest:{
   onBeforeRequest:reg("before"),onHeadersReceived:reg("headers"),
   onErrorOccurred:reg("error"),onCompleted:reg("completed"),
   filterResponseData(){activeFilter={out:[],closed:0,
    write(chunk){this.out.push(Buffer.from(chunk));},
    close(){this.closed++;},disconnect(){this.closed++;}};
    return activeFilter;}
  },
  proxy:{onRequest:reg("proxy"),onError:reg("proxyError")},dns:{resolve:async()=>({addresses:[]})},
  webNavigation:{onCreatedNavigationTarget:reg("popup")},
  tabs:{onUpdated:reg("updated"),onRemoved:reg("removed"),query:async()=>[],
   get:async id=>({id,url:"https://www.youtube.com/watch?v=private"}),
   sendMessage:async()=>({})},
  alarms:{onAlarm:reg("alarm"),create:async()=>{}},
  runtime:{onMessage:reg("message")},
  browserAction:{setBadgeText:async()=>{},setBadgeBackgroundColor:async()=>{}},
  storage:{local:{get:async()=>stored,set:async x=>{stored={...stored,...x};}}}
 };
 const timeout=(fn,ms)=>{const t=setTimeout(fn,ms);if(ms>=60000)t.unref();return t;};
 const context=vm.createContext({browser,URL,TextEncoder,TextDecoder,console,Date,AbortController,
  setTimeout:timeout,clearTimeout,fetch:async()=>{throw Error("no remote list updates");}});
 for(const name of scripts)
  vm.runInContext(fs.readFileSync(path.join(__dirname,"../src",name),"utf8"),context,{filename:name});
 await new Promise(resolve=>setTimeout(resolve,30));
 listeners.updated(1,{url:"https://www.youtube.com/watch?v=private"},{url:"https://www.youtube.com/watch?v=private"});
 const base={tabId:1,documentUrl:"https://www.youtube.com/watch?v=private",type:"xmlhttprequest",method:"POST"};
 const player={...base,url:"https://www.youtube.com/youtubei/v1/player?prettyPrint=false"};
 const browse={...base,url:"https://www.youtube.com/youtubei/v1/browse"};
 assert.equal(listeners.before(player).cancel,undefined,"player must pass");
 assert.equal(listeners.before({...player,documentUrl:""}).cancel,true,
  "contextless player-looking request must remain under normal network rules");
 assert.equal(listeners.before({...player,documentUrl:"https://unrelated.test/watch"}).cancel,true,
  "cross-site player-looking request must not receive a free pass");
 assert.equal(listeners.before(browse).cancel,undefined,"supported YouTube feed JSON must reach response filtering");
 assert.equal(listeners.before({...base,url:"https://googleads.g.doubleclick.net/pagead"}).cancel,true,"third-party ad stays blocked");
 listeners.headers({...player,requestId:"p1",statusCode:200,
  responseHeaders:[{name:"Content-Type",value:"application/json"}]});
 assert.ok(activeFilter,"response filter registered");
 const original=JSON.stringify({streamingData:{formats:[{url:"signed-video"}]},
  videoDetails:{title:"private"},adPlacements:[{}],adSlots:[{}],playerAds:[{}]});
 const bytes=Buffer.from(original);activeFilter.ondata({data:bytes.subarray(0,19)});
 activeFilter.ondata({data:bytes.subarray(19)});activeFilter.onstop();
 assert.equal(activeFilter.closed,1);
 const result=JSON.parse(Buffer.concat(activeFilter.out).toString("utf8"));
 assert.equal(result.adPlacements,undefined);
 assert.deepEqual(result.streamingData.formats[0].url,"signed-video");
 const metrics=await listeners.message({action:"getSiteDashboard",tabId:1});
 assert.equal(metrics.youtubeResponse.playerRequests,2);
 assert.equal(metrics.youtubeResponse.modified,1);
 assert.equal(metrics.youtubeResponse.fields,3);
 listeners.headers({...browse,requestId:"b1",statusCode:200,
  responseHeaders:[{name:"Content-Type",value:"application/json"}]});
 assert.ok(activeFilter,"feed JSON filter registered");
 const feed=JSON.stringify({contents:[{videoRenderer:{videoId:"organic"}},
  {adSlotRenderer:{adSlotId:"paid"}}]});
 activeFilter.ondata({data:Buffer.from(feed)});activeFilter.onstop();
 const resultFeed=JSON.parse(Buffer.concat(activeFilter.out).toString("utf8"));
 assert.equal(resultFeed.contents.length,1);
 assert.equal(resultFeed.contents[0].videoRenderer.videoId,"organic");
 const feedStats=await listeners.message({action:"getSiteDashboard",tabId:1});
 assert.equal(feedStats.youtubeResponse.modified,2);
 assert.equal(feedStats.youtubeResponse.fields,4);
 await listeners.message({action:"saveSettings",settings:{youtubeResponseFilter:false}});
 assert.equal(stored.settings.youtubeResponseFilter,false,"choice must persist");
 assert.equal((await listeners.message({action:"getSettings"})).settings.youtubeResponseFilter,false);
 assert.equal(listeners.before(player).cancel,true,"turning off filtering restores ordinary rule matching");
 assert.equal(listeners.before(browse).cancel,true,"disabled filtering restores browse rule blocking");
 await listeners.message({action:"saveSettings",settings:{youtubeResponseFilter:true}});
 assert.equal(stored.settings.youtubeResponseFilter,true,"re-enabling must persist");
 assert.equal(listeners.before(player).cancel,undefined,"player JSON is reachable once filtering is re-enabled");
 const paused=await listeners.message({action:"setSiteAllowed",tabId:1,allowed:true});
 assert.equal(paused.ok,true);
 assert.equal(listeners.before(player).cancel,undefined,"allowlisting still works");
});
