"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict");
const Lab=require("../src/youtube-lab.js");
const report=(host,mode)=>({
 format:Lab.FORMAT,schemaVersion:1,website:host,experimentMode:mode,
 protectionEnabled:true,siteAllowlisted:false,temporaryPause:false,requestLogEnabled:true,
 filterBackend:"hybrid",blockedCount:0,responseFiltering:{enabled:true,supported:true},playback:[{kind:"ad-showing"}]
});
test("Build 313: private full hostname projects to fixed site family only",()=>{
 const r=Lab.parse(JSON.stringify(report("m.youtube.com","observe")));
 assert.equal(r.siteFamily,"youtube");
 assert.equal(JSON.stringify(r).includes("m.youtube.com"),false);
 assert.equal(Lab.siteFamily("www.youtube-nocookie.com"),"embedded");
 assert.equal(Lab.siteFamily("youtu.be"),"short-link");
});
test("Build 313: mixing embedded player with normal watch-page report is warned",()=>{
 const a=Lab.parse(JSON.stringify(report("www.youtube.com","observe")));
 const b=Lab.parse(JSON.stringify(report("youtube-nocookie.com","combined")));
 const c=Lab.compare(a,b);
 assert.equal(c.comparable,false);
 assert.ok(c.warnings.some(w=>w.includes("site families differ")));
 assert.equal(c.verifiedAdFree,false);
});
test("Build 313: normal subdomains share same coarse class",()=>{
 const a=Lab.parse(JSON.stringify(report("www.youtube.com","observe")));
 const b=Lab.parse(JSON.stringify(report("m.youtube.com","combined")));
 assert.ok(!Lab.compare(a,b).warnings.some(w=>w.includes("site families")));
});
test("Build 313: malicious hostnames remain rejected",()=>{
 for(const host of ["youtube.com.attacker.test","https://youtube.com/watch?v=PRIVATE","youtu.be.attacker","YT.YOUTUBE.COM"])
  assert.throws(()=>Lab.parse(JSON.stringify(report(host,"observe"))));
 assert.equal(Lab.siteFamily("youtube.com.attacker.test"),"unknown");
});
test("Build 313: enum contains no URLs or account data",()=>{
 const r=Lab.parse(JSON.stringify({...report("music.youtube.com","observe"),
   secret:"https://youtube.com/watch?v=PRIVATE_ID",tabId:744,password:"SECRET"}));
 for(const x of ["PRIVATE_ID","SECRET","music.youtube.com","744"])assert.ok(!JSON.stringify(r).includes(x));
 assert.equal(require("../src/manifest.json").version,require("../package.json").version);
});