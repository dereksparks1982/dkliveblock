"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path");
const X=require("../src/youtube-experiment.js");
const ROOT=path.resolve(__dirname,"..");
const BASE="https://www.youtube.com/youtubei/v1/";
test("Build 297: fifth mode is tab-local and expires after one hour",()=>{
 assert.deepEqual(X.MODES,["combined","response-only","bridge-only","observe","player-pass-through"]);
 const store=new Map();
 assert.equal(X.get(store,1,"www.youtube.com",1000),"combined");
 assert.equal(X.set(store,1,"www.youtube.com","player-pass-through",1000),true);
 assert.equal(X.get(store,2,"www.youtube.com",1001),"combined");
 assert.equal(X.get(store,1,"www.youtube.com",1001),"player-pass-through");
 assert.equal(X.get(store,1,"www.youtube.com",1000+X.TTL),"combined");
 assert.equal(store.size,0);
});
test("Build 297: pass-through disables both mutating player JSON methods",()=>{
 assert.deepEqual({...X.policy("player-pass-through")},{response:false,bridge:false,observe:true});
 assert.deepEqual({...X.policy("player-pass-through",false)},{response:false,bridge:false,observe:false});
 assert.deepEqual({...X.policy("combined")},{response:true,bridge:true,observe:false});
 assert.equal(X.preserveRequest("player-pass-through",true,true),false);
 assert.equal(X.preserveRequest("player-pass-through",true,false),false);
});
test("Build 297: only three exact API paths on four official hosts",()=>{
 for(const host of ["youtube.com","www.youtube.com","m.youtube.com","music.youtube.com"])
  for(const end of ["player","get_watch","resolve_url"])
   assert.equal(X.playerPassThrough("player-pass-through",
    "https://"+host+"/youtubei/v1/"+end+"?prettyPrint=false"),true,host+"/"+end);
 for(const end of ["browse","search","next","playlist","reel_watch_sequence",
 "log_event","player_extra","player/foo","ads"])
  assert.equal(X.playerPassThrough("player-pass-through",BASE+end),false,end);
});
test("Build 297: ad, media, tracking, navigation and impostor hosts never exempt",()=>{
 const denied=[
 "https://googleads.g.doubleclick.net/pagead",
 "https://ads.youtube.com/youtubei/v1/player",
 "https://youtube.com.evil.test/youtubei/v1/player",
 "https://evil-youtube.com/youtubei/v1/player",
 "https://www.youtube.com/watch",
 "https://www.youtube.com/api/stats/qoe",
 "https://www.youtube-nocookie.com/youtubei/v1/player",
 "http://www.youtube.com/youtubei/v1/player",
 "https://user:secret@www.youtube.com/youtubei/v1/player",
 "not-a-url"
 ];
 for(const url of denied)
  assert.equal(X.playerPassThrough("player-pass-through",url),false,url);
});
test("Build 297: no accidental default bypass or disabled feature override",()=>{
 for(const mode of X.MODES.filter(x=>x!=="player-pass-through"))
  assert.equal(X.playerPassThrough(mode,BASE+"player"),false,mode);
 assert.equal(X.playerPassThrough("player-pass-through",BASE+"player",false),false);
 assert.equal(X.playerPassThrough("player-pass-through","x".repeat(5000)),false);
});
test("Build 297: reset and site change revoke the temporary mode",()=>{
 const store=new Map();
 assert.equal(X.set(store,1,"www.youtube.com","player-pass-through",1000),true);
 assert.equal(X.get(store,1,"music.youtube.com",1001),"combined");
 assert.equal(X.set(store,1,"www.youtube.com","player-pass-through",1002),true);
 assert.equal(X.set(store,1,"www.youtube.com","combined",1003),true);
 assert.equal(X.get(store,1,"www.youtube.com",1004),"combined");
 assert.equal(X.set(store,1,"youtube.com.attacker.test","player-pass-through",1004),false);
});
test("Build 297: pass-through stays behind safety gates in live background source",()=>{
 const c=fs.readFileSync(path.join(ROOT,"src/background.js"),"utf8");
 const at=c.indexOf("const diagnosticPlayerPass=DKYouTubeExperiment.playerPassThrough");
 assert.ok(at>0);
 assert.ok(c.indexOf("DKAllowedActivity.matches(")<at);
 assert.ok(c.indexOf("if(!activeTab(d.tabId,top))")<at);
 assert.ok(c.indexOf("DKAuthProtection.isCriticalRequest(")<at);
 assert.ok(c.indexOf("DKYouTubeResponse.requestEligible(d,top)",at)>at);
 const html=fs.readFileSync(path.join(ROOT,"src/site-dashboard.html"),"utf8");
 const js=fs.readFileSync(path.join(ROOT,"src/site-dashboard.js"),"utf8");
 assert.match(html,/value="player-pass-through"/);
 assert.match(js,/mode==="player-pass-through"&&!window.confirm/);
});
test("Build 297: report/lab/outcome retain mode without raw request URLs",()=>{
 const Report=require("../src/youtube-report.js");
 const Lab=require("../src/youtube-lab.js");
 const Outcome=require("../src/youtube-outcome.js");
 const report=Report.build({ok:true,site:"www.youtube.com",tabId:7,
  youtubeTestMode:"player-pass-through",youtubeResponse:{enabled:true,supported:true}});
 assert.equal(report.experimentMode,"player-pass-through");
 assert.equal(Lab.parse(JSON.stringify(report)).mode,"player-pass-through");
 assert.equal(Outcome.compare({experimentMode:"player-pass-through"},
  {experimentMode:"observe"}).baselineMode,"player-pass-through");
});
test("Build 297: version, test runner and Firefox permissions preserved",()=>{
 const pkg=require("../package.json"),manifest=require("../src/manifest.json");
 assert.equal(pkg.version,"0.3.267");
 assert.equal(manifest.version,pkg.version);
 const runner=fs.readFileSync(path.join(ROOT,"scripts/test-local.sh"),"utf8");
 assert.ok(runner.includes("tests/youtube-player-pass-through-build297.test.js"));
 assert.ok(runner.includes("tests/youtube-response-integration.test.js"));
 assert.equal(manifest.permissions.includes("declarativeNetRequest"),false);
});
