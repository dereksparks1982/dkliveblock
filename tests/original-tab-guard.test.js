"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict");
const G=require("../src/original-tab-guard.js");
const NOW=1700000000000;
const redirect="https://stripchat.com/?campaign=not-recorded";
const details=(url=redirect,more={})=>({type:"main_frame",tabId:15,url,method:"GET",...more});
test("Build 223 blocks original-tab ad takeover without canceling second video tab",()=>{
 const m=new Map();
 assert.equal(G.note(m,15,18,"www.xnxx.com","https://www.xnxx.com/video-123",NOW),true);
 assert.equal(m.get(15).childId,18);
 assert.equal(G.shouldBlock(m,details(),"www.xnxx.com",true,NOW+1000),true);
 assert.equal(G.shouldBlock(m,details(redirect,{tabId:18}),"www.xnxx.com",true,NOW+1000),false);
 assert.equal(G.shouldBlock(m,details("https://www.xnxx.com/video-123"),"www.xnxx.com",true,NOW+1000),false);
 assert.equal(G.shouldBlock(m,details("https://mp4-cdn77.xnxx-cdn.com/video.mp4"),"www.xnxx.com",true,NOW+1000),false);
});
test("Build 223 rejects spoofing, foreign origins and unrelated media",()=>{
 const m=new Map();G.note(m,15,18,"xnxx.com","about:blank",NOW);
 for(const url of ["https://stripchat.com.evil.invalid/","https://evil-stripchat.com/","http://xnxx.com/vid","https://example.org/"])
  assert.equal(G.shouldBlock(m,details(url),"www.xnxx.com",true,NOW+1),false,url);
 assert.equal(G.shouldBlock(m,details(redirect,{originUrl:"https://example.org/"}),"xnxx.com",true,NOW+1),false);
 assert.equal(G.shouldBlock(m,details(redirect,{method:"POST"}),"xnxx.com",true,NOW+1),false);
 assert.equal(G.shouldBlock(m,details(redirect,{type:"sub_frame"}),"xnxx.com",true,NOW+1),false);
 assert.equal(G.shouldBlock(m,details(redirect,{tabId:-1}),"xnxx.com",true,NOW+1),false);
 assert.equal(G.shouldBlock(m,details(redirect),"example.org",true,NOW+1),false);
 assert.equal(G.shouldBlock(m,details(redirect),"xnxx.com.evil.invalid",true,NOW+1),false);
 assert.equal(G.shouldBlock(m,details(redirect),"xnxx.com",false,NOW+1),false);
});
test("Build 223 requires recent sibling-tab evidence, not just a same-site origin",()=>{
 assert.equal(G.shouldBlock(new Map(),details(redirect,{originUrl:"https://www.xnxx.com/video-123"}),"xnxx.com",true,NOW),false);
 assert.equal(G.shouldBlock(new Map(),details(redirect,{documentUrl:"https://www.xnxx.com/video-123"}),"xnxx.com",true,NOW),false);
 assert.equal(G.shouldBlock(new Map(),details(redirect),"xnxx.com",true,NOW),false);
});
test("Build 223 clock rollover, short lifetime, and tab cleanup",()=>{
 const m=new Map();G.note(m,15,18,"xnxx.com","",NOW);
 assert.equal(G.shouldBlock(m,details(),"xnxx.com",true,NOW-1),false);
 assert.equal(G.shouldBlock(m,details(),"xnxx.com",true,NOW+30000),true);
 assert.equal(G.shouldBlock(m,details(),"xnxx.com",true,NOW+30001),false);
 assert.equal(G.note(m,15,18,"xnxx.com","https://example.org/",NOW),false);
 G.clear(m,18);assert.equal(m.size,0,"removed child discards observation");
 G.note(m,15,19,"xnxx.com","",NOW);G.clear(m,15);
 assert.equal(m.size,0,"leaving source site discards observation");
});
test("Build 223 only records relevant source-site tab relationships",()=>{
 const m=new Map();
 for(const site of ["example.org","xnxx.com.evil.org","fake-xnxx.com"])
  assert.equal(G.note(m,15,18,site,"about:blank",NOW),false);
 assert.equal(G.note(m,15,15,"xnxx.com","about:blank",NOW),false);
 assert.equal(G.note(m,15,18,"xnxx.com","https://stripchat.com",NOW),false);
 assert.equal(G.note(m,15,18,"xnxx.com","about:blank",NOW),true);
 assert.equal(G.note(m,15,19,"www.xnxx.com","https://www.xnxx.com/video",NOW),true);
 assert.equal(m.get(15).childId,19);
 assert.equal(m.size,1);
});
