"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path");
const read=p=>fs.readFileSync(path.join(__dirname,"..",p),"utf8");
const core=read("src/facebook-full-core.js");
function functionSource(name){
 const prefix="function "+name+"(";
 const at=core.indexOf(prefix);
 assert.ok(at>=0,name+" is missing");
 const end=core.indexOf("\n}",at);
 assert.ok(end>at,name+" ending missing");
 return core.slice(at,end+2);
}
test("Build 377: late ARIA sponsorship labels are exact and bounded",()=>{
 const f=new Function("labelKey","INVISIBLE_CHARS_RE","SPONSORED_TEXTS","SPONSORED_ARIA_RE",
  functionSource("sponsoredAriaCandidate")+";return sponsoredAriaCandidate;")(
   s=>s.replace(/^[\\s·•|]+|[\\s·•|]+$/g,""),/[\\p{Cf}\\p{Mn}\\p{Co}]/gu,
   new Set(["Sponsored","Ad","Реклама"]),/sponsored content$/i);
 for(const s of ["Sponsored","Ad","Ad ·","Sponsored ·","Реклама","Sponsored content"])
  assert.equal(f(s),true,s);
 for(const s of ["Ads Manager","advertisement","Organic post","Unrelated Ad post",
  "Ad approval","Ads",null,"Ad"+"z".repeat(105)])
  assert.equal(f(s),false,String(s));
});
test("Build 377: a refused hide is no longer counted as a success",()=>{
 const hidden=new Map(),card={};
 let calls=0;
 let actual=null;
 const fn=new Function("findPostContainer","hiddenPosts","hidePost","hiddenContainerFor",
  functionSource("tryHideFromLabel")+";return tryHideFromLabel;")(
    ()=>card,hidden,()=>{calls++;},()=>actual
  );
 assert.equal(fn({},"sponsored"),false);
 assert.equal(calls,1);
 actual=card;
 assert.equal(fn({},"sponsored"),true);
 hidden.set(card,{reason:"sponsored"});
 assert.equal(fn({},"sponsored"),true);
 assert.equal(calls,2,"an already hidden post must not be hidden again");
});
test("Build 377: late aria-label mutations rescan candidates only",()=>{
 assert.ok(core.includes('attributeFilter: ["aria-labelledby", "aria-label"]'));
 assert.ok(core.includes('mutation.attributeName === "aria-label"'));
 assert.ok(core.includes('if (settings.hideSponsored && sponsoredAriaCandidate(raw))'));
 assert.ok(core.includes('scheduleScan(mutation.target);'));
 assert.ok(core.includes('(sponsoredAriaCandidate(ariaLabel) && adLabelPosition(el))'));
 // Privacy and performance: no new global polling and no storage, URL,
 // post text or full feed scan on every changed ARIA attribute.
 assert.ok(!core.includes('attributeFilter: ["aria-labelledby", "aria-label", "style"]'));
});
