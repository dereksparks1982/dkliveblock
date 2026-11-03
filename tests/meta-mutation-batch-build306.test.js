"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict"),
 fs=require("node:fs"),path=require("node:path");
const Meta=require("../src/meta-module.js"),FB=require("../src/facebook-ads.js");
const source=fs.readFileSync(path.join(__dirname,"../src/content.js"),"utf8");
function events(n){return Array.from({length:n},(_,i)=>({type:"attributes",index:i,target:{nodeType:1}}));}
test("Build 306: short mutation bursts are inspected once and in order",()=>{
 for(const n of [0,1,2,16,39,40]){
  const batch=events(n),selected=Meta.sampleMutations(batch);
  assert.deepEqual(selected,batch);
  assert.notEqual(selected,batch,"never mutate browser-supplied array");
 }
});
test("Build 306: large bursts preserve head, middle and tail with 40 total records",()=>{
 for(const n of [41,42,80,120,2000]){
  const sampled=Meta.sampleMutations(events(n));
  assert.equal(sampled.length,40);
  assert.equal(sampled[0].index,0);assert.equal(sampled[15].index,15);
  assert.equal(sampled[24].index,n-16);assert.equal(sampled[39].index,n-1);
  assert.ok(sampled.some(e=>e.index>15&&e.index<n-16),"middle retained");
  assert.equal(new Set(sampled.map(e=>e.index)).size,40);
  assert.ok(sampled.every((e,i)=>i===0||e.index>sampled[i-1].index));
 }
});
test("Build 306: malicious or malformed batches fail closed",()=>{
 for(const v of [null,undefined,"hello",{}, {length:100},42])assert.deepEqual(Meta.sampleMutations(v),[]);
 assert.deepEqual(Meta.sampleMutations(events(70),1000),[]);
 assert.deepEqual(Meta.sampleMutations(events(70),1),[]);
});
function adFixture(){
 const body={nodeType:1},doc={body,documentElement:{},location:{hostname:"www.facebook.com"}},
 win={location:{hostname:"www.facebook.com",pathname:"/"},innerWidth:1300};
 const style={value:"",priority:"",getPropertyValue(){return this.value;},
  getPropertyPriority(){return this.priority;},setProperty(_,value,priority){this.value=value;this.priority=priority||"";},
  removeProperty(){this.value="";this.priority="";}};
 const card={nodeType:1,isConnected:true,style,parentElement:body,children:[],
  matches:s=>s.includes('[role="article"]')&&!s.startsWith("main"),
  closest:()=>null,contains:()=>false,querySelector:s=>s.includes("/ads/about/")?{}:null,
  querySelectorAll:()=>[],getClientRects:()=>[{}],
  getBoundingClientRect:()=>({width:550,height:360,top:100,left:350})};
 doc.querySelectorAll=()=>{throw Error("Mutation fast path must not scan the full Facebook document");};
 return {body,doc,win,card};
}
test("Build 306: late sponsored insertion is handled by the existing safe Facebook scanner",()=>{
 const f=adFixture();const batch=events(128);
 batch[127]={type:"childList",target:f.body,addedNodes:[f.card]};
 const sampled=Meta.sampleMutations(batch);
 assert.equal(sampled.at(-1),batch[127]);
 const detector=FB.create(f.doc,f.win);
 assert.equal(detector.scanInserted(sampled),1);
 assert.equal(f.card.style.value,"none");
 detector.restore();assert.equal(f.card.style.value,"");
});
test("Build 306: no change to other sites or playback and no new privilege",()=>{
 assert.ok(source.includes('isFacebookHost&&typeof DKMetaModule!=="undefined"'));
 assert.ok(source.includes('DKMetaModule.sampleMutations(records,40):records.slice(0,40)'));
 assert.ok(source.includes('facebookRecognizer?.scanInserted?.(facebookChanges)'));
 const m=require("../src/manifest.json");assert.equal(m.version,require("../package.json").version);
 assert.ok(m.content_scripts[0].js.includes("meta-module.js"));
});
test("Build 306: old tests do not freeze the application at historical versions",()=>{
 for(const f of ["facebook-linked-author-build298","youtube-player-enforcement-build296",
  "youtube-player-pass-through-build297","website-back-to-top-build298",
  "layout-identity-build294","nesty-evidence-lab-build295"]){
  const c=fs.readFileSync(path.join(__dirname,f+".test.js"),"utf8");
  assert.doesNotMatch(c,/assert\.equal\((?:pkg|p|manifest)\.version,\s*"0\.3\.\d+"\)/);
 }
});