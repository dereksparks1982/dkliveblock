"use strict";
const test=require("node:test"),assert=require("node:assert/strict");
const {matches}=require("../src/procedural.js");
test("text predicates require matching content",()=>{
 assert.equal(matches({textContent:"Sponsored article"},{mode:"text",selector:"div",text:"Sponsored"}),true);
 assert.equal(matches({textContent:"Editorial"},{mode:"text",selector:"div",text:"Sponsored"}),false);
});
test("descendant predicates require a matching element",()=>{
 assert.equal(matches({querySelector:s=>s===".sponsor"?{}:null},{mode:"has",selector:"div",target:".sponsor"}),true);
 assert.equal(matches({querySelector:()=>null},{mode:"has",selector:"div",target:".sponsor"}),false);
});
test("invalid selectors and unsupported actions fail closed",()=>{
 assert.equal(matches({querySelector:()=>{throw Error("invalid CSS")}},{mode:"has",selector:"div",target:"~"}),false);
 assert.equal(matches({textContent:"Sponsored"},{mode:"script",selector:"div",text:"Sponsored"}),false);
 assert.equal(matches(null,{mode:"text",selector:"div",text:"Sponsored"}),false);
});

test("Build 34 normalized aliases cannot run code and preserve matching semantics",()=>{
 const {procedural}=require("../src/rules.js");
 const text=procedural("page.test#?#article:has-text(Sponsored)");
 const child=procedural("page.test#?#article:has(.sponsored)");
 assert.equal(text.mode,"text");
 assert.equal(child.mode,"has");
 assert.equal(matches({textContent:"Sponsored post"},text),true);
 assert.equal(matches({textContent:"Independent article"},text),false);
 assert.equal(matches({querySelector:selector=>selector===".sponsored"?{}:null},child),true);
 assert.equal(matches({querySelector:()=>null},child),false);
});

test("Build 101 quoted literal text uses existing bounded matcher",()=>{
 const {procedural}=require("../src/rules.js");
 const r=procedural('news.example##article:has-text("Sponsored")');
 assert.equal(matches({textContent:"Sponsored editorial note"},r),true);
 assert.equal(matches({textContent:"Editorial note"},r),false);
});

test("Build 102 :contains aliases share literal procedural matching",()=>{
 const {procedural}=require("../src/rules.js");
 const r=procedural("news.example##article:contains(Advert)");
 assert.equal(matches({textContent:"Paid Advert placement"},r),true);
 assert.equal(matches({textContent:"Editorial coverage"},r),false);
});

test("Build 105 bounded literal text matching avoids huge article bodies",()=>{
 const P=require("../src/procedural.js");
 const rule={selector:"article",mode:"text",text:"Sponsored"};
 assert.equal(P.matches({textContent:"Sponsored card"},rule),true);
 assert.equal(P.matches({textContent:"x".repeat(P.MAX_TEXT_CHARS+1)+"Sponsored"},rule),false);
 assert.equal(P.matches({get textContent(){throw Error("unusual page getter");}},rule),false);
 assert.equal(P.matches({textContent:"Sponsored"},{...rule,text:""}),false);
});
