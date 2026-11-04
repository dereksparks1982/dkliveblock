"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict");
const Meta=require("../src/meta-module.js");
function inspected(label){
 const old=globalThis.DKCompanyModules,disp=globalThis.DKAdaptiveDispatcher;
 try{
  globalThis.DKCompanyModules={profileFor:()=>({company:"meta",platform:"facebook"})};
  let evaluator=null;
  globalThis.DKAdaptiveDispatcher={create:()=>({register:(id,fn)=>{if(id==="meta-explicit-sponsored")evaluator=fn;},inspect:ctx=>[evaluator(ctx)]})};
  const m=Meta.create({}, {top:null,location:{hostname:"www.facebook.com"}});
  return m.review({getAttribute:()=>label})[0];
 }finally{globalThis.DKCompanyModules=old;globalThis.DKAdaptiveDispatcher=disp;}
}
test("Build 333: exact Russian disclosure is review evidence",()=>{
 for(const word of ["Реклама","Спонсировано","Sponsored","Sponsored content"])
  assert.equal(inspected(word).matched,true,word);
});
test("Build 333: ordinary Russian words cannot trigger review",()=>{
 for(const word of ["Это реклама","Рекламный","Рекламодатель","Рекламы","advice"])
  assert.equal(inspected(word).matched,false,word);
});
test("Build 333: Meta review outputs only bounded fixed signal vocabulary",()=>{
 assert.deepEqual(inspected("Sponsored").evidence,["sponsor_label","aria_label"]);
});
test("Build 333: non-Facebook company behavior remains independently scoped",()=>{
 assert.equal(Meta.sampleMutations([{type:"childList"}]).length,1);
 const src=require("node:fs").readFileSync(require("node:path").join(__dirname,"../src/meta-module.js"),"utf8");
 assert.match(src,/platform==="facebook"\?root\.DKFacebookAds/);
});
test("Build 333: manifest and package versions still agree",()=>{
 const m=require("../src/manifest.json"),p=require("../package.json");
 assert.equal(m.version,p.version);assert.equal(p.version,"0.3.303");
});
