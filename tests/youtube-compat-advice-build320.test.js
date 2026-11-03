"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path");
const Advice=require("../src/youtube-compatibility-advice.js");
const report=require("../src/youtube-report.js");
test("Build 320: in-player enforcement is observed without claiming a root cause",()=>{
 const r=Advice.assess({playbackAssessment:{counts:{enforcement:2}}});
 assert.ok(r.signals.includes("in-player-enforcement-observed"));
 assert.equal(r.rootCauseEstablished,false);assert.equal(r.verifiedAdFree,false);
});
test("Build 320: concurrent media blocking and buffering are correlated only",()=>{
 const r=Advice.assess({playbackAssessment:{counts:{buffering:3}},
  networkEvidence:{mediaBlocked:2}});
 assert.ok(r.signals.includes("blocked-media-and-playback-fault-coobserved"));
 assert.match(r.next,/before changing network or response filters/);
});
test("Build 320: first-party request and response edit signals do not prove YouTube cause",()=>{
 const r=Advice.assess({playbackAssessment:{counts:{enforcement:1}},
  networkEvidence:{firstPartyXHR:4},responseFiltering:{modified:2}});
 assert.ok(r.signals.includes("first-party-xhr-and-enforcement-coobserved"));
 assert.ok(r.signals.includes("player-json-edit-and-enforcement-coobserved"));
});
test("Build 320: missing or hostile inputs cannot forge success or leak private fields",()=>{
 const r=Advice.assess({networkEvidence:{hostname:"private.example"},
  playbackAssessment:{counts:{enforcement:"1"}},token:"SENSITIVE"});
 assert.deepEqual(r.signals,["insufficient-playback-evidence"]);
 assert.equal(JSON.stringify(r).includes("private.example"),false);
 assert.equal(JSON.stringify(r).includes("SENSITIVE"),false);
});
test("Build 320: report embeds bounded advice and text exporter labels it correctly",()=>{
 const out=report.build({ok:true,site:"www.youtube.com",tabId:5,
  playbackDiagnostics:[{kind:"enforcement",watchUrl:"PRIVATE_ID"}]});
 assert.ok(out.compatibilityAdvice.signals.includes("in-player-enforcement-observed"));
 assert.match(report.asText(out),/Root cause independently established: no/);
 assert.equal(JSON.stringify(out).includes("PRIVATE_ID"),false);
 const html=fs.readFileSync(path.join(__dirname,"../src/site-dashboard.html"),"utf8");
 assert.ok(html.indexOf('src="youtube-compatibility-advice.js"')<html.indexOf('src="youtube-report.js"'));
 assert.equal(require("../src/manifest.json").version,require("../package.json").version);
});