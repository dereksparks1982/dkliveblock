"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict");
const DK=require("../src/streaming-diagnostics.js");
test("streaming diagnostics are bounded, local host-only and no raw URLs",()=>{
 const map=new Map();
 assert.equal(DK.record(map,3,"www.youtube.com","video.googlevideo.com","media",100),true);
 assert.equal(DK.record(map,3,"www.youtube.com","video.googlevideo.com","media",120),true);
 const rows=DK.recent(map,3,121);
 assert.equal(rows.length,1);
 assert.equal(rows[0].count,2);
 assert.equal(rows[0].host,"video.googlevideo.com");
 assert.equal(Object.prototype.hasOwnProperty.call(rows[0],"url"),false);
 assert.equal(DK.record(map,3,"news.example.org","cdn.example.net","media",130),false);
 assert.equal(DK.record(map,3,"www.youtube.com","https://video.example/video?secret=1","media",140),false);
 assert.equal(DK.record(map,3,"www.youtube.com","video.example","script",150),false);
 assert.equal(DK.record(map,3,"www.disneyplus.com","api.disneyplus.com","xmlhttprequest",155),true);
 assert.equal(DK.recent(map,3,190).length,2);
 DK.clear(map,3);
 assert.equal(DK.recent(map,3,200).length,0);
});
test("streaming records expire and cap per tab",()=>{
 const map=new Map();
 for(let i=0;i<120;i++)DK.record(map,10,"youtube.com","cdn"+i+".example.com","media",1000+i);
 assert.equal(DK.recent(map,10,1200).length,DK.MAX);
 assert.equal(DK.recent(map,10,1200+DK.TTL_MS+100).length,0);
});
test("diagnostics are opt-in through existing temporary request log preference",()=>{
 const fs=require("node:fs"),path=require("node:path"),dir=path.join(__dirname,"../src");
 const bg=fs.readFileSync(path.join(dir,"background.js"),"utf8");
 const popup=fs.readFileSync(path.join(dir,"popup.html"),"utf8");
 const options=fs.readFileSync(path.join(dir,"options.html"),"utf8");
 assert.match(bg,/DKStreamingDiagnostics\.record/);
 assert.match(bg,/if\(!data\.settings\.requestLog\)return/);
 assert.match(popup,/streamingIssueCount/);
 assert.match(options,/id="streaming-diagnostics"/);
});

test("streaming diagnostics keep the source site separated across services",()=>{
 const map=new Map();
 assert.equal(DK.record(map,1,"www.youtube.com","cdn.example.org","media",1000),true);
 assert.equal(DK.record(map,1,"www.disneyplus.com","cdn.example.org","media",1001),true);
 const records=DK.recent(map,1,2000);
 assert.equal(records.length,2);
 assert.equal(records[0].pageHost,"www.youtube.com");
 assert.equal(records[1].pageHost,"www.disneyplus.com");
 assert.equal(records[0].count,1);
 assert.equal(records[1].count,1);
 assert.doesNotMatch(JSON.stringify(records),/https:|\/play\/|token=/);
});
