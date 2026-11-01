"use strict";
const test=require("node:test"),assert=require("node:assert/strict");
const C=require("../src/subscription-cache.js");
test("conditional validators are sent only when a successful list cache exists",()=>{
 assert.deepEqual(C.headers(null),{});
 assert.deepEqual(C.headers({etag:'"abc"'}),{});
 assert.deepEqual(C.headers({text:"list",etag:'W/"a123"'}),{"If-None-Match":'W/"a123"'});
 assert.deepEqual(C.headers({text:"list",lastModified:"Wed, 21 Oct 2015 07:28:00 GMT"}),{"If-Modified-Since":"Wed, 21 Oct 2015 07:28:00 GMT"});
});
test("reject injected cache metadata and invalid dates",()=>{
 assert.equal(C.safeTag('"a"\nInjected: yes'),"");
 assert.equal(C.safeTag("not-a-tag"),"");
 assert.equal(C.safeDate("not-a-date"),"");
 assert.deepEqual(C.headers({text:"list",etag:'"a"\nInjected: yes'}),{});
});
test("304 preserves current working list, increments checked time only",()=>{
 const prev={text:"[Adblock Plus 2.0] cached",updated:123,checked:124,etag:'"abc"'};
 const item=C.store(prev,{unchanged:true,metadata:{etag:'"abc"',lastModified:""}},999);
 assert.equal(item.text,prev.text);
 assert.equal(item.updated,123);
 assert.equal(item.checked,999);
 assert.throws(()=>C.store(null,{unchanged:true,metadata:{}},999),/without a cached/);
});
test("200 accepts new verified list and changes cache metadata",()=>{
 const item=C.store({text:"old",updated:10},{unchanged:false,text:"new",metadata:{etag:'"new"',lastModified:""}},100);
 assert.equal(item.text,"new");
 assert.equal(item.updated,100);
 assert.equal(item.etag,'"new"');
});

test("Build 184 keeps a large previously working list when refresh is implausibly empty",()=>{
 const Guard=require("../src/subscription-update-guard.js");
 const list=n=>"[Adblock Plus 2.0]\n! Title: Example\n"+
  Array.from({length:n},(_,i)=>"||ad"+i+".example^$script").join("\n")+"\n";
 const original={text:list(500)};
 const good=Guard.check(original,list(450));
 assert.equal(good.accept,true);
 assert.equal(good.previousCount,500);
 assert.equal(good.nextCount,450);
 const bad=Guard.check(original,list(10));
 assert.equal(bad.accept,false);
 assert.equal(bad.nextCount,10);
 assert.match(bad.reason,/keeping last working copy/);
 assert.equal(original.text,list(500),"guard never mutates a cached list");
});
test("Build 184 permits new subscriptions and normal rule-list maintenance",()=>{
 const Guard=require("../src/subscription-update-guard.js");
 const list=n=>"[Adblock Plus 2.0]\n! Title: Example\n"+
  Array.from({length:n},(_,i)=>"||ad"+i+".example^$script").join("\n")+"\n";
 assert.equal(Guard.check(null,list(5)).accept,true,"initial install");
 assert.equal(Guard.check({text:list(40)},list(1)).accept,true,
  "small custom subscriptions may legitimately change");
 assert.equal(Guard.check({text:list(200)},list(50)).accept,true,
  "exact threshold is acceptable");
 assert.equal(Guard.check({text:list(200)},list(49)).accept,false);
 assert.equal(Guard.check({text:list(200)},list(120)).accept,true);
 assert.equal(Guard.check({text:list(200)},null).accept,false);
});
test("Build 184 counts filter rules without including names, hosts or private list text",()=>{
 const fs=require("node:fs"),path=require("node:path");
 const Guard=require("../src/subscription-update-guard.js");
 const text="! Title: SECRET\n[Adblock Plus 2.0]\n"+
  "||ads.private.example^\n@@||ads.private.example^$domain=secret.example\n"+
  "secret.example##.ad\n# only-a-comment\n";
 assert.equal(Guard.count(text),3);
 const result=Guard.check({text:("||private.example^\n").repeat(200)},text);
 assert.equal(result.accept,false);
 assert.equal(JSON.stringify(result).includes("private.example"),false);
 assert.equal(JSON.stringify(result).includes("SECRET"),false);
 const background=fs.readFileSync(path.join(__dirname,"../src/background.js"),"utf8");
 assert.equal((background.match(/DKSubscriptionUpdateGuard\.check\(/g)||[]).length,2);
 const manifest=JSON.parse(fs.readFileSync(path.join(__dirname,"../src/manifest.json"),"utf8"));
 assert.ok(manifest.background.scripts.indexOf("subscription-update-guard.js")>=0);
 assert.ok(manifest.background.scripts.indexOf("subscription-update-guard.js")<
  manifest.background.scripts.indexOf("background.js"));
});
