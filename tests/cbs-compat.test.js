"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path");
const C=require("../src/cbs-compat.js"),V=require("../src/video-assist.js");
const bg=fs.readFileSync(path.join(__dirname,"../src/background.js"),"utf8");
const p=(url,type="script",site="www.cbsnews.com")=>C.playerConfig({url,type},site);
test("Build 231 exact CBS bootstrap dependencies survive ordinary subscriptions",()=>{
 for(const url of ["https://tealium.cbsnews.com/site/prod/utag.js",
  "https://imasdk.googleapis.com/js/sdkloader/ima3_dai.js",
  "https://imasdk.googleapis.com/js/sdkloader/ima3_dai_debug.js",
  "https://doppler-config.cbsivideo.com/player.js"])
  assert.equal(p(url),true,url);
 assert.equal(p("https://doppler-config.cbsivideo.com/data","xmlhttprequest"),true);
});
test("Build 231 unrelated advertising, script names and sites stay blocked",()=>{
 for(const url of ["https://imasdk.googleapis.com/js/sdkloader/ima3.js",
  "https://imasdk.googleapis.com/js/sdkloader/ima3_debug.js",
  "https://pubads.g.doubleclick.net/ad","https://tealium.cbsnews.com/other.js",
  "https://tealium.cbsnews.com/site/prod/utag.js.evil",
  "https://tealium.cbsnews.com.evil.invalid/site/prod/utag.js",
  "http://tealium.cbsnews.com/site/prod/utag.js",
  "https://user:pass@tealium.cbsnews.com/site/prod/utag.js",
  "https://tealium.cbsnews.com:8443/site/prod/utag.js"])
  assert.equal(p(url),false,url);
 assert.equal(p("https://tealium.cbsnews.com/site/prod/utag.js","xmlhttprequest"),false);
 assert.equal(p("https://imasdk.googleapis.com/js/sdkloader/ima3_dai.js","media"),false);
 assert.equal(p("https://tealium.cbsnews.com/site/prod/utag.js","script","youtube.com"),false);
 assert.equal(p("https://tealium.cbsnews.com/site/prod/utag.js","script","www.cbsnews.com.evil.invalid"),false);
 assert.ok(bg.indexOf("DKAllowedActivity.matches")<bg.indexOf("DKCBSCompat.playerConfig"));
 assert.ok(bg.indexOf("DKCBSCompat.playerConfig")<bg.indexOf("data.engine.checkRequest"));
});
test("Build 231 player CSS selectors protect JW video controls, not ad boxes",()=>{
 for(const selector of [".jwplayer",".jw-controls",".jw-display", ".jw-icon-playback",
  ".jw-wrapper", ".vjs-big-play-button"])
  assert.equal(V.protectCBSSelector(selector,"www.cbsnews.com"),true,selector);
 assert.equal(V.protectCBSSelector(".jw-controls","player.cbsivideo.com"),true);
 assert.equal(V.protectCBSSelector(".jw-controls","youtube.com"),false);
 assert.deepEqual(V.safeCosmetics([".ad",".jw-controls",".video-player"],"www.cbsnews.com"),[".ad"]);
 assert.deepEqual(V.safeCosmetics([".ad",".jw-controls"],"player.cbsivideo.com"),[".ad"]);
 assert.deepEqual(V.safeCosmetics([".ad",".jw-controls"],"example.com"),[".ad",".jw-controls"]);
});
test("Build 229 old CBS manual picker cleanup leaves unrelated filters intact",()=>{
 const input="||doubleclick.net^\nwww.cbsnews.com##.jwplayer\nexample.com##.test\ncbsnews.com##.video-player\nwww.cbsnews.com#@#.okay";
 const changed=C.clearLegacyCBS(input);
 assert.equal(changed.removed,2);
 assert.equal(changed.text,"||doubleclick.net^\nexample.com##.test\nwww.cbsnews.com#@#.okay");
 assert.equal(C.clearLegacyCBS(changed.text).removed,0);
});
test("Build 231 popup request buttons have identical constrained dimensions",()=>{
 const css=fs.readFileSync(path.join(__dirname,"../src/style.css"),"utf8");
 assert.match(css,/\.popup #viewBlocked,\.popup #viewAllowed\s*\{/);
 assert.match(css,/width:101px;min-width:101px;height:34px/);
 const html=fs.readFileSync(path.join(__dirname,"../src/popup.html"),"utf8");
 assert.match(html,/id="viewBlocked"/);assert.match(html,/id="viewAllowed"/);
});
