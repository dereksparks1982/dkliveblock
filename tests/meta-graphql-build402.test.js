"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict");
const M=require("../src/meta-graphql.js");
const entry=(id,meta={})=>({node:{id,...meta}});
const feed=edges=>({data:{viewer:{news_feed:{edges}}}});
const rewrite=x=>M.rewrite(JSON.stringify(x));
const ids=r=>JSON.parse(r.text).data.viewer.news_feed.edges.map(e=>e.node.id);
test("Build 402: renamed typed field removes sponsored edge, not neighbors",()=>{
 const r=rewrite(feed([entry("left"),entry("ad",{th_dat_spo:{__typename:"SponsoredData"}}),entry("right")]));
 assert.equal(r.removed,1);assert.deepEqual(ids(r),["left","right"]);
});
test("Build 402: renamed nonempty ad ID is positive evidence",()=>{
 const r=rewrite(feed([entry("ad",{th_dat_spo:{ad_id:"x"}}),entry("ordinary",{th_dat_spo:{ad_id:""}})]));
 assert.equal(r.removed,1);assert.deepEqual(ids(r),["ordinary"]);
});
test("Build 402: story and relay view-model wrappers work",()=>{
 const r=rewrite(feed([
  entry("story",{story:{th_dat_spo:{__typename:"SponsoredData"}}}),
  entry("relay",{relay_rendering_strategy:{view_model:{story:{th_dat_spo:{ad_id:"a"}}}}}),
  entry("safe")
 ]));
 assert.equal(r.removed,2);assert.deepEqual(ids(r),["safe"]);
});
test("Build 402: edge-level relay and Marketplace feed work",()=>{
 const x={data:{marketplace_search:{feed_units:{edges:[
  {node:{id:"ad"},relay_rendering_strategy:{view_model:{story:{th_dat_spo:{ad_id:"x"}}}}},
  entry("safe")
 ]}}}};
 const r=rewrite(x);
 assert.equal(r.removed,1);
 assert.equal(JSON.parse(r.text).data.marketplace_search.feed_units.edges[0].node.id,"safe");
});
test("Build 402: sidebar dedicated new_adverts slot handles the new alias",()=>{
 const x={data:{viewer:{sideFeedUnit:{nodes:[{new_adverts:{nodes:[
  {id:"ad",th_dat_spo:{__typename:"SponsoredData"}},{id:"safe",th_dat_spo:{disclaimer:"label"}}
 ]}}]}}}};
 const r=rewrite(x);
 assert.equal(r.removed,1);
 assert.equal(JSON.parse(r.text).data.viewer.sideFeedUnit.nodes[0].new_adverts.nodes[0].id,"safe");
});
test("Build 402: old sponsored_data contract remains compatible",()=>{
 assert.equal(M.adMetadata({ad_id:null}),true);
 const r=rewrite(feed([entry("old",{sponsored_data:{ad_id:null}}),entry("safe")]));
 assert.equal(r.removed,1);assert.deepEqual(ids(r),["safe"]);
});
test("Build 402: ambiguous new field, quoted text and empty ID fail open",()=>{
 const x=feed([
  entry("plain",{th_dat_spo:{}}),entry("normal",{th_dat_spo:{label:"sponsored"}}),
  entry("empty",{th_dat_spo:{ad_id:""}}),entry("long",{th_dat_spo:{ad_id:"x".repeat(257)}}),
  entry("quoted",{message:"SponsoredData"}),entry("shared",{story:{sponsored_data:{context:"ordinary"}}})
 ]);
 const raw=JSON.stringify(x);const r=M.rewrite(raw);
 assert.equal(r.changed,false);assert.equal(r.text,raw);
});
test("Build 402: Facebook GHL parser canary is never changed",()=>{
 const x={node:{s:{__typename:"SponsoredData"}},data:{node:{
  id:"decoy",th_dat_spo:{__typename:"SponsoredData"}}}};
 const raw=JSON.stringify(x);const r=M.rewrite(raw);
 assert.equal(r.changed,false);assert.equal(r.text,raw);
});
test("Build 402: unrelated private user collections are untouched",()=>{
 const x={data:{viewer:{
  messages:{edges:[entry("msg",{th_dat_spo:{ad_id:"x"}})]},
  reactions:{edges:[entry("react",{th_dat_spo:{__typename:"SponsoredData"}})]},
  profile:{th_dat_spo:{ad_id:"x"}}}}};
 const raw=JSON.stringify(x);assert.equal(M.rewrite(raw).text,raw);
});
test("Build 402: prefixed streaming JSONL preserves safe records and CRLF",()=>{
 const ad=feed([entry("ad",{th_dat_spo:{__typename:"SponsoredData"}}),entry("safe")]);
 const other={data:{viewer:{id:"profile"}}};
 const raw="for (;;);"+JSON.stringify(ad)+"\r\n"+JSON.stringify(other)+"\r\n";
 const r=M.rewrite(raw);
 assert.equal(r.removed,1);
 const lines=r.text.slice("for (;;);".length).trim().split("\r\n");
 assert.deepEqual(JSON.parse(lines[0]).data.viewer.news_feed.edges.map(e=>e.node.id),["safe"]);
 assert.deepEqual(JSON.parse(lines[1]),other);
});
test("Build 402: known RequireJS bbox nested feed is filtered safely",()=>{
 const x={require:[["Loader",[],[],[{__bbox:{result:feed([
  entry("ad",{th_dat_spo:{ad_id:"x"}}),entry("safe")
 ])}}]]]};
 const r=rewrite(x);assert.equal(r.removed,1);
 const edges=JSON.parse(r.text).require[0][3][0].__bbox.result.data.viewer.news_feed.edges;
 assert.equal(edges[0].node.id,"safe");
});
test("Build 402: incomplete JSONL and GraphQL errors do not partially mutate",()=>{
 const x=feed([entry("ad",{th_dat_spo:{ad_id:"x"}})]),ad=JSON.stringify(x);
 for(const raw of [ad+"\n"+'{"data":'+"\n",
  ad+"\r\n"+JSON.stringify({errors:[{message:"login"}]})+"\r\n",
  JSON.stringify({...x,errors:[{message:"auth"}]})]){
  const r=M.rewrite(raw);assert.equal(r.changed,false);assert.equal(r.text,raw);
 }
});
test("Build 402: limits protect large feeds and oversized IDs",()=>{
 assert.equal(M.adMetadata({ad_id:"x".repeat(257)},true),false);
 assert.equal(M.adMetadata({ad_id:"x"},true),true);
 const x=feed(Array.from({length:1001},(_,i)=>entry("row"+i,{th_dat_spo:{ad_id:"x"}})));
 const raw=JSON.stringify(x);
 assert.equal(M.rewrite(raw).text,raw);
});
test("Build 402: existing opt-out stays final and only strict Facebook XHR eligible",()=>{
 const request={type:"xmlhttprequest",method:"POST",statusCode:200,tabId:1,
  url:"https://www.facebook.com/api/graphql/",documentUrl:"https://www.facebook.com/feed"};
 const on={enabled:true,adRecognition:true,metaGraphqlFilter:true};
 assert.equal(M.experimentEnabled(on,request,"www.facebook.com"),true);
 assert.equal(M.experimentEnabled({...on,metaGraphqlFilter:false},request,"www.facebook.com"),false);
 assert.equal(M.experimentEnabled(on,{...request,type:"document"},"www.facebook.com"),false);
});
test("Build 402: old schema contract and no extra browser permissions",()=>{
 const manifest=require("../src/manifest.json"),pkg=require("../package.json");
 assert.equal(manifest.version,pkg.version);
 assert.ok(manifest.background.scripts.includes("meta-graphql.js"));
});
