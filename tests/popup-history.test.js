"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict");
const P=require("../src/popup-history.js");
test("strict blank-first popunder history can be enriched without storing full URLs",()=>{
 const store=new Map();
 assert.equal(P.add(store,5,"1337x.to",20,"about:blank","strict",1000),true);
 assert.equal(P.getRecent(store,5,"1337x.to",1100)[0].destinationHost,"");
 assert.equal(P.enrich(store,5,20,"https://scam.example/click?token=PRIVATE",1200),true);
 const records=P.getRecent(store,5,"1337x.to",1300);
 assert.equal(records[0].destinationHost,"scam.example");
 assert.equal(records[0].reason,"strict");
 assert.doesNotMatch(JSON.stringify(records),/PRIVATE|\/click|token|newTabId/);
 assert.equal(P.add(store,5,"1337x.to",20,"https://another.example/","strict",1400),false);
});
test("history stays tab-scoped, expires and discards oldest rows",()=>{
 const store=new Map();
 P.add(store,1,"site.test",10,"https://ads.example/x","filter",100);
 assert.equal(P.getRecent(store,2,"site.test",150).length,0);
 assert.equal(P.getRecent(store,1,"other.test",150).length,0);
 for(let i=0;i<P.MAX+4;i++)P.add(store,1,"site.test",100+i,"https://ads.example/a","filter",200+i);
 assert.equal(P.getRecent(store,1,"site.test",1000).length,P.MAX);
 assert.equal(P.getRecent(store,1,"site.test",P.TTL+2000).length,0);
});
test("wrong kinds and non-network URLs are rejected or masked",()=>{
 const store=new Map();
 assert.equal(P.add(store,3,"a.test",1,"javascript:alert(1)","filter"),true);
 assert.equal(P.getRecent(store,3,"a.test")[0].destinationHost,"");
 assert.equal(P.add(store,3,"a.test",2,"https://site.test/","unverified"),false);
 assert.equal(P.add(store,-1,"a.test",1,"https://site.test/","strict"),false);
 P.clear(store,3);assert.equal(P.getRecent(store,3,"a.test").length,0);
});
