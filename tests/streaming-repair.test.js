"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict");
const Repair=require("../src/streaming-repair.js");
test("temporary repair is exact-host, exact-type and tab-scoped",()=>{
 const table=new Map();
 assert.equal(Repair.allow(table,3,"www.youtube.com","video.googlevideo.com","media",100),true);
 assert.equal(Repair.matches(table,3,"www.youtube.com","video.googlevideo.com","media",200),true);
 assert.equal(Repair.matches(table,3,"www.youtube.com","video.googlevideo.com","script",200),false);
 assert.equal(Repair.matches(table,4,"www.youtube.com","video.googlevideo.com","media",200),false);
 assert.equal(Repair.matches(table,3,"www.youtube.com","ads.googlevideo.com","media",200),false);
 assert.equal(Repair.matches(table,3,"www.disneyplus.com","video.googlevideo.com","media",200),false);
 assert.equal(Repair.matches(table,3,"www.youtube.com","video.googlevideo.com","media",100+Repair.TTL_MS+1),false);
});
test("repair rejects arbitrary sites and malformed hosts, caps grants, and revokes",()=>{
 const table=new Map();
 assert.equal(Repair.allow(table,9,"evil.example","cdn.example.com","media",100),false);
 assert.equal(Repair.allow(table,9,"youtube.com","https://cdn.example/file","media",100),false);
 assert.equal(Repair.allow(table,9,"youtube.com","cdn.example.com","script",100),false);
 for(let i=0;i<Repair.MAX;i++)assert.equal(Repair.allow(table,9,"youtube.com","cdn"+i+".example.com","media",100),true);
 assert.equal(Repair.allow(table,9,"youtube.com","one-more.example.com","media",100),false);
 assert.equal(Repair.list(table,9,101).length,Repair.MAX);
 Repair.clear(table,9);
 assert.equal(Repair.list(table,9,102).length,0);
});
test("Repair requires explicit user decision and never bypasses whole site",()=>{
 const fs=require("node:fs"),path=require("node:path");
 const dir=path.join(__dirname,"../src"),js=fs.readFileSync(path.join(dir,"options.js"),"utf8");
 const bg=fs.readFileSync(path.join(dir,"background.js"),"utf8");
 const html=fs.readFileSync(path.join(dir,"options.html"),"utf8");
 assert.match(js,/window\.confirm/);
 assert.match(js,/temporarilyAllowStreamingHost/);
 assert.match(bg,/DKStreamingRepair\.matches/);
 assert.match(bg,/DKStreamingDiagnostics\.recent/);
 assert.match(bg,/clearTemporaryStreamingAllowances/);
 assert.match(html,/streamRepairRevoke/);
});
