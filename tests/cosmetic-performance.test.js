"use strict";
const test=require("node:test"),assert=require("node:assert/strict");
require("../src/rules.js");
const {FilterEngine}=require("../src/engine.js");
const {performance}=require("node:perf_hooks");
test("index 40k cosmetic and 12k procedural rules without scanning each on every page",()=>{
 const cosmetics=Array.from({length:40000},(_,i)=>"publisher"+i+".example##.banner"+i);
 const procedural=Array.from({length:12000},(_,i)=>"publisher"+i+".example#?#div.ad:-abp-contains(Sponsored)");
 const input=cosmetics.concat(procedural,["##.global","publisher105.example##.special"]).join("\n");
 const buildStart=performance.now(),f=new FilterEngine(input),built=performance.now()-buildStart;
 assert.equal(f.cosmetic.length,40002);
 assert.equal(f.procedural.length,12000);
 assert.ok(built<15000,"Cosmetic index build too slow: "+Math.round(built)+" ms");
 const scan=performance.now();
 for(let i=0;i<1000;i++){
  const h="publisher"+(i*23%40000)+".example";
  const filters=f.getSelectors(h);
  assert.equal(filters.includes(".global"),true);
  assert.equal(filters.length,2+(h==="publisher105.example"?1:0));
  const proceduralList=f.getProcedural(h);
  assert.equal(proceduralList.length,i*23%40000<12000?1:0);
 }
 assert.ok(performance.now()-scan<8000,"Domain cosmetic lookups exceeded offline limit");
});
