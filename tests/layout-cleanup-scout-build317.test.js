"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict");
const L=require("../src/layout-reflow.js"),S=require("../src/nesty-layout-scout.js");
function cls(v){const a=new Set(v.split(" "));let blocked=false;return{contains:k=>a.has(k),add:k=>a.add(k),remove(k){if(blocked)throw Error("blocked");a.delete(k)},block:x=>{blocked=x}}}
function fixture(){
 const list={tagName:"UL",classList:cls("videos"),isConnected:true,closest:()=>null,children:[0,1].map(()=>({tagName:"LI",classList:cls("videoblock"),querySelector:()=>({})}))};
 const style={isConnected:false,remove(){this.isConnected=false}};
 const doc={body:{},querySelectorAll:()=>[list],createElement:()=>style,documentElement:{appendChild:()=>{style.isConnected=true}}};
 return {list,layout:L.create(doc,{location:{hostname:"pornhub.com",pathname:"/"}})};
}
function specialist(){return S.create({location:{hostname:"pornhub.com"}},{byKey:()=>({id:"nesty_layout_scout",title:"Nesty Layout Scout"})})}
test("Build 317: unfinished rollback shows a read-only Nesty finding",()=>{
 const x=fixture();x.layout.scan();x.list.classList.block(true);
 assert.equal(x.layout.restore(),false);assert.equal(x.layout.status().cleanupPending,true);
 assert.equal(x.layout.diagnostics().cleanupPending,true);
 const r=specialist().review(x.layout.diagnostics(),{active:true,enabled:true});
 assert.equal(r.finding,"layout-cleanup-pending");assert.equal(r.nextStep,"retry-existing-rollback");
 assert.equal(r.executable,false);
});
test("Build 317: rollback retry clears the pending state",()=>{
 const x=fixture();x.layout.scan();x.list.classList.block(true);x.layout.restore();
 x.list.classList.block(false);assert.equal(x.layout.restore(),true);
 assert.equal(x.layout.status().cleanupPending,false);
});
test("Build 317: scan does not layer another grid over cleanup failure",()=>{
 const x=fixture();x.layout.scan();x.list.classList.block(true);x.layout.restore();
 assert.equal(x.layout.scan(),0);assert.equal(x.layout.status().cleanupPending,true);
});
test("Build 317: legacy diagnostics normalize with false default",()=>{
 const a={supportedPage:true,scannedLists:1,eligibleLists:1,videoTiles:2,emptyAdSlots:0,mixedLists:0,shortLists:0,oversizedLists:0,appliedLists:0,appliedSlots:0,scans:1};
 assert.equal(S.normalize(a).cleanupPending,false);assert.equal(S.normalize({...a,cleanupPending:true}).cleanupPending,true);
});
test("Build 317: browser permissions and site scope intact",()=>{
 assert.equal(S.supports("facebook.com"),false);assert.equal(require("../package.json").version,require("../src/manifest.json").version);
});