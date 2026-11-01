"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path");
const A=require("../src/cbs-autoplay.js");
function mock(){
 const handlers=new Map(),videos=[],pauses=[];
 function video({paused=true,readyState=0,autoplay=true}={}){
  const v={localName:"video",paused,readyState,autoplay,
   hasAttribute(n){return n==="autoplay"&&this.autoplay;},
   removeAttribute(n){if(n==="autoplay")this.autoplay=false;},
   pause(){pauses.push(this);this.paused=true;},
   getBoundingClientRect:()=>({left:0,top:0,right:200,bottom:100,width:200,height:100})};
  videos.push(v);return v;
 }
 const doc={addEventListener:(n,fn)=>handlers.set(n,fn),
  removeEventListener:n=>handlers.delete(n),querySelectorAll:()=>videos};
 return {ctl:A.create(doc),handlers,videos,pauses,video};
}
test("Build 230: guard only disables autoplay of idle, uninitialized media",()=>{
 const {ctl,video,pauses,handlers}=mock(),v=video();
 ctl.setEnabled(true);
 assert.equal(v.autoplay,false);assert.equal(pauses.length,0);
 assert.equal(handlers.has("play"),false);ctl.setEnabled(false);
});
test("Build 230: preserve active and metadata-ready CBS player media",()=>{
 const {ctl,video,pauses}=mock(),playing=video({paused:false,readyState:3}),
   ready=video({paused:true,readyState:4});
 ctl.setEnabled(true);ctl.scan();
 assert.equal(playing.autoplay,true);assert.equal(ready.autoplay,true);
 assert.equal(pauses.length,0);ctl.setEnabled(false);
});
test("Build 230: a genuine player gesture releases replacement media",()=>{
 const {ctl,video,handlers,pauses}=mock();video();ctl.setEnabled(true);
 handlers.get("pointerdown")({target:{closest:()=>null},isTrusted:true,clientX:70,clientY:50});
 const v=video();ctl.scan();assert.equal(v.autoplay,true);
 assert.equal(pauses.length,0);ctl.setEnabled(false);
});
test("Build 230: synthetic and unrelated clicks do not disable idle guard",()=>{
 const {ctl,video,handlers}=mock();video();ctl.setEnabled(true);
 handlers.get("click")({target:{closest:()=>({})},isTrusted:false});
 handlers.get("click")({target:{closest:()=>null},isTrusted:true,clientX:400,clientY:300});
 const v=video();ctl.scan();assert.equal(v.autoplay,false);ctl.setEnabled(false);
});
test("Build 230: autoplay guard applies only to primary CBS News documents",()=>{
 const bg=fs.readFileSync(path.join(__dirname,"../src/background.js"),"utf8");
 const cs=fs.readFileSync(path.join(__dirname,"../src/content.js"),"utf8");
 const C=require("../src/cbs-compat.js");
 const manifest=JSON.parse(fs.readFileSync(path.join(__dirname,"../src/manifest.json"),"utf8"));
 const scripts=manifest.content_scripts[0].js;
 assert.ok(scripts.indexOf("cbs-autoplay.js")<scripts.indexOf("content.js"));
 assert.match(bg,/cbsAutoplay:active&&DKCBSCompat\.autoplayProtection\(sender\.tab\?\.url\|\|""\)&&sender\.frameId===0/);
 assert.match(cs,/cbsAutoplay\?\.setEnabled\(active&&s\.cbsAutoplay===true&&window===window\.top/);
 assert.equal(C.autoplayProtection("https://www.cbsnews.com/"),true);
 assert.equal(C.autoplayProtection("https://www.cbsnews.com/news/story"),true);
 assert.equal(C.autoplayProtection("https://www.cbsnews.com/live/"),false);
 assert.equal(C.autoplayProtection("https://www.youtube.com/news/story"),false);
});
