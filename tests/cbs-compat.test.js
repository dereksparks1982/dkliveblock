"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path");
const CBS=require("../src/cbs-compat.js");
const video=require("../src/video-assist.js");
const bg=fs.readFileSync(path.join(__dirname,"../src/background.js"),"utf8");
test("Build 229: only CBS News player config host is exempt",()=>{
 const good={url:"https://doppler-config.cbsivideo.com/player.js",type:"script"};
 assert.equal(CBS.playerConfig(good,"www.cbsnews.com"),true);
 assert.equal(CBS.playerConfig({...good,type:"xmlhttprequest"},"cbsnews.com"),true);
 for(const url of ["https://imasdk.googleapis.com/sdk.js","https://pubads.g.doubleclick.net/ad",
  "https://doppler-config.cbsivideo.com.evil.com/x","http://doppler-config.cbsivideo.com/x"]){
  assert.equal(CBS.playerConfig({...good,url},"www.cbsnews.com"),false,url);
 }
 assert.equal(CBS.playerConfig(good,"youtube.com"),false);
 assert.equal(CBS.playerConfig({...good,type:"media"},"www.cbsnews.com"),false);
 assert.ok(bg.indexOf("DKAllowedActivity.matches")<bg.indexOf("DKCBSCompat.playerConfig"));
 assert.ok(bg.indexOf("DKCBSCompat.playerConfig")<bg.indexOf("data.engine.checkRequest"));
});
test("Build 229: old CBS picker rules automatically removed, ad rules preserved",()=>{
 const input="||doubleclick.net^\nwww.cbsnews.com##.jwplayer\nexample.com##.test\ncbsnews.com##.video-player\nwww.cbsnews.com#@#.okay";
 const fixed=CBS.clearLegacyCBS(input);
 assert.equal(fixed.removed,2);
 assert.equal(fixed.text,"||doubleclick.net^\nexample.com##.test\nwww.cbsnews.com#@#.okay");
 assert.equal(CBS.clearLegacyCBS(fixed.text).removed,0);
 assert.match(bg,/DKCBSCompat\.clearLegacyCBS/);
});
test("Build 229: CBS recognized video player containers survive cosmetic filtering",()=>{
 assert.equal(video.protectCBSSelector(".jwplayer","www.cbsnews.com"),true);
 assert.equal(video.protectCBSSelector(".video-player","www.cbsnews.com"),true);
 assert.equal(video.protectCBSSelector(".video-player","youtube.com"),false);
 assert.deepEqual(video.safeCosmetics([".ad",".video-player",".jwplayer"],"www.cbsnews.com"),[".ad"]);
 assert.deepEqual(video.safeCosmetics([".ad",".video-player"],"example.com"),[".ad",".video-player"]);
});
test("Build 229: CBS homepage and article must wait for Play",()=>{
 assert.equal(CBS.autoplayProtection("https://www.cbsnews.com/"),true);
 assert.equal(CBS.autoplayProtection("https://www.cbsnews.com/?news=top"),true);
 assert.equal(CBS.autoplayProtection("https://www.cbsnews.com/news/story-slug"),true);
 assert.equal(CBS.autoplayProtection("https://www.cbsnews.com/live/"),false);
 assert.equal(CBS.autoplayProtection("https://www.youtube.com/news/story"),false);
 assert.equal(CBS.autoplayProtection("http://www.cbsnews.com/"),false);
 assert.ok(bg.includes("DKCBSCompat.autoplayProtection(sender.tab?.url"));
});
test("Build 229: existing CBS article autoplay guard remains scoped",()=>{
 assert.ok(bg.includes("cbsAutoplay:active&&"));
 const manifest=JSON.parse(fs.readFileSync(path.join(__dirname,"../src/manifest.json"),"utf8"));
 assert.equal(manifest.version,"0.3.199");
 assert.ok(manifest.background.scripts.indexOf("cbs-compat.js")<manifest.background.scripts.indexOf("background.js"));
});
