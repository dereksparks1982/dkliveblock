"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict"),
 fs=require("node:fs"),path=require("node:path");
const src=fs.readFileSync(path.join(__dirname,"../src/facebook-ads.js"),"utf8");
function buildAudit(hidden,allowed=()=>false){
 const from=src.indexOf(" let auditCursor=0;"),to=src.indexOf(" function restore(){",from);
 assert.ok(from>=0&&to>from);
 const released=[],time={now:()=>10000};
 const audit=new Function("hidden","allowed","Date","restoreOne","stillSponsored",
  src.slice(from,to)+"return auditHidden;")(
  hidden,allowed,time,(el,old)=>released.push(el.id),el=>el.sponsored===true);
 return {audit,released,time};
}
function card(id,sponsored=true,connected=true){
 return {id,sponsored,isConnected:connected,contains:()=>false};
}
function info(){return {trigger:null,misses:0,lastMiss:0};}
test("Build 387: dormant audit rotates across sixty cards without unbounded scan",()=>{
 const cards=Array.from({length:60},(_,i)=>card(i)),hidden=new Map(cards.map(x=>[x,info()]));
 const h=buildAudit(hidden);cards[58].sponsored=false;
 assert.equal(h.audit(30),0);
 assert.equal(hidden.size,60);
 h.time.now=()=>11000;
 assert.equal(h.audit(30),0,"first inspection of later card must not restore");
 h.time.now=()=>12000;
 assert.equal(h.audit(30),0);
 h.time.now=()=>13000;
 assert.equal(h.audit(30),1,"second inspection of later card must restore");
 assert.equal(hidden.size,59);
 assert.deepEqual(h.released,[58]);
});
test("Build 387: unchanged sponsored posts remain hidden through repeated dormant audits",()=>{
 const cards=Array.from({length:15},(_,i)=>card(i)),hidden=new Map(cards.map(x=>[x,info()]));
 const h=buildAudit(hidden);
 for(let t=10000;t<100000;t+=10000){h.time.now=()=>t;assert.equal(h.audit(30),0);}
 assert.equal(hidden.size,15);
 assert.deepEqual(h.released,[]);
});
test("Build 387: recycled node restored only after separate negative audits",()=>{
 const el=card("recycled",true),hidden=new Map([[el,info()]]);
 const h=buildAudit(hidden);
 assert.equal(h.audit(30),0);el.sponsored=false;
 assert.equal(h.audit(30),0);
 h.time.now=()=>10699;assert.equal(h.audit(30),0);
 h.time.now=()=>10700;assert.equal(h.audit(30),1);
 assert.equal(hidden.size,0);
});
test("Build 387: whitelisted and disconnected cards are pruned without affecting others",()=>{
 const clean=card("clean"),allow=card("allowed"),removed=card("removed",true,false);
 const hidden=new Map([[clean,info()],[allow,info()],[removed,info()]]);
 const h=buildAudit(hidden,el=>el===allow);
 assert.equal(h.audit(30),2);
 assert.equal(hidden.size,1);
 assert.equal(hidden.has(clean),true);
 assert.deepEqual(h.released,["allowed"]);
});
test("Build 387: audit budget is clamped even when caller supplies huge number",()=>{
 const hidden=new Map(Array.from({length:90},(_,i)=>[card(i,false),info()]));
 const h=buildAudit(hidden);
 assert.equal(h.audit(50000),0);
 assert.equal([...hidden.values()].filter(x=>x.misses===1).length,30);
 assert.equal(h.audit(0),0);
 assert.equal([...hidden.values()].filter(x=>x.misses===1).length,31);
});
