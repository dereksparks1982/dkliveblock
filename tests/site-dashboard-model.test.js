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
 assert.deepEqual(rows,[{host:"doubleclick.net",type:"image",when:100,sequence:0,registeredDomain:"doubleclick.net",ruleType:"engine"}]);
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

test("Build 62 retained host-only records show all nine blocks and cap at 250",()=>{
 const rows=Array.from({length:9},(_,index)=>({host:"ads.example",type:"script",when:index+1}));
 const full=M.requestRows({requestLog:true,recentBlocks:rows});
 assert.equal(full.length,9);
 assert.equal(full[8].when,9);
 assert.equal(M.requestRows({requestLog:true,recentBlocks:Array.from({length:300},(_,index)=>({host:"ad.example",type:"image",when:index+1}))}).length,250);
 assert.equal(M.requestRows({requestLog:false,recentBlocks:rows}).length,0);
});

test("Detailed blocked records remain hostname-only with bounded safe fields",()=>{
 const item=M.requestRows({requestLog:true,recentBlocks:[{host:"ads.example",type:"script",when:123,sequence:9,ruleType:"filter",url:"https://ads.example/path?token=secret"}]});
 assert.deepEqual(item,[{host:"ads.example",type:"script",when:123,sequence:9,registeredDomain:"ads.example",ruleType:"filter"}]);
 assert.equal(JSON.stringify(item).includes("secret"),false);
});

test("permitted groups are bounded and saved manual switches remain visible when logging off",()=>{
 const normal={requestLog:true,allowedGroups:[
  {host:"avatars.githubusercontent.com",type:"image",count:8,last:100},
  {host:"unsafe.example/token=SECRET",type:"script",count:1,last:101}],
  selectiveBlocks:[{host:"avatars.githubusercontent.com",type:"image"},
   {host:"api.github.com",type:"xmlhttprequest"}]};
 const rows=M.permittedRows(normal);
 assert.equal(rows.length,2);
 assert.equal(rows[0].count,8);
 assert.equal(rows[0].block,true);
 assert.equal(rows[1].observed,false);
 assert.equal(rows[1].block,true);
 assert.deepEqual(M.permittedRows({...normal,requestLog:false}).map(x=>x.host),
  ["avatars.githubusercontent.com","api.github.com"]);
});
