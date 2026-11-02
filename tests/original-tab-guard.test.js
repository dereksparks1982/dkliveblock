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

test("Build 225 deliberate navigation cannot be blocked based on initiating site alone",()=>{
 const m=new Map();
 for(const d of [
  details(redirect,{originUrl:"https://www.xnxx.com/video-123"}),
  details(redirect,{documentUrl:"https://xnxx.com/video-123"}),
  details(redirect)
 ])assert.equal(G.shouldBlock(m,d,"xnxx.com",true,NOW),false);
 G.note(m,15,18,"xnxx.com","https://www.xnxx.com/video-123",NOW);
 assert.equal(G.shouldBlock(m,details(redirect,{originUrl:"https://www.xnxx.com/video-123"}),
  "xnxx.com",true,NOW+1000),true);
 assert.equal(G.shouldBlock(m,details(redirect,{originUrl:"https://other.example/"}),
  "xnxx.com",true,NOW+1000),false);
 G.clear(m,18);
 assert.equal(G.shouldBlock(m,details(redirect),"xnxx.com",true,NOW+1000),false);
});

test("Build 274 Nesty 5 requires a real video child, not just a blank window",()=>{
 const m=new Map();G.note(m,15,18,"xnxx.com","about:blank",NOW);
 assert.equal(G.NESTY_5.id,"agent_nesty_5");
 assert.equal(G.shouldBlockNesty5(m,details("https://unlisted-ad.test/"),"xnxx.com",true,NOW+100),false);
 assert.equal(G.confirmVideo(m,18,"https://www.xnxx.com/video-321",NOW+200),true);
 assert.equal(G.shouldBlockNesty5(m,details("https://unlisted-ad.test/"),"xnxx.com",true,NOW+300),true);
 assert.equal(G.shouldBlockNesty5(m,details("https://another.test/"),"xnxx.com",true,NOW+4501),false);
});
test("Build 274 Nesty 5 refuses late, nonvideo or foreign video evidence",()=>{
 const m=new Map();G.note(m,15,18,"xnxx.com","about:blank",NOW);
 assert.equal(G.confirmVideo(m,18,"https://xnxx.com/search",NOW+100),false);
 assert.equal(G.confirmVideo(m,18,"https://example.test/video-1",NOW+100),false);
 assert.equal(G.confirmVideo(m,18,"https://xnxx.com/video-3",NOW+4501),false);
 assert.equal(G.shouldBlockNesty5(m,details("https://ad.test/"),"xnxx.com",true,NOW+200),false);
});
test("Build 274 Nesty 5 preserves original-site video and unrelated external navigation",()=>{
 const m=new Map();G.note(m,15,18,"xnxx.com","https://xnxx.com/video-1",NOW);
 for(const d of [details("https://xnxx.com/video-2"),
  details("https://somewhere.test/",{tabId:18}),
  details("https://somewhere.test/",{originUrl:"https://other.test/"}),
  details("https://somewhere.test/",{method:"POST"}),
  details("https://user:pass@somewhere.test/")])
  assert.equal(G.shouldBlockNesty5(m,d,"xnxx.com",true,NOW+100),false);
 assert.equal(G.shouldBlockNesty5(m,details("https://somewhere.test/"),"xnxx.com",false,NOW+100),false);
 assert.equal(Object.keys(m.get(15)).includes("url"),false);
});
