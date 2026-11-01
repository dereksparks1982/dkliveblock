"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path");
const A=require("../src/cbs-autoplay.js");
function mock(){
 const handlers=new Map(),videos=[];
 const video={localName:"video",autoplay:true,paused:false,
   hasAttribute:x=>x==="autoplay",removeAttribute(){this.removed=true},
   pause(){this.pauses=(this.pauses||0)+1;this.paused=true},
   getBoundingClientRect:()=>({left:0,top:0,right:200,bottom:100,width:200,height:100})};
 videos.push(video);
 const doc={addEventListener:(name,fn)=>handlers.set(name,fn),
  removeEventListener:name=>handlers.delete(name),
  querySelectorAll:()=>videos};
 const control=A.create(doc);control.setEnabled(true);
 return {doc,control,handlers,videos,video};
}
test("Build 228 CBS still blocks autoplay without a user gesture",()=>{
 const {handlers,video,control}=mock();
 assert.equal(video.paused,true);assert.equal(video.autoplay,false);
 video.paused=false;handlers.get("play")({target:video});
 assert.equal(video.paused,true);
 control.setEnabled(false);
});
test("Build 228 clicking an overlay inside the video unblocks delayed/replaced players",()=>{
 const {handlers,video,videos,control}=mock();
 const play=handlers.get("play");
 const overlay={localName:"div",closest:()=>null};
 handlers.get("pointerdown")({target:overlay,isTrusted:true,clientX:70,clientY:50});
 assert.equal(handlers.has("play"),false,"stops intercepting play after a click");
 video.paused=false;play({target:video});assert.equal(video.paused,false);
 const replacement={...video,paused:false,autoplay:true,pauses:0};
 videos.push(replacement);control.scan();
 assert.equal(replacement.pauses,0,"replacement video is not forced to pause");
 control.setEnabled(false);
});
test("Build 228 clicking a known video-player control lets the page drive playback",()=>{
 const {handlers,video,control}=mock();
 handlers.get("click")({target:{closest:()=>({localName:"div"})},isTrusted:true});
 video.paused=false;control.scan();
 assert.equal(video.paused,false);
 control.setEnabled(false);
});
test("Build 228 unrelated clicks and synthetic clicks do not unlock playback",()=>{
 const {handlers,video,control}=mock();
 const play=handlers.get("play");
 handlers.get("click")({target:{closest:()=>null},isTrusted:true,clientX:450,clientY:250});
 video.paused=false;play({target:video});assert.equal(video.paused,true);
 handlers.get("click")({target:{closest:()=>({})},isTrusted:false});
 video.paused=false;play({target:video});assert.equal(video.paused,true);
 control.setEnabled(false);
});
test("Build 228 article-only background scope is unchanged",()=>{
 const bg=fs.readFileSync(path.join(__dirname,"../src/background.js"),"utf8");
 const manifest=JSON.parse(fs.readFileSync(path.join(__dirname,"../src/manifest.json"),"utf8"));
 const js=manifest.content_scripts[0].js;
 assert.ok(js.indexOf("cbs-autoplay.js")<js.indexOf("content.js"));
 assert.match(bg,/cbsAutoplay:active&&/);
 assert.match(bg,/cbsnews/);
 assert.match(bg,/sender\.tab\?\.url/);
});
