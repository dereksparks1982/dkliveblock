"use strict";
const {test}=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const vm=require("node:vm");

function engineFor(lines) {
  const sourceRoot=path.resolve(__dirname,"../src");
  const context=vm.createContext({URL,console,TextEncoder,TextDecoder});
  for(const name of ["rules.js","engine.js"])
    vm.runInContext(fs.readFileSync(path.join(sourceRoot,name),"utf8"),context,{filename:name,timeout:1500});
  return new context.DKFilter.FilterEngine(lines);
}
function seed(){
 const text=fs.readFileSync(path.resolve(__dirname,"../src/background.js"),"utf8");
 const line=text.split("\n").find(x=>x.startsWith("const SEED="));
 assert.ok(line,"built-in seed must remain present in background.js");
 return vm.runInNewContext(line.slice("const SEED=".length,-1),{},{timeout:1500});
}
const promoted="https://n2j9y0x0.bxcdn.net/library/example-promo.mp4";
const contentMp4="https://mp4-cdn77.xnxx-cdn.com/files/regular-video.mp4";
const contentHls="https://hls-cdn77.xnxx-cdn.com/media/master.m3u8";
const thumb="https://thumb-cdn77.xnxx-cdn.com/assets/thumbnail.jpg";

test("Build 222 source-scoped ad video media is blocked while genuine media origins stay usable",()=>{
 const rules=seed();
 assert.ok(rules.includes("||n2j9y0x0.bxcdn.net^$media,domain=xnxx.com"),"seed includes narrowly scoped preroll host");
 const engine=engineFor(rules);
 assert.equal(engine.shouldBlock(promoted,"media","www.xnxx.com"),true);
 assert.equal(engine.shouldBlock(promoted,"media","xnxx.com"),true);
 assert.equal(engine.shouldBlock(promoted,"media","example.com"),false,"other sites remain unaffected");
 assert.equal(engine.shouldBlock(promoted,"image","www.xnxx.com"),false,"other resource types stay untouched");
 assert.equal(engine.shouldBlock(promoted,"xmlhttprequest","www.xnxx.com"),false,"only video delivery is targeted");
 assert.equal(engine.shouldBlock(contentMp4,"media","www.xnxx.com"),false,"first-party video delivery still works");
 assert.equal(engine.shouldBlock(contentHls,"xmlhttprequest","www.xnxx.com"),false,"first-party HLS XHR still works");
 assert.equal(engine.shouldBlock(thumb,"image","www.xnxx.com"),false,"thumbnails remain available");
});
test("Build 222 normal filter exceptions and unrelated hosts are respected",()=>{
 const rules=seed();
 const engine=engineFor(rules+"\n@@||n2j9y0x0.bxcdn.net^$media,domain=xnxx.com");
 assert.equal(engine.shouldBlock(promoted,"media","www.xnxx.com"),false,"ordinary exception can reverse the block");
 const plain=engineFor(rules);
 assert.equal(plain.shouldBlock("https://another.bxcdn.net/media/test.mp4","media","www.xnxx.com"),false,"do not block the entire CDN");
 assert.equal(plain.shouldBlock("https://n2j9y0x0.bxcdn.net.evil.example/media/test.mp4","media","www.xnxx.com"),false,"host spoofing cannot match");
 assert.equal(plain.shouldBlock("https://n2j9y0x0.bxcdn.net/media/test.mp4","media","xnxx.com.evil.example"),false,"source site cannot be spoofed");
});
