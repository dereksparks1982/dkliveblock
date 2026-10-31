"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path");
const R=require("../src/rules.js"),Engine=require("../src/engine.js").FilterEngine;
const Redirect=require("../src/redirect-resources.js");
test("Build 76 parse only vetted inert replacements with exact resource type",()=>{
 const one=R.network("||ads.example^$script,redirect=noop.js");
 const two=R.network("||ads.example^$stylesheet,redirect=empty.css");
 assert.equal(one.redirect,"noop.js");assert.equal(two.redirect,"empty.css");
 for(const rule of ["||ads.example^$redirect=noop.js",
  "||ads.example^$image,redirect=noop.js",
  "||ads.example^$media,redirect=empty.css",
  "*$script,redirect=noop.js",
  "||ads.example^$script,redirect=https://evil.test/x.js",
  "||ads.example^$script,redirect=../secret.js",
  "@@||ads.example^$script,redirect=noop.js",
  "||ads.example^$script,redirect=noop.js,redirect=empty.css",
  "||ads.example^$script,~image,redirect=noop.js"])
  assert.equal(R.network(rule),null,rule);
});
test("Build 76 redirect match respects exceptions, important and source-site scope",()=>{
 const f=new Engine("||ads.example^$script,redirect=noop.js,domain=publisher.example\n"+
  "@@||ads.example/keep^$script");
 const blocked=f.checkRequest("https://ads.example/pixel.js","script","publisher.example");
 assert.equal(blocked.block,true);assert.equal(blocked.rule.redirect,"noop.js");
 assert.equal(f.checkRequest("https://ads.example/pixel.js","script","other.example").block,false);
 assert.equal(f.checkRequest("https://ads.example/pixel.png","image","publisher.example").block,false);
 assert.equal(f.checkRequest("https://ads.example/keep?a=1","script","publisher.example").block,false);
 const priority=new Engine("||ads.example^$script,redirect=noop.js,important\n@@||ads.example^$script");
 assert.equal(priority.checkRequest("https://ads.example/x","script","publisher.example").rule.redirect,"noop.js");
});
test("Build 76 output is extension-local only, no data/JS URLs, no media substitutions",()=>{
 const runtime={getURL:p=>"moz-extension://a1b2c3/"+p};
 const rule=R.network("||ads.example^$script,redirect=noop.js");
 assert.equal(Redirect.path(rule,"script"),"redirect/noop.js");
 assert.equal(Redirect.url(rule,"script",runtime),"moz-extension://a1b2c3/redirect/noop.js");
 assert.equal(Redirect.url(rule,"media",runtime),"");
 assert.equal(Redirect.url(rule,"script",{getURL:()=> "https://evil.test/"}),"");
 const manifest=JSON.parse(fs.readFileSync(path.resolve(__dirname,"../src/manifest.json"),"utf8"));
 assert.deepEqual(manifest.web_accessible_resources,["redirect/noop.js","redirect/empty.css"]);
 assert.ok(manifest.background.scripts.indexOf("redirect-resources.js")<manifest.background.scripts.indexOf("background.js"));
 for(const file of manifest.web_accessible_resources){
  const source=fs.readFileSync(path.resolve(__dirname,"../src",file),"utf8");
  assert.doesNotMatch(source,/\bfetch\s*\(|XMLHttpRequest|eval\s*\(/);
  assert.ok(source.length<256);
 }
});
