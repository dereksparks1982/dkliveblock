"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path");
const G=require("../src/ghostery-cosmetics.js");
test("Build 392: robust selector groups keep quoted commas as one selector",()=>{
 assert.deepEqual(G.selectorList('.ad,[data-kind="promo,slot"],#sponsored'),
  ['.ad','[data-kind="promo,slot"]','#sponsored']);
 assert.match(G.sanitize('[data-kind="promo,slot"],.ad {display:none!important;}'),/promo,slot/);
 assert.match(G.sanitize('[data-kind="promo,slot"],.ad {display:none!important;}'),/\.ad/);
});
test("Build 392: fail closed on malformed selectors without hiding adjacent content",()=>{
 for(const group of ['.ad,[kind="broken', '.ad,[kind=promo,bad]',
  '.ad,,.other', '.ad,[data-x="bad\\value"]', '.ad,:has(.article)',
  '.ad,[name="bad"],[nested[x]=y]']){
  const css=G.sanitize(group+' {display:none!important;}');
  if(group.includes(':has('))assert.doesNotMatch(css,/:has/);
  else assert.equal(css,'',group);
 }
});
test("Build 392: scripts and protected media never leave the cosmetic bridge",()=>{
 const vendor={getCosmeticsFilters:()=>({active:true,
  styles:'[data-kind="promo,slot"],video,#movie_player {display:none!important;}',
  scripts:['window.evil=1;']})};
 const css=G.styles(vendor,"news.example",{page:"https://news.example/page"});
 assert.match(css,/promo,slot/);assert.doesNotMatch(css,/video|movie_player|evil/);
 assert.equal(G.styles(vendor,"www.youtube.com",{streaming:true}),"");
});
test("Build 392: protected host and native elemhide exceptions remain final",()=>{
 let calls=0;const vendor={getCosmeticsFilters:()=>{calls++;return {active:true,styles:'.ad {display:none!important;}'};}};
 assert.equal(G.styles(vendor,"news.example",{policy:{elemhide:true}}),"");
 assert.equal(G.styles(vendor,"news.example",{policy:{document:true}}),"");
 assert.equal(G.styles(vendor,"news.example",{protectSelector:s=>s===".ad"}),"");
 assert.equal(calls,1);
});
test("Build 392: MPL and MIT file notices remain independent",()=>{
 const src=p=>fs.readFileSync(path.join(__dirname,"..",p),"utf8");
 assert.match(src("src/LICENSE-GHOSTERY.txt"),/Mozilla Public License Version 2.0/);
 assert.match(src("src/vendor/LICENSE-FACEBOOK-SPONSORED-MIT.txt"),/MIT License/);
 assert.match(src("docs/GHOSTERY_INTEGRATION.md"),/DK's own source/);
});
