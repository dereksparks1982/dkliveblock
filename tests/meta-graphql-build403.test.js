"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict");
const M=require("../src/meta-graphql.js");
const feed=edges=>({data:{viewer:{news_feed:{edges}}}});
const wrap=(id,meta={})=>({node:{id,...meta}});
const parse=x=>M.rewrite(JSON.stringify(x));
const ids=r=>JSON.parse(r.text).data.viewer.news_feed.edges.map(e=>e.node.id);
const STRATEGY="CometStorySponsoredLabelStrategy";
const section=t=>({comet_sections:{context_layout:{story:{comet_sections:{
 metadata:{sponsoredLabel:{__typename:t}}}}}}});
const req=(page="https://www.facebook.com/")=>({
 tabId:403,method:"POST",type:"xmlhttprequest",statusCode:200,
 url:"https://www.facebook.com/api/graphql/",documentUrl:page});
test("Build 403: exact metadata strategy catches sponsored feed without ad_id",()=>{
 const ad=wrap("ad",section(STRATEGY));
 const good=wrap("friend",{story:{text:"Sponsored discussion"}});
 const r=parse(feed([good,ad,wrap("family")]));
 assert.equal(r.removed,1);assert.deepEqual(ids(r),["friend","family"]);
});
test("Build 403: wrong path, typename or user text never cause a hide",()=>{
 const base=feed([
  wrap("wrong-strategy",section("CometStoryUnpaidLabelStrategy")),
  wrap("wrong-path",{story:section(STRATEGY)}),
  wrap("quoted",{message:STRATEGY}),
  wrap("unrelated",{comet_sections:{metadata:{x:{__typename:STRATEGY}}}}),
  wrap("ordinary",{th_dat_spo:{label:"unknown"}})
 ]);
 const raw=JSON.stringify(base),r=M.rewrite(raw);
 assert.equal(r.changed,false);assert.equal(r.text,raw);
});
test("Build 403: metadata lookup has a strict 24-entry budget",()=>{
 const ad=section(STRATEGY);
 const meta=ad.comet_sections.context_layout.story.comet_sections.metadata;
 for(let i=0;i<24;i++)meta["organic"+i]={__typename:"NoAd"};
 const raw=JSON.stringify(feed([wrap("ad",ad)]));
 assert.equal(M.rewrite(raw).text,raw);
});
test("Build 403: nested RequireJS strategy is recognized only in feed edges",()=>{
 const x={require:[["Loader",[],[],[{__bbox:{result:feed([
  wrap("ad",section(STRATEGY)),wrap("good")
 ])}}]]]};
 const r=parse(x);
 assert.equal(r.removed,1);
 const a=JSON.parse(r.text).require[0][3][0].__bbox.result.data.viewer.news_feed.edges;
 assert.equal(a[0].node.id,"good");
});
test("Build 403: parser decoy path with strategy remains untouched",()=>{
 const x={node:{comet_sections:section(STRATEGY).comet_sections},
  data:{node:section(STRATEGY)}};
 const raw=JSON.stringify(x);assert.equal(M.rewrite(raw).text,raw);
});
test("Build 403: search recognizes additional explicitly suffixed ad roles",()=>{
 const x={data:{serpResponse:{results:{edges:[
  wrap("ad",{role:"SEARCH_PRODUCT_ADS"}),wrap("ordinary",{role:"SEARCH_RESULTS"}),
  wrap("odd",{role:"ADS"}),wrap("another",{role:"SEARCH_ADS"})
 ]}}}};
 const r=parse(x);
 assert.equal(r.removed,2);
 assert.deepEqual(JSON.parse(r.text).data.serpResponse.results.edges.map(e=>e.node.id),["ordinary","odd"]);
});
test("Build 403: other feed does not inherit broad search role matching",()=>{
 const x=feed([wrap("friend",{role:"PRODUCT_ADS"}),wrap("other")]);
 const raw=JSON.stringify(x);assert.equal(M.rewrite(raw).text,raw);
});
test("Build 403: Marketplace composer item and bulk routes are protected",()=>{
 for(const path of ["/marketplace/create/item","/marketplace/create/bulk",
  "/marketplace/create","/marketplace/create/other",
  "/marketplace/you/selling/create/item"]){
  const url="https://www.facebook.com"+path;
  assert.equal(M.protectedComposerPage(url),true,path);
  assert.equal(M.eligible(req(url),"www.facebook.com"),false,path);
 }
});
test("Build 403: normal Marketplace browse and general feed are eligible",()=>{
 for(const p of ["/marketplace/","/marketplace/category/vehicles","/marketplace/createit",
  "/feed","/groups/123"]){
  const url="https://www.facebook.com"+p;
  assert.equal(M.protectedComposerPage(url),false,p);
  assert.equal(M.eligible(req(url),"www.facebook.com"),true,p);
 }
});
test("Build 403: lookalike websites and non-HTTPS paths remain unauthorized",()=>{
 for(const url of ["http://www.facebook.com/marketplace/create/item",
  "https://www.facebook.com.evil.invalid/marketplace/create/item",
  "javascript:alert(1)","no-url"]){
  assert.equal(M.protectedComposerPage(url),false,url);
 }
});
test("Build 403: sidebar removes confirmed ad children, keeps empty ad wrapper",()=>{
 const x={data:{viewer:{sideFeedUnit:{nodes:[
  {__typename:"AdsSideFeedUnit",id:"wrapper",new_adverts:{nodes:[
   {id:"ad",th_dat_spo:{ad_id:"x"}}]},extra:{layout:"grid"}},
  {__typename:"ContactsSideFeedUnit",id:"contacts"}
 ]}}}};
 const r=parse(x);
 assert.equal(r.removed,1);
 const arr=JSON.parse(r.text).data.viewer.sideFeedUnit.nodes;
 assert.equal(arr.length,2);
 assert.equal(arr[0].id,"wrapper");assert.equal(arr[0].extra.layout,"grid");
 assert.deepEqual(arr[0].new_adverts.nodes,[]);
 assert.equal(arr[1].id,"contacts");
});
test("Build 403: sidebar unknown and organic children remain in original order",()=>{
 const x={data:{viewer:{sideFeedUnit:{nodes:[
  {__typename:"AdsSideFeedUnit",new_adverts:{nodes:[
   {id:"a",sponsored_data:{ad_id:"x"}},{id:"good"}, {id:"b",th_dat_spo:{ad_id:"y"}}]}},
  {__typename:"UnknownSideUnit",info:{id:"keep"}}
 ]}}}};
 const r=parse(x);
 assert.equal(r.removed,2);
 const rows=JSON.parse(r.text).data.viewer.sideFeedUnit.nodes;
 assert.equal(rows.length,2);assert.equal(rows[0].new_adverts.nodes[0].id,"good");
 assert.equal(rows[1].info.id,"keep");
});
test("Build 403: JSONL output preserves approved ad-only changes and CRLF",()=>{
 const ad=feed([wrap("ad",section(STRATEGY)),wrap("safe")]);
 const raw="for (;;);"+JSON.stringify(ad)+"\r\n"+JSON.stringify({data:{viewer:{id:"account"}}})+"\r\n";
 const r=M.rewrite(raw);assert.equal(r.removed,1);
 assert.ok(r.text.includes("\r\n"));assert.ok(r.text.includes('"id":"safe"'));
});
test("Build 403: malformed sibling GraphQL errors fail open",()=>{
 const x=feed([wrap("ad",section(STRATEGY))]);
 const raw=JSON.stringify(x)+"\n"+JSON.stringify({errors:[{message:"login"}]})+"\n";
 assert.equal(M.rewrite(raw).text,raw);
});
test("Build 403: production manifest stays synchronized and test wired",()=>{
 const m=require("../src/manifest.json"),p=require("../package.json");
 assert.equal(m.version,p.version);
 assert.ok(/^\d+\.\d+\.\d+$/.test(p.version));
});
