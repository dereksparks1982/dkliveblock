"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict");
const E=require("../src/session-export.js");
const site=(tabId,host)=>({ok:true,tabId,site:host,globalEnabled:true,
 sitePaused:host==="github.com",temporarilyPaused:false,requestLog:true,
 blocked:1,allowedRequests:3,recentBlocks:[{host:"ads.example",type:"script",
  when:10000,sequence:1,registeredDomain:"ads.example",ruleType:"filter"}],
 allowedGroups:[{host:"cdn.example",type:"image",count:3,last:11000}],selectiveBlocks:[]});
test("combines blocked and permitted evidence for current sites, never tab URLs",()=>{
 const a=site(2,"github.com"),b=site(5,"youtube.com");
 a.url="https://github.com/secret/SECRET_TOKEN";
 b.title="PRIVATE VIDEO TITLE";
 const report=E.build([a,b],12000);
 assert.equal(report.websites.length,2);
 assert.equal(report.websites[0].permitted.requests[0].destinationHostname,"cdn.example");
 assert.equal(report.websites[1].blocked.requests[0].destinationHostname,"ads.example");
 assert.equal(report.websites[0].websiteAllowlisted,true);
 const raw=JSON.stringify(report)+"\n"+E.asText(report);
 assert.ok(!raw.includes("SECRET_TOKEN")&&!raw.includes("PRIVATE VIDEO TITLE"));
 assert.match(raw,/github\.com/);assert.match(raw,/youtube\.com/);
});
test("limits number of tabs and never trusts malformed snapshot hostnames",()=>{
 const records=Array.from({length:40},(_,i)=>site(i,"example"+i+".test"));
 const report=E.build([...records,{...site(99,"example.test"),site:"example.test/path?TOKEN=PRIVATE"}],12000);
 assert.equal(report.includedTabs,E.MAX_TABS);
 assert.equal(new Set(report.websites.map(x=>x.tabId)).size,report.includedTabs);
 assert.throws(()=>E.build([]),/No current/);
});
test("download is only local and both TXT and JSON reports can be written",()=>{
 const record={};
 const env={Blob:class{constructor(parts,opts){record.text=parts.join("");this.size=record.text.length;record.mime=opts.type}},
  URL:{createObjectURL:()=>{record.local=true;return "blob:internal"},revokeObjectURL:()=>{record.revoked=true}},
  document:{body:{appendChild:()=>{}},createElement:()=>({click:()=>{record.clicked=true},remove:()=>{record.removed=true}})},
  setTimeout:f=>f()};
 const report=E.build([site(3,"example.test")],12000);
 assert.match(E.download(report,"txt",env).filename,/\.txt$/);
 assert.match(record.text,/CURRENT OPEN WEBSITE REPORT/);
 assert.match(E.download(report,"json",env).filename,/\.json$/);
 assert.equal(JSON.parse(record.text).includedTabs,1);
 assert.equal(record.clicked&&record.removed&&record.revoked,true);
 assert.throws(()=>E.download(report,"html",env),/Unsupported export/);
});
