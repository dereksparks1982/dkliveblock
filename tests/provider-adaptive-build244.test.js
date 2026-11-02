"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict");
const P=require("../src/provider-intelligence.js"),A=require("../src/adaptive-dispatcher.js");
test("provider records require explicit evidence and never auto-block",()=>{
 const db=P.create();
 assert.equal(db.observe({host:"not a host",type:"ad"}),null);
 const row=db.observe({host:"ads.example.com",type:"ad",evidence:["ad_slot","attribution"]});
 assert.equal(row.confidence,"corroborated");
 assert.equal(db.lookup("ads.example.com").type,"ad");
 assert.equal(db.list().length,1);db.clear();assert.equal(db.list().length,0);
});
test("dispatcher isolates exceptions and never executes a blocking action",()=>{
 const d=A.create();
 assert.equal(d.register("broken",()=>{throw Error("ignored");}),true);
 assert.equal(d.register("evidence",()=>({matched:true,evidence:["ad_slot","sponsor_label"]})),true);
 assert.equal(d.register("weak",()=>({matched:true,evidence:["one"]})),true);
 assert.deepEqual(d.inspect({}).map(x=>x.id),["evidence"]);
 assert.equal(d.inspect({})[0].action,"review");
});
