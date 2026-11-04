"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict");
const FB=require("../src/facebook-ads.js"),fs=require("node:fs"),path=require("node:path");
function fixture(editor){
 const grid={children:Array.from({length:6},()=>({querySelector:s=>s.includes("/marketplace/item/")?{}:null}))};
 const item={nodeType:1,style:{setProperty(){}},getClientRects:()=>[{}],
  getBoundingClientRect:()=>({width:250,height:250}),
  querySelectorAll:s=>s.includes("/marketplace/item/")?[{}]:[],
  querySelector:s=>s.includes('contenteditable="true"')?(editor?{}:null):null,
  parentElement:grid};
 return {item,doc:{body:{},documentElement:{}}};
}
test("Build 342: Marketplace tile containing an editor is protected",()=>{
 const f=fixture(true);assert.equal(FB.marketplaceTileFrom(f.item,f.doc),null);
});
test("Build 342: ordinary Marketplace listing remains candidate for exact signal",()=>{
 const f=fixture(false);assert.equal(FB.marketplaceTileFrom(f.item,f.doc),f.item);
});
test("Build 342: mobile post cannot hide a writing editor",()=>{
 const s=fs.readFileSync(path.join(__dirname,"../src/facebook-ads.js"),"utf8");
 const block=s.slice(s.indexOf("function mobilePostFrom"),s.indexOf("function railSection"));
 assert.ok(block.includes('input:not([type="hidden"])'));
 assert.ok(block.includes('[contenteditable="true"]'));
});
test("Build 342: all three Facebook card/tile surfaces protect editor descendants",()=>{
 const src=fs.readFileSync(path.join(__dirname,"../src/facebook-ads.js"),"utf8");
 const token='[contenteditable="true"],[role="textbox"],[role="searchbox"],textarea,input:not([type="hidden"])';
 assert.ok(src.split(token).length>=4);
});
test("Build 342: post-339 regression is version-independent",()=>{
 const src=fs.readFileSync(path.join(__dirname,"facebook-priority-tail-build339.test.js"),"utf8");
 assert.doesNotMatch(src,/assert\.equal\(p\.version,"0\.3\.\d+"\)/);
 assert.equal(require("../src/manifest.json").version,require("../package.json").version);
});
