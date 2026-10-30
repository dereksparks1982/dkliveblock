"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path");
const source=fs.readFileSync(path.join(__dirname,"../src/content.js"),"utf8");
const background=fs.readFileSync(path.join(__dirname,"../src/background.js"),"utf8");
const Library=require("../src/video-library.js");
const videoId="dQw4w9WgXcQ",url="https://www.youtube.com/watch?v="+videoId;
const start=source.indexOf(" async function maybeRememberVideo(){");
const end=source.indexOf(" function startPicker(){",start);
if(start<0||end<0)throw Error("Automatic video capture implementation not found");
const isolated=source.slice(start,end);
function foreground({enabled=true,paused=false,position=61,duration=300,ad=false}={}){
 const sent=[],video={paused,ended:false,seeking:false,currentTime:position,duration};
 const doc={title:"Test YouTube video",
  querySelector:q=>q==="video"?video:q===".html5-video-player.ad-showing"?(ad?{}:null):null};
 const win={};win.top=win;
 const fakeBrowser={runtime:{sendMessage:async event=>{sent.push(event);return {ok:true};}}};
 const controls=new Function("document","location","browser","window","URL","Date",
  "let rememberVideos="+JSON.stringify(enabled)+",isYouTube=true,lastRememberAt=0;\n"+
  isolated+"\nreturn {run:maybeRememberVideo};"
 )(doc,{href:url},fakeBrowser,win,URL,Date);
 return {sent,run:controls.run};
}
test("disabled automatic video memory sends no request",async()=>{
 const page=foreground({enabled:false});await page.run();
 assert.equal(page.sent.length,0);
});
test("ordinary 1-minute YouTube playback sends one bounded request",async()=>{
 const page=foreground();await page.run();await page.run();
 assert.equal(page.sent.length,1);
 assert.equal(page.sent[0].action,"rememberVideoProgress");
 assert.equal(page.sent[0].videoId,videoId);
 assert.equal(page.sent[0].position,61);
});
test("paused, ads, short playback and finished videos are never remembered",async()=>{
 for(const options of [{paused:true},{ad:true},{position:59},{duration:89},{position:298}]){
  const page=foreground(options);await page.run();
  assert.equal(page.sent.length,0,JSON.stringify(options));
 }
});
const startBg=background.indexOf(' if(msg.action==="rememberVideoProgress"){');
const endBg=background.indexOf(' if(msg.action==="saveVideo"){',startBg);
if(startBg<0||endBg<0)throw Error("Background automatic saving validation not found");
const handlerSource=background.slice(startBg,endBg);
function backgroundRequest({enabled=true,frameId=0,pageUrl=url,tabUrl=url,position=90,duration=400,recordId=videoId,times=new Map()}={}){
 let saves=0;
 const sender={tab:{id:11,url:tabUrl},frameId,url:pageUrl};
 const msg={action:"rememberVideoProgress",videoId:recordId,position,duration,title:"A documentary"};
 const handler=new Function("msg","sender","fromContent","data","DKVideoLibrary",
  "autoVideoTimes","id","libraryUpdate","Date",handlerSource+"\nreturn null;");
 return {invoke:()=>handler(msg,sender,true,{settings:{rememberVideos:enabled}},Library,times,11,operation=>{
  saves++;const result=operation([]);
  return {ok:Array.isArray(result),count:result?.length||0};
 },Date),get saves(){return saves;}};
}
test("background verifies opt-in, frame and canonical tab URL",()=>{
 for(const flags of [{enabled:false},{frameId:2},{pageUrl:"https://evil.example/watch?v="+videoId},
  {tabUrl:"https://www.youtube.com/watch?v=otherIDABC"},{recordId:"bad"},
  {position:20},{duration:89}]){
  const req=backgroundRequest(flags);
  assert.ok(req.invoke().error,JSON.stringify(flags));
  assert.equal(req.saves,0);
 }
 const req=backgroundRequest(),first=req.invoke(),second=req.invoke();
 assert.equal(first.ok,true);
 assert.equal(second.skipped,true);
 assert.equal(req.saves,1);
});
