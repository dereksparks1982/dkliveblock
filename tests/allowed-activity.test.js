"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict");
const A=require("../src/allowed-activity.js");
test("permitted subresources counted and grouped, with only hostname/type saved",()=>{
 const table=new Map(),site="github.com";
 assert.equal(A.observe(table,4,site,"https://cdn.github.com/images/private.png?token=SECRET","image",100),true);
 assert.equal(A.observe(table,4,site,"https://cdn.github.com/images/another.png?token=PRIVATE","image",200),true);
 assert.equal(A.observe(table,4,site,"https://github.com/login","main_frame",300),false);
 assert.equal(A.observe(table,4,site,"moz-extension://uuid/hidden","image",300),false);
 assert.equal(A.observe(table,4,site,"https://cdn.github.com/secret","script",400),true);
 const snapshot=A.snapshot(table,4,site);
 assert.equal(snapshot.total,3);
 assert.equal(snapshot.groups.length,2);
 assert.equal(snapshot.groups.find(x=>x.type==="image").count,2);
 assert.equal(snapshot.groups.find(x=>x.type==="script").count,1);
 assert.doesNotMatch(JSON.stringify(snapshot),/PRIVATE|SECRET|private\.png|\/login|hidden|another\.png/);
 assert.equal(A.snapshot(table,4,"other.test").total,0);
 A.clear(table,4);assert.equal(A.snapshot(table,4,site).total,0);
});
test("allowlisted site supports exact host/type toggle, lasting after page reload",()=>{
 let blocks=[];
 const first=A.toggle(blocks,"github.com","avatars.githubusercontent.com","image",true);
 assert.equal(first.ok,true);blocks=first.rows;
 assert.equal(A.matches(blocks,"github.com","avatars.githubusercontent.com","image"),true);
 assert.equal(A.matches(blocks,"github.com","avatars.githubusercontent.com","script"),false);
 assert.equal(A.matches(blocks,"gitlab.com","avatars.githubusercontent.com","image"),false);
 assert.equal(A.matches(blocks,"github.com","avatars.githubusercontent.com","main_frame"),false);
 blocks=A.restore(JSON.parse(JSON.stringify(blocks)));
 assert.equal(blocks.length,1);
 const undone=A.toggle(blocks,"github.com","avatars.githubusercontent.com","image",false);
 assert.equal(undone.ok,true);
 assert.equal(A.matches(undone.rows,"github.com","avatars.githubusercontent.com","image"),false);
});
test("invalid destinations, unsafe types and malformed persisted records are rejected",()=>{
 for(const host of ["evil.test/private","https://evil.test","double..click.net","localhost"]){
  assert.equal(A.toggle([], "github.com",host,"script",true).error!==undefined,true,host);
 }
 assert.equal(A.toggle([],"github.com","cdn.github.com","main_frame",true).error!==undefined,true);
 assert.deepEqual(A.restore([
  {site:"github.com",host:"cdn.github.com",type:"image",path:"PRIVATE"},
  {site:"bad/test",host:"cdn.github.com",type:"image"},
  {site:"github.com",host:"cdn.github.com",type:"image"}
 ]),[{site:"github.com",host:"cdn.github.com",type:"image"}]);
});

test("Build 220 captures why individual requests were allowed without preserving sensitive URL content",()=>{
 const table=new Map(),site="chatgpt.com";
 const raw="https://t0.gstatic.com/image/PRIVATE_PATH?token=SECRET_TOKEN";
 assert.equal(A.observe(table,7,site,raw,"image",1000,
  {reason:"site-allowlisted",method:"GET",statusCode:200,headers:{cookie:"SECRET_COOKIE"}}),true);
 assert.equal(A.observe(table,7,site,raw,"image",1001,
  {reason:"filter-engine-permitted",method:"POST",statusCode:204}),true);
 const result=A.snapshot(table,7,site);
 assert.equal(result.total,2);
 assert.equal(result.events.length,2);
 assert.equal(result.events[0].reason,"filter-engine-permitted");
 assert.equal(result.events[0].method,"POST");
 assert.equal(result.events[0].httpStatus,204);
 assert.equal(result.groups[0].reasons["site-allowlisted"],1);
 assert.equal(result.groups[0].reasons["filter-engine-permitted"],1);
 assert.equal(result.groups[0].methods.GET,1);
 assert.equal(result.groups[0].httpStatuses["200"],1);
 for(const secret of ["PRIVATE_PATH","SECRET_TOKEN","SECRET_COOKIE"])
  assert.doesNotMatch(JSON.stringify(result),new RegExp(secret));
 assert.equal(A.snapshot(table,7,"different.example").events.length,0);
});
test("Build 220 whitelists decision/method/status and strictly caps per-request evidence",()=>{
 const table=new Map();
 assert.equal(A.observe(table,2,"example.com","https://cdn.example.com/p?key=PRIVATE","script",100,{
  reason:"user-supplied-sentence",method:"BAD METHOD SECRET",statusCode:999,body:"SECRET"
 }),true);
 const first=A.snapshot(table,2,"example.com").events[0];
 assert.equal(first.reason,"decision-not-recorded");
 assert.equal(first.method,"Unknown");
 assert.equal(first.httpStatus,null);
 for(let i=0;i<A.MAX_EVENTS+10;i++)A.observe(table,2,"example.com",
  "https://cdn.example.com/a?token=PRIVATE","script",101+i,
  {reason:"manual-exception",method:"GET",statusCode:200});
 const current=A.snapshot(table,2,"example.com");
 assert.equal(current.total,A.MAX_EVENTS+11);
 assert.equal(current.events.length,A.MAX_EVENTS);
 assert.equal(current.groups[0].count,A.MAX_EVENTS+11);
 assert.equal(current.events[0].sequence,A.MAX_EVENTS+11);
 assert.doesNotMatch(JSON.stringify(current),/PRIVATE|SECRET/);
 A.clear(table,2);
 assert.equal(A.snapshot(table,2,"example.com").events.length,0);
});
