"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path");
const legacy=fs.readFileSync(path.join(__dirname,"../src/facebook-ads.js"),"utf8");
const full=fs.readFileSync(path.join(__dirname,"../src/facebook-full-core.js"),"utf8");
function extract(name,next,params=[]){
 const start=legacy.indexOf(" function "+name+"("),end=legacy.indexOf(" function "+next+"(",start);
 assert.ok(start>=0&&end>start,name+" present");
 return new Function(...params,"return "+legacy.slice(start,end).trim())();
}
function fixture(parentMarked=false,childMarked=false){
 const props={display:"none"},priority={display:"important"},attrs=new Set(),writes=[];
 const el={isConnected:true,
  style:{getPropertyValue:k=>props[k]||"",getPropertyPriority:k=>priority[k]||"",
   setProperty(k,v,p){props[k]=v;priority[k]=p;writes.push(["set",k,v,p]);},
   removeProperty(k){delete props[k];delete priority[k];writes.push(["remove",k]);}},
  getClientRects:()=>[1],
  closest:sel=>sel==="[data-fbsb-hidden]"&&parentMarked?{}:null,
  querySelector:sel=>sel==="[data-fbsb-hidden]"&&childMarked?{}:null,
  setAttribute:k=>attrs.add(k),removeAttribute:k=>attrs.delete(k),
  contains:()=>false};
 return {el,attrs,writes,props};
}
test("Build 384: retained partial scanner refuses full-engine-owned descendants and ancestors",()=>{
 const map=new Map(),hide=extract("hide","restoreOne",["allowed","hidden","limit","onEvidence"]);
 for(const flags of [[true,false],[false,true]]){
  const f=fixture(...flags);
  assert.equal(hide(f.el,null,"feed"),false);
  assert.equal(map.size,0);
  assert.equal(f.attrs.size,0);
 }
});
test("Build 384: fallback owns, marks and restores only its own hide",()=>{
 const map=new Map(),hide=extract("hide","restoreOne",["allowed","hidden","limit","onEvidence"]);
 // The extracted factory's closed-over hidden map is supplied explicitly.
 // No browser DOM and no real Facebook account is needed for the test.
 const f=fixture();
 const scoped=extract("hide","restoreOne",["allowed","hidden","limit","onEvidence"]);
 const fn=hide.bind(null);
 // Binding doesn't carry injected free variables. Recreate with values.
 const h=new Function("allowed","hidden","limit","onEvidence",
   "return "+legacy.slice(legacy.indexOf(" function hide("),legacy.indexOf(" function restoreOne(")).trim())(
   ()=>false,map,10,null);
 assert.equal(h(f.el,null,"feed"),true);
 assert.equal(f.attrs.has("data-dklb-nesty-legacy-hidden"),true);
 assert.equal(map.has(f.el),true);
 const restore=extract("restoreOne","stillSponsored");
 restore(f.el,{value:"",priority:""});
 assert.equal(f.attrs.has("data-dklb-nesty-legacy-hidden"),false);
 assert.equal(f.props.display,undefined);
});
test("Build 384: full-core-owned post is not made visible by legacy restore",()=>{
 const f=fixture(true,false),restore=extract("restoreOne","stillSponsored");
 f.attrs.add("data-dklb-nesty-legacy-hidden");
 restore(f.el,{value:"block",priority:""});
 assert.equal(f.attrs.has("data-dklb-nesty-legacy-hidden"),false);
 assert.equal(f.props.display,"none");
 assert.equal(f.writes.length,0);
});
test("Build 384: primary full engine rejects legacy-owned card before touching styles",()=>{
 assert.match(full,/if \(container\?\.closest\?\.\("\[data-dklb-nesty-legacy-hidden\]"\)/);
 assert.match(full,/container\?\.querySelector\?\.\("\[data-dklb-nesty-legacy-hidden\]"\)/);
 assert.ok(full.indexOf('container?.closest?.("[data-dklb-nesty-legacy-hidden]")')<
  full.indexOf('if (dkExcluded(container) || dkExcluded(label)) return;',full.indexOf("function hidePost(")));
 assert.match(legacy,/el\.setAttribute\?\.\("data-dklb-nesty-legacy-hidden",""\)/);
});
test("Build 384: no new Facebook access permissions, network rules or ads override",()=>{
 const manifest=JSON.parse(fs.readFileSync(path.join(__dirname,"../src/manifest.json"),"utf8"));
 const scripts=manifest.content_scripts[1].js;
 assert.ok(scripts.indexOf("facebook-ads.js")<scripts.indexOf("meta-module.js"));
 assert.ok(scripts.indexOf("meta-strategy-nesty.js")<scripts.indexOf("meta-module.js"));
 assert.ok(!manifest.permissions.includes("debugger"));
 assert.equal(manifest.version,require("../package.json").version);
});
