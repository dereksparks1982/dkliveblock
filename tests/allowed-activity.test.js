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
