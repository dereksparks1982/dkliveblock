"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path");
const A=require("../src/cbs-autoplay.js"),C=require("../src/cbs-compat.js");
test("Build 231 CBS video controller never pauses, intercepts clicks or mutates autoplay",()=>{
 const events=[],video={autoplay:true,paused:false,playCount:0,pause(){this.playCount++}};
 const doc={addEventListener:(...args)=>events.push(args),
  querySelectorAll:()=>[video],removeEventListener:(...args)=>events.push(args)};
 const guard=A.create(doc);
 guard.setEnabled(true);
 guard.scan();
 assert.equal(guard.enabled,true);
 assert.equal(video.autoplay,true);
 assert.equal(video.playCount,0);
 assert.deepEqual(events,[]);
 guard.setEnabled(false);
 assert.equal(guard.enabled,false);
 assert.equal(video.autoplay,true);
});
test("Build 231 controller does not observe nested JWPlayer or synthetic clicks",()=>{
 let accessed=false;
 const doc={addEventListener(){throw Error("must not add listener")},
  querySelectorAll(){accessed=true;throw Error("must not inspect player")}};
 const guard=A.create(doc);
 guard.setEnabled(true);guard.scan();guard.setEnabled(false);
 assert.equal(accessed,false);
});
test("Build 231 CBS page detection remains exact and top-frame only",()=>{
 const manifest=JSON.parse(fs.readFileSync(path.join(__dirname,"../src/manifest.json"),"utf8"));
 const bg=fs.readFileSync(path.join(__dirname,"../src/background.js"),"utf8");
 const content=fs.readFileSync(path.join(__dirname,"../src/content.js"),"utf8");
 assert.ok(manifest.content_scripts[0].js.indexOf("cbs-autoplay.js")<
   manifest.content_scripts[0].js.indexOf("content.js"));
 assert.equal(C.autoplayProtection("https://www.cbsnews.com/"),true);
 assert.equal(C.autoplayProtection("https://www.cbsnews.com/news/story"),true);
 assert.equal(C.autoplayProtection("https://www.cbsnews.com/live/"),false);
 assert.equal(C.autoplayProtection("https://www.cbsnews.com.evil.invalid/"),false);
 assert.match(bg,/sender\.frameId===0/);
 assert.match(content,/window===window\.top/);
});
