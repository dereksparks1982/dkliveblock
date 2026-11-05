"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path");
const source=fs.readFileSync(path.join(__dirname,"../src/facebook-full-core.js"),"utf8");
function extract(name){const start=source.indexOf("function "+name+"("),end=source.indexOf("\n}",start);assert.ok(start>=0&&end>start);return source.slice(start,end+2);}
function harness(next={}){
 const doc={querySelector:s=>{const id=s.includes('~="')?s.split('~="')[1].split('"')[0]:s.includes('#')?s.split('#')[1].split('"')[0]:null;return next[id]||null;}};
 const css={escape:x=>x};
 return new Function("document","CSS","const resolvingReferrers=new Set();const MAX_REFERRER_HOPS=8;"+extract("resolveViaReferrer")+";let calls=0;function processLabel(el){calls++;if(el.next)resolveViaReferrer(el);};return {run:resolveViaReferrer,count:()=>calls,active:()=>resolvingReferrers.size};")(doc,css);
}
test("Build 391: two-node ARIA portal cycle is bounded and cleaned up",()=>{
 const a={id:"a",next:true},b={id:"b",next:true},h=harness({a:b,b:a});
 assert.equal(h.run(a),true);assert.equal(h.count(),1);assert.equal(h.active(),0);
 assert.equal(h.run(a),true);assert.equal(h.count(),2);assert.equal(h.active(),0);
});
test("Build 391: self-links, missing target and malformed references refuse safely",()=>{
 const a={id:"a"},self=harness({a});assert.equal(self.run(a),false);
 assert.equal(harness().run(a),false);assert.equal(harness().run({}),false);
 const src=extract("resolveViaReferrer");
 const bad=new Function("document","CSS","const resolvingReferrers=new Set();const MAX_REFERRER_HOPS=8;function processLabel(){};"+src+";return resolveViaReferrer;")
 ({querySelector(){throw Error("bad selector");}},{escape:x=>x});
 assert.equal(bad(a),false);
});
test("Build 391: long portal chains are limited to eight synchronous hops",()=>{
 const nodes=Array.from({length:15},(_,i)=>({id:"n"+i,next:true}));
 const map=Object.fromEntries(nodes.slice(0,-1).map((node,i)=>[node.id,nodes[i+1]]));
 const h=harness(map);assert.equal(h.run(nodes[0]),true);
 assert.ok(h.count()<=8);assert.equal(h.active(),0);
});
test("Build 391: in-flight set is cleared when processing throws",()=>{
 const src=extract("resolveViaReferrer");const target={id:"a"};let count=0;
 const h=new Function("document","CSS","processLabel","const resolvingReferrers=new Set();const MAX_REFERRER_HOPS=8;"+src+";return {run:resolveViaReferrer,size:()=>resolvingReferrers.size};")
 ({querySelector:()=>target},{escape:x=>x},()=>{count++;throw Error("handler");});
 const original={id:"source"};assert.throws(()=>h.run(original),/handler/);
 assert.equal(h.size(),0);assert.throws(()=>h.run(original),/handler/);assert.equal(count,2);
});
test("Build 391: existing full Facebook engine and commercial attribution survive",()=>{
 assert.ok(source.includes("const RETRY_INTERVAL_MS = 50"));
 assert.ok(source.includes("function wholePost("));
 assert.ok(fs.readFileSync(path.join(__dirname,"../src/vendor/LICENSE-FACEBOOK-SPONSORED-MIT.txt"),"utf8").includes("MIT License"));
});
