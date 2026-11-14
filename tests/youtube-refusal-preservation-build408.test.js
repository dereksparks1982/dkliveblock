"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict");
const R=require("../src/youtube-response.js"),F=require("../src/youtube-feed.js");
const fs=require("node:fs"),path=require("node:path");
const PLAYER="https://www.youtube.com/youtubei/v1/player";
const PREFETCH="https://www.youtube.com/youtubei/v1/resolve_url";
const NEXT="https://www.youtube.com/youtubei/v1/next";
const screen={playerErrorMessageRenderer:{reason:{simpleText:"unavailable"}}};
const player=(more={})=>({
 playabilityStatus:{status:"OK"},videoDetails:{title:"ordinary"},
 streamingData:{formats:[{url:"signed-media"}]},
 adPlacements:[{}],adSlots:[{}],playerAds:[{}],...more});
const denied=(more={})=>player({playabilityStatus:{status:"OK",errorScreen:screen},...more});
const rewrite=(o,url=PLAYER)=>R.rewrite(JSON.stringify(o),url);
const prefetch=(o,serialized=false)=>({endpoint:{watchEndpoint:{
 unserializedPrefetchData:{playerResponse:serialized?JSON.stringify(o):o,signedToken:"keep"}}}});
test("Build 408: status OK plus explicit errorScreen preserves refusal",()=>{
 const x=denied(),raw=JSON.stringify(x),r=R.rewrite(raw);
 assert.equal(r.changed,false);assert.equal(r.refused,true);assert.equal(r.text,raw);
});
test("Build 408: absent status but present errorScreen also preserves refusal",()=>{
 const x=denied({playabilityStatus:{errorScreen:screen}}),r=rewrite(x);
 assert.equal(r.changed,false);assert.equal(r.refused,true);
});
test("Build 408: an errorScreen array is preserved rather than hidden",()=>{
 const x=denied({playabilityStatus:{status:"OK",errorScreen:[{code:1}]}}),r=rewrite(x);
 assert.equal(r.changed,false);assert.equal(r.refused,true);
});
test("Build 408: ordinary OK player still has its three ad fields removed",()=>{
 const x=player(),r=rewrite(x);
 assert.equal(r.changed,true);assert.equal(r.fields,3);
 const y=JSON.parse(r.text);
 assert.equal(y.adSlots,undefined);assert.equal(y.playerAds,undefined);
 assert.deepEqual(y.streamingData,x.streamingData);
});
test("Build 408: historical refusal statuses are still rejected",()=>{
 for(const status of ["LOGIN_REQUIRED","UNPLAYABLE","ERROR"]){
  const r=rewrite(player({playabilityStatus:{status}}));
  assert.equal(r.changed,false);assert.equal(r.refused,true);
 }
});
test("Build 408: nested object refusal prevents partial outer editing",()=>{
 const x=player({playerResponse:denied()}),raw=JSON.stringify(x),r=R.rewrite(raw);
 assert.equal(r.text,raw);assert.equal(r.changed,false);assert.equal(r.refused,true);
});
test("Build 408: nested string refusal prevents partial outer editing",()=>{
 const x=player({playerResponse:JSON.stringify(denied())}),raw=JSON.stringify(x);
 const r=R.rewrite(raw);assert.equal(r.changed,false);assert.equal(r.text,raw);
});
test("Build 408: prefetch object remains unchanged with signed navigation",()=>{
 const x=prefetch(denied()),raw=JSON.stringify(x),r=R.rewrite(raw,PREFETCH);
 assert.equal(r.changed,false);assert.equal(r.refused,true);assert.equal(r.text,raw);
});
test("Build 408: serialized prefetch refusal is preserved",()=>{
 const x=prefetch(denied(),true),raw=JSON.stringify(x),r=R.rewrite(raw,PREFETCH);
 assert.equal(r.changed,false);assert.equal(r.refused,true);assert.equal(r.text,raw);
});
test("Build 408: playable prefetch still removes only approved ad fields",()=>{
 const r=rewrite(prefetch(player()),PREFETCH);
 assert.equal(r.changed,true);assert.equal(r.fields,3);
 const x=JSON.parse(r.text).endpoint.watchEndpoint.unserializedPrefetchData;
 assert.equal(x.playerResponse.adSlots,undefined);assert.equal(x.signedToken,"keep");
});
test("Build 408: feed errorScreen vetoes known sponsored entries",()=>{
 for(const url of [NEXT,"https://www.youtube.com/youtubei/v1/browse"]){
  const x={playabilityStatus:{status:"OK",errorScreen:screen},
   contents:[{videoRenderer:{videoId:"friend"}},{adSlotRenderer:{id:"ad"}}]};
  const raw=JSON.stringify(x),r=R.rewrite(raw,url);
  assert.equal(r.text,raw);assert.equal(r.changed,false);
  assert.equal(F.prune(x,url).changed,false);assert.equal(x.contents.length,2);
 }
});
test("Build 408: ordinary feed still removes known ad entries",()=>{
 const x={playabilityStatus:{status:"OK"},contents:[
  {videoRenderer:{videoId:"friend"}},{adSlotRenderer:{id:"ad"}}]};
 const r=R.rewrite(JSON.stringify(x),NEXT);
 assert.equal(r.changed,true);assert.equal(JSON.parse(r.text).contents.length,1);
});
test("Build 408: MAIN bridge uses own data descriptors and matching refusal guard",()=>{
 const source=fs.readFileSync(path.join(__dirname,"../src/youtube-page-bridge.js"),"utf8");
 assert.match(source,/ownData\(state,"errorScreen"\)/);
 assert.match(source,/plain\(screen\)\|\|Array\.isArray\(screen\)/);
 assert.match(source,/function denied\(x\)/);
});
test("Build 408: existing in-player warning is not automatically reloaded",()=>{
 const source=fs.readFileSync(path.join(__dirname,"../src/background.js"),"utf8");
 assert.match(source,/recoveryAttempted:false/);
 assert.match(source,/DKAdaptiveYouTube\.matchesLiveWatch\(liveTab\?\.url,msg\.watchVideoId\)/);
});
test("Build 408: no new extension privileges or upstream runtime package",()=>{
 const manifest=require("../src/manifest.json"),pkg=require("../package.json");
 assert.equal(manifest.version,pkg.version);
 assert.equal(pkg.dependencies["@ghostery/adblocker"],"2.20.3");
});
test("Build 408: unrelated and HTTP player calls still fail request gate",()=>{
 const req={type:"xmlhttprequest",method:"POST",tabId:7,statusCode:200,
  documentUrl:"https://www.youtube.com/watch?v=ABCDEFGHIJK",url:PLAYER};
 assert.equal(R.eligible(req,"www.youtube.com"),true);
 assert.equal(R.eligible({...req,url:"http://www.youtube.com/youtubei/v1/player"},"www.youtube.com"),false);
 assert.equal(R.eligible({...req,url:"https://youtube.com.evil.test/youtubei/v1/player"},"www.youtube.com"),false);
});
