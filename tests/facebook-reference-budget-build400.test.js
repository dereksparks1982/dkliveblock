"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path");
const src=fs.readFileSync(path.join(__dirname,"../src/facebook-full-core.js"),"utf8");
function extract(n){const s=src.indexOf("function "+n+"("),e=src.indexOf("\n}",s);
 assert.ok(s>=0&&e>s,n);return src.slice(s,e+2);}
function setup(mapping={}){
 const visits=[],doc={getElementById(id){visits.push(id);return mapping[id]||null}};
 const fn=new Function("document","INVISIBLE_CHARS_RE","labelTextById","rescuedAdLabel",
  "const MAX_LABEL_REF_IDS=16,MAX_LABEL_REF_ATTR=1024,MAX_LABEL_REF_TEXT=120;"+
  extract("labelRefTexts")+";return labelRefTexts;");
 return {run:fn(doc,/\\u200b/g,new Map(),()=>""),visits,el:t=>({getAttribute:()=>t})};
}
test("Build 400: 40 references inspect exactly the first and last eight",()=>{
 const h=setup(),ids=Array.from({length:40},(_,i)=>"id"+i);
 h.run(h.el(ids.join(" ")));
 assert.deepEqual(h.visits,[...ids.slice(0,8),...ids.slice(-8)]);
});
test("Build 400: duplicate ids are checked once",()=>{
 const h=setup();const r=h.run(h.el("a a b a b c c"));
 assert.deepEqual(h.visits,["a","b","c"]);
 assert.deepEqual(r.map(x=>x.id),["a","b","c"]);
});
test("Build 400: exact ad label at the tail is preserved",()=>{
 const ids=Array.from({length:30},(_,i)=>"id"+i);
 const h=setup({id29:{textContent:"Sponsored"}});
 const entries=h.run(h.el(ids.join(" ")));
 assert.equal(entries.at(-1).text,"Sponsored");
});
test("Build 400: oversized attribute, ids and target text fail open",()=>{
 const h=setup({a:{textContent:"Sponsored".repeat(200)}});
 assert.deepEqual(h.run(h.el("a".repeat(1100))),[]);
 assert.deepEqual(h.run(h.el("b".repeat(161))),[]);
 assert.equal(h.run(h.el("a"))[0].text,"");
 assert.equal(h.visits.length,1);
});
test("Build 400: unchanged reference gates, retry interval and exact ad labels remain",()=>{
 assert.match(src,/const RETRY_INTERVAL_MS = 50/);
 assert.match(src,/function isDanglingRef\(/);
 assert.match(src,/function classifyLabel\(/);
 assert.match(src,/function resolveViaReferrer\(/);
 assert.ok(src.includes('attributeFilter: ["aria-labelledby", "aria-label"]'));
});
