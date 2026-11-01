"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict");
const Outcome=require("../src/youtube-outcome.js");
test("outcomes distinguish ad state, refusal and user skip, never assert success",()=>{
 const ad=Outcome.summarize({youtubeResponse:{modified:5},playbackDiagnostics:[{kind:"ad-showing",url:"secret"}]});
 assert.equal(ad.category,"player-ad-state-observed");
 assert.equal(ad.verifiedAdFree,false);
 assert.equal(Outcome.summarize({playbackDiagnostics:[{kind:"enforcement"},{kind:"ad-showing"}]}).category,
  "anti-adblock-enforcement-observed");
 assert.equal(Outcome.summarize({playbackDiagnostics:[{kind:"ad-skip"}]}).category,"skip-action-observed");
 assert.equal(Outcome.summarize({youtubeResponse:{modified:1}}).category,"metadata-modified-outcome-unverified");
 assert.equal(Outcome.summarize({}).category,"insufficient-evidence");
 assert.doesNotMatch(JSON.stringify(ad),/secret|https|watch\\?v=|title|cookie/);
});
test("malformed and huge outcome counters cannot leak or overwhelm reports",()=>{
 const out=Outcome.summarize({youtubeResponse:{modified:Infinity},playbackDiagnostics:[
  ...Array.from({length:100},()=>({kind:"ad-showing",videoId:"PRIVATE"})),
  {kind:"PRIVATE"}]});
 assert.equal(out.counts["ad-showing"],30);
 assert.equal(out.modifiedResponses,0);
 assert.equal(out.observations,30);
 assert.doesNotMatch(JSON.stringify(out),/PRIVATE/);
});

test("Build 199 compares voluntary exports using only categorical outcomes",()=>{
 const a={experimentMode:"observe",responseFiltering:{modified:0},playback:[
  {kind:"ad-showing",watchUrl:"https://private.example/watch?token=SECRET"},
  {kind:"buffering"}],website:"www.youtube.com",account:"PRIVATE_ACCOUNT"};
 const b={experimentMode:"combined",responseFiltering:{modified:2},playback:[],account:"SECRET"};
 const compared=Outcome.compare(a,b);
 assert.equal(Outcome.summarize(a).category,"playback-fault-observed");
 assert.equal(compared.baselineMode,"observe");
 assert.equal(compared.candidateMode,"combined");
 assert.equal(compared.deltaAdState,-1);
 assert.equal(compared.deltaFaults,-1);
 assert.equal(compared.deltaModifiedResponses,2);
 assert.equal(compared.verifiedAdFree,false);
 assert.doesNotMatch(JSON.stringify(compared),/PRIVATE|SECRET|watch|token|account|youtube.com/);
});
