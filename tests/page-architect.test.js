"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict");
const A=require("../src/page-architect.js");
const WATCH="https://www.youtube.com/watch?v=CMNP5pNxIHc";
test("Build 374: clean view needs explicit valid watch-page intent",()=>{
 assert.equal(A.plan(WATCH).enabled,false);
 assert.equal(A.plan(WATCH,null).enabled,false);
 assert.equal(A.plan("https://www.youtube.com/shorts/CMNP5pNxIHc",{}).enabled,false);
 assert.equal(A.plan("https://youtube.com.evil.test/watch?v=CMNP5pNxIHc",{}).enabled,false);
 assert.equal(A.plan("http://youtube.com/watch?v=CMNP5pNxIHc",{}).enabled,false);
});
test("Build 374: clean view cannot remove the real player",()=>{
 const p=A.plan(WATCH,{player:false,comments:false,related:false});
 assert.equal(p.enabled,true);
 assert.ok(p.regions.includes("player"));
 assert.ok(!p.regions.includes("comments"));
 assert.ok(!p.regions.includes("related"));
 assert.ok(Object.isFrozen(p.regions));
});
test("Build 374: deny unknown or nonboolean region settings",()=>{
 for(const x of [{ads:true},{player:"false"},{comments:1},[],true])
  assert.equal(A.plan(WATCH,x).enabled,false);
 assert.deepEqual(A.plan(WATCH,{comments:true}).regions,
  ["masthead","player","title","actions","description","comments"]);
});
test("Build 374: planner makes no changes to DOM or media",()=>{
 const fs=require("node:fs"),path=require("node:path");
 const src=fs.readFileSync(path.join(__dirname,"../src/page-architect.js"),"utf8");
 for(const phrase of ["appendChild(","removeChild(","fetch(","innerHTML","XMLHttpRequest"])
  assert.equal(src.includes(phrase),false,phrase);
 const manifest=require("../src/manifest.json");
 assert.ok(!JSON.stringify(manifest).includes("page-architect.js"),
  "planning-only module is not injected until opt-in UI has acceptance");
});

test("Build 375: read-only discovery requires a real player and masthead",()=>{
 const nodes=new Set(["#movie_player","ytd-masthead","ytd-watch-metadata #title","#related"]);
 const doc={querySelector(selector){return nodes.has(selector)?{nodeType:1}:null;}};
 const seen=A.discover(doc,WATCH);
 assert.equal(seen.supported,true);assert.equal(seen.ready,true);
 assert.ok(seen.found.includes("player"));
 assert.ok(seen.missing.includes("comments"));
 assert.ok(Object.isFrozen(seen.found));
 const preview=A.preview(WATCH,{},doc);
 assert.equal(preview.ready,true);
 assert.deepEqual(preview.missing,["actions","description"]);
 nodes.delete("#movie_player");
 assert.equal(A.preview(WATCH,{},doc).ready,false);
});
test("Build 375: unsupported markup and malformed document fail closed",()=>{
 const original="https://www.youtube.com/watch?v=CMNP5pNxIHc";
 assert.equal(A.discover(null,original).ready,false);
 assert.equal(A.discover({},original).ready,false);
 assert.equal(A.discover({querySelector(){throw Error("bad selector");}},original).ready,false);
 assert.equal(A.discover({querySelector(){return {};}},"https://evil.example/watch?v=CMNP5pNxIHc").supported,false);
 assert.equal(A.preview(original,null,{querySelector(){return {};}}).ready,false);
});
test("Build 375: discovery never mutates the page or returns DOM objects",()=>{
 let checks=0;
 const marker={secret:"DO_NOT_COPY"};
 const doc={querySelector(){checks++;return marker;}};
 const snapshot=JSON.stringify(A.discover(doc,WATCH));
 assert.ok(checks>=7);
 assert.equal(snapshot.includes(marker.secret),false);
 assert.equal(snapshot.includes("https://"),false);
 assert.equal(Object.isFrozen(A.discover(doc,WATCH)),true);
 const fs=require("node:fs"),path=require("node:path");
 const src=fs.readFileSync(path.join(__dirname,"../src/page-architect.js"),"utf8");
 for(const forbidden of ["appendChild(","removeChild(","innerHTML","XMLHttpRequest","window.postMessage("])
  assert.equal(src.includes(forbidden),false,forbidden);
});
