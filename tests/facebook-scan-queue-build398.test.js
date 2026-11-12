"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path");
const source=fs.readFileSync(path.join(__dirname,"../src/facebook-full-core.js"),"utf8");
const start=source.indexOf("const pendingRoots = new Set();");
const end=source.indexOf("\n// Facebook recycles DOM nodes,",start);
assert.ok(start>=0&&end>start);const schedulerSource=source.slice(start,end);
function harness(){
 const frames=[],scanned=[];
 const body={nodeType:1,isConnected:true,parentElement:null,contains(n){return n!==this&&n?.parentElement===this;}};
 const run=new Function("Node","document","requestAnimationFrame","scanRoot",
  schedulerSource+"\nreturn {scheduleScan,flushScheduledScans,pendingRoots};");
 const h=run({ELEMENT_NODE:1},{body},cb=>frames.push(cb),n=>scanned.push(n));
 function node(parent){return {nodeType:1,isConnected:true,parentElement:parent,
  contains(n){let p=n?.parentElement;while(p){if(p===this)return true;p=p.parentElement;}return false;}};}
 return {...h,node,body,frames,scanned,tick(){assert.ok(frames.length);frames.shift()();}};
}
test("Build 398: repeated and nested insertions scan only the outer card",()=>{
 const h=harness(),outer=h.node(h.body),inner=h.node(outer),leaf=h.node(inner);
 h.scheduleScan(inner);h.scheduleScan(leaf);h.scheduleScan(outer);h.scheduleScan(inner);
 assert.equal(h.frames.length,1);assert.equal(h.pendingRoots.size,1);
 h.tick();assert.deepEqual(h.scanned,[outer]);assert.equal(h.pendingRoots.size,0);
});
test("Build 398: disconnected roots are not rescanned",()=>{
 const h=harness(),n=h.node(h.body);h.scheduleScan(n);n.isConnected=false;
 h.tick();assert.equal(h.scanned.length,0);
 h.scheduleScan(n);assert.equal(h.frames.length,0);
});
test("Build 398: at most 48 distinct root scans per animation frame",()=>{
 const h=harness(),items=Array.from({length:80},()=>h.node(h.body));
 for(const n of items)h.scheduleScan(n);
 assert.equal(h.frames.length,1);h.tick();
 assert.equal(h.scanned.length,48);assert.equal(h.pendingRoots.size,32);
 assert.equal(h.frames.length,1);h.tick();
 assert.equal(h.scanned.length,80);assert.equal(h.pendingRoots.size,0);
});
test("Build 398: overflow falls back to a single full-body scan",()=>{
 const h=harness(),items=Array.from({length:97},()=>h.node(h.body));
 for(const n of items)h.scheduleScan(n);
 assert.equal(h.pendingRoots.size,1);assert.equal(h.frames.length,1);
 h.tick();assert.deepEqual(h.scanned,[h.body]);
});
test("Build 398: safe repeated resume is not forced into a new browser task",()=>{
 assert.match(source,/pendingLabels\.clear\(\); pendingRoots\.clear\(\)/);
 assert.match(source,/const RETRY_INTERVAL_MS = 50/);
 assert.match(source,/function wholePost\(/);
 assert.match(source,/function isKeptAuthor\(/);
});
