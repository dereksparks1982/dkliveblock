"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict");
const Y=require("../src/youtube-triage.js");
test("counts repetitive blocked first-party YouTube XHR without revealing URLs",()=>{
 const data={ok:true,site:"www.youtube.com",requestLog:true,recentBlocks:[
  {host:"www.youtube.com",type:"xmlhttprequest",ruleEvidence:{subscription:"EasyList"}},
  {host:"www.youtube.com",type:"xmlhttprequest",ruleEvidence:{subscription:"EasyList"}},
  {host:"www.youtube.com",type:"image"},
  {host:"googleads.g.doubleclick.net",type:"xmlhttprequest"},
  {host:"r4---sn.googlevideo.com",type:"media"}
 ]};
 const r=Y.summarize(data);
 assert.equal(r.firstPartyXHR,2);
 assert.equal(r.firstPartyImage,1);
 assert.equal(r.advertisingInfrastructure,1);
 assert.equal(r.mediaBlocked,1);
 assert.deepEqual(r.firstPartySources,["EasyList"]);
 assert.match(r.interpretation,/purpose is unknown/);
 assert.doesNotMatch(JSON.stringify(r),/watch\?v=|\/api\/|token=/);
});
test("never attributes first-party YouTube requests to advertising solely by hostname",()=>{
 const r=Y.summarize({ok:true,site:"youtube.com",requestLog:true,recentBlocks:[
  {host:"www.youtube.com",type:"xmlhttprequest"}]});
 assert.equal(r.advertisingInfrastructure,0);
 assert.equal(r.firstPartyXHR,1);
 assert.match(r.interpretation,/could include playback or advertising/);
});
test("non-YouTube sites cannot inherit YouTube player diagnosis",()=>{
 assert.equal(Y.summarize({ok:true,site:"github.com",requestLog:true,recentBlocks:[]}).applicable,false);
 assert.equal(Y.summarize({ok:true,site:"youtube.com.attacker.test",requestLog:true,recentBlocks:[]}).applicable,false);
 assert.equal(Y.isYouTube("www.youtube.com"),true);
});

test("Build 191 does not leak URL-bearing source labels from YouTube XHR blocks",()=>{
 const r=Y.summarize({ok:true,site:"www.youtube.com",requestLog:true,recentBlocks:[
  {host:"www.youtube.com",type:"xmlhttprequest",ruleEvidence:{subscription:"https://private.example/watch?secret=1"}},
  {host:"www.youtube.com",type:"xmlhttprequest",ruleEvidence:{subscription:"EasyList"}},
  {host:"www.youtube.com",type:"xmlhttprequest",ruleEvidence:{subscription:"PRIVATE\\nline"}}]});
 assert.equal(r.firstPartyXHR,3);
 assert.deepEqual(r.firstPartySources,["EasyList"]);
 assert.doesNotMatch(JSON.stringify(r),/private.example|PRIVATE|secret=1/);
});

test("Build 196 media requests on ad infrastructure stay visible as media failures",()=>{
 const r=Y.summarize({ok:true,site:"www.youtube.com",requestLog:true,recentBlocks:[
  {host:"ads.doubleclick.net",type:"media"},
  {host:"ads.doubleclick.net",type:"script"},
  {host:"cdn.googlevideo.com",type:"media"}]});
 assert.equal(r.mediaBlocked,2);
 assert.equal(r.advertisingInfrastructure,1);
 assert.equal(r.recorded,3);
});
