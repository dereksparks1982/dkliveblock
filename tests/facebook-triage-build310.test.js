"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict");
const R=require("../src/facebook-diagnostic-report.js");
const make=(flags={},d={scans:3,fastScans:1,hidden:0},g=null)=>R.build({
 ok:true,active:true,adRecognition:true,adapterLoaded:true,picking:false,...flags,detector:d},g);
test("Build 310: report provides a fixed read-only triage code and safe instruction",()=>{
 const r=make();assert.equal(r.triage.code,"no-hides-recorded");
 assert.match(r.triage.next,/If a marked Ad remains visible/);
 assert.equal(JSON.stringify(r).includes("facebook.com/private"),false);
});
test("Build 310: disabled, unavailable, picking and never-scanned distinguish causes",()=>{
 assert.equal(make({active:false}).triage.code,"protection-inactive");
 assert.equal(make({adRecognition:false}).triage.code,"recognition-disabled");
 assert.equal(make({adapterLoaded:false}).triage.code,"scanner-unavailable");
 assert.equal(make({picking:true}).triage.code,"picker-active");
 assert.equal(make({},{}).triage.code,"no-scans-recorded");
});
test("Build 310: a hidden counter is evidence of DOM activity not universal success",()=>{
 const r=make({},{scans:1,hidden:2});assert.equal(r.triage.code,"dom-hide-observed");
 assert.match(r.triage.next,/specific Sponsored card/);
});
test("Build 310: GraphQL modification is evidence only, never an ad-removal claim",()=>{
 const r=make({},{scans:1},{ok:true,enabled:true,supported:true,stats:{modified:3}});
 assert.equal(r.triage.code,"graphql-modification-observed");
 assert.equal(make({},{scans:1},{ok:false,stats:{modified:5}}).triage.code,"no-hides-recorded");
 assert.equal(make({},{scans:1},{ok:true,enabled:false,supported:true,stats:{modified:5}}).triage.code,"no-hides-recorded");
});
test("Build 310: malformed evidence does not generate optimistic status",()=>{
 assert.equal(R.triage(null).code,"invalid-evidence");
 assert.equal(R.triage({kind:"dk-facebook-aggregate-diagnostics",schema:1}).code,"invalid-evidence");
 const m=require("../src/manifest.json");assert.equal(m.version,require("../package.json").version);
});