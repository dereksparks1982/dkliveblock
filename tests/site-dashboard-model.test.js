"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict");
const M=require("../src/site-dashboard-model.js");
test("Build 59 clearly distinguishes global, site, tab and active protection",()=>{
 const d={ok:true,globalEnabled:true,sitePaused:false,temporarilyPaused:false,siteActive:true};
 assert.equal(M.status(d).label,"Blocking active");
 assert.equal(M.status({...d,temporarilyPaused:true}).label,"Tab temporarily paused");
 assert.equal(M.status({...d,sitePaused:true}).label,"Website allowlisted");
 assert.equal(M.status({...d,globalEnabled:false}).label,"Protection disabled globally");
});
test("Build 59 only displays bounded host-only blocked requests",()=>{
 const rows=M.requestRows({requestLog:true,recentBlocks:[
  {host:"doubleclick.net",type:"image",when:100},
  {host:"evil.test/path?token=SECRET",type:"script",when:101},
  {host:"site.test",type:"not-a-resource",when:102}
 ]});
 assert.deepEqual(rows,[{host:"doubleclick.net",type:"image",when:100}]);
 assert.deepEqual(M.requestRows({requestLog:false,recentBlocks:rows}),[]);
});
test("Build 59 only displays valid scoped allowances and sanitized history",()=>{
 const d={requestLog:true,popupHistory:[{destinationHost:"ads.example",reason:"strict",when:100},
  {destinationHost:"https://evil.example/path?secret=1",reason:"filter",when:101}],
  customAllowances:["ads.test","bad.test/path","ads.test"],
  requestAllowances:[{host:"cdn.example",type:"image",scope:"temporary",expires:300},
   {host:"http://bad.example/path",type:"script",scope:"remember"},
   {host:"cdn.example",type:"main_frame",scope:"session"}]};
 assert.deepEqual(M.customHosts(d),["ads.test","ads.test"]);
 assert.deepEqual(M.allowances(d),[{host:"cdn.example",type:"image",scope:"temporary",expires:300}]);
 const pop=M.popupRows(d);
 assert.equal(pop[0].host,"ads.example");
 assert.equal(pop[1].host,"Destination unknown");
 assert.equal(JSON.stringify(pop).includes("secret"),false);
});
test("Build 59 badges never display NaN, negative or absurd counters",()=>{
 assert.equal(M.number(-1),0);
 assert.equal(M.number(NaN),0);
 assert.equal(M.number(Infinity),0);
 assert.equal(M.number(1e20),9999999);
});
