"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict");
const B=require("../src/block-details.js");
test("known service operators are hints, not legal ownership or a malware claim",()=>{
 const known=B.summary("securepubads.g.doubleclick.net","script","rutube.ru","filter");
 assert.equal(known.operator,"Google LLC");
 assert.match(known.operatorEvidence,/not proof/);
 assert.match(known.why,/network filtering rule/);
 assert.equal(known.thirdParty,true);
 assert.equal(B.summary("cdn.unknown.example","media","rutube.ru","engine").operator,"Unverified");
});
test("details never construct links for untrusted or malformed hosts",()=>{
 assert.deepEqual(B.researchLinks("bad.example/path?token=secret"),[]);
 assert.deepEqual(B.researchLinks("https://bad.example"),[]);
 const links=B.researchLinks("ads.example");
 assert.equal(links.length,4);
 assert.ok(links.every(x=>x.url.startsWith("https://")&&!x.url.includes("?token")));
});

test("registration links target the registrable domain while evidence links target observed host",()=>{
 const links=B.researchLinks("securepubads.g.doubleclick.net","doubleclick.net");
 assert.equal(links[0].url,"https://rdap.org/domain/doubleclick.net");
 assert.match(links[2].url,/securepubads\.g\.doubleclick\.net/);
});
