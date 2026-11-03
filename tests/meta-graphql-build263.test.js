"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict"),
 fs=require("node:fs"),path=require("node:path");
const Meta=require("../src/meta-graphql.js");
const ROOT=path.resolve(__dirname,"..");
const manifest=require("../src/manifest.json");
const request={requestId:"graphql-1",tabId:17,statusCode:200,
 method:"POST",type:"xmlhttprequest",pageHost:"www.facebook.com",
 url:"https://www.facebook.com/api/graphql/",
 documentUrl:"https://www.facebook.com/feed",
 responseHeaders:[{name:"Content-Type",value:"application/json; charset=utf-8"}]};
const encode=x=>new TextEncoder().encode(x);
const decode=x=>new TextDecoder().decode(x);
test("Build 263: only exact first-party Facebook GraphQL POST XHR requests",()=>{
 assert.equal(Meta.eligible(request,"www.facebook.com"),true);
 for(const changed of [
  {method:"GET"}, {type:"main_frame"}, {statusCode:403},
  {tabId:-1},{url:"https://m.facebook.com/api/graphql/"},
  {url:"https://www.facebook.com/login"},
  {documentUrl:"https://unrelated.example/feed"},
  {url:"https://www.facebook.com.evil.test/api/graphql/"}
 ])assert.equal(Meta.eligible({...request,...changed},"www.facebook.com"),false,JSON.stringify(changed));
});
test("Build 263: reject unknown or ambiguous content type, charset, oversized and partial responses",()=>{
 assert.equal(Meta.safeHeaders(request),true);
 const cases=[
  [{name:"Content-Type",value:"text/html"}],
  [{name:"Content-Type",value:"application/json; charset=iso-8859-1"}],
  [{name:"Content-Type",value:"application/json"},{name:"Content-Type",value:"application/json"}],
  [{name:"Content-Type",value:"application/json"},{name:"Content-Length",value:"9999999999"}],
  [{name:"Content-Type",value:"application/json"},{name:"Content-Range",value:"bytes 0-40/200"}]
 ];
 for(const responseHeaders of cases)
  assert.equal(Meta.safeHeaders({...request,responseHeaders}),false);
});
test("Build 263: prune sponsored news-feed record while preserving organic edges and metadata",()=>{
 const o={data:{viewer:{news_feed:{edges:[
  {category:"ORGANIC",node:{id:"friend"}},
  {category:"SPONSORED",node:{id:"ad"}},
  {category:"ORGANIC",node:{id:"family"}}]},id:"profile"}}};
 const r=Meta.rewrite(JSON.stringify(o));
 assert.equal(r.changed,true);assert.equal(r.removed,1);
 const out=JSON.parse(r.text).data.viewer;
 assert.deepEqual(out.news_feed.edges.map(x=>x.node.id),["friend","family"]);
 assert.equal(out.id,"profile");
});
test("Build 263: sidebar new_adverts and Marketplace are isolated ad-object shapes",()=>{
 const o={data:{viewer:{sideFeedUnit:{nodes:[{
  new_adverts:{nodes:[{sponsored_data:{ad_id:"a"},id:1},{id:2}]}
 }]}},serpResponse:{results:{edges:[
  {node:{id:"normal"}},
  {node:{__typename:"MarketplaceFeedAdStory",id:"ad"}}
 ]}}}};
 const r=Meta.rewrite(JSON.stringify(o));
 assert.equal(r.changed,true);assert.equal(r.removed,2);
 const data=JSON.parse(r.text).data;
 assert.equal(data.viewer.sideFeedUnit.nodes[0].new_adverts.nodes[0].id,2);
 assert.equal(data.serpResponse.results.edges[0].node.id,"normal");
});
test("Build 263: streamed GraphQL JSONL preserves line separators and unrelated records",()=>{
 const text='for (;;);{"data":{"viewer":{"news_feed":{"edges":[{"category":"SPONSORED","node":{"id":"ad"}},{"category":"ORGANIC","node":{"id":"friend"}}]}}}}\r\n{"data":{"viewer":{"id":"safe"}}}\r\n';
 const r=Meta.rewrite(text);
 assert.equal(r.changed,true);assert.equal(r.removed,1);
 assert.ok(r.text.startsWith("for (;;);"));
 assert.ok(r.text.includes("\r\n"));
 assert.ok(r.text.includes('"id":"friend"'));
 assert.ok(r.text.includes('"id":"safe"'));
});
test("Build 263: unknown GraphQL records, errors, invalid JSON and ordinary sponsored metadata fail open",()=>{
 const text=[
  "not-json",
  '{"error":{"message":"Sign in again"}}',
  '{"errors":[{"message":"Authentication required"}],"data":{"viewer":{"news_feed":{"edges":[{"category":"SPONSORED","node":{"id":1}}]}}}}',
  '{"data":{"viewer":{"news_feed":{"edges":[{"category":"ORGANIC","node":{"sponsored_data":{"disclaimer":"not an ad"}}}]}}}}',
  '{"data":{"viewer":{"id":1}}}'
 ];
 for(const input of text){
  const r=Meta.rewrite(input);assert.equal(r.changed,false,input);
  assert.equal(r.text,input);
 }
});
test("Build 263: XHR stream filters exactly one sponsored edge and closes cleanly",()=>{
 let called=0;const chunks=[],filter={
  write(data){chunks.push(new Uint8Array(data));},
  close(){this.closed=true;},disconnect(){this.disconnected=true;}};
 const webRequest={filterResponseData(id){called++;assert.equal(id,request.requestId);return filter;}};
 const input='{"data":{"viewer":{"news_feed":{"edges":[{"category":"SPONSORED","node":{"id":1}},{"category":"ORGANIC","node":{"id":2}}]}}}}';
 assert.equal(Meta.attach(request,webRequest,{}),true);
 const bytes=encode(input),half=Math.floor(bytes.length/2);
 filter.ondata({data:bytes.slice(0,half)});
 filter.ondata({data:bytes.slice(half)});
 filter.onstop();
 assert.equal(called,1);assert.equal(filter.closed,true);
 assert.equal(JSON.parse(decode(Buffer.concat(chunks.map(x=>Buffer.from(x))))).data.viewer.news_feed.edges[0].node.id,2);
 assert.equal(Meta.stats(17).modified,1);
 Meta.clear(17);
});
test("Build 263: unknown response is copied byte-for-byte through the stream",()=>{
 const writes=[],filter={write(x){writes.push(Buffer.from(x));},close(){this.closed=true;},disconnect(){}};
 const request2={...request,requestId:"graphql-2",tabId:18};
 assert.equal(Meta.attach(request2,{filterResponseData:()=>filter},{}),true);
 const original=encode("NOT_JSON\tQ");
 filter.ondata({data:original});
 filter.onstop();
 assert.deepEqual(Buffer.concat(writes),Buffer.from(original));
 assert.equal(filter.closed,true);Meta.clear(18);
});
test("Build 263: extension settings are independent and no new permissions required",()=>{
 const bg=fs.readFileSync(path.join(ROOT,"src/background.js"),"utf8"),
  opts=fs.readFileSync(path.join(ROOT,"src/options.html"),"utf8"),
  settings=fs.readFileSync(path.join(ROOT,"src/settings.js"),"utf8");
 assert.match(bg,/metaGraphqlFilter:true/);
 assert.match(bg,/DKMetaGraphQL\.attach/);
 assert.match(bg,/activeTab\(d\.tabId,site\)/);
 assert.match(bg,/policy\?\.document\|\|policy\?\.elemhide/);
 assert.match(settings,/"metaGraphqlFilter"/);
 assert.match(opts,/id="metaGraphqlFilter"/);
 assert.equal(manifest.version,require("../package.json").version);
 assert.ok(manifest.background.scripts.includes("meta-graphql.js"));
 assert.ok(!manifest.content_scripts.some(x=>x.js.includes("meta-graphql.js")));
});

test("Build 286: Meta Nesty 05 runs only under active Facebook experiment",()=>{
 assert.equal(Meta.EXPERIMENT_OWNER,"agent_nesty_meta_05");
 const s={enabled:true,adRecognition:true,metaGraphqlFilter:true};
 assert.equal(Meta.experimentEnabled(s,request,"www.facebook.com"),true);
 for(const v of [{...s,metaGraphqlFilter:false},{...s,enabled:false},{...s,adRecognition:false}])
  assert.equal(Meta.experimentEnabled(v,request,"www.facebook.com"),false);
 assert.equal(Meta.experimentEnabled(s,{...request,url:"https://www.instagram.com/api/graphql/"},"www.instagram.com"),false);
 const bg=fs.readFileSync(path.join(ROOT,"src/background.js"),"utf8");
 assert.match(bg,/if\(typeof s\.metaGraphqlFilter==="boolean"\)data\.settings\.metaGraphqlFilter=s\.metaGraphqlFilter/);
 assert.match(bg,/msg.action==="setMetaGraphqlExperiment"/);
 assert.match(bg,/DKMetaGraphQL\.experimentEnabled\(data.settings,request,site\)/);
});
