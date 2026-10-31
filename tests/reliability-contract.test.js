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

test("Build 130 bundled YouTube pack and offline cosmetic fallback remain ad-only",()=>{
 const pack=fs.readFileSync(path.join(__dirname,"../filters/youtube.txt"),"utf8");
 const background=fs.readFileSync(path.join(__dirname,"../src/background.js"),"utf8");
 assert.match(pack,/! DKLB-YouTube-Pack: 3/);
 for(const selector of ["ytd-search-pyv-renderer","ytm-display-ad-renderer"])
  assert.ok(pack.includes("youtube.com##"+selector));
 for(const token of ['"##amp-ad"','"##amp-auto-ads"',
  '"youtube.com##ytd-display-ad-renderer"'])assert.ok(background.includes(token),token);
 assert.doesNotMatch(pack,/^.*##video(?:$|\s)/m);
});
test("Build 130 signed URLs and tracking callbacks remain untouched",()=>{
 const engine=new FilterEngine("*$removeparam=utm_*\n*$removeparam=clickid");
 assert.equal(engine.cleanNavigation("https://shop.example/order?utm_source=ad&signature=secret"),null);
 assert.equal(engine.cleanNavigation("https://login.example/callback?clickid=1&state=secret"),null);
 assert.equal(engine.cleanNavigation("https://shop.example/product?utm_source=ad&sku=5"),
  "https://shop.example/product?sku=5");
});
test("Build 130 watch-next and playlist routes preserve refusal evidence",()=>{
 for(const endpoint of ["next","playlist"]){
  const url="https://www.youtube.com/youtubei/v1/"+endpoint;
  assert.equal(Feed.kind(url),"feed");
  const denied=JSON.stringify({playabilityStatus:{status:"UNPLAYABLE"},
   contents:[{adSlotRenderer:{id:1}}]});
  assert.equal(Feed.rewrite(url,denied).text,denied);
  const valid=Feed.rewrite(url,JSON.stringify({results:[
   {videoRenderer:{id:1}},{adSlotRenderer:{id:2}}]}));
  assert.equal(valid.changed,true);
  assert.equal(JSON.parse(valid.text).results.length,1);
 }
});
test("Build 130 AMP and labelled ad containers remain explicit, not editorial",()=>{
 const A=require("../src/ad-recognition.js");
 assert.equal(A.hasStrongSignal({localName:"amp-ad"}),true);
 assert.equal(A.hasStrongSignal({localName:"amp-story"}),false);
 const ads={localName:"div",getAttribute:k=>k==="aria-label"?"Paid advertisement":null};
 const normal={localName:"article",getAttribute:k=>k==="aria-label"?"Sponsored article":null};
 assert.equal(A.hasStrongSignal(ads),true);
 assert.equal(A.hasStrongSignal(normal),false);
});
test("Build 130 YouTube response diagnostics cover all five endpoint categories",()=>{
 for(const kind of ["player","feed","next","playlist","shorts"])
  assert.ok(Object.prototype.hasOwnProperty.call(Y.stats(733).byKind,kind));
 assert.ok(Y.MAX_FILTERS<=16);
 assert.ok(Y.MAX_PER_TAB<=4);
});

test("Build 131 signed query preservation is enforced before either cleanup layer",()=>{
 const Privacy=require("../src/privacy.js");
 for(const key of ["utm_signature","UTM_NONCE","X-Goog-Algorithm"]){
  const link="https://cdn.example/file?utm_campaign=social&"+key+"=opaque";
  assert.equal(Privacy.preserveNavigation(link),true);
  assert.equal(Privacy.stripTrackingParameters(link),null);
 }
});

test("Build 132 browser privacy cleaner does not rewrite OAuth fragment redirects",()=>{
 const P=require("../src/privacy.js");
 const original="https://login.example/callback?utm_source=ad#access_token=opaque";
 assert.equal(P.preserveNavigation(original),true);
 assert.equal(P.stripTrackingParameters(original),null);
});

test("Build 145 custom UTM marketing fields are cleaned without touching signed links",()=>{
 const Privacy=require("../src/privacy.js");
 assert.equal(Privacy.stripTrackingParameters("https://news.example/?UTM_Custom_Channel=ad&article=3"),
  "https://news.example/?article=3");
 assert.equal(Privacy.stripTrackingParameters("https://cdn.example/?UTM_Custom_Channel=ad&utm_nonce=opaque"),null);
});

test("Build 147 common paid-click IDs are removed only on ordinary navigation",()=>{
 const P=require("../src/privacy.js");
 assert.equal(P.stripTrackingParameters("https://news.example/?srsltid=paid&article=5"),
  "https://news.example/?article=5");
 assert.equal(P.stripTrackingParameters("https://files.example/?srsltid=paid&X-Amz-Signature=opaque"),null);
});

test("Build 150 class/ID procedural rules remain site-limited and reversible",()=>{
 const f=new FilterEngine("news.example##.sponsor-card:has-text(Sponsored)"+
  "\nnews.example#?##banner:has(.paid-badge)"+
  "\nnews.example#@?#banner:has(.paid-badge)");
 assert.deepEqual(f.getProcedural("news.example"),[
  {selector:".sponsor-card",mode:"text",text:"Sponsored"}]);
 assert.deepEqual(f.getProcedural("unrelated.example"),[]);
 assert.equal(Rules.procedural("news.example##.:has-text(Sponsored)"),null);
});
test("Build 150 feed scanner never invokes getters and preserves refused next replies",()=>{
 const url="https://www.youtube.com/youtubei/v1/next";
 let accessed=0;
 const data={results:[{videoRenderer:{videoId:"real"}},
  {compactPromotedVideoRenderer:{id:1}}]};
 Object.defineProperty(data,"suspicious",{enumerable:true,get(){accessed++;throw Error("getter");}});
 assert.equal(Feed.prune(data,url).changed,false);
 assert.equal(accessed,0);
 assert.equal(data.results.length,2);
 const refusal=JSON.stringify({playabilityStatus:{status:"LOGIN_REQUIRED"},
  results:[{compactPromotedVideoRenderer:{id:1}}]});
 assert.equal(Feed.rewrite(url,refusal).text,refusal);
});
test("Build 150 first-run ad-slot recognition includes Google inventory path frames",()=>{
 const A=require("../src/ad-recognition.js");
 assert.equal(A.hasStrongSignal({localName:"iframe",id:"google_ads_iframe_/12345/news_0"}),true);
 const legit={localName:"iframe",id:"video_player_frame"};
 assert.equal(A.hasStrongSignal(legit),false);
 const slot={localName:"div",hasAttribute:k=>k==="data-google-query-id",
  getAttribute:()=>null};
 assert.equal(A.hasStrongSignal(slot),true);
});
test("Build 150 query privacy leaves signed links and rejects unsupported cleanup rules",()=>{
 const Privacy=require("../src/privacy.js");
 assert.equal(Privacy.stripTrackingParameters("https://news.example/?twclid=a&utm_custom_channel=b&article=9"),
  "https://news.example/?article=9");
 assert.equal(Privacy.stripTrackingParameters(
  "https://login.example/callback?utm_campaign=paid#access_token=secret"),null);
 assert.equal(Rules.network("*$removeparam=utm_source,script"),null);
 assert.equal(Rules.network("*$removeparam=utm_source,to=other.example"),null);
});
test("Build 150 YouTube JSON stream guard declines ambiguous charsets",()=>{
 const request={responseHeaders:[{name:"Content-Type",
  value:"application/json; charset=utf-8; charset=windows-1252"}]};
 assert.equal(Y.safeHeaders(request),false);
 assert.equal(Y.safeHeaders({responseHeaders:[{name:"Content-Type",
  value:"application/json; charset=utf-8"}]}),true);
 assert.ok(Y.MAX_DELAY_MS<=4000);
 assert.ok(Y.MAX_FILTERS<=16);
});
