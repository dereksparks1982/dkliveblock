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
 for(const phrase of ["querySelector(","appendChild(","removeChild(","fetch(","innerHTML","XMLHttpRequest"])
  assert.equal(src.includes(phrase),false,phrase);
 const manifest=require("../src/manifest.json");
 assert.ok(!JSON.stringify(manifest).includes("page-architect.js"),
  "planning-only module is not injected until opt-in UI has acceptance");
});
