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
