"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict");
const Report=require("../scripts/ghostery-compatibility-audit.js");
const fs=require("node:fs"),path=require("node:path");
const ROOT=path.resolve(__dirname,"..");
const read=p=>fs.readFileSync(path.join(ROOT,p),"utf8");
const manifest=require("../src/manifest.json"),pkg=require("../package.json");
function row(){return {id:"fixture",productionBlock:true};}
function options(overrides={}){return {
 source:read("src/ghostery-cosmetics.js"),hybrid:read("src/hybrid-engine.js"),
 manifest,dependencies:pkg.dependencies,
 rows:Array.from({length:24},(_,i)=>({...row(),id:"fixture-"+i})),
 ...overrides
};}
test("Build 406: capability matrix distinguishes wired, disabled, not-wired",()=>{
 const c=Report.capabilities();
 assert.equal(c.length,11);
 assert.ok(c.some(x=>x.name==="cosmetic-css"&&x.dk==="integrated-conservative"));
 assert.ok(c.some(x=>x.name==="scriptlets"&&x.dk==="disabled-by-design"));
 assert.ok(c.some(x=>x.name==="webextension-adapter"&&x.dk==="evaluated-not-installed"));
 assert.ok(c.some(x=>x.name==="html-filter"&&x.dk==="not-wired"));
});
test("Build 406: inspection of actual committed runtime adapter passes",()=>{
 const result=Report.audit(options());
 assert.equal(result.ok,true,result.errors.join("\n"));
 assert.equal(result.checkedCases,24);
});
test("Build 406: removal of CSS injection guard fails inspection",()=>{
 const opts=options();opts.source=opts.source.replace("getInjectionRules:false","getInjectionRules:true");
 assert.equal(Report.audit(opts).ok,false);
});
test("Build 406: no mixed request flags can accidentally request upstream scripts",()=>{
 const opts=options();opts.source+="\n// accidental getInjectionRules:true";
 assert.equal(Report.audit(opts).ok,false);
});
test("Build 406: generic-hide guard is required to preserve local exceptions",()=>{
 const opts=options();opts.source=opts.source.replace(
  "policy?.generichide!==true&&(signals.classes.length||signals.ids.length)",
  "(signals.classes.length||signals.ids.length)");
 assert.equal(Report.audit(opts).ok,false);
});
test("Build 406: unexpected Ghostery pin or manifest load order fails",()=>{
 const opts=options({dependencies:{"@ghostery/adblocker":"2.20.4"},
  manifest:{...manifest,background:{scripts:["hybrid-engine.js","ghostery-vendor.js"]}}});
 const res=Report.audit(opts);
 assert.equal(res.ok,false);assert.ok(res.errors.length>=2);
});
test("Build 406: audit output is summary only, not private browsing details",()=>{
 const bad=options();bad.rows[0]={...bad.rows[0],url:"https://secret.invalid/"};
 const out=Report.audit(bad);
 assert.equal(out.ok,false);
 assert.ok(out.capabilities.every(x=>!Object.keys(x).includes("url")));
});
test("Build 406: no official WebExtension double-listener installation",()=>{
 assert.equal(Object.keys(pkg.dependencies).length,1);
 assert.equal(pkg.dependencies["@ghostery/adblocker"],"2.20.3");
 assert.equal(Report.capabilities().find(x=>x.name==="webextension-adapter").dk,
  "evaluated-not-installed");
});
