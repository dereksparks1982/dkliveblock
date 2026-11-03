"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path");
const Report=require("../src/facebook-diagnostic-report.js");
const src=n=>fs.readFileSync(path.join(__dirname,"..","src",n),"utf8");
const detector={ok:true,active:true,adRecognition:true,picking:false,adapterLoaded:true,lastScanAt:1730000000000,
 detector:{hidden:1,scans:5,lastBylineSignals:3,fastHidden:1,profileName:"User",rawUrl:"https://facebook.com/private",account:{token:"SECRET"},lastHidden:Infinity}};
const graphql={ok:true,enabled:true,siteActive:true,supported:true,
 stats:{attached:16,modified:4,removed:2,unchanged:12,errors:0,profile:"SECRET",rawUrl:"/api/graphql?token=SECRET",skipped:-2}};
test("Build 305: sanitizer joins only approved numeric detector and GraphQL counters",()=>{
 const r=Report.build(detector,graphql);assert.equal(r.schema,2);assert.equal(r.kind,"dk-facebook-aggregate-diagnostics");
 assert.equal(r.detector.scans,5);assert.equal(r.detector.lastBylineSignals,3);
 assert.equal(r.graphql.available,true);assert.equal(r.graphql.enabled,true);assert.equal(r.graphql.counters.attached,16);assert.equal(r.graphql.counters.modified,4);
 const text=JSON.stringify(r);for(const forbidden of ["SECRET","rawUrl","profileName","account","token","private"])assert.ok(!text.includes(forbidden),forbidden);
 assert.equal(r.detector.lastHidden,undefined);assert.equal(r.graphql.counters.skipped,undefined);
});
test("Build 305: missing GraphQL evidence is unavailable, never zero or disabled",()=>{
 const r=Report.build(detector,null);assert.equal(r.graphql.available,false);assert.equal(r.graphql.enabled,undefined);
 assert.equal(Report.build({ok:false},graphql),null);
 assert.deepEqual(Report.counts({attached:NaN,modified:"3",removed:1.5,errors:1000001},Report.GRAPHQL),{});
});
test("Build 305: zero network blocks are not claimed to prove ad blocking",()=>{
 const r=Report.build({...detector,detector:{hidden:0,scans:1}}, {ok:true,enabled:true,stats:{}});
 assert.equal(r.detector.hidden,0);assert.deepEqual(r.graphql.counters,{});
 assert.match(r.interpretation,/cannot establish/);
});
test("Build 305: existing Meta UI uses same-tab screenshot diagnostics and separate guarded GraphQL",()=>{
 const js=src("meta-intelligence-ui.js"),html=src("meta-intelligence.html");
 assert.match(js,/getFacebookDetectorStatus/);assert.match(js,/getMetaGraphqlStats/);
 assert.match(js,/DKFacebookDiagnosticReport\.build\(reply,graphqlReply\)/);
 assert.match(js,/after\?\.url!==tab\.url/);
 assert.match(js,/DKFacebookDiagnosticReport\.graphql\(result\)/);
 assert.match(html,/<script src="facebook-diagnostic-report.js"><\/script><script src="meta-intelligence-ui.js"><\/script>/);
 assert.doesNotMatch(js,/innerHTML\s*=/);
 assert.equal(require("../src/manifest.json").version,require("../package.json").version);
});
test("Build 305: no new privileges or runtime network activity",()=>{
 const m=require("../src/manifest.json");for(const row of m.content_scripts)assert.ok(!row.js.includes("facebook-diagnostic-report.js"));
 for(const s of m.background.scripts)assert.notEqual(s,"facebook-diagnostic-report.js");
 assert.doesNotMatch(src("facebook-diagnostic-report.js"),/fetch\s*\(|XMLHttpRequest|webRequest\.on|tabs\.create/);
});