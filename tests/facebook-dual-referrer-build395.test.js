"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path");
const source=fs.readFileSync(path.join(__dirname,"../src/facebook-full-core.js"),"utf8");
const start=source.indexOf("function resolveViaReferrer("),end=source.indexOf("\n}",start);
assert.ok(start>=0&&end>start);const fn=source.slice(start,end+2);
function harness(query,handler=()=>{}){
 const code="const resolvingReferrers=new Set(),MAX_REFERRER_HOPS=8;"+fn+";"+
  "const calls=[];function processLabel(el){calls.push(el);handler(el,resolveViaReferrer);}"+
  "return {run:resolveViaReferrer,calls,size:()=>resolvingReferrers.size};";
 return new Function("document","CSS","handler",code)({querySelector:query},{escape:s=>s},handler);
}
test("Build 395: process ARIA and distinct SVG referrer once each",()=>{
 const aria={id:"dead"},svg={id:"real"},h=harness(s=>s.startsWith("[aria-")?aria:svg);
 assert.equal(h.run({id:"sponsored"}),true);assert.deepEqual(h.calls,[aria,svg]);assert.equal(h.size(),0);
});
test("Build 395: duplicate targets and self-links are not processed",()=>{
 const ref={id:"ref"},h=harness(()=>ref);
 assert.equal(h.run({id:"ad"}),true);assert.deepEqual(h.calls,[ref]);
 const self={id:"same"},x=harness(()=>self);assert.equal(x.run(self),false);
});
test("Build 395: malformed ARIA selector does not suppress valid SVG route",()=>{
 const svg={id:"svg"},h=harness(s=>{if(s.startsWith("[aria-"))throw Error("bad");return svg;});
 assert.equal(h.run({id:"ad"}),true);assert.deepEqual(h.calls,[svg]);
});
test("Build 395: cycles do not recurse forever and in-flight tracking clears",()=>{
 const a={id:"a"},b={id:"b"};
 const h=harness(s=>s.includes('"a"')?b:a,(node,resolve)=>resolve(node));
 assert.equal(h.run(a),true);assert.ok(h.calls.length<=2);assert.equal(h.size(),0);
});
test("Build 395: exactly two known selector forms, not a feed scan",()=>{
 const q=[],h=harness(s=>{q.push(s);return null;});
 assert.equal(h.run({id:"ad"}),false);assert.equal(q.length,2);
 assert.match(q[0],/aria-labelledby/);assert.match(q[1],/use/);
});
