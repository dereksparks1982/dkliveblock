"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict");
const E=require("../src/allowed-export.js");
function fixture(){
 return {ok:true,requestLog:true,tabId:6,site:"chatgpt.com",allowedRequests:7,
  globalEnabled:true,sitePaused:true,temporarilyPaused:false,siteActive:false,
  allowedGroups:[{host:"images.example.net",type:"image",count:5,last:100000},
   {host:"api.example.net",type:"xmlhttprequest",count:2,last:101000}],
  selectiveBlocks:[{host:"images.example.net",type:"image"}]};
}
test("exports allowed groups including exact manual controls, service details and counts",()=>{
 const report=E.build(fixture(),null,105000);
 assert.equal(report.website,"chatgpt.com");
 assert.equal(report.totalCompletedRequestsOnTab,7);
 assert.equal(report.requests.length,2);
 assert.equal(report.observedGroups,2);
 assert.equal(report.savedManualBlockingChoices,1);
 assert.equal(report.requests[0].selectiveBlocking,"Block future matching hostname and type");
 assert.equal(report.requests[0].completedRequests,5);
 assert.equal(report.requests[1].resourceType,"xmlhttprequest");
 assert.ok(report.requests[0].researchLinks.some(x=>x.url.includes("rdap.org")));
 assert.match(E.asText(report),/PERMITTED DESTINATION 2 OF 2/);
 assert.match(E.asText(report),/Site allowlisted/);
});
test("single permitted destination can be exported separately",()=>{
 const report=E.build(fixture(),{host:"api.example.net",type:"xmlhttprequest"},105000);
 assert.equal(report.exportedGroups,1);
 assert.equal(report.requests[0].destinationHostname,"api.example.net");
 assert.match(E.filename(report,"json"),/permitted-request.*\.json$/);
 assert.throws(()=>E.build(fixture(),{host:"unseen.example",type:"script"}),/changed/);
});
test("saved manual controls can be exported when request logging is off",()=>{
 const f={...fixture(),requestLog:false,allowedGroups:[],allowedRequests:0};
 const report=E.build(f,null,105000);
 assert.equal(report.requests.length,1);
 assert.equal(report.requests[0].observedInCurrentTab,false);
 assert.equal(report.requests[0].completedRequests,0);
 assert.equal(report.requestLogEnabled,false);
});
test("never exports a URL, query string, cookie, video ID or private field",()=>{
 const f=fixture();
 f.tabURL="https://chatgpt.com/c/SECRET_TOKEN";
 f.allowedGroups[0].url="https://images.example.net/path?password=SECRET_PASSWORD";
 f.allowedGroups[0].cookie="SECRET_COOKIE";
 f.allowedGroups[1].headers={"authorization":"SECRET_AUTH"};
 const output=JSON.stringify(E.build(f))+"\n"+E.asText(E.build(f));
 for(const secret of ["SECRET_TOKEN","SECRET_PASSWORD","SECRET_COOKIE","SECRET_AUTH"])
  assert.equal(output.includes(secret),false);
 assert.equal(output.includes("https://images.example.net/path"),false);
});
test("local TXT and JSON download produce files without fetch or telemetry",()=>{
 const data=E.build(fixture(),null,105000);
 const saved={};
 const env={
  Blob:class{constructor(chunks,config){saved.text=chunks.join("");saved.mime=config.type;this.size=saved.text.length;}},
  URL:{createObjectURL:()=>{saved.object=true;return "blob:local"},revokeObjectURL:()=>{saved.revoked=true}},
  document:{body:{appendChild:()=>{saved.appended=true}},createElement:()=>({
   click:()=>{saved.clicked=true},remove:()=>{saved.removed=true}})},
  setTimeout:cb=>{cb()}
 };
 const txt=E.download(data,"txt",env);
 assert.match(txt.filename,/\.txt$/);
 assert.match(saved.text,/PERMITTED DESTINATION/);
 assert.equal(saved.clicked&&saved.removed&&saved.revoked,true);
 const json=E.download(data,"json",env);
 assert.match(json.filename,/\.json$/);
 assert.equal(JSON.parse(saved.text).requests.length,2);
 assert.throws(()=>E.download(data,"html",env),/Unsupported/);
});
