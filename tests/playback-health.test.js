"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict");
const H=require("../src/playback-health.js");
const doc={visibilityState:"visible"};
function video(readyState=2){return {isConnected:true,paused:false,ended:false,
 seeking:false,readyState,error:null,getClientRects:()=>[1]};}
test("probe detects only sustained buffering, not ordinary loading or pauses",()=>{
 const p=H.createProbe(),v=video();
 assert.equal(p.scan(v,doc,1000),null);
 assert.equal(p.scan(v,doc,5999),null);
 assert.equal(p.scan(v,doc,6000),"buffering");
 assert.equal(p.scan(v,doc,6001),null);
 assert.equal(p.scan(v,doc,26000),"buffering");
 v.readyState=4;assert.equal(p.scan(v,doc,26001),null);
 v.readyState=2;assert.equal(p.scan(v,doc,27000),null);
 assert.equal(p.scan(v,doc,32000),null); // cooling period
 assert.equal(p.scan(v,doc,46000),"buffering");
});
test("hidden, paused, seeking, ended and detached players cannot be reported",()=>{
 const p=H.createProbe(),v=video();
 for(const value of ["paused","ended","seeking"]){
  v[value]=true;assert.equal(p.scan(v,doc,1000),null);v[value]=false;
 }
 assert.equal(p.scan(v,{visibilityState:"hidden"},1000),null);
 v.getClientRects=()=>[];assert.equal(p.scan(v,doc,1000),null);
 v.getClientRects=()=>[1];v.isConnected=false;
 assert.equal(p.scan(v,doc,1000),null);
});
test("media errors are recorded without leaking the media source",()=>{
 const p=H.createProbe(),v=video(0);
 v.error={code:3,message:"secret https://video.example/path?token=topsecret"};
 assert.equal(p.scan(v,doc,10000),"media-error");
 assert.equal(p.scan(v,doc,40000),null);
 v.error=null;assert.equal(p.scan(v,doc,41000),null);
 v.error={code:4};assert.equal(p.scan(v,doc,42000),"media-error");
});
test("bounded, expiry-aware tab history includes only coarse metadata",()=>{
 const table=new Map();
 assert.equal(H.record(table,8,"www.youtube.com","buffering",true,1000),true);
 assert.equal(H.record(table,8,"www.youtube.com","buffering",false,2000),false);
 assert.equal(H.record(table,8,"www.youtube.com","media-error",false,3000),true);
 const rows=H.recent(table,8,"www.youtube.com",4000);
 assert.equal(rows.length,2);assert.equal(rows[1].blockedMediaNearby,true);
 assert.doesNotMatch(JSON.stringify(rows),/source|currentTime|video|url|token|path/);
 assert.equal(H.recent(table,9,"www.youtube.com",4000).length,0);
 assert.equal(H.recent(table,8,"other.youtube.com",4000).length,0);
 assert.equal(H.recent(table,8,"www.youtube.com",H.TTL_MS+5000).length,0);
});
test("no spoofed streaming page, invalid kind or huge backlog",()=>{
 const table=new Map();
 for(const host of ["youtube.com.evil.test","notyoutube.com","disneyplus.com.evil.test","fakedisneyplus.com",""])
  assert.equal(H.record(table,1,host,"buffering",false,1),false);
 assert.equal(H.record(table,1,"youtube.com","nonsense",false,1),false);
 for(let i=0;i<H.MAX+6;i++)H.record(table,1,"youtube.com",
  i%2?"media-error":"buffering",false,1000+i*20001);
 assert.equal(H.recent(table,1,"youtube.com",1000+(H.MAX+5)*20001).length,H.MAX);
 H.clear(table,1);assert.equal(H.recent(table,1,"youtube.com").length,0);
});

test("switching HTML5 video nodes resets stall timer across SPA transitions",()=>{
 const probe=H.createProbe(),a=video(),b=video();
 assert.equal(probe.scan(a,doc,1000),null);
 assert.equal(probe.scan(b,doc,6000),null);
 assert.equal(probe.scan(b,doc,10999),null);
 assert.equal(probe.scan(b,doc,11000),"buffering");
 probe.reset();
 assert.equal(probe.scan(b,doc,17000),null);
});

test("media failures remain visible after playback stops, but not during seeking",()=>{
 const p=H.createProbe(),v=video(0);
 v.paused=true;v.error={code:3};
 assert.equal(p.scan(v,doc,10000),"media-error");
 p.reset();v.seeking=true;
 assert.equal(p.scan(v,doc,11000),null);
 v.seeking=false;v.ended=true;
 assert.equal(p.scan(v,doc,12000),null);
});

test("Disney+ playback health is supported without accepting lookalike hostnames",()=>{
 const H=require("../src/playback-health.js");
 const store=new Map();
 for(const host of ["disneyplus.com","www.disneyplus.com","playback.disneyplus.com"]){
  assert.equal(H.platform(host),"Disney+");
  assert.equal(H.record(store,23,host,"buffering",true,1000),true);
  assert.equal(H.recent(store,23,host,1001).length,1);
  H.clear(store,23);
 }
 for(const host of ["disneyplus.com.attacker.net","disneyplus.co","notdisneyplus.com","disneypluscom"]){
  assert.equal(H.supportsHost(host),false,host);
  assert.equal(H.record(store,23,host,"buffering",true,1000),false);
 }
 assert.equal(H.platform("www.youtube.com"),"YouTube");
 assert.equal(H.platform("www.youtube-nocookie.com"),"YouTube");
 assert.equal(H.platform("notreal.example"),"");
});
test("Disney+ DRM or HTML5 failures remain only coarse events",()=>{
 const H=require("../src/playback-health.js"),store=new Map();
 const v=video(0),probe=H.createProbe();
 v.error={code:4,message:"DRM license query: https://secret.example/?account=PRIVATE"};
 assert.equal(probe.scan(v,doc,10000),"media-error");
 assert.equal(H.record(store,10,"www.disneyplus.com","media-error",false,10000),true);
 const rows=H.recent(store,10,"www.disneyplus.com",11000);
 assert.deepEqual(rows,[{kind:"media-error",when:10000,blockedMediaNearby:false}]);
 assert.doesNotMatch(JSON.stringify(rows),/PRIVATE|DRM|license|account|secret|url/);
});
