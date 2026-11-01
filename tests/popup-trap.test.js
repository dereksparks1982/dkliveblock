"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict");
const Trap=require("../src/popup-trap.js");
test("The Pirate Bay and 1337x domains and subdomains activate strict mode",()=>{
 for(const host of ["thepiratebay.org","www.thepiratebay.org","thepiratebay10.org",
  "1337x.to","www.1337x.st","1337xx.to","1337x.is","1337x.tw"])
  assert.equal(Trap.protectedHost(host),true,host);
 for(const host of ["youtube.com","github.com","not1337x.to","1337x.to.example.org",
  "thepiratebay.org.scam.example","evilthepiratebay.org","",null])
  assert.equal(Trap.protectedHost(host),false,String(host));
});
test("one-time permit expires, is consumed once, and can be revoked",()=>{
 const permits=new Map();
 assert.equal(Trap.grantOnce(permits,5,100),true);
 assert.equal(Trap.consumeOnce(permits,5,101),true);
 assert.equal(Trap.consumeOnce(permits,5,102),false);
 Trap.grantOnce(permits,5,200);
 assert.equal(Trap.consumeOnce(permits,5,200+Trap.GRACE_MS+1),false);
 Trap.grantOnce(permits,5,500);Trap.revoke(permits,5);
 assert.equal(Trap.consumeOnce(permits,5,501),false);
});
test("same popup tab cannot be counted twice across tab and navigation events",()=>{
 const claims=new Map();
 assert.equal(Trap.claim(claims,13,5,100),true);
 assert.equal(Trap.claim(claims,13,5,200),false);
 assert.equal(Trap.claim(claims,13,5,100+Trap.CLAIM_MS+1),true);
 assert.equal(Trap.claim(claims,5,5,100),false);
});
test("global disable or paused site never enables strict trap",()=>{
 assert.equal(Trap.shouldBlock("1337x.to",true,true),true);
 assert.equal(Trap.shouldBlock("1337x.to",false,true),false);
 assert.equal(Trap.shouldBlock("1337x.to",true,false),false);
 assert.equal(Trap.shouldBlock("example.org",true,true),false);
});

test("Build 114 rollback or invalid claim timestamps are not treated as active",()=>{
 const claims=new Map([[21,{sourceTabId:1,when:1000}],
  [22,{sourceTabId:1,when:NaN}]]);
 assert.equal(Trap.claim(claims,23,1,900),true);
 assert.equal(claims.has(21),false);
 assert.equal(claims.has(22),false);
});

test("Build 201 one-tab permits reject invalid timestamps and clock rollback",()=>{
 const permits=new Map(),claims=new Map();
 for(const time of [NaN,Infinity,-1,Number.MAX_SAFE_INTEGER]){
  assert.equal(Trap.grantOnce(permits,1,time),false);
  assert.equal(Trap.claim(claims,2,1,time),false);
 }
 assert.equal(Trap.grantOnce(permits,1,1000),true);
 assert.equal(Trap.consumeOnce(permits,1,999),false);
 assert.equal(Trap.grantOnce(permits,1,1000),true);
 assert.equal(Trap.consumeOnce(permits,1,1001),true);
 assert.equal(Trap.claim(claims,2,1,1000),true);
});

test("Build 212 claimed popup navigation fails closed on invalid clocks and stale claims",()=>{
 const claims=new Map();
 assert.equal(Trap.claim(claims,40,1,1000),true);
 assert.equal(Trap.claimActive(claims,40,1000),true);
 assert.equal(Trap.claimActive(claims,40,1000+Trap.CLAIM_MS),true);
 assert.equal(Trap.claimActive(claims,40,1000+Trap.CLAIM_MS+1),false);
 assert.equal(claims.has(40),false);
 Trap.claim(claims,41,1,2000);
 assert.equal(Trap.claimActive(claims,41,1999),false,
  "clock rollback must not preserve an active navigation cancellation");
 assert.equal(claims.has(41),false);
 for(const bad of [NaN,-1,Infinity])
  assert.equal(Trap.claimActive(new Map([[50,{sourceTabId:1,when:1000}]]),50,bad),false);
 assert.equal(Trap.claimActive(new Map([[51,{sourceTabId:51,when:1000}]]),51,1001),false);
});
test("Build 212 one-time approved tabs reject rollback, expiry and malformed records",()=>{
 const approved=new Map();
 assert.equal(Trap.allowTab(approved,45,1000),true);
 assert.equal(Trap.tabAllowed(approved,45,1000),true);
 assert.equal(Trap.tabAllowed(approved,45,1000+Trap.CLAIM_MS),true);
 assert.equal(Trap.tabAllowed(approved,45,1000+Trap.CLAIM_MS+1),false);
 assert.equal(approved.has(45),false);
 Trap.allowTab(approved,46,2000);
 assert.equal(Trap.tabAllowed(approved,46,1999),false);
 assert.equal(approved.has(46),false);
 assert.equal(Trap.allowTab(approved,47,Number.MAX_SAFE_INTEGER),false);
 approved.set(48,{since:1000,until:Infinity});
 assert.equal(Trap.tabAllowed(approved,48,1001),false);
 approved.set(49,{since:1000,until:2000});
 assert.equal(Trap.tabAllowed(approved,49,1001),false);
});
test("Build 212 permit status matches real one-time consumption window",()=>{
 const permits=new Map();
 assert.equal(Trap.grantOnce(permits,9,1000),true);
 assert.equal(Trap.permitActive(permits,9,1000),true);
 assert.equal(Trap.permitActive(permits,9,1000+Trap.GRACE_MS),true);
 assert.equal(Trap.permitActive(permits,9,1000+Trap.GRACE_MS+1),false);
 assert.equal(Trap.grantOnce(permits,9,2000),true);
 assert.equal(Trap.permitActive(permits,9,1999),false);
 assert.equal(Trap.consumeOnce(permits,9,2000),false,
  "invalidated permit cannot be resurrected");
});
