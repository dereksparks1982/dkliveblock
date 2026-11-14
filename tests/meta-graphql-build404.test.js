"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict");
const M=require("../src/meta-graphql.js");
const id=(name,props={})=>({id:name,...props});
const ad=id("ad",{th_dat_spo:{ad_id:"x"}});
const old=id("old",{sponsored_data:{ad_id:"x"}});
const strategy=id("strategy",{comet_sections:{context_layout:{story:{comet_sections:{
 metadata:{sponsor:{__typename:"CometStorySponsoredLabelStrategy"}}
}}}}});
const safe=id("safe",{th_dat_spo:{disclaimer:"non-ad"}});
const result=o=>M.rewrite(JSON.stringify(o));
test("Build 404: feed nodes remove typed ad, preserve organic entries",()=>{
 const x={data:{viewer:{news_feed:{nodes:[safe,ad,id("family")]}}}};
 const r=result(x);
 assert.equal(r.removed,1);
 assert.deepEqual(JSON.parse(r.text).data.viewer.news_feed.nodes.map(x=>x.id),["safe","family"]);
});
test("Build 404: historical and strategy markers work in feed nodes",()=>{
 const x={data:{viewer:{news_feed:{nodes:[old,strategy,id("friend")]}}}};
 const r=result(x);assert.equal(r.removed,2);
 assert.deepEqual(JSON.parse(r.text).data.viewer.news_feed.nodes.map(x=>x.id),["friend"]);
});
test("Build 404: mixed edges and direct nodes filter independently",()=>{
 const x={data:{viewer:{news_feed:{
  edges:[{node:ad},{node:id("friend")}],
  nodes:[old,id("safe")]
 }}}};
 const r=result(x);assert.equal(r.removed,2);
 const news=JSON.parse(r.text).data.viewer.news_feed;
 assert.deepEqual(news.edges.map(x=>x.node.id),["friend"]);
 assert.deepEqual(news.nodes.map(x=>x.id),["safe"]);
});
test("Build 404: named Marketplace feed nodes are eligible, ordinary listings survive",()=>{
 const x={data:{marketplace_search:{feed_units:{
  nodes:[id("sponsored",{__typename:"MarketplaceFeedAdStory"}),safe,id("listing")],
  metadata:{pagination:"keep"}
 }}}};
 const r=result(x);assert.equal(r.removed,1);
 const feed=JSON.parse(r.text).data.marketplace_search.feed_units;
 assert.deepEqual(feed.nodes.map(x=>x.id),["safe","listing"]);
 assert.equal(feed.metadata.pagination,"keep");
});
test("Build 404: named viewer Marketplace stories nodes are eligible",()=>{
 const x={data:{viewer:{marketplace_feed_stories:{
  nodes:[ad,id("listing")],edges:[{node:old},{node:id("friend")}]
 }}}};
 const r=result(x);assert.equal(r.removed,2);
 const feed=JSON.parse(r.text).data.viewer.marketplace_feed_stories;
 assert.deepEqual(feed.nodes.map(x=>x.id),["listing"]);
 assert.deepEqual(feed.edges.map(x=>x.node.id),["friend"]);
});
test("Build 404: search-only roles ending in _ADS filter direct nodes",()=>{
 const x={data:{serpResponse:{results:{nodes:[
  id("first",{role:"SEARCH_PRODUCT_ADS"}),id("second",{role:"PROMOTED_ADS"}),
  id("legit",{role:"SEARCH_RESULTS"}),id("another",{role:"ADS"})
 ]}}}};
 const r=result(x);assert.equal(r.removed,2);
 assert.deepEqual(JSON.parse(r.text).data.serpResponse.results.nodes.map(x=>x.id),["legit","another"]);
});
test("Build 404: uppercase ad role is not applied to ordinary feed nodes",()=>{
 const x={data:{viewer:{news_feed:{nodes:[
  id("friend",{role:"PROMOTED_ADS"}),id("ordinary")
 ]}}}};
 const raw=JSON.stringify(x);
 assert.equal(M.rewrite(raw).text,raw);
});
test("Build 404: root data.node, messages and reactions remain untouched",()=>{
 const x={data:{node:ad,viewer:{
  messages:{nodes:[ad],edges:[{node:old}]},
  reactions:{nodes:[strategy]}
 }}};
 const raw=JSON.stringify(x);assert.equal(M.rewrite(raw).text,raw);
});
test("Build 404: arbitrary arrays do not acquire new pruning privileges",()=>{
 const x={data:{viewer:{saved_posts:{nodes:[ad]},
  photo_gallery:{edges:[{node:ad}]},profile:{nodes:[ad]}}}};
 const raw=JSON.stringify(x);assert.equal(M.rewrite(raw).text,raw);
});
test("Build 404: oversized node collection fails open without partial edit",()=>{
 const many=Array.from({length:1001},(_,i)=>id("n"+i,{th_dat_spo:{ad_id:"x"}}));
 const x={data:{viewer:{news_feed:{nodes:many}}}};
 const raw=JSON.stringify(x);assert.equal(M.rewrite(raw).text,raw);
});
test("Build 404: nested bbox JSONL changes only supported node collections",()=>{
 const first={require:[["Loader",[],[],[{__bbox:{result:{
  data:{viewer:{news_feed:{nodes:[ad,safe]}}}}}
 }]]]};
 const second={data:{viewer:{messages:{nodes:[ad]}}}};
 const raw="for (;;);"+JSON.stringify(first)+"\r\n"+JSON.stringify(second)+"\r\n";
 const r=M.rewrite(raw);assert.equal(r.removed,1);
 assert.ok(r.text.includes('"id":"safe"'));
 const lines=r.text.slice("for (;;);".length).trim().split("\r\n");
 assert.deepEqual(JSON.parse(lines[1]),second);
});
test("Build 404: errors and truncated JSONL protect every record",()=>{
 const good=JSON.stringify({data:{viewer:{news_feed:{nodes:[ad,safe]}}}});
 const broken=good+"\n"+'{"unfinished":'+"\n";
 assert.equal(M.rewrite(broken).text,broken);
 const x={errors:[{message:"auth"}],data:{viewer:{news_feed:{nodes:[ad]}}}};
 const raw=JSON.stringify(x);assert.equal(M.rewrite(raw).text,raw);
});
test("Build 404: direct nodes can be ordinary post text about advertising",()=>{
 const x={data:{viewer:{news_feed:{nodes:[id("post",{message:"SponsoredData",
  comet_sections:{context_layout:{story:{comet_sections:{metadata:{
   label:{__typename:"OrganicLabelStrategy"}
  }}}}}}),safe]}}}};
 const raw=JSON.stringify(x);
 assert.equal(M.rewrite(raw).text,raw);
});
test("Build 404: strict route still excludes Marketplace creation pages",()=>{
 const page="https://www.facebook.com/marketplace/create/item";
 const d={type:"xmlhttprequest",statusCode:200,method:"POST",tabId:1,
  url:"https://www.facebook.com/api/graphql/",documentUrl:page};
 assert.equal(M.eligible(d,"www.facebook.com"),false);
 assert.equal(M.eligible({...d,documentUrl:"https://www.facebook.com/marketplace/"},"www.facebook.com"),true);
});
test("Build 404: manifest and package versions match",()=>{
 const m=require("../src/manifest.json"),p=require("../package.json");
 assert.equal(m.version,p.version);assert.equal(p.version,"0.3.364");
});
