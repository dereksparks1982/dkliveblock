"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict");
const fs=require("node:fs"),vm=require("node:vm"),path=require("node:path");
const source=fs.readFileSync(path.resolve(__dirname,"../src/youtube-page-bridge.js"),"utf8");
const EVENT="dk-live-block:youtube-response-control";
function context(){
 const listeners={};const document={addEventListener(k,fn){listeners[k]=fn;}};
 const requests=[];
 const originalFetch=(url,opts)=>{requests.push({url,opts});
  return Promise.resolve({status:200,headers:{get:()=> "application/json"},
   json:()=>Promise.resolve({videoDetails:{title:"private"},streamingData:{formats:[1]},adSlots:[{}]}),
   text:()=>Promise.resolve(JSON.stringify({videoDetails:{title:"private"},adPlacements:[{}]})),
   clone(){return this;}});};
 function XHR(){}
 XHR.prototype.open=function(method,url){this.request={method,url};};
 XHR.prototype.send=function(){};
 Object.defineProperty(XHR.prototype,"responseText",{configurable:true,get(){return JSON.stringify({videoDetails:{title:"private"},adSlots:[{}]});}});
 Object.defineProperty(XHR.prototype,"response",{configurable:true,get(){return {videoDetails:{title:"private"},adSlots:[{}]};}});
 XHR.prototype.getResponseHeader=()=> "application/json";
 const window={fetch:originalFetch,XMLHttpRequest:XHR};
 window.top=window;
 const location={hostname:"www.youtube.com",href:"https://www.youtube.com/watch?v=private"};
 const context=vm.createContext({window,document,location,URL,Promise,WeakMap,Object,Array,JSON,String});
 const feed=fs.readFileSync(path.resolve(__dirname,"../src/youtube-feed.js"),"utf8");
 vm.runInContext(feed,context,{filename:"youtube-feed.js"});
 vm.runInContext(source,context,{filename:"youtube-page-bridge.js"});
 return {window,document,requests,originalFetch,send:flag=>listeners[EVENT]({detail:flag})};
}
test("Build 74 MAIN-world script waits for explicit activation and restores fetch",async()=>{
 const p=context();
 assert.equal(p.window.fetch,p.originalFetch);
 p.send("enable");assert.notEqual(p.window.fetch,p.originalFetch);
 const response=await p.window.fetch("https://www.youtube.com/youtubei/v1/player",{method:"POST"});
 const parsed=await response.json();
 assert.equal(parsed.adSlots,undefined);
 assert.deepEqual(Array.from(parsed.streamingData.formats),[1]);
 p.send("disable");assert.equal(p.window.fetch,p.originalFetch);
 const fresh=await p.window.fetch("https://www.youtube.com/youtubei/v1/player",{method:"POST"});
 assert.ok((await fresh.json()).adSlots);
});
test("Build 74 does not rewrite GET, unrelated URL or unsupported page responses",async()=>{
 const p=context();p.send("enable");
 const unrelated=await p.window.fetch("https://www.youtube.com/youtubei/v1/browse",{method:"POST"});
 assert.ok((await unrelated.json()).adSlots);
 const get=await p.window.fetch("https://www.youtube.com/youtubei/v1/player");
 assert.ok((await get.json()).adSlots);
 const outside=await p.window.fetch("https://attacker.test/youtubei/v1/player",{method:"POST"});
 assert.ok((await outside.json()).adSlots);
 const response=await p.window.fetch("https://www.youtube.com/youtubei/v1/get_watch",{method:"POST"});
 assert.equal(JSON.parse(await response.text()).adPlacements,undefined);
});
test("Build 74 XHR responseText and json are limited to valid response and reset on disable",()=>{
 const p=context();const proto=p.window.XMLHttpRequest.prototype;
 const native=Object.getOwnPropertyDescriptor(proto,"responseText").get;
 p.send("enable");
 const xhr=new p.window.XMLHttpRequest();
 xhr.open("POST","https://www.youtube.com/youtubei/v1/player");xhr.readyState=4;xhr.status=200;xhr.responseType="";
 assert.equal(JSON.parse(xhr.responseText).adSlots,undefined);
 xhr.responseType="json";assert.equal(xhr.response.adSlots,undefined);
 p.send("disable");assert.equal(Object.getOwnPropertyDescriptor(proto,"responseText").get,native);
});
test("Build 83 initial feed ad handling runs after activation in MAIN world",()=>{
 const p=context();
 p.window.ytInitialData={contents:[
  {videoRenderer:{videoId:"normal"}},
  {adSlotRenderer:{adId:"paid"}}
 ]};
 p.send("enable");
 assert.equal(p.window.ytInitialData.contents.length,1);
 assert.equal(p.window.ytInitialData.contents[0].videoRenderer.videoId,"normal");
});
test("Build 78 page script nested reply handling and ready handshake",()=>{
 const p=context();
 p.window.ytInitialPlayerResponse={playerResponse:JSON.stringify({
  streamingData:{formats:[1]},videoDetails:{title:"private"},adSlots:[{}]})};
 p.send("enable");
 assert.equal(JSON.parse(p.window.ytInitialPlayerResponse.playerResponse).adSlots,undefined);
 assert.match(source,/youtube-response-ready/);
 const c=fs.readFileSync(path.resolve(__dirname,"../src/content.js"),"utf8");
 assert.match(c,/bridgeReadySeen/);
});
test("Build 84 MAIN-world bridge preserves denied player response with nested metadata",()=>{
 const p=context();
 const nested={streamingData:{formats:[{url:"signed"}]},videoDetails:{title:"private"},
  adPlacements:[{}]};
 p.window.ytInitialPlayerResponse={playabilityStatus:{status:"LOGIN_REQUIRED"},
  playerResponse:JSON.stringify(nested)};
 const before=p.window.ytInitialPlayerResponse.playerResponse;
 p.send("enable");
 assert.equal(p.window.ytInitialPlayerResponse.playerResponse,before);
});
test("Build 77 removes known ad fields from an already loaded initial player bootstrap",()=>{
 const p=context();
 p.window.ytInitialPlayerResponse={streamingData:{formats:["signed"]},videoDetails:{title:"private"},
  adPlacements:[{ad:1}],adSlots:[{ad:2}],playabilityStatus:{status:"OK"}};
 p.send("enable");
 assert.equal(p.window.ytInitialPlayerResponse.adPlacements,undefined);
 assert.equal(p.window.ytInitialPlayerResponse.adSlots,undefined);
 assert.deepEqual(Array.from(p.window.ytInitialPlayerResponse.streamingData.formats),["signed"]);
});
test("Build 80 avoids recursive decoration if an unconventional clone returns itself",async()=>{
 const p=context();p.send("enable");
 const response=await p.window.fetch("https://www.youtube.com/youtubei/v1/player",{method:"POST"});
 assert.equal(response.clone(),response);
 assert.equal((await response.json()).adSlots,undefined);
});
test("Build 75 safe teardown does not undo somebody else's later XHR hook",()=>{
 const p=context(),proto=p.window.XMLHttpRequest.prototype;
 p.send("enable");
 const external=function(){return 123;};proto.open=external;
 p.send("disable");
 assert.equal(proto.open,external);
});
test("Build 74 manifest loads MAIN only on YouTube and control follows existing site state",()=>{
 const manifest=JSON.parse(fs.readFileSync(path.resolve(__dirname,"../src/manifest.json"),"utf8"));
 const bridge=manifest.content_scripts.find(x=>x.world==="MAIN");
 assert.ok(bridge);assert.deepEqual(bridge.js,["youtube-feed.js","youtube-page-bridge.js"]);
 assert.equal(manifest.content_scripts[0].world||"ISOLATED","ISOLATED");
 assert.equal(bridge.all_frames,false);
 assert.equal(bridge.run_at,"document_start");
 assert.ok(bridge.matches.every(x=>x.includes("youtube")));
 const code=fs.readFileSync(path.resolve(__dirname,"../src/content.js"),"utf8");
 assert.match(code,/youtubePageAssistEnabled/);
 assert.match(code,/CustomEvent\("dk-live-block:youtube-response-control"/);
 assert.doesNotMatch(source,/\bbrowser\.|fetch\(\s*["']https?:|eval\(|new Function\(/);
});

test("Build 91 supports site-relative YouTube API fetch calls without affecting unrelated paths",async()=>{
 const p=context();
 const response={status:200,headers:{get:()=> "application/json"},
  json:async()=>({contents:[{videoRenderer:{videoId:"organic"}},
   {adSlotRenderer:{slot:"paid"}}]}),
  text:async()=>JSON.stringify({entries:[{command:{reelWatchEndpoint:{videoId:"organic"}}},
   {command:{reelWatchEndpoint:{videoId:"paid",adClientParams:{isAd:true}}}}]}),
  clone(){return this;}};
 p.window.fetch=async()=>response;
 p.send("enable");
 const feed=await p.window.fetch("/youtubei/v1/browse",{method:"POST"});
 const parsed=await feed.json();
 assert.equal(parsed.contents.length,1);
 assert.equal(parsed.contents[0].videoRenderer.videoId,"organic");
 const shorts=await p.window.fetch("/youtubei/v1/reel_watch_sequence",{method:"POST"});
 const sequence=JSON.parse(await shorts.text());
 assert.equal(sequence.entries.length,1);
 const other=await p.window.fetch("/youtubei/v1/unknown",{method:"POST"});
 assert.equal(other,response,"unrelated endpoints are not decorated");
});
test("Build 91 relative XHR browse calls preserve organic entries and remove clearly marked ads",()=>{
 const p=context(),proto=p.window.XMLHttpRequest.prototype;
 const prior=Object.getOwnPropertyDescriptor(proto,"response").get;
 Object.defineProperty(proto,"response",{configurable:true,get(){
  return {contents:[{videoRenderer:{videoId:"organic"}},{adSlotRenderer:{adId:"paid"}}]};}});
 p.send("enable");
 const xhr=new p.window.XMLHttpRequest();
 xhr.open("POST","/youtubei/v1/browse");
 xhr.status=200;xhr.readyState=4;xhr.responseType="json";
 const result=xhr.response;
 assert.equal(result.contents.length,1);
 assert.equal(result.contents[0].videoRenderer.videoId,"organic");
 p.send("disable");
 assert.notEqual(Object.getOwnPropertyDescriptor(proto,"response").get,prior);
});

test("Build 92 reprocesses newly replaced YouTube SPA bootstrap without duplicate wrappers",()=>{
 const p=context();
 p.send("enable");
 const wrapped=p.window.fetch;
 p.window.ytInitialData={contents:[{videoRenderer:{videoId:"fresh"}},
  {adSlotRenderer:{adId:"paid"}}]};
 p.window.ytInitialPlayerResponse={videoDetails:{title:"fresh"},
  streamingData:{formats:["signed"]},adPlacements:[{}]};
 p.send("enable");
 assert.equal(p.window.fetch,wrapped);
 assert.equal(p.window.ytInitialData.contents.length,1);
 assert.equal(p.window.ytInitialData.contents[0].videoRenderer.videoId,"fresh");
 assert.equal(p.window.ytInitialPlayerResponse.adPlacements,undefined);
 p.send("enable");
 assert.equal(p.window.ytInitialData.contents.length,1);
 p.send("disable");
 assert.equal(p.window.fetch,p.originalFetch);
});
test("Build 92 disabled mode leaves new initial data unchanged",()=>{
 const p=context();
 p.window.ytInitialData={contents:[{videoRenderer:{videoId:"fresh"}},
  {adSlotRenderer:{adId:"paid"}}]};
 p.send("disable");
 assert.equal(p.window.ytInitialData.contents.length,2);
});

test("Build 94 page bridge never rejects a valid fetch JSON because its player object is frozen",async()=>{
 const p=context();
 const readOnly=Object.freeze({videoDetails:{title:"safe"},
  streamingData:{formats:["signed"]},adSlots:[{id:1}]});
 p.window.fetch=async()=>({status:200,headers:{get:()=> "application/json"},
  json:async()=>readOnly,text:async()=>JSON.stringify(readOnly),
  clone(){return this;}});
 p.send("enable");
 const response=await p.window.fetch("/youtubei/v1/player",{method:"POST"});
 assert.equal((await response.json()).adSlots.length,1);
 assert.equal(JSON.parse(await response.text()).adSlots.length,1);
});
test("Build 94 frozen initial player object remains unchanged instead of breaking initialization",()=>{
 const p=context();
 p.window.ytInitialPlayerResponse=Object.freeze({videoDetails:{title:"safe"},
  streamingData:{formats:["signed"]},adSlots:[{}]});
 p.send("enable");
 assert.equal(p.window.ytInitialPlayerResponse.adSlots.length,1);
 assert.equal(p.window.ytInitialPlayerResponse.streamingData.formats[0],"signed");
 p.send("disable");
});
test("Build 94 nonconfigurable ad field cannot cause partial removal of other fields",()=>{
 const p=context();
 const player={videoDetails:{title:"safe"},streamingData:{formats:["signed"]},
  adPlacements:[{}],adSlots:[{}]};
 Object.defineProperty(player,"adSlots",{configurable:false,writable:true,value:[{}]});
 p.window.ytInitialPlayerResponse=player;
 p.send("enable");
 assert.equal(player.adSlots.length,1);
 assert.equal(player.adPlacements.length,1);
});
