"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict");
const M=require("../src/company-modules.js"),F=require("../src/facebook-ads.js");
test("Build 243 company routing distinguishes verified platform domains",()=>{
 for(const [host,company,platform] of [
  ["www.facebook.com","meta","facebook"],["m.instagram.com","meta","instagram"],
  ["www.threads.net","meta","threads"],["web.whatsapp.com","meta","whatsapp"],
  ["www.youtube.com","youtube","youtube"],["r3---sn.googlevideo.com","youtube","youtube"]
 ]){
  assert.equal(M.companyFor(host),company);
  assert.equal(M.platformFor(host),platform);
 }
});
test("Build 243 no suffix confusion or accidental Meta cross-platform hiding",()=>{
 for(const host of ["facebook.com.evil.example","notfacebook.com","myyoutube.com",
  "instagram.com.bad.tld","", "https://facebook.com/"])
  assert.equal(M.companyFor(host),null);
 assert.equal(F.isFacebook("facebook.com"),true);
 assert.equal(F.isFacebook("www.facebook.com"),true);
 assert.equal(F.isFacebook("instagram.com"),false);
 assert.equal(F.isFacebook("threads.net"),false);
});
test("Build 243 immutable profiles carry no user data and disclose only detection inventory",()=>{
 assert.equal(Object.isFrozen(M.profiles.meta),true);
 assert.deepEqual([...M.profiles.meta.platforms],["facebook","instagram","threads","whatsapp"]);
 assert.equal(M.profileFor("example.net"),null);
});
