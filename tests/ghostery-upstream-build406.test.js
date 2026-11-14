"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict");
require("../src/ghostery-dom.js");
const G=require("../src/ghostery-cosmetics.js");
function fakeVendor(){
 const calls=[];
 return {calls,getCosmeticsFilters(o){
  calls.push(o);
  return {active:true,styles:o.getRulesFromDOM?
   ".dynamic-ad{display:none!important;}":".base-ad{display:none!important;}",
   scripts:["dangerous-remote-code()"]};
 }};
}
test("Build 406: upstream CSS-only request explicitly turns off scriptlets",()=>{
 const v=fakeVendor(),css=G.styles(v,"news.example",
  {domSignals:{classes:["dynamic-ad"],ids:["ad-cell"]}});
 assert.equal(v.calls.length,2);
 for(const req of v.calls){
  assert.equal(req.getInjectionRules,false);
  assert.equal(req.getExtendedRules,false);
  assert.equal(req.getBaseRules,req.getRulesFromDOM?false:true);
  assert.equal(req.getRulesFromDOM,!req.getRulesFromHostname);
 }
 assert.match(css,/base-ad/);assert.match(css,/dynamic-ad/);
 assert.doesNotMatch(css,/dangerous/);
});
test("Build 406: native generic-hide exception cannot be undone by dynamic vendor CSS",()=>{
 const v=fakeVendor(),css=G.styles(v,"news.example",{
  policy:{generichide:true},domSignals:{classes:["dynamic-ad"]}});
 assert.equal(v.calls.length,1,"No dynamic call while generic hiding is disabled");
 assert.equal(v.calls[0].getBaseRules,false);
 assert.match(css,/base-ad/,"The vendor's named host CSS may still be safe");
 assert.doesNotMatch(css,/dynamic-ad/);
});
test("Build 406: empty/malformed DOM signals never invoke a second upstream call",()=>{
 const v=fakeVendor();
 G.styles(v,"news.example",{domSignals:{classes:["auth-token"],ids:[]}});
 assert.equal(v.calls.length,1);
});
test("Build 406: page document and elemhide exceptions short circuit all passes",()=>{
 for(const policy of [{document:true},{elemhide:true}]){
  const v=fakeVendor();
  assert.equal(G.styles(v,"news.example",{domSignals:{classes:["dynamic-ad"]},policy}),"");
  assert.equal(v.calls.length,0);
 }
});
test("Build 406: player and sign-in elements remain excluded after upstream filtering",()=>{
 const vendor={getCosmeticsFilters:o=>({active:true,
  styles:o.getRulesFromDOM?
   ".video-player,.login-form,.advertisement{display:none!important;}":
   ".player-overlay,.sponsored-label{display:none!important;}",
  scripts:["ignored()"]})};
 const css=G.styles(vendor,"news.example",{domSignals:{classes:["advertisement"]},
  protectSelector:s=>s===".sponsored-label"});
 assert.match(css,/\.advertisement/);
 assert.doesNotMatch(css,/video-player|login-form|player-overlay|sponsored-label|ignored/);
});
test("Build 406: native CSS remains enabled when vendor dynamic matching throws",()=>{
 let calls=0;
 const vendor={getCosmeticsFilters:o=>{
  calls++;
  if(o.getRulesFromDOM)throw Error("upstream matcher failure");
  return {active:true,styles:".reliable-ad{display:none!important;}"};
 }};
 const css=G.styles(vendor,"news.example",{domSignals:{ids:["ad-card"]}});
 assert.equal(calls,2);assert.match(css,/reliable-ad/);
});
test("Build 406: production script and dependency contracts unchanged",()=>{
 const m=require("../src/manifest.json"),p=require("../package.json");
 assert.equal(m.version,p.version);
 assert.equal(p.dependencies["@ghostery/adblocker"],"2.20.3");
 assert.ok(m.background.scripts.indexOf("ghostery-vendor.js")<
  m.background.scripts.indexOf("hybrid-engine.js"));
});
