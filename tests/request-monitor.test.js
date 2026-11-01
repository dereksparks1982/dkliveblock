"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict");
const M=require("../src/request-monitor.js");
test("site scoped capture logs each request with only safe fields",()=>{
 const sessions=new Map();
 assert.equal(M.start(sessions,4,"example.org",100),true);
 assert.equal(M.record(sessions,4,"example.org",{
  requestId:"req1",url:"https://ads.example.net/secret?token=PRIVATE",
  method:"GET",type:"script"},110),true);
 assert.equal(M.record(sessions,4,"example.org",{requestId:"req2",url:"https://cdn.example.org/a.png",
  method:"GET",type:"image"},120),true);
 M.transition(sessions,4,"req1","blocked");
 M.transition(sessions,4,"req2","allowed",{statusCode:200});
 const result=M.snapshot(sessions,4);
 assert.equal(result.seen,2);
 assert.equal(result.counts.blocked,1);
 assert.equal(result.counts.allowed,1);
 assert.equal(result.rows[0].host,"ads.example.net");
 assert.equal(result.rows[1].httpStatus,200);
 assert.doesNotMatch(JSON.stringify(result),/PRIVATE|secret|token|req1|req2/);
});
test("blocked verdict stays blocked when Firefox reports cancellation error",()=>{
 const sessions=new Map();M.start(sessions,2,"site.example");
 M.record(sessions,2,"site.example",{requestId:"x",url:"https://ads.test/a",type:"image"});
 M.transition(sessions,2,"x","blocked");
 assert.equal(M.transition(sessions,2,"x","failed",{error:"NS_ERROR_ABORT"}),false);
 assert.equal(M.snapshot(sessions,2).rows[0].status,"blocked");
});
test("capture is per tab, stops without deleting rows and navigations remove it",()=>{
 const sessions=new Map();M.start(sessions,5,"site.example");
 assert.equal(M.record(sessions,5,"other.example",{requestId:"1",url:"https://cdn.net/a"}),false);
 assert.equal(M.record(sessions,6,"site.example",{requestId:"1",url:"https://cdn.net/a"}),false);
 assert.equal(M.record(sessions,5,"site.example",{requestId:"1",url:"https://cdn.net/a"}),true);
 M.stop(sessions,5);
 assert.equal(M.record(sessions,5,"site.example",{requestId:"2",url:"https://cdn.net/b"}),false);
 assert.equal(M.snapshot(sessions,5).rows.length,1);
 M.clear(sessions,5);assert.equal(M.snapshot(sessions,5).rows.length,0);
 M.remove(sessions,5);assert.equal(M.snapshot(sessions,5).active,false);
});
test("captures are bounded, older records discarded and totals preserved",()=>{
 const sessions=new Map();M.start(sessions,8,"site.example");
 for(let i=0;i<M.MAX+10;i++)M.record(sessions,8,"site.example",{
  requestId:"id"+i,url:"https://cdn.site.example/asset?a="+i,type:"image"},100+i);
 const snapshot=M.snapshot(sessions,8);
 assert.equal(snapshot.seen,M.MAX+10);
 assert.equal(snapshot.dropped,10);
 assert.equal(snapshot.rows.length,M.MAX);
 assert.equal(snapshot.counts.pending,M.MAX+10);
});
test("synthetic popup blocked events included without URL query strings",()=>{
 const s=new Map();M.start(s,7,"news.example");
 assert.ok(M.syntheticBlock(s,7,"news.example","https://popup.example/a?secret=1","popup"));
 const res=M.snapshot(s,7);
 assert.equal(res.counts.blocked,1);
 assert.equal(res.rows[0].reason,"Popup rule");
 assert.doesNotMatch(JSON.stringify(res),/secret/);
});

test("Build 201 captures only valid hosts, times and fixed private-safe reasons",()=>{
 const store=new Map();
 for(const h of ["a..example","-cdn.example","cdn-.example","cdn.example."])
  assert.equal(M.start(store,1,h,1000),false);
 assert.equal(M.start(store,1,"site.example",1000),true);
 const req={requestId:"safe",url:"https://cdn.example/secret?password=PRIVATE",type:"image"};
 assert.equal(M.record(store,1,"site.example",req,NaN),false);
 assert.equal(M.record(store,1,"site.example",req,1100),true);
 assert.equal(M.note(store,1,"safe","https://private.example/watch?token=SECRET"),false);
 assert.equal(M.note(store,1,"safe","User-approved hostname/type exception"),true);
 assert.doesNotMatch(JSON.stringify(M.snapshot(store,1)),/PRIVATE|SECRET|password|watch/);
});

test("Build 213 FIFO eviction requires no linear request-ID map scan",()=>{
 const store=new Map();M.start(store,213,"news.example",1000);
 const state=store.get(213);
 state.byId[Symbol.iterator]=()=>{throw Error("linear map scan forbidden");};
 for(let i=0;i<M.MAX+50;i++)assert.equal(M.record(store,213,"news.example",{
  requestId:"PRIVATE_ID_"+i,url:"https://cdn.example/image"+i,
  method:"GET",type:"image"},1000+i),true);
 const report=M.snapshot(store,213);
 assert.equal(report.seen,M.MAX+50);
 assert.equal(report.rows.length,M.MAX);
 assert.equal(report.dropped,50);
 assert.equal(report.counts.pending,M.MAX+50,
  "lifetime totals still count evicted requests");
 assert.equal(state.byId.has("PRIVATE_ID_0"),false);
 assert.equal(state.byId.has("PRIVATE_ID_50"),true);
 assert.equal(M.transition(store,213,"PRIVATE_ID_0","blocked"),false);
 assert.equal(M.transition(store,213,"PRIVATE_ID_50","allowed",{statusCode:200}),true);
 assert.doesNotMatch(JSON.stringify(report),/PRIVATE_ID_/);
});
test("Build 213 synthetic popup evicts tracked request IDs directly",()=>{
 const store=new Map();M.start(store,214,"site.example",1000);
 M.record(store,214,"site.example",{requestId:"PRIVATE_OLD",
  url:"https://tracking.example/pixel",type:"image"},1001);
 const state=store.get(214);
 state.byId[Symbol.iterator]=()=>{throw Error("linear map scan forbidden");};
 for(let i=0;i<M.MAX;i++)
  assert.equal(M.syntheticBlock(store,214,"site.example",
   "https://popup.example/redirect?secret=PRIVATE", "popup",1010+i),true);
 const result=M.snapshot(store,214);
 assert.equal(result.rows.length,M.MAX);
 assert.equal(result.dropped,1);
 assert.equal(state.byId.has("PRIVATE_OLD"),false);
 assert.equal(M.transition(store,214,"PRIVATE_OLD","allowed"),false);
 assert.equal(result.counts.pending,1,"historical counts are retained");
 assert.equal(result.counts.blocked,M.MAX);
 assert.doesNotMatch(JSON.stringify(result),/PRIVATE_OLD|PRIVATE|secret/);
});
