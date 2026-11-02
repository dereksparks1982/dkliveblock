"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict"),
 fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
const root=path.join(__dirname,"..");
const orion=fs.readFileSync(path.join(root,"src/orion-dom.js"),"utf8");
const firefox=fs.readFileSync(path.join(root,"src/content.js"),"utf8");
function fixture(host="www.facebook.com"){
 const listeners={},docs={},mutations=[],timeouts=new Map(),intervals=new Map(),meta=[],generic=[],events=[],spies={scans:0,genericScans:0,restore:0};
 let id=0;
 class MutationObserver {
  constructor(cb){this.callback=cb;mutations.push(this);}
  observe(target,opts){this.target=target;this.opts=opts;}
  disconnect(){this.disconnected=true;}
  fire(records){this.callback(records);}
 }
 const doc={body:{},documentElement:{},visibilityState:"visible",
  addEventListener:(kind,fn)=>{docs[kind]=fn;}};
 const win={location:{hostname:host,protocol:"https:",pathname:"/"},MutationObserver,
  setTimeout:fn=>{const key=++id;timeouts.set(key,fn);return key;},
  clearTimeout:key=>timeouts.delete(key),setInterval:fn=>{const key=++id;intervals.set(key,fn);return key;},
  clearInterval:key=>intervals.delete(key),
  addEventListener:(kind,fn)=>{listeners[kind]=fn;}};
 win.top=win;
 const ctx={window:win,document:doc,DKFacebookAds:{
  create:()=>host.endsWith("facebook.com")?{
   scan:()=>{spies.scans++;},restore:()=>{spies.restore++;},
   observeMutation:record=>{meta.push(record.id);return !!record.meta;}}:null},
  DKAdRecognition:{create:()=>({scan:()=>{spies.genericScans++;},
   restore:()=>{spies.restore++;}}),
   relevantMutation:record=>{generic.push(record.id);return !!record.generic;}}
 };
 vm.runInNewContext(orion,ctx,{timeout:1000});
 return {listeners,docs,mutations,timeouts,intervals,meta,generic,events,doc,spies,fire:records=>mutations.at(-1).fire(records),
  flush(){const run=[...timeouts.values()];timeouts.clear();run.forEach(fn=>fn());}};
}
test("Orion batch: inspect all 40 mutations even when the first already schedules a scan",()=>{
 const f=fixture(),records=Array.from({length:40},(_,i)=>({id:i,meta:i===0||i===39}));
 f.fire(records);
 assert.equal(f.meta.length,40);
 assert.deepEqual(f.meta,Array.from({length:40},(_,i)=>i));
 assert.equal(f.timeouts.size,1);
 f.flush();assert.equal(f.spies.scans,2);
});
test("Orion batch: a removed Sponsored label after style mutation is retained for Facebook",()=>{
 const f=fixture();
 f.fire([{id:"css",meta:true},{id:"removed-label",meta:true},{id:"generic",generic:true}]);
 assert.deepEqual(f.meta,["css","removed-label","generic"]);
 assert.equal(f.timeouts.size,1);
});
test("Orion batch: cap inspection at 40 even under 10,000 changes",()=>{
 const f=fixture();
 f.fire(Array.from({length:10000},(_,i)=>({id:i,meta:i===9999})));
 assert.equal(f.meta.length,40);assert.equal(f.timeouts.size,0);
});
test("Orion batch: generic ad recognition still works without a Facebook trigger",()=>{
 const f=fixture("example.com");
 f.fire([{id:"ordinary"},{id:"gpt",generic:true}]);
 assert.deepEqual(f.generic,["ordinary","gpt"]);
 f.flush();assert.equal(f.spies.genericScans,2);
});
test("Orion batch: pagehide cancels scheduled scans and reverts both scanner styles",()=>{
 const f=fixture();
 f.fire([{id:1,meta:true}]);
 assert.equal(f.timeouts.size,1);
 f.listeners.pagehide();
 assert.equal(f.timeouts.size,0);assert.equal(f.intervals.size,0);
 assert.equal(f.spies.restore,2);
});
test("Orion batch: late timeout callback cannot scan a reopened page",()=>{
 const f=fixture();
 f.fire([{id:1,meta:true}]);const stale=[...f.timeouts.values()][0];
 f.listeners.pagehide();f.listeners.pageshow();
 const baseline=f.spies.scans;
 stale();
 assert.equal(f.spies.scans,baseline);
});
test("Orion batch: resume from page cache reinstalls observer and scanner once",()=>{
 const f=fixture();
 f.listeners.pagehide();f.listeners.pageshow();
 assert.equal(f.mutations.length,2);
 assert.equal(f.spies.scans,2);
 f.listeners.pageshow();
 assert.equal(f.mutations.length,2);
});
test("Orion batch: visibility return queues a scan; hidden tab never scans",()=>{
 const f=fixture();
 f.doc.visibilityState="hidden";
 f.docs.visibilitychange();
 assert.equal(f.timeouts.size,0);
 f.doc.visibilityState="visible";f.docs.visibilitychange();
 assert.equal(f.timeouts.size,1);
 f.flush();assert.equal(f.spies.scans,2);
});
test("Orion batch: observer subscribes to Meta style and label updates",()=>{
 const f=fixture();
 const opts=f.mutations[0].opts;
 assert.equal(opts.subtree,true);
 for(const key of ["style","class","aria-labelledby","aria-label","data-pagelet"])
  assert.ok(opts.attributeFilter.includes(key));
});
test("Firefox batch: existing bounded observer no longer stops before processing late Meta records",()=>{
 assert.match(firefox,/records\.slice\(0,40\)/);
 const start=firefox.indexOf("new MutationObserver(records=>{");
 assert.ok(start>0);
 const snippet=firefox.slice(start,firefox.indexOf("overlayObserver.observe",start));
 assert.match(snippet,/facebookRecognizer\?\.observeMutation\(item\)/);
 assert.doesNotMatch(snippet,/if\(popups&&ads\)break/);
});
test("Orion batch: neither adapter introduces network interception, tracking, or remote calls",()=>{
 assert.doesNotMatch(orion,/webRequest|filterResponseData|fetch\(|XMLHttpRequest|sendBeacon/);
 assert.doesNotMatch(orion,/indexedDB|localStorage|cookies/);
});
