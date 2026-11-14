"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict");
const Meta=require("../src/meta-graphql.js");
const story=(id,ad)=>({node:{id,story:ad?{sponsored_data:{ad_id:"ad-"+id}}:{sponsored_data:{disclaimer:"ordinary"}}}});
test("Build 264: Marketplace feed unit hides just sponsored listing",()=>{
 const input={data:{marketplace_search:{feed_units:{edges:[story("normal",false),story("ad",true)]}}}};
 const r=Meta.rewrite(JSON.stringify(input));
 assert.equal(r.removed,1);
 assert.deepEqual(JSON.parse(r.text).data.marketplace_search.feed_units.edges.map(x=>x.node.id),["normal"]);
});
test("Build 264: viewer marketplace_feed_stories removes only explicit ads",()=>{
 const input={data:{viewer:{marketplace_feed_stories:{edges:[story("ad",true),story("family",false)]}}}};
 const r=Meta.rewrite(JSON.stringify(input));
 assert.equal(r.removed,1);
 assert.equal(JSON.parse(r.text).data.viewer.marketplace_feed_stories.edges[0].node.id,"family");
});
test("Build 264: rendered search ad marker but not normal descriptions",()=>{
 const ad={node:{id:"ad"},relay_rendering_strategy:{view_model:{story:{sponsored_data:{ad_id:"x"}}}}};
 const organic={node:{id:"organic",story:{sponsored_data:{label:"review"}}}};
 const data={data:{serpResponse:{results:{edges:[ad,organic]}}}};
 const r=Meta.rewrite(JSON.stringify(data));
 assert.equal(r.removed,1);
 assert.equal(JSON.parse(r.text).data.serpResponse.results.edges[0].node.id,"organic");
});
test("Build 264: bounded RequireJS bbox can find sponsored record",()=>{
 const inner={__bbox:{result:{data:{viewer:{news_feed:{edges:[
  {category:"SPONSORED",node:{id:"ad"}},
  {category:"ORGANIC",node:{id:"friend"}}
 ]}}}}}};
 const outer={__bbox:{require:[["Nested",[],[],[inner]]]}};
 const doc={require:[["Loader",[],[],[outer]]]};
 const r=Meta.rewrite("for (;;);"+JSON.stringify(doc)+"\r\n");
 assert.equal(r.removed,1);
 const payload=JSON.parse(r.text.slice("for (;;);".length));
 const rows=payload.require[0][3][0].__bbox.require[0][3][0].__bbox.result.data.viewer.news_feed.edges;
 assert.deepEqual(rows.map(x=>x.node.id),["friend"]);
});
test("Build 264: unrelated messages, reactions and private user data pass unchanged",()=>{
 const original=JSON.stringify({data:{viewer:{
  messages:{edges:[{category:"SPONSORED",node:{id:"message"}}]},
  reactions:{edges:[{node:{__typename:"SponsoredData",id:"reaction"}}]},
  profile:{id:"ordinary"}}}});
 const r=Meta.rewrite(original);
 assert.equal(r.changed,false);
 assert.equal(r.text,original);
});
test("Build 264: never remove organic sponsored_data without ad evidence",()=>{
 const original=JSON.stringify({data:{viewer:{news_feed:{edges:[
  {node:{sponsored_data:{disclaimer:"non-ad"}}},
  {node:{story:{sponsored_data:{source:"friend"}}}}
 ]}}}});
 const r=Meta.rewrite(original);
 assert.equal(r.changed,false);
 assert.equal(r.text,original);
});
test("Build 403: known sidebar ad child removed, stable wrappers survive",()=>{
 const data={data:{viewer:{sideFeedUnit:{nodes:[
  {__typename:"AdsSideFeedUnit",new_adverts:{nodes:[{id:"ad",sponsored_data:{ad_id:"x"}}]}},
  {__typename:"AdsSideFeedUnit",other:{id:"friend"}},
  {new_adverts:{nodes:[{id:"safe",sponsored_data:{label:"non-ad"}}]}}
 ]}}}};
 const r=Meta.rewrite(JSON.stringify(data));
 assert.equal(r.removed,1);
 const rows=JSON.parse(r.text).data.viewer.sideFeedUnit.nodes;
 assert.equal(rows.length,3);
 assert.equal(rows[0].__typename,"AdsSideFeedUnit");
 assert.deepEqual(rows[0].new_adverts.nodes,[]);
 assert.equal(rows[1].other.id,"friend");
 assert.equal(rows[2].new_adverts.nodes[0].id,"safe");
});
test("Build 264: JSONL preserves ordinary records and separators",()=>{
 const sponsored={data:{marketplace_search:{feed_units:{edges:[story("ad",true),story("safe",false)]}}}};
 const normal={data:{viewer:{messages:{edges:[{node:{id:"hello"}}]}}}};
 const raw="for (;;);"+JSON.stringify(sponsored)+"\r\n"+JSON.stringify(normal)+"\r\n";
 const r=Meta.rewrite(raw);
 assert.equal(r.removed,1);assert.ok(r.text.endsWith("\r\n"));
 const rows=r.text.slice("for (;;);".length).trim().split("\r\n");
 assert.equal(rows.length,2);
 assert.equal(JSON.parse(rows[0]).data.marketplace_search.feed_units.edges.length,1);
 assert.equal(JSON.parse(rows[1]).data.viewer.messages.edges[0].node.id,"hello");
});
