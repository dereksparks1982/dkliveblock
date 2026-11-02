"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict");
const Meta=require("../src/meta-graphql.js");
const normal={data:{viewer:{news_feed:{edges:[{node:{id:"friend"}},
 {category:"SPONSORED",node:{id:"ad"}}]}}}};
const line=JSON.stringify(normal),plain={data:{viewer:{id:"ordinary"}}};
const unedited=str=>{const r=Meta.rewrite(str);assert.equal(r.changed,false);assert.equal(r.text,str);};
function clock(){
 let now=0,serial=0;
 const active=new Map();
 return {setTimeout(fn,ms){const id=++serial;active.set(id,{at:now+ms,fn});return id;},
  clearTimeout(id){active.delete(id);},
  tick(ms){
   const end=now+ms;
   while(true){
    const due=[...active].filter(([,x])=>x.at<=end).sort((a,b)=>a[1].at-b[1].at)[0];
    if(!due)break;now=due[1].at;active.delete(due[0]);due[1].fn();
   }now=end;
  },get pending(){return active.size;}};
}
const d={requestId:"meta-build265",tabId:265,statusCode:200,method:"POST",
 type:"xmlhttprequest",pageHost:"www.facebook.com",
 url:"https://www.facebook.com/api/graphql/",
 documentUrl:"https://www.facebook.com/feed",
 responseHeaders:[{name:"Content-Type",value:"application/json; charset=utf-8"}]};
function harness(tab,clockObj=clock()){
 const output=[],filter={write(x){output.push(new Uint8Array(x));},
  close(){this.closed=true;},disconnect(){this.disconnected=true;}};
 const accepted=Meta.attach({...d,tabId:tab,requestId:"meta-"+tab},{filterResponseData:()=>filter},clockObj);
 const bytes=()=>{const all=new Uint8Array(output.reduce((n,x)=>n+x.length,0));let p=0;for(const x of output){all.set(x,p);p+=x.length;}return all;};
 return {accepted,filter,clock:clockObj,bytes};
}
test("Build 265: malformed later JSONL record prevents editing an earlier ad entry",()=>{
 const input="for (;;);"+line+"\n"+'{"data":{"viewer":'+"\n";
 unedited(input);
});
test("Build 265: unknown transport record cancels an entire JSONL transaction",()=>{
 const input="for (;;);"+line+"\n"+'<html>bad payload</html>'+"\n";
 unedited(input);
});
test("Build 265: an error in any JSONL record blocks all earlier ad edits",()=>{
 const input="for (;;);"+line+"\n"+
 JSON.stringify({errors:[{message:"authentication failed"}],data:{viewer:{id:"protected"}}})+"\n";
 unedited(input);
});
test("Build 265: error-bearing RequireJS envelope preserves inner feed",()=>{
 const input=JSON.stringify({errors:[{message:"failed"}],require:[[
 "Loader",[],[],[{__bbox:{result:normal}}]
 ]]});
 unedited(input);
});
test("Build 265: valid multi-record JSONL remains filtered without touching safe record",()=>{
 const input="for (;;);"+line+"\r\n"+JSON.stringify(plain)+"\r\n";
 const r=Meta.rewrite(input);assert.equal(r.changed,true);assert.equal(r.removed,1);
 const parts=r.text.slice("for (;;);".length).trim().split("\r\n");
 assert.equal(parts.length,2);
 assert.deepEqual(JSON.parse(parts[0]).data.viewer.news_feed.edges.map(x=>x.node.id),["friend"]);
 assert.deepEqual(JSON.parse(parts[1]),plain);
});
test("Build 265: timer renews after activity, timeout flushes original bytes",()=>{
 const t=clock(),h=harness(268,t);assert.equal(h.accepted,true);
 const input='{"message":"no valid Facebook ad shape"}';
 const a=new TextEncoder().encode(input);
 h.filter.ondata({data:a.slice(0,12)});
 t.tick(3100);assert.equal(h.filter.disconnected,undefined);
 h.filter.ondata({data:a.slice(12)});
 t.tick(3100);assert.equal(h.filter.disconnected,undefined);
 t.tick(1000);assert.equal(h.filter.disconnected,true);
 assert.equal(new TextDecoder().decode(h.bytes()),input);
 assert.equal(Meta.stats(268).timeout,1);
 assert.equal(t.pending,0);Meta.clear(268);
});
test("Build 265: absolute lifetime still expires when response trickles data",()=>{
 const t=clock(),h=harness(269,t);assert.equal(h.accepted,true);
 for(let i=0;i<6;i++){
  h.filter.ondata({data:new Uint8Array([65])});
  t.tick(3000);
  assert.equal(h.filter.disconnected,undefined);
 }
 h.filter.ondata({data:new Uint8Array([66])});
 t.tick(2000);
 assert.equal(h.filter.disconnected,true);
 assert.equal(new TextDecoder().decode(h.bytes()),"AAAAAAB");
 assert.equal(t.pending,0);Meta.clear(269);
});
test("Build 265: bounded chunk count fails open instead of buffering forever",()=>{
 const h=harness(270);assert.equal(h.accepted,true);
 for(let i=0;i<Meta.MAX_CHUNKS;i++)h.filter.ondata({data:new Uint8Array([65])});
 assert.equal(h.filter.disconnected,undefined);
 h.filter.ondata({data:new Uint8Array([66])});
 assert.equal(h.filter.disconnected,true);
 const bytes=h.bytes();assert.equal(bytes.length,Meta.MAX_CHUNKS+1);
 assert.equal(bytes[0],65);assert.equal(bytes[bytes.length-1],66);
 assert.equal(Meta.stats(270).oversized,1);Meta.clear(270);
});
test("Build 265: invalid UTF-8 returns unmodified response chunks",()=>{
 const h=harness(271);assert.equal(h.accepted,true);
 h.filter.ondata({data:new Uint8Array([123,255,125])});
 h.filter.onstop();
 assert.equal(h.filter.closed,true);
 assert.deepEqual(Array.from(h.bytes()),[123,255,125]);Meta.clear(271);
});
test("Build 265: max two concurrent filters per Facebook tab then release",()=>{
 const t=clock(),a=harness(272,t),b=harness(272,t),c=harness(272,t);
 assert.equal(a.accepted,true);assert.equal(b.accepted,true);assert.equal(c.accepted,false);
 a.filter.onstop();b.filter.onstop();
 const fourth=harness(272,t);assert.equal(fourth.accepted,true);
 fourth.filter.onstop();Meta.clear(272);assert.equal(t.pending,0);
});
