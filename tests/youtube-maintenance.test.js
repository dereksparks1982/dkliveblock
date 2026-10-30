"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path");
require("../src/rules.js");
require("../src/video-assist.js");
require("../src/auth-protection.js");
require("../src/subscription-cache.js");
const Y=require("../src/youtube-maintenance.js");
const raw=fs.readFileSync(path.join(__dirname,"../filters/youtube.txt"),"utf8");
const make=(version,lines=[
 "youtube.com##ytd-ad-slot-renderer",
 "youtube.com##ytd-promoted-video-renderer",
 "youtube.com##.ytp-ad-overlay-container"
])=>"[Adblock Plus 2.0]\n! DKLB-YouTube-Pack: "+version+"\n"+lines.join("\n")+"\n";
test("public version 1 pack is valid, bounded and data-only",()=>{
 const parsed=Y.validate(raw);
 assert.equal(parsed.version,1);
 assert.equal(Y.status(null,null,0,"",false).remoteEnabled,false);
 assert.ok(parsed.count>=5);
 assert.ok(raw.length<120000);
 assert.match(Y.SOURCE,/^https:\/\/raw\.githubusercontent\.com\/dereksparks1982\/dkliveblock\/main\/filters\/youtube\.txt$/);
});
test("only simple YouTube-specific cosmetic rules are accepted",()=>{
 const malicious=[
  "##.advertisement",
  "news.example##.sponsored",
  "youtube.com##video",
  "youtube.com###movie_player",
  "youtube.com##.g_id_signin",
  "youtube.com##.body",
  "youtube.com##.ad-slot:has(video)",
  "youtube.com#?#div.ad:-abp-contains(Sponsored)",
  "youtube.com##.ad-slot;display:block",
  "youtube.com##script",
  "||googlevideo.com^$media",
  "@@||doubleclick.net^",
  "youtube.com##.ad-slot\n! DKLB-YouTube-Pack: 3",
  "youtube.com##.sponsored-overlay,body"
 ];
 for(const entry of malicious)assert.throws(()=>Y.validate(make(2,[
  "youtube.com##ytd-ad-slot-renderer",
  "youtube.com##ytd-promoted-video-renderer",entry])),Error,entry);
});
test("duplicate selectors and malformed version headers reject the entire pack",()=>{
 assert.throws(()=>Y.validate(make(2,["youtube.com##.ytp-ad-overlay-container","youtube.com##.ytp-ad-overlay-container","youtube.com##ytd-ad-slot-renderer"])),/Duplicate/);
 assert.throws(()=>Y.validate(raw.replace("DKLB-YouTube-Pack: 1","DKLB-YouTube-Pack: 0")),/version/);
 assert.throws(()=>Y.validate(raw.replace("DKLB-YouTube-Pack: 1","DKLB-YouTube-Pack: 2\n! DKLB-YouTube-Pack: 3")),/version/);
 assert.throws(()=>Y.validate("<!doctype html>"+raw),/header/);
});
test("cache restoration validates content and metadata independently",()=>{
 const good={version:1,text:raw,updated:9,checked:10,etag:'"v1"'};
 assert.equal(Y.restore(good).version,1);
 assert.equal(Y.restore({...good,version:2}),null);
 assert.equal(Y.restore({...good,text:"bad"}),null);
 assert.equal(Y.restore(null),null);
});
test("updates must increment version; bad or rolled-back versions cannot reactivate",()=>{
 const one=Y.validate(raw),two=Y.validate(raw.replace("DKLB-YouTube-Pack: 1","DKLB-YouTube-Pack: 2"));
 assert.equal(Y.transition(one,one.text).changed,false);
 assert.equal(Y.transition(one,two.text).changed,true);
 assert.throws(()=>Y.transition(two,one.text),/downgrade/);
 assert.throws(()=>Y.transition(one,one.text.replace("ytd-ad-slot-renderer","ytd-promoted-ad-renderer")),/without a new version/);
 assert.throws(()=>Y.transition(null,two.text,2),/rolled back/);
 const three=two.text.replace("DKLB-YouTube-Pack: 2","DKLB-YouTube-Pack: 3");
 assert.equal(Y.transition(one,three,2).changed,true);
});
test("safe pack rules avoid every media/player and login-control CSS target",()=>{
 const parsed=Y.validate(raw);
 for(const line of parsed.text.split("\n").filter(x=>x.startsWith("youtube"))){
  const selector=line.split("##")[1];
  assert.ok(!["video","audio","body","#movie_player",".g_id_signin"].includes(selector));
 }
});
