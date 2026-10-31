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
