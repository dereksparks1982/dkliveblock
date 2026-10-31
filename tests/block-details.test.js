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
