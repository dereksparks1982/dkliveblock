"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path");
const R=require("../src/youtube-report.js");
const js=fs.readFileSync(path.join(__dirname,"../src/site-dashboard.js"),"utf8");
const tab=(id,url)=>({id,url});
test("Build 308: original selected tab is eligible only while its URL is unchanged",()=>{
 const t=tab(12,"https://www.youtube.com/watch?v=PRIVATE");
 assert.equal(R.unchangedTab(t,{...t},12),true);
 assert.equal(R.unchangedTab(tab(9,"https://youtube.com/"),tab(9,"https://youtube.com/"),9),true);
});
test("Build 308: a different video on same host invalidates the saved snapshot",()=>{
 const t=tab(12,"https://www.youtube.com/watch?v=ORIGINAL");
 for(const url of ["https://www.youtube.com/watch?v=NEW","https://www.youtube.com/shorts/ID",t.url+"#changed"])
  assert.equal(R.unchangedTab(t,tab(12,url),12),false);
});
test("Build 308: tab replacement and unsupported data reject without throwing",()=>{
 const t=tab(12,"https://www.youtube.com/watch?v=ORIGINAL");
 assert.equal(R.unchangedTab(t,tab(13,t.url),12),false);
 assert.equal(R.unchangedTab(t,t,13),false);
 assert.equal(R.unchangedTab(null,t,12),false);
 assert.equal(R.unchangedTab(tab(12,""),tab(12,""),12),false);
 assert.equal(R.unchangedTab(tab(12,"x".repeat(4100)),tab(12,"x".repeat(4100)),12),false);
});
test("Build 308: report still excludes video URLs, player identifiers and account data",()=>{
 const obj=R.build({ok:true,site:"www.youtube.com",tabId:12,
  youtubeTestMode:"player-pass-through",
  playbackDiagnostics:[{kind:"enforcement",videoId:"SECRET_ID"}]});
 assert.equal(obj.experimentMode,"player-pass-through");
 assert.equal(JSON.stringify(obj).includes("SECRET_ID"),false);
 assert.equal(Object.hasOwn(obj,"url"),false);
});
test("Build 308: button exports fresh guarded evidence, not cached current",()=>{
 assert.match(js,/async function exportYouTube\(kind\)/);
 assert.match(js,/const before=await verifyCurrentTab\(expected\)/);
 assert.match(js,/action:"getSiteDashboard",tabId:expected\.tabId/);
 assert.match(js,/const after=await verifyCurrentTab\(expected\)/);
 assert.match(js,/DKYouTubeReport\.unchangedTab\(before,after,expected\.tabId\)/);
 assert.match(js,/DKYouTubeReport\.build\(fresh\)/);
 assert.doesNotMatch(js,/DKYouTubeReport\.build\(current\)/);
 assert.equal(require("../src/manifest.json").version,require("../package.json").version);
});