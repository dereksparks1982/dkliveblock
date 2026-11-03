"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict");
const Nesty=require("../src/nesty-intelligence.js");
test("Build 312: only known named signals are retained with stable first-seen order",()=>{
 const r=Nesty.signalsOf(["sponsor_label","fake_private_message","post_boundary","sponsor_label",false,3]);
 assert.deepEqual(r,["sponsor_label","post_boundary"]);assert.equal(Object.isFrozen(r),true);
});
test("Build 312: massive signal arrays are bounded before unexpected tail access",()=>{
 const input=Array.from({length:100000},()=>"junk_123");
 input[1]="sponsor_label";input[159]="post_boundary";input[160]="ad_slot";
 assert.deepEqual(Nesty.signalsOf(input),["sponsor_label","post_boundary"]);
});
test("Build 312: output stays within forty distinct known signals",()=>{
 const items=Array.from({length:300},(_,i)=>i%2?"ad_slot":"post_boundary");
 assert.deepEqual(Nesty.signalsOf(items),["post_boundary","ad_slot"]);
});
test("Build 312: reject invalid shapes and private-looking tokens",()=>{
 for(const x of [null,undefined,{},42,"sponsor_label"])assert.deepEqual(Nesty.signalsOf(x),[]);
 assert.deepEqual(Nesty.signalsOf(["private_message_123","123private","bad-hyphen"]),[]);
});
test("Build 312: Nesty is review-only and does not install network rules",()=>{
 const src=require("node:fs").readFileSync(require("node:path").join(__dirname,"../src/nesty-intelligence.js"),"utf8");
 assert.ok(src.includes('action:"review-only"'));assert.ok(src.includes('automaticRules:false'));
 assert.doesNotMatch(src,/browser\.webRequest\.on|fetch\s*\(/);
 assert.equal(require("../package.json").version,require("../src/manifest.json").version);
});