"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict");
const R=require("../src/facebook-diagnostic-report.js");
const base={ok:true,active:true,adRecognition:true,picking:false,adapterLoaded:true,
 detector:{coreFull:1,coreMissing:0,coreEnabled:1,settingsReady:1,observerActive:1,
  hidden:0,fastHidden:0,scans:3,observerCalls:4,labelsClassified:0,labelsAnchored:0}};
const gql={ok:true,enabled:true,siteActive:true,supported:true,
 stats:{attached:0,modified:0,removed:0,unchanged:0}};
const build=(d={},g=gql)=>R.build({...base,detector:{...base.detector,...d}},g);
test("Build 407: diagnostic export uses existing schema and aggregate-only pipeline",()=>{
 const p=build().pipeline;
 assert.equal(p.dom,"scanning-no-label");
 assert.equal(p.graphql,"no-eligible-responses-observed");
 assert.equal(p.focus,"inspect-facebook-response-routes");
 assert.equal(p.verified,false);assert.equal(p.scope,"aggregate-only");
 assert.equal(build().schema,2);
});
test("Build 407: observed eligible unmodified GraphQL responses signal schema investigation",()=>{
 const p=build({labelsClassified:0},
  {...gql,stats:{attached:8,unchanged:8,modified:0,removed:0}}).pipeline;
 assert.equal(p.graphql,"responses-observed-unmodified");
 assert.equal(p.focus,"inspect-ad-metadata-schema");
});
test("Build 407: modified GraphQL and hidden posts never claim per-post success",()=>{
 const p=build({hidden:2,labelsAnchored:2},
  {...gql,stats:{attached:7,modified:3,removed:5}}).pipeline;
 assert.equal(p.dom,"hides-observed");assert.equal(p.graphql,"records-modified");
 assert.equal(p.focus,"both-layers-active-still-check-feed");
 assert.equal(p.verified,false);
});
test("Build 407: detected labels without a safe post boundary have own diagnosis",()=>{
 const p=build({labelsClassified:4,labelsUnanchored:4}).pipeline;
 assert.equal(p.dom,"labels-unanchored");assert.equal(p.focus,"inspect-post-boundaries");
});
test("Build 407: anchored-but-unhidden ads do not become successful hides",()=>{
 const p=build({labelsClassified:3,labelsAnchored:3}).pipeline;
 assert.equal(p.dom,"labels-anchored-no-hide");
 assert.equal(p.focus,"inspect-post-boundaries");
});
test("Build 407: late SPA retry evidence has separate category",()=>{
 const p=build({pending:5,labelsDeferred:1}).pipeline;
 assert.equal(p.dom,"labels-pending");assert.equal(p.focus,"inspect-late-spa-retries");
});
test("Build 407: GraphQL timeout, errors or oversized fallback do not claim a block",()=>{
 for(const counter of ["timeout","errors","oversized"]){
  const p=build({}, {...gql,stats:{attached:2,[counter]:1,modified:1}}).pipeline;
  assert.equal(p.graphql,"interception-errors-observed");
  assert.equal(p.focus,"inspect-graphql-safety-fallback");
 }
});
test("Build 407: capacity skips are distinguished from no eligible responses",()=>{
 const p=build({}, {...gql,stats:{skipped:3}}).pipeline;
 assert.equal(p.graphql,"capacity-skips-observed");
});
test("Build 407: disabled, unsupported and missing GraphQL never read as success",()=>{
 assert.equal(build({},null).pipeline.graphql,"unavailable");
 assert.equal(build({}, {...gql,enabled:false}).pipeline.graphql,"inactive");
 assert.equal(build({}, {...gql,supported:false}).pipeline.graphql,"unsupported");
});
test("Build 407: engine missing or observer absent takes precedence over ad evidence",()=>{
 assert.equal(build({coreMissing:1,hidden:100}).pipeline.dom,"core-missing");
 assert.equal(build({observerActive:0,labelsAnchored:10}).pipeline.dom,"observer-inactive");
 assert.equal(build({settingsReady:0,hidden:2}).pipeline.dom,"settings-unavailable");
});
test("Build 407: inactive extension cannot be labeled active by spoofed counters",()=>{
 const report=R.build({...base,active:false,detector:{...base.detector,hidden:100}},gql);
 assert.equal(report.pipeline.dom,"inactive");
 assert.equal(report.pipeline.focus,"check-authorization-and-pauses");
});
test("Build 407: private contents and malformed numeric counters are excluded",()=>{
 const d={...base,detector:{...base.detector,profile:"SECRET",postText:"PRIVATE",
  token:"THE_TOKEN",labelsAnchored:NaN,hidden:1000001}};
 const g={...gql,stats:{attached:3,removed:2,account:"SHOULD_NOT_EXPORT",
  rawURL:"/my-profile?token=SENSITIVE"}};
 const report=R.build(d,g),str=JSON.stringify(report);
 for(const secret of ["SECRET","PRIVATE","THE_TOKEN","SHOULD_NOT_EXPORT","SENSITIVE","rawURL"])
  assert.doesNotMatch(str,new RegExp(secret));
 assert.equal(report.detector.hidden,undefined);
 assert.equal(report.pipeline.verified,false);
});
test("Build 407: malformed input produces explicit unknown and invalid evidence",()=>{
 const p=R.pipeline(null);
 assert.equal(p.dom,"unknown");assert.equal(p.focus,"invalid-evidence");
 assert.equal(R.build({ok:false},gql),null);
});
test("Build 407: output pipeline contains only fixed categories, no raw report echo",()=>{
 const r=build({hidden:1,pending:2});
 assert.deepEqual(Object.keys(r.pipeline),["dom","graphql","focus","verified","scope"]);
 assert.ok(Object.isFrozen(r.pipeline));
});
test("Build 407: preserve fixed report contract and no browser runtime permission",()=>{
 const m=require("../src/manifest.json"),pkg=require("../package.json");
 assert.equal(m.version,pkg.version);
 const source=require("node:fs").readFileSync(
  require("node:path").join(__dirname,"../src/facebook-diagnostic-report.js"),"utf8");
 for(const method of ["fetch(","sendBeacon(","XMLHttpRequest","webRequest.","tabs.create("])
  assert.equal(source.includes(method),false);
});
