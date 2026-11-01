"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path");
const M=require("../src/adaptive-model.js");
const A=require("../src/adaptive-youtube.js");
test("Build 231 offline linear model classifies only fixed, coarse synthetic examples",()=>{
 let correct=0,total=0;
 for(let faults=0;faults<4;faults++)
  for(let blocked=0;blocked<2;blocked++)
   for(let err=0;err<2;err++)
    for(let buffering=0;buffering<2;buffering++)
     for(let enforcement=0;enforcement<2;enforcement++)
      for(let skipped=0;skipped<2;skipped++)
       for(let showing=0;showing<2;showing++){
       const result=M.predict({faultCount:faults,blockedMediaEvidence:!!blocked,
        sawMediaError:!!err,sawBuffering:!!buffering,
        sawEnforcement:!!enforcement,sawAdSkip:!!skipped,sawAdShowing:!!showing});
       const expected=faults>=2&&!!blocked&&!enforcement&&!skipped&&!showing?
        "response-only":"combined";
       assert.ok(result&&result.score>=0&&result.score<=1);
       assert.equal(result.recommendation,expected,
        JSON.stringify({faults,blocked,err,buffering,enforcement,skipped,showing}));
       total++;correct++;
      }
 assert.equal(total,256);
 assert.equal(correct,256);
 assert.equal(M.FEATURES.length,7);
 assert.equal(M.WEIGHTS.length,7);
 assert.equal(M.VERSION,"offline-synthetic-v2");
});
test("Build 231 untrusted or malformed model inputs fail closed",()=>{
 assert.equal(M.predict(null),null);
 assert.equal(M.predict({faultCount:NaN}),null);
 assert.equal(M.predict({faultCount:2,blockedMediaEvidence:true,sawMediaError:true,
  sawBuffering:true,sawEnforcement:false,sawAdSkip:false}),null,
  "missing seventh feature must fail closed");
 assert.equal(M.predict({faultCount:9}),null);
 assert.equal(M.predict({faultCount:2,blockedMediaEvidence:"yes",
  sawMediaError:true,sawBuffering:true,sawEnforcement:false,sawAdSkip:false,sawAdShowing:false}),null);
 const valid={faultCount:2,blockedMediaEvidence:true,
  sawMediaError:true,sawBuffering:true,sawEnforcement:false,sawAdSkip:false,sawAdShowing:false};
 const result=M.predict(valid);
 assert.equal(result.recommendation,"response-only");
 assert.ok(result.score>M.THRESHOLD);
 assert.equal(M.predict({...valid,sawAdShowing:true}).recommendation,"combined",
  "verified on-page ad state vetoes changing defenses");
 assert.equal(JSON.stringify(result).includes("http"),false);
 assert.equal(Object.isFrozen(result),true);
});
test("Build 186 enforcement or observed ad skip vetoes fallback during active tab",()=>{
 for(const flag of ["enforcement","ad-skip"]){
  const store=new Map(),site="www.youtube.com",now=100000;
  assert.equal(A.note(store,1,site,flag,false,now).changed,false);
  assert.equal(A.note(store,1,site,"buffering",true,now+25000).changed,false);
  assert.equal(A.note(store,1,site,"media-error",true,now+50000).changed,false);
  assert.equal(A.mode(store,1,site,now+50001),"combined");
 }
 const state=new Map();
 assert.equal(A.note(state,2,"youtube.com","buffering",true,100000).changed,false);
 const changed=A.note(state,2,"youtube.com","media-error",false,125000);
 assert.equal(changed.changed,true);
 assert.equal(A.mode(state,2,"youtube.com",125001),"response-only");
 assert.equal(A.mode(state,2,"youtube.com",changed.expires),"combined");
});
test("Build 186 actual Firefox background loader includes both adaptive modules in order",()=>{
 const manifest=JSON.parse(fs.readFileSync(path.join(__dirname,"../src/manifest.json"),"utf8"));
 const names=manifest.background.scripts;
 const model=names.indexOf("adaptive-model.js");
 const controller=names.indexOf("adaptive-youtube.js");
 const background=names.indexOf("background.js");
 assert.ok(model>=0&&model<controller&&controller<background);
 assert.equal(names.filter(x=>x==="adaptive-model.js").length,1);
 assert.equal(names.filter(x=>x==="adaptive-youtube.js").length,1);
 const data=fs.readFileSync(path.join(__dirname,"../src/adaptive-model.js"),"utf8");
 assert.doesNotMatch(data,/\bfetch\s*\(|XMLHttpRequest|import\s*\(|WebSocket|https?:\/\//);
 const controllerSource=fs.readFileSync(path.join(__dirname,"../src/adaptive-youtube.js"),"utf8");
 assert.match(controllerSource,/Model\?\.predict/);
 assert.match(controllerSource,/prediction\?\.recommendation==="response-only"/);
});
test("Build 186 MIT training code is vendored, not executed by extension",()=>{
 const manifest=JSON.parse(fs.readFileSync(path.join(__dirname,"../src/manifest.json"),"utf8"));
 for(const script of manifest.background.scripts)
  assert.doesNotMatch(script,/micrograd|\.py$/);
 const license=fs.readFileSync(path.join(__dirname,
  "../scripts/vendor/micrograd/LICENSE"),"utf8");
 assert.match(license,/MIT License|The MIT License/i);
 assert.match(license,/Andrej Karpathy/);
 for(const file of ["engine.py","nn.py"]){
  assert.ok(fs.existsSync(path.join(__dirname,
   "../scripts/vendor/micrograd/micrograd",file)));
 }
});
