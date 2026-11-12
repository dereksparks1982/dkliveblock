"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict");
const G=require("../src/ghostery-cosmetics.js");
test("Build 397: aggregate CSS work cap preserves early safe rules, drops late output",()=>{
 const oversized=".invalid {color:"+"x".repeat(210000)+";}";
 const result=G.sanitize([".sponsor {display:none!important;}",...Array(12).fill(oversized),
  ".late-ad {display:none!important;}"]);
 assert.match(result,/sponsor/);assert.doesNotMatch(result,/late-ad|invalid/);
});
test("Build 397: block scan budget stops overly fragmented CSS",()=>{
 const fragments=Array(5000).fill(".x{opacity:1;}").join("");
 assert.equal(G.sanitize([fragments,".late {display:none!important;}"]),"");
});
test("Build 397: existing quoted comma selectors still work in multiple chunks",()=>{
 const css=G.sanitize([".a {display:none!important;}",
  '[data-kind="promo,slot"],.b {display:none!important;}']);
 assert.match(css,/\.a/);assert.match(css,/promo,slot/);assert.match(css,/\.b/);
});
test("Build 397: streaming and native site allows remain authoritative",()=>{
 let called=0;const vendor={getCosmeticsFilters(){called++;return {active:true,styles:".ad {display:none!important;}"}}};
 assert.equal(G.styles(vendor,"www.youtube.com",{streaming:true}),"");
 assert.equal(G.styles(vendor,"news.example",{policy:{document:true}}),"");
 assert.equal(G.styles(vendor,"news.example",{policy:{elemhide:true}}),"");
 assert.equal(called,0);
});
