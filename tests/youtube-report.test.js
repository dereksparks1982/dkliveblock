"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path");
const Report=require("../src/youtube-report.js");
test("Build 77 single YouTube report exports modified-response counters and safe network evidence",()=>{
 const report=Report.build({ok:true,site:"www.youtube.com",tabId:12,globalEnabled:true,
  requestLog:true,blocked:4,allowedRequests:2,filterBackend:"hybrid",
  youtubeResponse:{enabled:true,supported:true,observed:2,modified:1,fields:3,unchanged:1,byKind:{player:{requests:2,seen:2,changed:1}}},
  recentBlocks:[{host:"www.youtube.com",type:"xmlhttprequest",when:1000,
   ruleEvidence:{subscription:"EasyList",pattern:"/watch?v=private-secret"}}],
  allowedGroups:[{host:"r1---sn.googlevideo.com",type:"media",count:2,last:1000}],
  playbackDiagnostics:[{kind:"enforcement",blockedMediaNearby:false,
   rawUrl:"https://www.youtube.com/watch?v=secret"}],
  title:"private-video-title",password:"private-password"});
 assert.equal(report.responseFiltering.modified,1);
 assert.equal(report.responseFiltering.skippedBusy,0);
 assert.equal(report.responseFiltering.fields,3);
 assert.equal(report.responseFiltering.byKind.player.requests,2);
 assert.match(Report.asText(report),/player JSON: 2 requested/);
 assert.equal(report.playback[0].kind,"enforcement");
 const data=JSON.stringify(report),text=Report.asText(report);
 for(const leak of ["private-secret","private-video-title","private-password",
  "watch?v=secret"])assert.equal(data.includes(leak)||text.includes(leak),false,leak);
 assert.match(text,/YouTube JSON modified: 1/);
 assert.match(data,/googlevideo\.com/);
});
test("Build 77 YouTube export refuses hostile and unrelated hostnames",()=>{
 for(const s of ["github.com","youtube.com.attacker.test",""]){
  assert.throws(()=>Report.build({ok:true,site:s,tabId:1}),/YouTube/);
 }
 assert.throws(()=>Report.build({ok:true,site:"www.youtube.com",tabId:-1}),/YouTube/);
});
test("Build 77 report UI loads only bundled scripts with explicit TXT/JSON actions",()=>{
 const html=fs.readFileSync(path.join(__dirname,"../src/site-dashboard.html"),"utf8");
 const js=fs.readFileSync(path.join(__dirname,"../src/site-dashboard.js"),"utf8");
 for(const id of ["dashboardYouTubeExportControls","dashboardYouTubeExportJSON","dashboardYouTubeExportText"])
  assert.ok(html.includes('id="'+id+'"'));
 assert.ok(html.includes('src="youtube-report.js"'));
 assert.ok(js.includes("DKYouTubeReport.build(current)"));
 assert.doesNotMatch(js,/fetch\(|sendBeacon|innerHTML\s*=/);
});
