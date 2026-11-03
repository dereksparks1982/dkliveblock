"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path");
const R=require("../src/youtube-manual-outcome.js");
const obs=(patch={})=>({baselineVideoType:"ordinary",candidateVideoType:"ordinary",
 baselinePlayback:"works",candidatePlayback:"works",
 baselineAds:"seen",candidateAds:"none-seen",...patch});
test("Build 314: successful playback with no observed ad is not verified blocking",()=>{
 const r=R.assess(obs());assert.equal(r.candidate,"no-ad-observed");
 assert.equal(r.baseline,"ad-observed");assert.equal(r.verifiedAdFree,false);
});
test("Build 314: refusal with no ads is a playback failure, not ad-free evidence",()=>{
 const r=R.assess(obs({candidatePlayback:"refused",candidateAds:"none-seen"}));
 assert.equal(r.candidate,"playback-refused");
 assert.ok(r.warnings.some(w=>w.includes("not evidence of successful ad blocking")));
});
test("Build 314: stalled playback and mixed video types produce different warning",()=>{
 const r=R.assess(obs({baselineVideoType:"ad-funded-film",candidatePlayback:"stalled"}));
 assert.equal(r.candidate,"playback-stalled");assert.equal(r.sameVideoType,false);
 assert.ok(r.warnings.some(w=>w.includes("Video types differ")));
});
test("Build 314: extra private fields are discarded from classified result",()=>{
 const r=R.assess({...obs(),watchUrl:"https://youtube.com/watch?v=PRIVATE_VIDEO",password:"SECRET"});
 assert.equal(JSON.stringify(r).includes("PRIVATE_VIDEO"),false);
 assert.equal(JSON.stringify(r).includes("SECRET"),false);
 assert.equal(R.assess(null).verifiedAdFree,false);
});
test("Build 314: offline UI loads classification before comparing and exporting",()=>{
 const h=fs.readFileSync(path.join(__dirname,"../src/youtube-lab.html"),"utf8");
 const u=fs.readFileSync(path.join(__dirname,"../src/youtube-lab-ui.js"),"utf8");
 assert.ok(h.indexOf('src="youtube-manual-outcome.js"')<h.indexOf('src="youtube-lab-ui.js"'));
 assert.ok(u.includes("DKYouTubeManualOutcome.assess(observed)"));
 assert.ok(u.includes("manualAssessment:DKYouTubeManualOutcome.assess(observations())"));
 assert.doesNotMatch(u,/fetch\s*\(|sendBeacon|innerHTML\s*=/);
 assert.equal(require("../src/manifest.json").version,require("../package.json").version);
});