"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path");
const root=path.resolve(__dirname,"../src");
const read=name=>fs.readFileSync(path.join(root,name),"utf8");
test("Build 25 toolbar exposes explicit formats, progress and cancel",()=>{
 const html=read("popup.html"),js=read("popup.js");
 for(const id of ["videoQuality","videoProgress","cancelVideo","downloadVideo"])
  assert.match(html,new RegExp('id="'+id+'"'));
 for(const quality of ["compatible","best","audio"])
  assert.ok(html.includes('value="'+quality+'"'));
 assert.match(js,/window\.confirm\(/);
 assert.match(js,/cancelVideoDownload/);
 assert.match(js,/refreshDownloadStatus/);
 assert.match(js,/QUALITIES=new Set/);
});
test("Build 25 background sends fixed fields over native port and constrains progress",()=>{
 const bg=read("background.js"),m=JSON.parse(read("manifest.json"));
 assert.equal(m.version,"0.2.6");
 assert.ok(m.optional_permissions.includes("nativeMessaging"));
 assert.ok(!m.permissions.includes("nativeMessaging"));
 assert.match(bg,/runtime\.connectNative\("dk_live_block_companion"\)/);
 assert.match(bg,/videoPort\.postMessage/);
 assert.match(bg,/VIDEO_QUALITIES=new Set/);
 assert.match(bg,/Number\.isFinite\(message\.percent\)/);
 assert.match(bg,/verifiedActiveVideo\(msg\)/);
 assert.match(bg,/confirmation:"explicit-user-action"/);
 assert.doesNotMatch(bg,/startVideoDownload\(msg\)[\s\S]{0,900}eval\(/);
});
test("Single-file companion includes download job module",()=>{
 const packageBuilder=fs.readFileSync(path.join(__dirname,"../scripts/make-companion-installer.py"),"utf8");
 const installer=fs.readFileSync(path.join(__dirname,"../scripts/install-companion.py"),"utf8");
 assert.match(packageBuilder,/download_jobs\.py/);
 assert.match(installer,/download_jobs\.py/);
});

test("native port handles progress, cancellation and format guards without starting twice",async()=>{
 const source=read("background.js");
 const start=source.indexOf("let videoLibraryQueue");
 const end=source.indexOf("const data={",start);
 assert.ok(start>=0&&end>start);
 let messageListener=()=>{},disconnectListener=()=>{},disconnected=0;
 const sent=[];
 const port={
  onMessage:{addListener:fn=>messageListener=fn},
  onDisconnect:{addListener:fn=>disconnectListener=fn},
  postMessage:value=>sent.push(value),
  disconnect:()=>{disconnected++;disconnectListener();}
 };
 const browser={
  tabs:{get:async id=>({id,url:"https://www.youtube.com/watch?v=dQw4w9WgXcQ"})},
  runtime:{connectNative:()=>port},
  permissions:{contains:async()=>true}
 };
 const lib={parseVideo:()=>({id:"dQw4w9WgXcQ",url:"https://www.youtube.com/watch?v=dQw4w9WgXcQ"})};
 // Evaluate only the download-state declarations, not the entire filtering background.
 const handlers=new Function("browser","DKVideoLibrary",
   source.slice(start,end)+"return {startVideoDownload,cancelVideoDownload,jobStatus};")(browser,lib);
 const input={tabId:4,videoId:"dQw4w9WgXcQ",quality:"best"};
 assert.equal((await handlers.startVideoDownload(input)).ok,true);
 assert.equal(sent[0].action,"startVideoDownload");
 assert.equal(sent[0].quality,"best");
 assert.equal((await handlers.startVideoDownload(input)).ok,undefined);
 messageListener({protocol:1,type:"progress",videoId:input.videoId,percent:43});
 assert.equal(handlers.jobStatus().progress,43);
 messageListener({protocol:1,type:"progress",videoId:input.videoId,percent:170});
 assert.equal(handlers.jobStatus().progress,43);
 assert.equal(handlers.cancelVideoDownload({videoId:input.videoId}).ok,true);
 assert.equal(sent.at(-1).action,"cancelVideoDownload");
 assert.equal(handlers.jobStatus().state,"cancelling");
 messageListener({protocol:1,type:"finished",videoId:input.videoId,state:"cancelled"});
 assert.equal(handlers.jobStatus().state,"cancelled");
 assert.equal(disconnected,1);
 assert.match((await handlers.startVideoDownload({...input,quality:"$(curl evil)"})).error,/quality/i);
});
