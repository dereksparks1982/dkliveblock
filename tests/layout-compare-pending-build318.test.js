"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict");
const Scout=require("../src/nesty-layout-scout.js");
const base=(pending=false)=>({supportedPage:true,inspectionUnavailable:false,cleanupPending:pending,
 scannedLists:1,eligibleLists:1,videoTiles:2,emptyAdSlots:0,mixedLists:0,
 shortLists:0,oversizedLists:0,appliedLists:0,appliedSlots:0,scans:1,
 geometry:{sampledTiles:2,sameRowPairs:1,widePairs:1,largestWideGapPx:360}});
function create(){return Scout.create({location:{hostname:"www.pornhub.com"}},
 {byKey:()=>({id:"nesty_layout_scout",title:"Nesty Layout Scout"})})}
test("Build 318: clean identical page permits a read-only comparison",()=>{
 const s=create(),r=s.compare(base(),base());assert.equal(r.comparable,true);
 assert.equal(r.outcome,"no-measured-change");assert.equal(r.executable,false);
});
test("Build 318: pending cleanup before comparison never reports a spacing victory",()=>{
 const r=create().compare(base(true),{...base(),geometry:{...base().geometry,widePairs:0,largestWideGapPx:0}});
 assert.equal(r,null);
});
test("Build 318: pending cleanup after comparison also rejects result",()=>{
 assert.equal(create().compare(base(),base(true)),null);
});
test("Build 318: type-confused booleans cannot forge a clean layout",()=>{
 for(const value of ["false",1,null,[],{}])assert.equal(Scout.normalize({...base(),cleanupPending:value}),null);
 assert.equal(Scout.normalize(base(false)).cleanupPending,false);
});
test("Build 318: reset and review only, no automatic rules or permissions",()=>{
 const s=create(),r=s.review(base(true),{active:true,enabled:true});
 assert.equal(r.finding,"layout-cleanup-pending");assert.equal(r.automaticRules,false);
 assert.equal(require("../src/manifest.json").version,require("../package.json").version);
});