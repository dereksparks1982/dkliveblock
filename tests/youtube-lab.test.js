"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path");
const Lab=require("../src/youtube-lab.js");
const Report=require("../src/youtube-report.js");
const base=()=>({
 ok:true,site:"www.youtube.com",tabId:12,globalEnabled:true,
 sitePaused:false,temporarilyPaused:false,requestLog:true,
 filterBackend:"hybrid",youtubeTestMode:"combined",blocked:7,
 allowedRequests:11,
 youtubeResponse:{enabled:true,supported:true,modified:3,
  attachAttempts:5,attached:4,errorStages:{attach:1,data:0,stop:0,stream:0},
  pagePrunes:{"bootstrap":1,"json-parse":2,"fetch-json":0,"fetch-text":0,"xhr-json":1,"xhr-text":0}},
 playbackDiagnostics:[{kind:"ad-showing"},{kind:"buffering"}],
 recentBlocks:[{host:"ads.example.net",type:"script",ruleEvidence:{subscription:"EasyList"}}]
});
const exported=(changes={})=>Report.build({...base(),...changes},1762100000000);
const parsed=(report=exported())=>Lab.parse(JSON.stringify(report));
test("Build 218 correctly projects actual DK Live Block YouTube report schema",()=>{
 const x=parsed();
 assert.equal(x.mode,"combined");
 assert.equal(x.backend,"hybrid");
 assert.equal(x.flags.enabled,true);
 assert.equal(x.flags.requestLog,true);
 assert.equal(x.metrics.blockedRequests,7);
 assert.equal(x.metrics.modifiedResponses,3);
 assert.equal(x.metrics.attachmentAttempts,5);
 assert.equal(x.metrics.attachedFilters,4);
 assert.equal(x.metrics.responseErrors,1);
 assert.equal(x.metrics.bridgeSamples,4);
 assert.equal(x.metrics.adState,1);
 assert.equal(x.metrics.buffering,1);
 assert.equal(x.observedEvents,2);
});
test("Build 218 report projection excludes URL, hostname, tab ID and arbitrary private fields",()=>{
 const report=exported();
 report.website="www.youtube.com";
 report.privateURL="https://youtube.com/watch?v=SUPER_SECRET_ID";
 report.tabId=987456;
 report.blocked=[{hostname:"exfiltration.example.net",path:"/secret"}];
 report.permitted=[{hostname:"account.example.net",cookie:"SECRET_COOKIE"}];
 report.playback=[{kind:"ad-showing",path:"/PRIVATE_VIDEO"}];
 report.responseFiltering.bootstrap=[{videoID:"PRIVATE_VIDEO"}];
 const result=JSON.stringify(Lab.parse(JSON.stringify(report)));
 for(const secret of ["SUPER_SECRET","exfiltration","account.example.net",
  "SECRET_COOKIE","PRIVATE_VIDEO","www.youtube.com","987456"])
  assert.equal(result.includes(secret),false,secret);
});
test("Build 218 rejects foreign formats, lookalike hostnames and invalid schema",()=>{
 const report=exported();
 for(const change of [
  {format:"DK Live Block YouTube compatibility report\u0000"},
  {format:"other JSON export"},{schemaVersion:2},
  {website:"youtube.com.evil.example"},{website:"https://youtube.com/watch?v=X"},
  {website:"foo..youtube.com"},{website:"YOUTUBE.COM"},
  {experimentMode:"free-ad-blocking"},{tabId:-1,website:"disneyplus.com"}]){
  assert.throws(()=>Lab.parse(JSON.stringify({...report,...change})));
 }
});
test("Build 218 refuses oversized and malformed local JSON safely",()=>{
 assert.throws(()=>Lab.parse(""),/750 KB/);
 assert.throws(()=>Lab.parse("{bad"),/valid JSON/);
 assert.throws(()=>Lab.parse("x".repeat(Lab.MAX_BYTES+1)),/750 KB/);
 assert.throws(()=>Lab.parse("{}"),/supported/);
 assert.throws(()=>Lab.parse(null),/750 KB/);
});
test("Build 218 malformed number and playback event inputs do not forge observations",()=>{
 const original=exported();
 for(const wrong of [-1,2.5,Infinity,1e12,"100",null]){
  const report=JSON.parse(JSON.stringify(original));
  report.blockedCount=wrong;
  if(wrong===Infinity)report.blockedCount=1e12;
  if(wrong===null)report.blockedCount=null;
  assert.throws(()=>Lab.parse(JSON.stringify(report)),/Invalid blocked requests/);
 }
 for(const row of [
  {kind:"identity",url:"secret"},
  {kind:"media-error",blockedMediaNearby:"yes"},
  null,
  "ad-showing"
 ]){
  const report={...original,playback:[row]};
  assert.throws(()=>Lab.parse(JSON.stringify(report)),/invalid player-health/);
 }
 assert.throws(()=>Lab.parse(JSON.stringify({
  ...original,playback:Array.from({length:31},()=>({kind:"ad-showing"}))
 })),/excessive/);
});
test("Build 218 comparison reports descriptive deltas without claiming success",()=>{
 const before=parsed(exported({youtubeTestMode:"observe",blocked:2,playbackDiagnostics:[
  {kind:"ad-showing"},{kind:"ad-showing"},{kind:"enforcement"}],
  youtubeResponse:{enabled:true,supported:true,modified:0,attachAttempts:0,attached:0}}));
 const after=parsed(exported({youtubeTestMode:"combined",blocked:5,playbackDiagnostics:[
  {kind:"ad-showing"}],
  youtubeResponse:{enabled:true,supported:true,modified:4,attachAttempts:7,attached:6}}));
 const c=Lab.compare(before,after),r=Object.fromEntries(c.rows.map(x=>[x.key,x]));
 assert.equal(c.baselineMode,"observe");
 assert.equal(c.candidateMode,"combined");
 assert.equal(r.adState.delta,-1);
 assert.equal(r.enforcement.delta,-1);
 assert.equal(r.modifiedResponses.delta,4);
 assert.equal(r.blockedRequests.delta,3);
 assert.equal(c.verifiedAdFree,false);
 assert.ok(c.warnings.some(x=>x.includes("Anti-adblock enforcement")));
 assert.match(c.caveat,/can be forged/);
});
test("Build 218 rejects mismatched settings and missing evidence as reliable comparison",()=>{
 const a=parsed(exported({youtubeTestMode:"bridge-only",playbackDiagnostics:[]}));
 const b=parsed(exported({youtubeTestMode:"response-only",sitePaused:true,
  requestLog:false,playbackDiagnostics:[{kind:"media-error"}]}));
 const result=Lab.compare(a,b);
 assert.equal(result.comparable,false);
 assert.ok(result.warnings.some(x=>x.includes("allowlist")));
 assert.ok(result.warnings.some(x=>x.includes("logging")));
 assert.ok(result.warnings.some(x=>x.includes("media error")));
 assert.ok(result.warnings.some(x=>x.includes("no player-health events")));
 assert.equal(result.verifiedAdFree,false);
});
test("Build 218 page uses file inputs and local-only safe text, no network calls",()=>{
 const root=path.join(__dirname,"../src");
 const html=fs.readFileSync(path.join(root,"youtube-lab.html"),"utf8");
 const ui=fs.readFileSync(path.join(root,"youtube-lab-ui.js"),"utf8");
 const dashboard=fs.readFileSync(path.join(root,"site-dashboard.html"),"utf8");
 for(const id of ["baselineFile","candidateFile","compareReports","exportComparison",
  "clearComparison","comparisonRows","comparisonWarnings","labStatus",
  "baselineVideoType","candidateVideoType","baselinePlayback","candidatePlayback",
  "baselineAds","candidateAds"])
  assert.ok(html.includes('id="'+id+'"'),id);
 assert.ok(html.includes('src="youtube-lab.js"'));
 assert.ok(html.includes('src="youtube-lab-ui.js"'));
 assert.ok(dashboard.includes('href="youtube-lab.html"'));
 assert.match(ui,/file\.text\(\)/);
 assert.match(ui,/video types differ/i);
 assert.match(ui,/textContent/);
 assert.doesNotMatch(ui,/\bfetch\s*\(|XMLHttpRequest|sendBeacon|innerHTML|localStorage|eval\s*\(/);
 const manifest=JSON.parse(fs.readFileSync(path.join(root,"manifest.json"),"utf8"));
 assert.ok(!manifest.permissions.includes("downloads"));
 assert.equal(manifest.version,require("../package.json").version);
});
