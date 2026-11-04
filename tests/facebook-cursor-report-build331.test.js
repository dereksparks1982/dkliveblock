"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict");
const Report=require("../src/facebook-diagnostic-report.js");
const base={ok:true,active:true,adRecognition:true,picking:false,adapterLoaded:true,lastScanAt:1730000000000};
test("Build 331: all three bounded scan cursors survive safe export",()=>{
 const r=Report.build({...base,detector:{articleCursor:240,bylineCursor:2399,referenceCursor:1199,scans:5}},null);
 assert.equal(r.detector.articleCursor,240);assert.equal(r.detector.bylineCursor,2399);
 assert.equal(r.detector.referenceCursor,1199);assert.equal(r.detector.scans,5);
 assert.equal(r.schema,2);assert.equal(r.graphql.available,false);
});
test("Build 331: malformed or oversized counters are discarded",()=>{
 const r=Report.build({...base,detector:{articleCursor:-1,bylineCursor:"12",referenceCursor:1000001,scans:1}},null);
 for(const key of ["articleCursor","bylineCursor","referenceCursor"])assert.equal(r.detector[key],undefined);
});
test("Build 331: page text, identity and URLs cannot leak through report",()=>{
 const r=Report.build({...base,detector:{articleCursor:8,rawUrl:"https://facebook.com/secret?token=123",postText:"Private conversation",authorId:"secret",nested:{cookie:"secret"}}},null);
 const json=JSON.stringify(r);
 for(const value of ["Private conversation","rawUrl","secret","postText","authorId","token"])assert.ok(!json.includes(value),value);
 assert.equal(r.detector.articleCursor,8);
});
test("Build 331: new cursors cannot assert that advertisements were removed",()=>{
 const r=Report.build({...base,detector:{articleCursor:200,bylineCursor:100,referenceCursor:300,scans:5,hidden:0}},null);
 assert.equal(r.triage.code,"no-hides-recorded");
 assert.equal(r.triage.next.includes("save this report"),true);
});
test("Build 331: report scope stays local and source versions agree",()=>{
 const m=require("../src/manifest.json"),p=require("../package.json");
 assert.equal(m.version,p.version);assert.equal(p.version,"0.3.301");
 for(const s of m.background.scripts)assert.notEqual(s,"facebook-diagnostic-report.js");
});
