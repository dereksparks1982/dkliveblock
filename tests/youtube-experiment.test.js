"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict");
const X=require("../src/youtube-experiment.js");
test("Build 168 modes independently select response and page-world rewriting",()=>{
 assert.deepEqual({...X.policy("combined")},{response:true,bridge:true,observe:false});
 assert.deepEqual({...X.policy("response-only")},{response:true,bridge:false,observe:false});
 assert.deepEqual({...X.policy("bridge-only")},{response:false,bridge:true,observe:false});
 assert.deepEqual({...X.policy("observe")},{response:false,bridge:false,observe:true});
 assert.deepEqual({...X.policy("combined",false)},{response:false,bridge:false,observe:false});
});
test("Build 168 modes are tab-host-scoped and expire without storage",()=>{
 const m=new Map();
 assert.equal(X.set(m,12,"www.youtube.com","bridge-only",1000),true);
 assert.equal(X.get(m,12,"www.youtube.com",2000),"bridge-only");
 assert.equal(X.get(m,12,"www.youtube.com",1000+X.TTL),"combined");
 assert.equal(m.size,0);
 assert.equal(X.set(m,12,"www.youtube.com","observe",4000),true);
 assert.equal(X.get(m,12,"music.youtube.com",4001),"combined");
 assert.equal(X.set(m,1,"youtube.com.attacker.test","observe"),false);
 assert.equal(X.set(m,1,"youtube.com","unexpected"),false);
});
test("Build 168 mode storage is bounded, resettable and does not store URLs",()=>{
 const m=new Map();
 for(let i=0;i<X.MAX_TABS+3;i++)assert.equal(X.set(m,i,"youtube.com","observe",1000),true);
 assert.equal(m.size,X.MAX_TABS);
 assert.equal(X.get(m,0,"youtube.com",1001),"combined");
 assert.equal(X.set(m,X.MAX_TABS,"youtube.com","combined",1002),true);
 assert.equal(X.get(m,X.MAX_TABS,"youtube.com",1003),"combined");
 assert.equal(JSON.stringify([...m.values()]).includes("https:"),false);
});
