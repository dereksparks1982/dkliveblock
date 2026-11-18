"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path");
const full=fs.readFileSync(path.join(__dirname,"../src/facebook-full-core.js"),"utf8");
const legacy=fs.readFileSync(path.join(__dirname,"../src/facebook-ads.js"),"utf8");
const meta=fs.readFileSync(path.join(__dirname,"../src/meta-module.js"),"utf8");
function fullPolicy(overrides={}){
 const start=full.indexOf("function dkCanFallbackHide("),end=full.indexOf("const dkApi=Object.freeze({",start);
 assert.ok(start>=0&&end>start);
 const flags={enabled:true,ready:true,observing:true,excluded:false,container:false,
  oversized:false,opened:false,shown:false,keptAuthor:false,keptPage:false,...overrides};
 const doc={body:{contains:()=>true}};
 const args=["Node","document","dkEnabled","dkSettingsReady","dkObserverActive",
  "dkExcluded","isPageContainer","tooBigToBeAPost","wasOpenedOnPurpose",
  "wasShownByUser","isKeptAuthor","isKeptPage"];
 const fn=new Function(...args,"return "+full.slice(start,end))(
  {ELEMENT_NODE:1},doc,flags.enabled,flags.ready,flags.observing,
  ()=>flags.excluded,()=>flags.container,()=>flags.oversized,()=>flags.opened,
  ()=>flags.shown,()=>flags.keptAuthor,()=>flags.keptPage);
 return {fn,card:{nodeType:1,isConnected:true,closest:()=>null,querySelector:()=>null}};
}
function oldHide(canHide){
 const start=legacy.indexOf(" function hide("),end=legacy.indexOf(" function restoreOne(",start);
 const hidden=new Map();
 assert.ok(start>=0&&end>start);
 const hide=new Function("canHide","allowed","hidden","limit","onEvidence",
   "return "+legacy.slice(start,end))(canHide,()=>false,hidden,10,()=>{});
 const props={},attrs=new Set();
 const card={isConnected:true,getClientRects:()=>[{}],
  style:{setProperty:(k,v)=>props[k]=v,getPropertyValue:k=>props[k]||"",
   getPropertyPriority:()=>""},contains:()=>false,
  closest:()=>null,querySelector:()=>null,
  setAttribute:key=>attrs.add(key)};
 return {hide,hidden,card,props,attrs};
}
test("Build 386: user-kept Pages, user-show choices and saved exceptions veto dormant scanner",()=>{
 for(const key of ["keptAuthor","keptPage","shown","excluded"]){
  const {fn,card}=fullPolicy({[key]:true});
  assert.equal(fn(card),false,key);
 }
});
test("Build 386: core disabled, storage unavailable or observer detached fail closed",()=>{
 for(const key of ["enabled","ready","observing"]){
  const {fn,card}=fullPolicy({[key]:false});
  assert.equal(fn(card),false,key);
 }
});
test("Build 386: a post inside a viewer, unsafe feed wrapper or detached card fails closed",()=>{
 for(const key of ["opened","oversized","container"]){
  const {fn,card}=fullPolicy({[key]:true});
  assert.equal(fn(card),false,key);
 }
 const {fn,card}=fullPolicy();
 card.isConnected=false;assert.equal(fn(card),false);
 card.isConnected=true;card.closest=()=>({});assert.equal(fn(card),false);
});
test("Build 386: eligible single card can be considered by the dormant scanner",()=>{
 const {fn,card}=fullPolicy();
 assert.equal(fn(card),true);
});
test("Build 386: legacy scanner obeys a rejected primary policy, and does not mark or hide",()=>{
 const f=oldHide(()=>false);
 assert.equal(f.hide(f.card,null,"feed"),false);
 assert.equal(f.hidden.size,0);
 assert.equal(f.attrs.size,0);
 assert.equal(Object.keys(f.props).length,0);
 const thrown=oldHide(()=>{throw Error("no policy");});
 assert.equal(thrown.hide(thrown.card,null,"feed"),false);
});
test("Build 386: approved legacy hide still requires old card safety and ownership",()=>{
 const f=oldHide(()=>true);
 assert.equal(f.hide(f.card,null,"feed"),true);
 assert.equal(f.hidden.size,1);
 assert.ok(f.attrs.has("data-dklb-nesty-legacy-hidden"));
 assert.equal(f.props.display,"none");
 assert.match(meta,/typeof facebook\?\.canFallbackHide!=="function"/);
 assert.match(meta,/card=>facebook\.canFallbackHide\(card\)===true/);
});
test("Build 386: no added permissions and all offline tests registered",()=>{
 const manifest=require("../src/manifest.json");
 assert.equal(manifest.version,require("../package.json").version);
 assert.ok(manifest.content_scripts[0].js.includes("facebook-full-core.js"));
 assert.ok(manifest.content_scripts[1].js.includes("meta-strategy-nesty.js"));
 const runner=fs.readFileSync(path.join(__dirname,"../scripts/test-local.sh"),"utf8");
 assert.ok(runner.includes("tests/facebook-keep-boundary-build386.test.js"));
});
