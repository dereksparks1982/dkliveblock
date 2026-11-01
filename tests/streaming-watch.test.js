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

test("skip button appearing via its accessible label triggers a scan",()=>{
 const f=fixture();f.w.start();f.flush();
 let selectors="";
 const labelled={nodeType:1,matches:selector=>{selectors=selector;return selector.includes("button[aria-label='Skip Ad' i]");},
 closest:()=>null,querySelector:()=>null};
 f.emit({type:"attributes",attributeName:"aria-label",target:labelled});
 assert.match(selectors,/Skip Ad/);
 assert.equal(f.pending,1);
 f.flush();assert.equal(f.clicks,2);
});

test("huge DOM insertion lists are inspected without materializing all nodes",()=>{
 let reads=0;
 const first={nodeType:1,matches:()=>false,closest:()=>null,querySelector:()=>null};
 const entries=new Proxy({length:1000000}, {
  get(target,key){
   if(key===Symbol.iterator)throw Error("Do not materialize NodeList");
   if(/^\\d+$/.test(String(key))){reads++;return first;}
   return target[key];
  }
 });
 assert.equal(W.relevant([{type:"childList",target:first,addedNodes:entries}]),false);
 assert.ok(reads<=12,"Do not inspect more than 12 child nodes");
});
test("skip-ad text detection stays limited to known player-related selectors",()=>{
 let selector="";
 const labelled={nodeType:1,matches:s=>{selector=s;return s.includes("Skip Advertisement");},
  closest:()=>null,querySelector:()=>null};
 assert.equal(W.elementRelated(labelled),true);
 assert.match(selector,/Skip Advertisement/);
});

test("Build 57 detects localized labels and title changes inside the watcher",()=>{
 const f=fixture();f.w.start();f.flush();
 assert.ok(f.observer.settings.attributeFilter.includes("title"));
 for(const label of ["Passer l’annonce","Werbung überspringen","Reklamı geç","Пропустить рекламу","跳过广告"]){
  const node={nodeType:1,matches:s=>s.includes(label),closest:()=>null,querySelector:()=>null};
  f.emit({type:"attributes",attributeName:"aria-label",target:node});
  assert.equal(f.pending,1,label);f.flush();
 }
 assert.equal(f.clicks,6);
});

test("Build 156 ignores routine progress mutations inside the player",()=>{
 const playerChild={nodeType:1,matches:()=>false,
  closest:selector=>selector.includes(".html5-video-player")?{}:null,
  querySelector:()=>{throw Error("Attribute checks must never scan a subtree");}};
 const update={type:"attributes",attributeName:"style",target:playerChild};
 assert.equal(W.relevant([update]),false);
 assert.equal(W.relevant([{...update,attributeName:"data-progress"}]),false);
});
test("Build 156 still detects player-root ad state changes and nested new skip buttons",()=>{
 const player={nodeType:1,matches:s=>s.includes("#movie_player"),
  closest:()=>null,querySelector:()=>null};
 assert.equal(W.relevant([{type:"attributes",attributeName:"class",target:player}]),true);
 const ordinary={nodeType:1,matches:()=>false,closest:()=>null,querySelector:()=>null};
 const ad={nodeType:1,matches:s=>s.includes("ytp-ad-skip-button"),
  closest:()=>null,querySelector:()=>null};
 assert.equal(W.relevant([{type:"childList",target:ordinary,addedNodes:[ad]}]),true);
 const nested={nodeType:1,matches:()=>false,closest:()=>null,
  querySelector:s=>s.includes("Skip Ad")?ad:null};
 assert.equal(W.relevant([{type:"childList",target:ordinary,addedNodes:[nested]}]),true);
});
test("Build 156 ignores unrelated content insertions while honoring ad-module changes",()=>{
 const unrelated={nodeType:1,matches:()=>false,closest:()=>null,querySelector:()=>null};
 assert.equal(W.relevant([{type:"childList",target:unrelated,addedNodes:[unrelated]}]),false);
 const adArea={nodeType:1,matches:()=>false,
  closest:s=>s.includes(".ytp-ad-module")?{}:null,querySelector:()=>null};
 assert.equal(W.relevant([{type:"attributes",attributeName:"hidden",target:adArea}]),true);
});

test("Build 157 watcher recognizes title-only and translated skip controls",()=>{
 for(const attr of ["button[title='Skip Ad' i]",
  "button[aria-label='Saltar anuncios' i]",
  "button[aria-label='Reklamları atla' i]"]){
  const node={nodeType:1,matches:s=>s.includes(attr),
   closest:()=>null,querySelector:()=>null};
  assert.equal(W.relevant([{type:"attributes",attributeName:"title",target:node}]),true,attr);
 }
});
