"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict");
const Catalog=require("../scripts/open-source-integration-catalog.js");
const Audit=require("../scripts/open-source-integration-audit.js");
const fs=require("node:fs"),path=require("node:path");
const pkg=require("../package.json"),manifest=require("../src/manifest.json");
const ROOT=path.join(__dirname,"..");
const exists=p=>fs.existsSync(path.join(ROOT,p));
const safeProvenance={ok:true,issues:[]};
test("Build 405: explicit status, license and next-step inventory for reviewed repos",()=>{
 assert.deepEqual(Catalog.validateCatalog(),[]);
 assert.equal(Catalog.ITEMS.length,16);
 const ids=new Set(Catalog.ITEMS.map(x=>x.id));assert.equal(ids.size,16);
 assert.deepEqual(Catalog.summarize(),{
  "bundled-runtime":3,"vendored-development":1,"planned-evaluation":2,
  "reference-only":7,"deferred":2,"archived-reference":1});
});
test("Build 405: production integration is backed by actual checked-in sources",()=>{
 const report=Audit.inspect({manifest,pkg,exists,provenance:safeProvenance});
 assert.equal(report.ok,true,report.problems.join("\n"));
 assert.deepEqual(report.bundled,["ghostery","psl","facebook-mit"]);
});
test("Build 405: missing bundled code or upstream notices cannot be called integrated",()=>{
 const report=Audit.inspect({manifest,pkg,exists:p=>p!=="src/LICENSE-GHOSTERY.txt"&&exists(p),
  provenance:safeProvenance});
 assert.equal(report.ok,false);assert.match(report.problems.join(" "),/LICENSE-GHOSTERY/);
});
test("Build 405: missing Facebook MIT integration fails evidence gate",()=>{
 const m={...manifest,content_scripts:manifest.content_scripts.filter(x=>
  !x.js?.includes("facebook-full-core.js"))};
 assert.equal(Audit.inspect({manifest:m,pkg,exists,provenance:safeProvenance}).ok,false);
});
test("Build 405: unreviewed Ghostery dependency version fails gate",()=>{
 const changed={...pkg,dependencies:{"@ghostery/adblocker":"^2.20.3"}};
 assert.equal(Audit.inspect({manifest,pkg:changed,exists,provenance:safeProvenance}).ok,false);
});
test("Build 405: existing license-gate errors propagate into reuse audit",()=>{
 const out=Audit.inspect({manifest,pkg,exists,provenance:{ok:false,issues:["digest mismatch"]}});
 assert.equal(out.ok,false);assert.match(out.problems.join(" "),/digest mismatch/);
});
test("Build 405: false bundled claim without local evidence is rejected",()=>{
 const altered=Catalog.ITEMS.map(x=>x.id==="brave"?
  {...x,status:"bundled-runtime",evidence:[]}:x);
 assert.ok(Catalog.validateCatalog(altered).some(x=>/missing local evidence/i.test(x)));
});
test("Build 405: null or malformed catalog entries fail closed without crashing",()=>{
 const bad=Catalog.ITEMS.slice();bad[1]=null;
 assert.ok(Catalog.validateCatalog(bad).some(x=>/Invalid component entry/.test(x)));
});
test("Build 405: unsupported status and duplicated candidate is rejected",()=>{
 const list=Catalog.ITEMS.map(x=>({...x}));
 list[2].id=list[1].id;list[3].status="installed-for-sure";
 const problems=Catalog.validateCatalog(list);
 assert.ok(problems.some(x=>/Duplicate/.test(x)));
 assert.ok(problems.some(x=>/Unknown status/.test(x)));
});
test("Build 405: reviewed GPL and ambiguous-data candidates stay uninstalled",()=>{
 for(const id of ["adguard-scriptlets","ublock-assets","adguard-tsurlfilter",
  "tracker-radar","privacy-config","privacy-badger","adguard-extra"]){
  const entry=Catalog.ITEMS.find(x=>x.id===id);
  assert.equal(entry.status,"reference-only");
  assert.deepEqual(entry.evidence,[]);
 }
});
test("Build 405: archived anti-circumvention repo is not proposed as live dependency",()=>{
 const item=Catalog.ITEMS.find(x=>x.id==="abp-anti-cv");
 assert.equal(item.status,"archived-reference");
 assert.equal(item.priority,"P3");
});
test("Build 405: no extra npm runtime dependencies or Firefox permissions",()=>{
 assert.deepEqual(Object.keys(pkg.dependencies),["@ghostery/adblocker"]);
 assert.deepEqual(Catalog.validateCatalog(),[]);
 const source=fs.readFileSync(path.join(ROOT,"scripts/open-source-integration-audit.js"),"utf8");
 for(const forbidden of ["fetch(","https.get(","exec(","spawn(","browser.runtime",
  "XMLHttpRequest","sendBeacon(","window.open("])
  assert.equal(source.includes(forbidden),false,forbidden);
});
