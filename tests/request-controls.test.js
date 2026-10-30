"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict");
const P=require("../src/request-controls.js"),I=require("../src/access-inspector.js");
test("host and resource-type allowance is exact, site-scoped and revocable",()=>{
 const s=P.make();
 assert.equal(P.grant(s,2,"news.example","cdn.example","media","temporary",1000).ok,true);
 assert.equal(P.matches(s,2,"news.example","cdn.example","media",1500),true);
 assert.equal(P.matches(s,3,"news.example","cdn.example","media",1500),false);
 assert.equal(P.matches(s,2,"news.example","cdn.example","script",1500),false);
 assert.equal(P.matches(s,2,"other.example","cdn.example","media",1500),false);
 assert.equal(P.matches(s,2,"news.example","cdn.example","media",601001),false);
 assert.equal(P.grant(s,2,"news.example","cdn.example","media","session").ok,true);
 assert.equal(P.matches(s,3,"news.example","cdn.example","media"),true);
 assert.equal(P.revoke(s,2,"news.example","cdn.example","media","session"),true);
 assert.equal(P.matches(s,3,"news.example","cdn.example","media"),false);
});
test("no blanket hosts, navigation, popup or injected-rule exceptions",()=>{
 const s=P.make();
 for(const dest of ["*.example.com","evil.com^$important","bad..org","localhost","UPPER.ORG"])
  assert.ok(P.grant(s,3,"site.example",dest,"script","remember").error);
 for(const kind of ["main_frame","popup","document","websocket^"])
  assert.ok(P.grant(s,3,"site.example","ads.example",kind,"remember").error);
 assert.ok(P.grant(s,-1,"site.example","ads.example","image","temporary").error);
});
test("remembered allow rules survive restoration, with strict validation",()=>{
 const s=P.make();P.grant(s,1,"site.example","ads.example","image","remember");
 const restored=P.restore([...s.remember,
  {site:"bad..com",host:"ads.example",type:"script",scope:"remember"},
  {site:"site.example",host:"bad.example",type:"popup",scope:"remember"}]);
 assert.deepEqual(restored,[{site:"site.example",host:"ads.example",type:"image",scope:"remember"}]);
 const next=P.make();next.remember=restored;
 assert.equal(P.matches(next,10,"site.example","ads.example","image"),true);
 assert.equal(P.matches(next,10,"site.example","ads.example","script"),false);
});
test("activity inspector distinguishes observations and guesses",()=>{
 const ad=I.describe("ads.example.net","script","news.example");
 assert.equal(ad.observed,"JavaScript code");
 assert.equal(ad.certainty,"likely");
 assert.equal(ad.thirdParty,true);
 const ordinary=I.describe("files.news.example","script","news.example");
 assert.equal(ordinary.certainty,"unknown");
 assert.match(ordinary.access,/not evidence of filesystem/);
});
