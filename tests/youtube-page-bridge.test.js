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
 vm.runInNewContext(source,{window,document,location,URL,Promise,WeakMap,Object,Array,JSON,String});
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
test("Build 77 removes known ad fields from an already loaded initial player bootstrap",()=>{
 const p=context();
 p.window.ytInitialPlayerResponse={streamingData:{formats:["signed"]},videoDetails:{title:"private"},
  adPlacements:[{ad:1}],adSlots:[{ad:2}],playabilityStatus:{status:"OK"}};
 p.send("enable");
 assert.equal(p.window.ytInitialPlayerResponse.adPlacements,undefined);
 assert.equal(p.window.ytInitialPlayerResponse.adSlots,undefined);
 assert.deepEqual(Array.from(p.window.ytInitialPlayerResponse.streamingData.formats),["signed"]);
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
 assert.ok(bridge);assert.deepEqual(bridge.js,["youtube-page-bridge.js"]);
 assert.equal(manifest.content_scripts[0].world||"ISOLATED","ISOLATED");
 assert.equal(bridge.all_frames,false);
 assert.equal(bridge.run_at,"document_start");
 assert.ok(bridge.matches.every(x=>x.includes("youtube")));
 const code=fs.readFileSync(path.resolve(__dirname,"../src/content.js"),"utf8");
 assert.match(code,/youtubePageAssistEnabled/);
 assert.match(code,/CustomEvent\("dk-live-block:youtube-response-control"/);
 assert.doesNotMatch(source,/\bbrowser\.|fetch\(\s*["']https?:|eval\(|new Function\(/);
});
