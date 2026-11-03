"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict");
const F=require("../src/facebook-ads.js");
function card(overrides={}){
 const body={nodeType:1},doc={body,documentElement:{nodeType:1}};
 const c={nodeType:1,isConnected:true,style:{setProperty:()=>{}},children:[],
  matches:()=>false,closest:()=>null,querySelector:()=>null,querySelectorAll:()=>[],
  getBoundingClientRect:()=>({width:550,height:320}),...overrides};
 return {c,doc};
}
test("Build 321: exact labeled ads are distinct from normal body words",()=>{
 for(const text of ["Ad","Sponsored"," sPONSORED ","A\u200bd"])assert.equal(F.isAdLabel(text),true);
 for(const text of ["advice","This is my ad","sponsorship","adopt","Ad campaign",""] )assert.equal(F.isAdLabel(text),false);
});
test("Build 321: ordinary post boundaries remain eligible without being declared ads",()=>{
 const {c,doc}=card();assert.equal(F.safeCard(c,doc),true);
 assert.equal(F.hasAdEvidence(c,doc,{},new Map()),false);
});
test("Build 321: user text editor and search box ancestors are protected",()=>{
 for(const scope of ["contenteditable","textbox","searchbox"]){
  const {c,doc}=card({closest:sel=>sel.includes(scope)?{nodeType:1}:null});
  assert.equal(F.safeCard(c,doc),false,scope);
 }
});
test("Build 321: dialog and multi-post wrappers remain protected",()=>{
 const d=card({closest:sel=>sel.includes('[role="dialog"]')?{}:null});assert.equal(F.safeCard(d.c,d.doc),false);
 const sibling={matches:sel=>sel.includes('[role="article"]'),getBoundingClientRect:()=>({width:500,height:300})};
 const m=card({children:[sibling,sibling]});assert.equal(F.safeCard(m.c,m.doc),false);
});
test("Build 321: newly protected editors do not affect normal feed review on other sites",()=>{
 assert.equal(F.isFacebook("facebook.com"),true);
 assert.equal(F.isFacebook("facebook.com.evil.test"),false);
 assert.equal(F.isFacebook("youtube.com"),false);
 assert.equal(require("../src/manifest.json").version,require("../package.json").version);
});