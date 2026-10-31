"use strict";
const test=require("node:test"),assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path");
const Rules=require("../src/rules.js");
const {FilterEngine}=require("../src/engine.js");
const Feed=require("../src/youtube-feed.js");
const Y=require("../src/youtube-response.js");
const manifest=JSON.parse(fs.readFileSync(path.join(__dirname,"../src/manifest.json"),"utf8"));
test("Build 107 Firefox asset order and privacy permission contract",()=>{
 const scripts=manifest.background.scripts;
 assert.ok(scripts.indexOf("youtube-feed.js")>=0);
 assert.ok(scripts.indexOf("youtube-feed.js")<scripts.indexOf("youtube-response.js"));
 const page=manifest.content_scripts.find(c=>c.world==="MAIN");
 assert.deepEqual(page.js,["youtube-feed.js","youtube-page-bridge.js"]);
 assert.ok(page.matches.every(s=>s.includes("youtube")));
 assert.ok(!manifest.permissions.includes("clipboardRead"));
});
test("Build 107 scoped cosmetics preserve exclusions and avoid unsupported syntax",()=>{
 const text="news.example,~pay.news.example##article:contains('Promoted')";
 const e=new FilterEngine(text);
 assert.equal(e.getProcedural("news.example").length,1);
 assert.equal(e.getProcedural("pay.news.example").length,0);
 assert.equal(Rules.cosmetic("news.example##div:matches-css(color:red)"),null);
});
test("Build 107 response limits and immutable YouTube data stay safe",()=>{
 assert.equal(Y.MAX_DELAY_MS,4000);
 assert.ok(Y.MAX_FILTERS<=16&&Y.MAX_PER_TAB<=4);
 const data={contents:Object.freeze([{adSlotRenderer:{id:1}}])};
 assert.equal(Feed.prune(data,"https://www.youtube.com/youtubei/v1/browse").changed,false);
 assert.equal(data.contents.length,1);
 const denied=JSON.stringify({playabilityStatus:{status:"LOGIN_REQUIRED"},
  playerResponse:JSON.stringify({videoDetails:{title:"safe"},adSlots:[{}]})});
 assert.equal(Y.rewrite(denied).text,denied);
});
test("Build 107 harmful nested counted regex stays unsupported",()=>{
 assert.equal(Rules.network("/^(a{1,10}){2,10}$/"),null);
 assert.ok(Rules.network("||ads.example^$script"));
});
