"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict");
const Diff=require("../scripts/engine-verdict-audit.js");
test("Build 405: reuse existing comparison harness, do not create another engine",()=>{
 assert.equal(typeof Diff.audit,"function");
 assert.equal(typeof Diff.loadEnvironment,"function");
 assert.ok(Diff.SAMPLES.length>=20);
 const ids=Diff.SAMPLES.map(x=>x.id);
 assert.equal(new Set(ids).size,ids.length);
});
test("Build 405: compare Firefox imageset and beacon with actual Ghostery type aliases",()=>{
 const source=require("node:fs").readFileSync(require("node:path").join(__dirname,
  "../scripts/engine-verdict-audit.js"),"utf8");
 assert.match(source,/ghosteryType\(row\.type\)/);
 assert.equal(Diff.SAMPLES.find(x=>x.id==="responsive-image-alias").type,"imageset");
 assert.equal(Diff.SAMPLES.find(x=>x.id==="beacon-ping-alias").type,"beacon");
});
test("Build 405: synthetic comparison results never contain full URLs or rule contents",()=>{
 const results=Diff.audit(Diff.loadEnvironment());
 assert.equal(results.length,Diff.SAMPLES.length);
 for(const row of results){
  assert.equal(typeof row.productionBlock,"boolean");
  for(const k of ["url","origin","rules","cookie","pageContent","token"])
   assert.equal(k in row,false,k);
 }
});
test("Build 405: existing important and intentional skip boundaries remain",()=>{
 const out=Diff.audit(Diff.loadEnvironment());
 const byId=Object.fromEntries(out.map(x=>[x.id,x]));
 assert.equal(byId["genericblock-exemption"].productionBlock,false);
 assert.equal(byId["genericblock-exemption"].category,"production_skips_vendor");
 assert.equal(byId["responsive-image-alias"].id,"responsive-image-alias");
 assert.equal(byId["beacon-ping-alias"].id,"beacon-ping-alias");
 assert.equal(byId["popup-exception"].productionBlock,false);
});
test("Build 405: no uncontrolled redirect is represented as vetted local resource",()=>{
 const out=Diff.audit(Diff.loadEnvironment());
 const bad=out.find(x=>x.id==="unsupported-script-redirect");
 assert.ok(bad&&!bad.vettedLocalRedirect);
 for(const row of out)if(row.vettedLocalRedirect)
  assert.equal(row.productionBlock,true);
});
