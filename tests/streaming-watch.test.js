"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict");
const W=require("../src/streaming-watch.js");
function fixture(){
 let observer,callback,active=true,clicks=0,serial=0;
 const timers=new Map();
 class MockObserver{
  constructor(fn){callback=fn;observer=this;}
  observe(root,settings){this.root=root;this.settings=settings;}
  disconnect(){this.disconnected=true;}
 }
 const document={documentElement:{}};
 const w=W.create(document,()=>{clicks++;},()=>active,{
  MutationObserver:MockObserver,delay:120,
  setTimeout:fn=>{const id=++serial;timers.set(id,fn);return id;},
  clearTimeout:id=>timers.delete(id)
 });
 function flush(){const batch=[...timers];timers.clear();for(const [,fn] of batch)fn();}
 function node(related){return {nodeType:1,matches:()=>related,closest:()=>null,querySelector:()=>null};}
 return {w,document,flush,node,emit:r=>callback([r]),get observer(){return observer;},get clicks(){return clicks;},get pending(){return timers.size;},disable:()=>{active=false;}};
}
test("preroll skip appearances trigger bounded prompt scans",()=>{
 const f=fixture();assert.equal(f.w.start(),true);f.flush();assert.equal(f.clicks,1);
 f.emit({type:"childList",target:f.node(false),addedNodes:[f.node(true)]});
 f.emit({type:"attributes",target:f.node(true)});
 assert.equal(f.pending,1);f.flush();assert.equal(f.clicks,2);
});
test("midroll becomes actionable when existing player changes class",()=>{
 const f=fixture();f.w.start();f.flush();
 f.emit({type:"attributes",attributeName:"class",target:f.node(true)});
 f.flush();assert.equal(f.clicks,2);
});
test("irrelevant site mutations never rescan the player",()=>{
 const f=fixture();f.w.start();f.flush();
 f.emit({type:"childList",target:f.node(false),addedNodes:[f.node(false)]});
 assert.equal(f.pending,0);assert.equal(f.clicks,1);
});
test("disabled protection disconnects and cancels scheduled callbacks",()=>{
 const f=fixture();f.w.start();f.flush();
 f.emit({type:"attributes",target:f.node(true)});
 assert.equal(f.pending,1);f.w.stop();assert.equal(f.observer.disconnected,true);
 f.flush();assert.equal(f.clicks,1);assert.equal(f.w.poke(),false);
 f.disable();assert.equal(f.w.start(),false);
});
test("SPA navigation poke checks the next ad without a full-page reload",()=>{
 const f=fixture();f.w.start();f.flush();
 assert.equal(f.w.poke(),true);f.flush();assert.equal(f.clicks,2);
});
test("unavailable observer and malformed mutations fail without disrupting playback",()=>{
 const w=W.create({documentElement:{}},()=>{throw Error("no")},()=>true,{MutationObserver:null});
 assert.equal(w.start(),false);
 assert.equal(W.relevant([{type:"childList",target:null}]),false);
 assert.equal(W.elementRelated({nodeType:3}),false);
});
