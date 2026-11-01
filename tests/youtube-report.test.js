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

test("Build 126 compatibility reports provide separate watch-next and playlist metrics",()=>{
 const s={ok:true,site:"www.youtube.com",tabId:11,youtubeResponse:{enabled:true,
  supported:true,byKind:{next:{requests:4,seen:3,changed:2},
   playlist:{requests:2,seen:1,changed:1}}}};
 const report=Report.build(s);
 assert.equal(report.responseFiltering.byKind.next.requests,4);
 assert.equal(report.responseFiltering.byKind.playlist.changed,1);
 const lines=Report.asText(report);
 assert.match(lines,/next JSON: 4 requested, 3 processed, 2 modified/);
 assert.match(lines,/playlist JSON: 2 requested, 1 processed, 1 modified/);
});

test("Build 155 exports refusal and prefetch counters without exporting playback secrets",()=>{
 const report=Report.build({ok:true,site:"www.youtube.com",tabId:155,
  youtubeResponse:{enabled:true,supported:true,observed:4,unchanged:3,
   refused:2,byKind:{player:{requests:2,seen:2,changed:0,refused:1},
    prefetch:{requests:2,seen:2,changed:1,refused:1}}},
  playbackDiagnostics:[{kind:"enforcement",rawUrl:"https://www.youtube.com/watch?v=PRIVATE_ID"}],
  videoId:"PRIVATE_ID",title:"PRIVATE_TITLE",reason:"PRIVATE_REASON"});
 assert.equal(report.responseFiltering.refused,2);
 assert.equal(report.responseFiltering.byKind.prefetch.requests,2);
 assert.equal(report.responseFiltering.byKind.prefetch.refused,1);
 const txt=Report.asText(report),serialized=JSON.stringify(report);
 assert.match(txt,/YouTube JSON refused: 2/);
 assert.ok(txt.includes("prefetch JSON: 2 requested, 2 processed, 1 modified, 1 refused/error"));
 for(const privateString of ["PRIVATE_ID","PRIVATE_TITLE","PRIVATE_REASON"])
  assert.equal((txt+serialized).includes(privateString),false);
});

test("Build 158 skip-button evidence is not falsely reported as a blocked ad",()=>{
 const report=Report.build({ok:true,site:"www.youtube.com",tabId:158,
  youtubeResponse:{observed:1,modified:0},playbackDiagnostics:[
   {kind:"ad-skip",when:1000,blockedMediaNearby:false,videoId:"PRIVATE_ID",title:"PRIVATE_TITLE"},
   {kind:"enforcement",when:2000,reason:"PRIVATE_REASON"}]});
 const txt=Report.asText(report),json=JSON.stringify(report);
 assert.equal(report.playback[0].kind,"ad-skip");
 assert.ok(txt.includes("ad-skip"));
 assert.match(report.limitations,/button click, not confirmed ad removal/);
 for(const secret of ["PRIVATE_ID","PRIVATE_TITLE","PRIVATE_REASON"])
  assert.equal((txt+json).includes(secret),false);
});

test("Build 167 exports coarse first-load timing without private player data",()=>{
 const report=Report.build({ok:true,site:"www.youtube.com",tabId:167,
  youtubeResponse:{enabled:true,supported:true,
   bootstrap:[
    {phase:"pre-enable",state:"data",adFields:2,refused:false,initialData:true,
     videoId:"SECRET_VIDEO",url:"https://www.youtube.com/watch?v=SECRET_VIDEO"},
    {phase:"post-enable",state:"data",adFields:0,refused:false,initialData:true},
    {phase:"late-1s",state:"accessor",adFields:0,refused:false,initialData:false},
    {phase:"bad-phase",state:"data",adFields:0,refused:false,initialData:false}
   ]}});
 assert.equal(report.responseFiltering.bootstrap.length,3);
 const exported=JSON.stringify(report)+"\n"+Report.asText(report);
 assert.match(exported,/YOUTUBE BOOTSTRAP/);
 assert.match(exported,/pre-enable: data/);
 assert.doesNotMatch(exported,/SECRET_VIDEO|watch\?v=|videoId/);
});
