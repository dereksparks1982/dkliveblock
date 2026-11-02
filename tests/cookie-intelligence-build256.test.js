"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict");
const C=require("../src/cookie-intelligence.js");
test("Build 256 never records cookie values or guesses ownership",()=>{
 const row=C.cookieMetadata({domain:".ads.example.com",name:"session",value:"SECRET",secure:true,
  httpOnly:true,sameSite:"lax",source:"http-response",path:"/",expirationDate:12345});
 assert.equal(row.domain,"ads.example.com");
 assert.equal(row.owner,"unverified");assert.equal(row.purpose,"unknown");
 assert.equal(row.value,undefined);assert.equal(JSON.stringify(row).includes("SECRET"),false);
 assert.equal(Object.isFrozen(row),true);
});
test("Build 256 explicit cookie decisions match site+domain+name only",()=>{
 const model=C.create();
 assert.equal(model.decide({site:"facebook.com",domain:"ads.example.com",name:"abc",action:"block"}),true);
 assert.equal(model.choice("facebook.com","ads.example.com","abc"),"block");
 assert.equal(model.choice("instagram.com","ads.example.com","abc"),null);
 assert.equal(model.choice("facebook.com","ads.example.com","different"),null);
 assert.equal(model.decide({site:"facebook.com",domain:"ads.example.com",name:"a=b",action:"block"}),false);
 assert.equal(model.decide({site:"facebook.com",domain:"ads.example.com",name:"abc",action:"allow"}),true);
 assert.equal(model.choice("facebook.com","ads.example.com","abc"),"allow");
 assert.equal(model.revoke("facebook.com","ads.example.com","abc"),true);
 assert.equal(model.choice("facebook.com","ads.example.com","abc"),null);
});
test("Build 256 observations and decisions are separate and clearable",()=>{
 const m=C.create();
 m.observe({domain:"facebook.com",name:"c_user",value:"DO-NOT-STORE",source:"existing-cookie"});
 m.decide({site:"facebook.com",domain:"facebook.com",name:"c_user",action:"allow"});
 m.clearObservations();
 assert.equal(m.listObservations().length,0);
 assert.equal(m.listDecisions().length,1);
 m.clearDecisions();assert.equal(m.listDecisions().length,0);
});
