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

test("Build 137 class selectors use the existing bounded procedural matcher",()=>{
 const {procedural}=require("../src/rules.js");
 const rule=procedural("news.example##.ad-card:has-text(Sponsored)");
 assert.equal(rule.selector,".ad-card");
 assert.equal(matches({textContent:"Sponsored link"},rule),true);
 assert.equal(matches({textContent:"Regular news"},rule),false);
});

test("Build 172 matches literal attributes without regex evaluation or page writes",()=>{
 const {procedural}=require("../src/rules.js");
 const rule=procedural("news.example##div.ad:matches-attr(data-ad=promoted)");
 let reads=0;
 const element={getAttribute(name){reads++;return name==="data-ad"?"promoted":null;}};
 assert.equal(matches(element,rule),true);
 assert.equal(reads,1);
 assert.equal(matches({getAttribute:()=>null},rule),false);
 assert.equal(matches({getAttribute:()=>"organic"},rule),false);
 assert.equal(matches({getAttribute:()=>{throw Error("hostile page");}},rule),false);
 assert.equal(matches({getAttribute:()=>"x".repeat(100)},rule),false);
});
test("Build 172 rejects forged attributes or match expressions at runtime",()=>{
 const element={getAttribute:()=>"/^promoted/"};
 const base={selector:"div.ad",mode:"attr",attribute:"data-ad",value:"promoted"};
 assert.equal(matches(element,{...base,attribute:"../private"}),false);
 assert.equal(matches(element,{...base,value:"/^(x+)+/"}),false);
 assert.equal(matches(element,{...base,value:""}),false);
 assert.equal(matches(null,base),false);
});

test("Build 182 literal computed CSS predicates use only safe property values",()=>{
 const {procedural}=require("../src/rules.js");
 const rule=procedural("news.example##.overlay:matches-css(position: fixed)");
 assert.equal(rule.mode,"css");
 assert.equal(rule.property,"position");
 assert.equal(rule.value,"fixed");
 let reads=0;
 const element={ownerDocument:{defaultView:{getComputedStyle(){
  reads++;return {getPropertyValue:p=>p==="position"?"fixed":"none"};}}}};
 assert.equal(matches(element,rule),true);
 assert.equal(reads,1);
 assert.equal(matches(element,{...rule,value:"absolute"}),false);
 assert.equal(matches({ownerDocument:{defaultView:{getComputedStyle(){
  throw Error("hostile page");
 }}}},rule),false);
 assert.equal(matches({},rule),false);
});
test("Build 182 procedural CSS cannot run regexes or enumerate arbitrary properties",()=>{
 const {procedural}=require("../src/rules.js");
 for(const rule of [
  "news.example##.ad:matches-css(background-image:url(https://bad.invalid))",
  "news.example##.ad:matches-css(position:/fixed/)",
  "news.example##.ad:matches-css(opacity:99999)",
  "news.example##.ad:matches-css(z-index:1e9)",
  "##.ad:matches-css(position:fixed)"
 ])assert.equal(procedural(rule),null,rule);
 let calls=0;
 const element={ownerDocument:{defaultView:{getComputedStyle(){
  calls++;return {getPropertyValue:()=> "fixed"};}}}};
 for(const rule of [
  {selector:".ad",mode:"css",property:"background",value:"url(data:x)"},
  {selector:".ad",mode:"css",property:"position",value:"/fixed/"},
  {selector:".ad",mode:"css",property:"__proto__",value:"fixed"}
 ])assert.equal(matches(element,rule),false);
 assert.equal(calls,0);
});
