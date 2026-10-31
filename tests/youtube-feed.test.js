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
