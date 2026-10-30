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
