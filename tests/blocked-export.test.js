"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict");
const E=require("../src/blocked-export.js");
function fixture(){
 return {ok:true,requestLog:true,tabId:15,site:"www.youtube.com",blocked:5,
  filterBackend:"hybrid",recentBlocks:[
   {host:"www.youtube.com",type:"image",when:1793410589000,sequence:2,
    registeredDomain:"youtube.com",ruleType:"filter",
    ruleEvidence:{source:"Native network filter (original list not determined)",
     pattern:"Matching pattern withheld: may contain a URL path or private parameter"}},
   {host:"googleads.g.doubleclick.net",type:"xmlhttprequest",when:1793410600000,sequence:3,
    registeredDomain:"doubleclick.net",ruleType:"filter",
    ruleEvidence:{source:"Native network filter (original list not determined)",pattern:"||doubleclick.net^"}}
  ]};
}
test("exports all retained blocked requests with details, owner hints and research links",()=>{
 const result=E.build(fixture(),null,new Map(),1793410800000);
 assert.equal(result.website,"www.youtube.com");
 assert.equal(result.totalBlockedOnTab,5);
 assert.equal(result.retainedRecords,2);
 assert.equal(result.exportedRecords,2);
 assert.equal(result.requests[0].destinationHostname,"www.youtube.com");
 assert.equal(result.requests[0].serviceOperator,"Google LLC (YouTube)");
 assert.equal(result.requests[0].registration.status.includes("Not fetched"),true);
 assert.equal(result.requests[1].matchedFilter,"||doubleclick.net^");
 assert.ok(result.requests[0].researchLinks.some(link=>link.url==="https://rdap.org/domain/youtube.com"));
 assert.ok(E.asText(result).includes("Matched filter evidence: ||doubleclick.net^"));
 assert.ok(E.asText(result).includes("REQUEST 2 OF 2"));
});
test("optional RDAP facts are exported only if user already fetched them",()=>{
 const f=fixture(),lookups=new Map();
 lookups.set(E.rowKey(f.site,f.tabId,"www.youtube.com"),{
  ok:true,domain:"youtube.com",organization:"",registrar:"MarkMonitor Inc.",
  registered:"2005-02-15",updated:"2026-01-14",expires:"2027-02-15",
  nameservers:["ns1.google.com","ns2.google.com"],statuses:["client transfer prohibited"]});
 const single=E.build(f,f.recentBlocks[0],lookups,1793410800000);
 assert.equal(single.exportedRecords,1);
 assert.equal(single.requests[0].registration.registrar,"MarkMonitor Inc.");
 assert.equal(single.requests[0].registration.registeredOrganization,"Not publicly disclosed");
 assert.equal(single.requests[0].serviceOperator,"Google LLC (YouTube)");
 assert.match(E.asText(single),/Registration lookup: User-requested public registration data/);
 assert.match(E.asText(single),/Registrar: MarkMonitor Inc\./);
});
test("export removes raw paths, tokens, credentials and arbitrary fields",()=>{
 const f=fixture();
 f.url="https://www.youtube.com/watch?v=PRIVATE_VIDEO_TOKEN";
 f.recentBlocks[0].url="https://www.youtube.com/sensitive?password=PRIVATE_PASSWORD";
 f.recentBlocks[0].ruleEvidence.pattern="https://www.youtube.com/private?token=PRIVATE_SECRET";
 f.recentBlocks[0].cookie="session=PRIVATE_SESSION";
 const out=E.build(f,null,new Map(),1793410800000);
 const dump=JSON.stringify(out)+"\n"+E.asText(out);
 for(const secret of ["PRIVATE_VIDEO_TOKEN","PRIVATE_PASSWORD","PRIVATE_SECRET","PRIVATE_SESSION"])
  assert.equal(dump.includes(secret),false,secret);
 assert.match(dump,/withheld/);
});
test("simulated Firefox local file download works without sending a network request",()=>{
 const saved=[],revoked=[],scheduled=[],record={};
 class BlobMock{
  constructor(chunks,{type}){record.text=chunks.join("");record.type=type;this.size=record.text.length;}
 }
 const env={Blob:BlobMock,URL:{
  createObjectURL:blob=>{saved.push(blob);return "blob:mock";},
  revokeObjectURL:url=>revoked.push(url)
 },document:{body:{appendChild(node){record.appended=node;}},
  createElement:tag=>{assert.equal(tag,"a");return {click(){record.clicked=true;},remove(){record.removed=true;}};}},
 setTimeout:(fn,ms)=>{scheduled.push({fn,ms});return 1;}};
 const report=E.build(fixture(),null,new Map(),1793410800000);
 const txt=E.download(report,"txt",env);
 assert.equal(txt.records,2);
 assert.match(txt.filename,/\.txt$/);
 assert.equal(record.appended.download,txt.filename);
 assert.equal(record.clicked,true);
 assert.equal(record.removed,true);
 assert.match(record.text,/www\.youtube\.com/);
 assert.equal(record.type,"text/plain;charset=utf-8");
 assert.equal(saved.length,1);
 assert.equal(scheduled[0].ms,60000);
 scheduled[0].fn();assert.deepEqual(revoked,["blob:mock"]);
 const json=E.download(report,"json",env);
 assert.deepEqual(JSON.parse(record.text),report);
 assert.match(json.filename,/\.json$/);
});
test("empty, off, invalid or stale selection cannot generate an export",()=>{
 const f=fixture();
 assert.throws(()=>E.build({...f,requestLog:false}),/disabled/);
 assert.throws(()=>E.build({...f,recentBlocks:[]}),/No blocked requests/);
 assert.throws(()=>E.build(f,{...f.recentBlocks[0],sequence:999}),/Selected request changed/);
 assert.throws(()=>E.build({...f,site:"http://bad/?token=PRIVATE"}),/Select an active/);
 assert.throws(()=>E.download({requests:[]}),/No blocked/);
 assert.throws(()=>E.download(E.build(f),"html"),/Unsupported export type/);
});

test("exports YouTube refusal and buffering separately, never private media URLs",()=>{
 const f=fixture();
 f.playbackDiagnostics=[
  {kind:"enforcement",when:1793410601000,blockedMediaNearby:false,url:"https://www.youtube.com/watch?v=PRIVATE_VIDEO"},
  {kind:"buffering",when:1793410607000,blockedMediaNearby:true},
  {kind:"fake",when:1793410610000}
 ];
 const result=E.build(f);
 assert.deepEqual(result.playbackDiagnostics.map(row=>row.kind),["enforcement","buffering"]);
 assert.match(E.asText(result),/PLAYBACK DIAGNOSTICS/);
 assert.match(E.asText(result),/enforcement/);
 assert.doesNotMatch(JSON.stringify(result),/PRIVATE_VIDEO/);
});

test("YouTube false-positive triage is in the blocked export but contains no video URL",()=>{
 const f=fixture();
 f.recentBlocks.push({host:"www.youtube.com",type:"xmlhttprequest",sequence:99,
  ruleEvidence:{source:"Native network filter (original list not determined)",subscription:"EasyPrivacy"},
  url:"https://www.youtube.com/players?videoId=SECRET_VIDEO"});
 const r=E.build(f);
 assert.equal(r.youtubeCompatibility.firstPartyXHR,1);
 assert.ok(r.youtubeCompatibility.firstPartySources.includes("EasyPrivacy"));
 assert.doesNotMatch(JSON.stringify(r),/SECRET_VIDEO/);
 assert.match(E.asText(r),/YOUTUBE COMPATIBILITY EVIDENCE/);
});

test("Build 170 regular blocked export includes sanitized YouTube response and bootstrap evidence",()=>{
 const f=fixture();
 f.youtubeTestMode="response-only";
 f.youtubeResponse={enabled:true,supported:true,playerRequests:3,observed:2,
  modified:1,refused:1,errors:0,
  bootstrap:[{phase:"pre-enable",state:"data",adFields:2,
   refused:false,initialData:true,videoId:"PRIVATE_VIDEO_ID",title:"PRIVATE_TITLE"},
   {phase:"post-enable",state:"data",adFields:0,
    refused:false,initialData:true},
   {phase:"late-sneaky",state:"other",adFields:0,
    refused:false,initialData:false,token:"PRIVATE_TOKEN"}]};
 const report=E.build(f,null,new Map(),1793410800000);
 assert.equal(report.youtubePlaybackEvidence.experimentMode,"response-only");
 assert.equal(report.youtubePlaybackEvidence.responseFiltering.modified,1);
 assert.equal(report.youtubePlaybackEvidence.responseFiltering.bootstrap.length,2);
 assert.equal(report.youtubePlaybackEvidence.responseFiltering.bootstrap[0].adFields,2);
 const exported=JSON.stringify(report)+"\n"+E.asText(report);
 assert.match(exported,/YOUTUBE PLAYER-DATA OBSERVATIONS/);
 assert.match(exported,/Response bodies modified: 1/);
 assert.match(exported,/does NOT confirm that ads were removed/);
 for(const secret of ["PRIVATE_VIDEO_ID","PRIVATE_TITLE","PRIVATE_TOKEN","late-sneaky"])
  assert.equal(exported.includes(secret),false,secret);
});
test("Build 170 non-YouTube blocked exports do not include player diagnostics",()=>{
 const page=fixture();
 page.site="news.example";
 const out=E.build(page);
 assert.equal(out.youtubePlaybackEvidence,null);
 assert.equal(E.asText(out).includes("YOUTUBE PLAYER-DATA OBSERVATIONS"),false);
});

test("Build 173 historical blocked export reflects only current exact host/type control",()=>{
 const f=fixture();
 f.requestAllowances=[{host:"www.youtube.com",type:"image",scope:"remember"}];
 f.selectiveBlocks=[{host:"googleads.g.doubleclick.net",type:"xmlhttprequest"}];
 const report=E.build(f);
 assert.equal(report.requests[0].currentControl.allowanceActive,true);
 assert.equal(report.requests[0].currentControl.manuallyBlocked,false);
 assert.equal(report.requests[1].currentControl.allowanceActive,false);
 assert.equal(report.requests[1].currentControl.manuallyBlocked,true);
 const text=E.asText(report);
 assert.match(text,/Request history note: This entry was blocked when recorded/);
 assert.match(text,/Currently manually allowed: true/);
 assert.match(text,/Current explicit manual block: true/);
 assert.doesNotMatch(JSON.stringify(report),/watch\?v=|PRIVATE_TOKEN/);
});
