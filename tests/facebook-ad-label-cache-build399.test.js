"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path");
const source=fs.readFileSync(path.join(__dirname,"../src/facebook-full-core.js"),"utf8");
function functionBody(name){const start=source.indexOf("function "+name+"("),end=source.indexOf("\n}",start);
 assert.ok(start>=0&&end>start,name);return source.slice(start,end+2);}
const constants=source.slice(source.indexOf("const MAX_LABEL_CACHE = 200;"),source.indexOf("// How many labels completed via a late text node"));
function fixture(){
 let time=100000,forward=0,connected=new Map();
 const text="const INVISIBLE_CHARS_RE=/\\u200b/g;"+
  "const SPONSORED_TEXTS=new Set([\'Sponsored\',\'Ad\',\'Реклама\']);"+
  "const SUGGESTED_TEXTS=new Set([\'Suggested for you\']);"+
  "const FOREIGN_SPONSORED_TEXTS=new Set([\'Anzeige\']);"+
  "function labelKey(s){return s.replace(/^[\\s·•|]+|[\\s·•|]+$/g,\'\');}"+
  constants+";"+functionBody("cacheLabelText")+";"+functionBody("labelRefTexts")+";"+
  "return {cache:cacheLabelText,read:labelRefTexts,ordinary:labelTextById,ads:adLabelRescues,standby:rescuedAdLabel};";
 const h=new Function("document","Date","resolveViaReferrer",text)({getElementById:id=>connected.get(id)||null},
  {now:()=>time},()=>{forward++;return false;});
 return {...h,go(ms){time+=ms;},connect(id,text){connected.set(id,{textContent:text})},
  ref:id=>({getAttribute:()=>id}),forward:()=>forward};
}
test("Build 399: frequent ordinary labels cannot evict the most recent ad from rescue cache",()=>{
 const h=fixture();h.cache("advert","Sponsored",{id:"advert"});
 for(let i=0;i<260;i++)h.cache("organic"+i,"Organic label "+i,{id:"organic"+i});
 assert.equal(h.ordinary.has("advert"),false);assert.equal(h.ads.size,1);
 assert.equal(h.read(h.ref("advert"))[0].text,"Sponsored");
});
test("Build 399: ordinary labels still prevent false dangling-reference inference",()=>{
 const h=fixture();h.cache("ordinary","Author timestamp",{id:"ordinary"});
 assert.equal(h.read(h.ref("ordinary"))[0].text,"Author timestamp");
 assert.equal(h.ads.size,0);
});
test("Build 399: rescued evidence expires and reused ids clear old ad labels",()=>{
 const h=fixture();h.cache("ad","Ad",{id:"ad"});h.cache("again","Sponsored",{id:"again"});
 h.cache("ad","Normal",{id:"ad"});
 assert.equal(h.ads.has("ad"),false);
 h.go(30001);
 assert.equal(h.standby("again"),"");assert.equal(h.ads.has("again"),false);
});
test("Build 399: legitimate ad cache is bounded and live DOM always wins",()=>{
 const h=fixture();for(let i=0;i<90;i++)h.cache("id"+i,"Sponsored",{id:"id"+i});
 assert.equal(h.ads.size,64);assert.equal(h.ads.has("id0"),false);
 h.connect("id89","Ordinary live title");
 assert.equal(h.read(h.ref("id89"))[0].text,"Ordinary live title");
});
test("Build 399: reject long raw content/ids and clear on pause",()=>{
 const h=fixture();h.cache("a".repeat(200),"Ad");h.cache("b","X".repeat(200));
 assert.equal(h.ads.size,0);assert.equal(h.ordinary.size,0);
 assert.match(source,/pendingRoots\.clear\(\); adLabelRescues\.clear\(\)/);
 assert.match(source,/const RETRY_INTERVAL_MS = 50/);
});
