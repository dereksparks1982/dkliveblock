"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict");
const F=require("../src/youtube-feed.js");
const browse="https://www.youtube.com/youtubei/v1/browse";
const reel="https://www.youtube.com/youtubei/v1/reel_watch_sequence";
test("Build 82 sponsored feed entry filtering leaves organic videos and metadata",()=>{
 const data={contents:[
  {richItemRenderer:{content:{videoRenderer:{videoId:"organic"}}}},
  {richItemRenderer:{content:{adSlotRenderer:{slot:"ad"}}}},
  {itemSectionRenderer:{contents:[
   {videoRenderer:{videoId:"another"}},{promotedVideoRenderer:{adId:"paid"}}]}}
 ],visitorData:"private"};
 const result=F.rewrite(browse,JSON.stringify(data));
 assert.equal(result.changed,true);assert.equal(result.items,2);
 const out=JSON.parse(result.text);
 assert.equal(out.visitorData,"private");
 assert.equal(out.contents.length,2);
 assert.equal(out.contents[0].richItemRenderer.content.videoRenderer.videoId,"organic");
 assert.equal(out.contents[1].itemSectionRenderer.contents.length,1);
});
test("Build 82 Shorts sequence filters only explicitly marked ad entries",()=>{
 const data={entries:[{command:{reelWatchEndpoint:{videoId:"real",adClientParams:{isAd:false}}}},
  {command:{reelWatchEndpoint:{videoId:"ad",adClientParams:{isAd:true}}}},
  {command:{reelWatchEndpoint:{videoId:"another"}}}],playbackTracking:{sig:"signed"}};
 const changed=F.rewrite(reel,JSON.stringify(data));
 assert.equal(changed.items,1);
 const out=JSON.parse(changed.text);
 assert.equal(out.entries.length,2);
 assert.deepEqual(out.playbackTracking,data.playbackTracking);
});
test("Build 82 rejects wrong hosts and unknown endpoint schemas",()=>{
 for(const url of ["https://www.youtube.com/youtubei/v1/player",
 "https://youtube.com.attacker.test/youtubei/v1/browse",
 "https://evil-youtube.com/youtubei/v1/reel_watch_sequence"])
 assert.equal(F.kind(url),"");
 assert.equal(F.rewrite(reel,'{"entries":[{"videoId":"organic"}]}').changed,false);
 assert.equal(F.rewrite(reel,"not json").changed,false);
});
test("Build 82 oversized unknown data produces no partial changes",()=>{
 const obj={contents:[{adSlotRenderer:{ad:1}}],oversized:Array.from({length:F.MAX_ARRAY+1},()=>({}))};
 assert.equal(F.prune(obj,browse).changed,false);
 assert.equal(obj.contents.length,1);
 assert.equal(F.rewrite(browse,"x".repeat(F.MAX_BYTES+1)).changed,false);
});

test("Build 93 fails open when a YouTube JSON object has too many fields",()=>{
 const obj={contents:[{adSlotRenderer:{adId:"paid"}}]};
 for(let i=0;i<F.MAX_KEYS;i++)obj["metadata"+i]={};
 const original=JSON.stringify(obj);
 const outcome=F.prune(obj,browse);
 assert.equal(outcome.changed,false);
 assert.equal(obj.contents.length,1);
 assert.equal(JSON.stringify(obj),original);
});
test("Build 93 will not partly mutate a feed when another targeted array is frozen",()=>{
 const frozen=Object.freeze([{adSlotRenderer:{id:2}}]);
 const data={a:{contents:[{videoRenderer:{id:1}},{adSlotRenderer:{id:1}}]},
  b:{contents:frozen}};
 const result=F.prune(data,browse);
 assert.equal(result.changed,false);
 assert.equal(data.a.contents.length,2,"writable array must also stay unchanged");
 assert.equal(data.b.contents.length,1);
});
test("Build 93 does not modify sealed arrays or new unknown wrapper structures",()=>{
 const items=Object.seal([{adSlotRenderer:{id:1}}]);
 assert.equal(F.prune({contents:items},browse).changed,false);
 assert.equal(items.length,1);
 const normal={contents:[{videoRenderer:{videoId:"safe"}}]};
 assert.equal(F.prune(normal,browse).changed,false);
 assert.equal(normal.contents.length,1);
});

test("Build 108 cannot partially change feeds containing nonconfigurable trailing elements",()=>{
 const entries=[{adSlotRenderer:{id:1}},{videoRenderer:{id:2}},{videoRenderer:{id:3}}];
 Object.defineProperty(entries,"2",{configurable:false,writable:true,value:entries[2]});
 const data={contents:entries,other:{contents:[{adSlotRenderer:{id:4}}]}};
 assert.equal(F.prune(data,browse).changed,false);
 assert.equal(entries.length,3);
 assert.equal(data.other.contents.length,1);
});
test("Build 108 refuses sparse/accessor arrays instead of partially splicing them",()=>{
 const entries=[{adSlotRenderer:{id:1}},{videoRenderer:{id:2}}];
 Object.defineProperty(entries,"1",{configurable:true,get(){return {videoRenderer:{id:2}};}});
 assert.equal(F.prune({contents:entries},browse).changed,false);
 const sparse=[{adSlotRenderer:{id:1}},, {videoRenderer:{id:3}}];
 assert.equal(F.prune({contents:sparse},browse).changed,false);
 assert.equal(sparse.length,3);
});

test("Build 110 declines excessive ad removals without modifying anything",()=>{
 const ad=()=>({adSlotRenderer:{id:1}});
 const data={contents:Array.from({length:F.MAX_REMOVALS+1},ad)};
 const before=data.contents.length;
 const result=F.prune(data,browse);
 assert.equal(result.changed,false);
 assert.equal(data.contents.length,before);
});
test("Build 110 normal modest sponsored feeds remain eligible for filtering",()=>{
 const data={contents:[{videoRenderer:{id:1}},{adSlotRenderer:{id:2}},
  {videoRenderer:{id:3}},{promotedVideoRenderer:{id:4}}]};
 const result=F.prune(data,browse);
 assert.equal(result.changed,true);
 assert.equal(result.items,2);
 assert.equal(data.contents.length,2);
});

test("Build 112 aliased feed arrays remove each ad only once",()=>{
 const shared=[{adSlotRenderer:{id:"ad"}},{videoRenderer:{videoId:"organic"}}];
 const data={left:{contents:shared},right:{contents:shared}};
 const result=F.prune(data,browse);
 assert.equal(result.changed,true);
 assert.equal(result.items,1);
 assert.equal(shared.length,1);
 assert.equal(shared[0].videoRenderer.videoId,"organic");
 assert.equal(data.left.contents,data.right.contents);
});
test("Build 112 independent arrays still remove independent advertised entries",()=>{
 const data={left:{contents:[{adSlotRenderer:{id:"first"}},
  {videoRenderer:{videoId:"organic-1"}}]},
  right:{contents:[{adSlotRenderer:{id:"second"}},
   {videoRenderer:{videoId:"organic-2"}}]}};
 const result=F.prune(data,browse);
 assert.equal(result.changed,true);
 assert.equal(result.items,2);
 assert.equal(data.left.contents[0].videoRenderer.videoId,"organic-1");
 assert.equal(data.right.contents[0].videoRenderer.videoId,"organic-2");
});

test("Build 120 removes additional explicit search and compact ad renderer entries",()=>{
 const url="https://www.youtube.com/youtubei/v1/search";
 const data={contents:[
  {videoRenderer:{videoId:"organic"}},
  {searchPyvRenderer:{ads:[{videoId:"promoted"}]}},
  {compactPromotedVideoRenderer:{videoId:"paid"}},
  {carouselAdRenderer:{carouselId:"ad"}},
  {gridPromotedVideoRenderer:{adSlotId:"grid"}},
  {richSectionRenderer:{content:{compactPromotedItemRenderer:{adId:"sponsor"}}}},
  {richSectionRenderer:{content:{richShelfRenderer:{title:"Editorial"}}}}
 ]};
 const result=F.prune(data,url);
 assert.equal(result.changed,true);
 assert.equal(result.items,5);
 assert.equal(data.contents.length,2);
 assert.equal(data.contents[0].videoRenderer.videoId,"organic");
 assert.ok(data.contents[1].richSectionRenderer.content.richShelfRenderer);
});
test("Build 120 ignores ad-looking field names without an explicit ad renderer object",()=>{
 const data={contents:[
  {videoRenderer:{videoId:"organic"},carouselAdRenderer:"false"},
  {searchPyvRenderer:null},
  {richSectionRenderer:{content:{videoRenderer:{videoId:"editorial"}}}}
 ]};
 const result=F.prune(data,"https://www.youtube.com/youtubei/v1/browse");
 assert.equal(result.changed,false);
 assert.equal(data.contents.length,3);
});

test("Build 121 watch-next recommendations remove ad renderers while retaining organic suggestions",()=>{
 const next="https://www.youtube.com/youtubei/v1/next";
 assert.equal(F.kind(next),"feed");
 assert.equal(F.kind(next+"/other"),"");
 const data={contents:{twoColumnWatchNextResults:{secondaryResults:{secondaryResults:{
  results:[{compactVideoRenderer:{videoId:"organic"}},
   {compactPromotedVideoRenderer:{videoId:"advertisement"}},
   {richItemRenderer:{content:{adSlotRenderer:{id:7}}}},
   {compactVideoRenderer:{videoId:"second"}}]
 }}}},trackingParams:"opaque"};
 // Explicitly supported nested watch-next list is handled in Build 121.
 assert.equal(F.prune(data,next).changed,true);
 assert.equal(data.contents.twoColumnWatchNextResults.secondaryResults.secondaryResults.results.length,2);
 assert.equal(data.contents.twoColumnWatchNextResults.secondaryResults.secondaryResults.results[0].compactVideoRenderer.videoId,"organic");
 assert.equal(data.trackingParams,"opaque");
});

test("Build 122 explicitly traverses watch-next results without losing organic entries",()=>{
 const next="https://www.youtube.com/youtubei/v1/next";
 const payload={contents:{twoColumnWatchNextResults:{secondaryResults:{
  secondaryResults:{results:[{compactVideoRenderer:{videoId:"real-a"}},
  {compactPromotedVideoRenderer:{adId:"sponsored"}},
  {compactVideoRenderer:{videoId:"real-b"}}]}}}},playbackTracking:{token:"opaque"}};
 const out=F.rewrite(next,JSON.stringify(payload));
 assert.equal(out.changed,true);
 assert.equal(out.items,1);
 const nextResults=JSON.parse(out.text).contents.twoColumnWatchNextResults.secondaryResults.secondaryResults.results;
 assert.deepEqual(nextResults.map(x=>x.compactVideoRenderer.videoId),["real-a","real-b"]);
 assert.deepEqual(JSON.parse(out.text).playbackTracking,payload.playbackTracking);
});
test("Build 122 unknown results arrays without explicit ad renderers remain untouched",()=>{
 const next="https://www.youtube.com/youtubei/v1/next";
 const payload={results:[{videoRenderer:{id:1}},{compactVideoRenderer:{id:2}}]};
 assert.equal(F.prune(payload,next).changed,false);
 assert.equal(payload.results.length,2);
});

test("Build 124 playlist API retains ordinary videos and removes only marked sponsors",()=>{
 const url="https://www.youtube.com/youtubei/v1/playlist";
 assert.equal(F.kind(url),"feed");
 const data={contents:{playlistVideoListRenderer:{contents:[
  {playlistVideoRenderer:{videoId:"real-a"}},
  {adSlotRenderer:{adSlotId:"sponsored"}},
  {playlistVideoRenderer:{videoId:"real-b"}}]}},
  visitorData:"private"};
 const changed=F.rewrite(url,JSON.stringify(data));
 assert.equal(changed.changed,true);
 assert.equal(changed.items,1);
 const parsed=JSON.parse(changed.text);
 assert.deepEqual(parsed.contents.playlistVideoListRenderer.contents.map(x=>x.playlistVideoRenderer.videoId),
  ["real-a","real-b"]);
 assert.equal(parsed.visitorData,"private");
});
test("Build 124 unknown playlist-like routes do not receive special filtering",()=>{
 for(const url of ["https://www.youtube.com/youtubei/v1/playlist_hack",
  "https://youtube.com.evil.example/youtubei/v1/playlist"]){
  assert.equal(F.kind(url),"");
 }
});

test("Build 125 refuses to rewrite error or explicitly denied feed and playlist replies",()=>{
 for(const url of ["https://www.youtube.com/youtubei/v1/browse",
   "https://www.youtube.com/youtubei/v1/next",
   "https://www.youtube.com/youtubei/v1/playlist"]){
  for(const status of ["LOGIN_REQUIRED","UNPLAYABLE","ERROR"]){
   const original=JSON.stringify({playabilityStatus:{status,reason:"server refusal"},
    contents:[{adSlotRenderer:{id:1}}]});
   const result=F.rewrite(url,original);
   assert.equal(result.changed,false);
   assert.equal(result.text,original);
  }
  const error=JSON.stringify({error:{code:403,message:"forbidden"},
   contents:[{adSlotRenderer:{id:1}}]});
  assert.equal(F.rewrite(url,error).text,error);
 }
});
test("Build 125 ordinary authorized feed replies still remove known sponsored entries",()=>{
 const original={playabilityStatus:{status:"OK"},
  contents:[{videoRenderer:{videoId:"real"}},{adSlotRenderer:{id:"paid"}}]};
 const out=F.rewrite(browse,JSON.stringify(original));
 assert.equal(out.changed,true);
 assert.equal(JSON.parse(out.text).contents[0].videoRenderer.videoId,"real");
});

test("Build 141 does not invoke page-defined getters while scanning feed objects",()=>{
 let called=0;
 const awkward={contents:[{videoRenderer:{id:1}},{adSlotRenderer:{id:2}}]};
 Object.defineProperty(awkward,"unexpected",{enumerable:true,get(){
  called++;throw Error("must not execute getter");}});
 const result=F.prune(awkward,browse);
 assert.equal(result.changed,false);
 assert.equal(called,0);
 assert.equal(awkward.contents.length,2);
});
test("Build 141 getter-backed Shorts ad marker is never read or executed",()=>{
 let called=0;
 const command={};
 Object.defineProperty(command,"reelWatchEndpoint",{enumerable:true,get(){
  called++;throw Error("getter");}});
 const payload={entries:[{command},{command:{reelWatchEndpoint:{
  videoId:"editorial",adClientParams:{isAd:false}}}}]};
 assert.equal(F.prune(payload,reel).changed,false);
 assert.equal(called,0);
 assert.equal(payload.entries.length,2);
});
test("Build 141 ordinary data-only sponsored entries still disappear",()=>{
 const payload={results:[{compactVideoRenderer:{videoId:"real"}},
  {compactPromotedVideoRenderer:{adId:"ad"}}]};
 const result=F.prune(payload,"https://www.youtube.com/youtubei/v1/next");
 assert.equal(result.changed,true);
 assert.equal(payload.results.length,1);
});
