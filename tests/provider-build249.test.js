"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict");
const P=require("../src/provider-intelligence.js");
test("Build 249 rejects malformed/suffix-spoofed provider hostnames",()=>{
 const db=P.create();
 for(const host of ["-ads.example","ads-.example","ads..example","x".repeat(64)+".com",
  "ads.123","ads.example/path","ads.example:443","ads_example.com"])
  assert.equal(db.observe({host,type:"unknown",evidence:["request_allowed"]}),null,host);
 assert.ok(db.observe({host:"Ads.Example",type:"unknown",evidence:["request_allowed"]}));
 assert.equal(db.lookup("ads.example").allowed,1);
});
test("Build 249 retains evidence and request counters across repeated observations",()=>{
 const db=P.create();
 db.observe({host:"ads.example",type:"unknown",evidence:["request_allowed"]});
 db.observe({host:"ads.example",type:"unknown",evidence:["request_blocked"]});
 const row=db.lookup("ads.example");
 assert.deepEqual([...row.evidence],["request_allowed","request_blocked"]);
 assert.equal(row.allowed,1);assert.equal(row.blocked,1);
 assert.equal(row.confidence,"unverified");
 assert.equal(Object.isFrozen(row.evidence),true);
});
