"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict");
const P=require("../src/provider-intelligence.js");
test("Build 247 aggregates allowed/blocked requests without raw URL details",()=>{
 const db=P.create();
 db.observe({host:"ads.example",type:"unknown",evidence:["request_allowed"]});
 db.observe({host:"ads.example",type:"unknown",evidence:["request_blocked"]});
 const row=db.lookup("ads.example");
 assert.equal(row.allowed,1);assert.equal(row.blocked,1);
 assert.equal(row.confidence,"unverified");
 assert.equal(JSON.stringify(row).includes("https:"),false);
 db.clear();assert.equal(db.lookup("ads.example"),null);
});
test("Build 247 caps independent destination entries to 100",()=>{
 const db=P.create();
 for(let i=0;i<105;i++)db.observe({host:"host"+i+".example",type:"unknown",
  evidence:["request_allowed"]});
 assert.equal(db.list().length,100);
 assert.equal(db.lookup("host0.example"),null);
});
