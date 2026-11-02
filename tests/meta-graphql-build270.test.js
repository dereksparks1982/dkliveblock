"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict");
const M=require("../src/meta-graphql.js"),N=require("../src/meta-agent-nesty.js");
const good={data:{viewer:{news_feed:{edges:[{node:{id:"friend"}},{category:"SPONSORED",node:{id:"ad"}}]}}}};
const nest=x=>({require:[["Loader",[],[],[{__bbox:{result:x}}]]]});
const raw=x=>JSON.stringify(x);
const untouched=x=>{const r=M.rewrite(x);assert.equal(r.changed,false);assert.equal(r.text,x);};
test("Agent Nesty Meta 05 is armed in the existing registry",()=>{
 assert.ok(N.agents.some(x=>x.id==="agent_nesty_meta_05"));
 assert.equal(typeof M.safeRequireEnvelope,"function");
});
test("Known valid nested RequireJS envelope still removes only ads",()=>{
 const x=nest(good),r=M.rewrite(raw(x));
 assert.equal(M.safeRequireEnvelope(x),true);
 assert.equal(r.removed,1);
 assert.deepEqual(JSON.parse(r.text).require[0][3][0].__bbox.result.data.viewer.news_feed.edges.map(x=>x.node.id),["friend"]);
});
test("Nested __bbox error field preserves full original response",()=>{untouched(raw({require:[[{__bbox:{error:{code:401},result:good}}]]}));});
test("Nested __bbox errors array preserves original response",()=>{untouched(raw({require:[[{__bbox:{errors:[{message:"login"}],result:good}}]]}));});
test("Nested result errors preserve original response",()=>{untouched(raw(nest({errors:[{message:"unauthorized"}],...good})));});
test("Later sibling Require error prevents earlier ad removal",()=>{
 untouched(raw({require:[[{__bbox:{result:good}},{__bbox:{result:{errors:[{message:"not authorized"}]}}}]]}));
});
test("JSONL late nested error cancels whole transaction",()=>{
 untouched("for (;;);"+raw(good)+"\n"+raw({require:[[{__bbox:{errors:[{message:"fail"}],result:good}}]]})+"\n");
});
test("JSONL early nested error cancels whole transaction",()=>{
 untouched("for (;;);"+raw({require:[[{__bbox:{error:"auth",result:good}}]]})+"\r\n"+raw(good)+"\r\n");
});
test("Malformed RequireJS field fails open",()=>{untouched(raw({...good,require:{unknown:true}}));});
test("Oversized transport collection fails open instead of partial removal",()=>{
 untouched(raw({...good,require:[Array.from({length:101},(_,i)=>({id:i}))]}));
});
test("Deeply nested transport fails open",()=>{
 let x={__bbox:{result:good}};
 for(let i=0;i<23;i++)x={result:x};
 untouched(raw({...good,require:[x]}));
});
test("Normal message content containing word error remains untouched while ads filter",()=>{
 const x={data:{viewer:{news_feed:good.data.viewer.news_feed,
  messages:{edges:[{node:{id:"message",error:"a quoted word"}}]}}}};
 const r=M.rewrite(raw(x));assert.equal(r.removed,1);
 assert.equal(JSON.parse(r.text).data.viewer.messages.edges[0].node.id,"message");
});
test("Non-ad response in nested message/reaction collections remains unchanged",()=>{
 const x=nest({data:{viewer:{messages:{edges:[{category:"SPONSORED",node:{id:"msg"}}]},
 reactions:{edges:[{category:"SPONSORED",node:{id:"reaction"}}]}}}});
 untouched(raw(x));
});
test("Empty nested error array is not a GraphQL failure",()=>{
 const x={require:[[{__bbox:{errors:[],result:good}}]]};
 assert.equal(M.rewrite(raw(x)).removed,1);
});
test("Root GraphQL error prevents nested edits",()=>{
 untouched(raw({...good,errors:[{message:"failed"}],require:nest(good).require}));
});
