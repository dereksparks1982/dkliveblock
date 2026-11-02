"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict");
require("../src/public-suffix.js");
require("../src/rules.js");
const {FilterEngine}=require("../src/engine.js");
const fs=require("node:fs"),path=require("node:path");

test("Build 209 an overflowing global list cannot discard site-specific hiding",()=>{
 const generic=Array.from({length:15003},(_,i)=>"##.generic"+i);
 const text=[...generic,"news.example##.local","news.example##.local2"].join("\n");
 const engine=new FilterEngine(text);
 const raw=engine.getSelectors("news.example");
 assert.equal(raw[0],".generic0");
 assert.equal(raw.at(-1),".local2");
 const bounded=engine.getSelectors("news.example",{},15000);
 assert.equal(bounded.length,15000);
 assert.deepEqual(bounded.slice(0,2),[".local",".local2"]);
 assert.equal(bounded.includes(".generic0"),true);
 assert.equal(bounded.includes(".generic15002"),false);
 assert.equal(engine.getSelectors("other.example",{},15000).length,15000);
});
test("Build 209 cosmetic exceptions win before prioritization and limits",()=>{
 const engine=new FilterEngine([
  "##.generic","#@#never","news.example##.local",
  "news.example##.parent","news.example#@#.parent",
  "##.local","news.example#@#.local"
 ].join("\n"));
 assert.deepEqual(engine.getSelectors("news.example"),[".generic"]);
 assert.deepEqual(engine.getSelectors("news.example",{},0),[]);
 assert.deepEqual(engine.getSelectors("news.example",{},1),[".generic"]);
 assert.deepEqual(engine.getSelectors("news.example",{elemhide:true},1),[]);
 assert.deepEqual(engine.getSelectors("news.example",{generichide:true},1),[]);
});
test("Build 209 smaller selector collections retain historical ordering",()=>{
 const engine=new FilterEngine([
  "##.global","example.org##.parent","sub.example.org##.child",
  "##.another"
 ].join("\n"));
 const original=engine.getSelectors("sub.example.org");
 assert.deepEqual(original,[".global",".another",".child",".parent"]);
 assert.deepEqual(engine.getSelectors("sub.example.org",{},15000),original);
 assert.deepEqual(engine.getSelectors("sub.example.org",{},3),
  [".child",".parent",".global"]);
});
test("Build 209 getStyle supplies the cosmetic ceiling without changing the UI",()=>{
 const source=fs.readFileSync(path.join(__dirname,"../src/background.js"),"utf8");
 assert.match(source,/data\.engine\.getSelectors\(h,policy,15000\)/);
 assert.match(source,/\.slice\(0,15000\)\.map\(s=>/);
});
