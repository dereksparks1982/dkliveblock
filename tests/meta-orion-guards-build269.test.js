"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict"),vm=require("node:vm"),
 fs=require("node:fs"),path=require("node:path");
const root=path.resolve(__dirname,"..");
const FB=require("../src/facebook-ads.js"),Nesty=require("../src/meta-agent-nesty.js");
function label(text){return {textContent:text,isConnected:true,children:[],
 tagName:"SPAN",childNodes:[{nodeType:3,textContent:text}],getAttribute:()=>null};}
test("Build 269: Meta Nesty 04 registered for expiring ephemeral evidence",()=>{
 assert.ok(Nesty.agents.some(a=>a.id==="agent_nesty_meta_04"&&a.status==="armed"));
 assert.equal(FB.CACHED_SPONSORED_TTL_MS,15000);
});
test("Build 269: removed Sponsored evidence is useful during a short bounded window",()=>{
 const at=1000,record={value:"sponsored",at};
 assert.equal(FB.cachedSponsored(record,null,[],at+14999),"sponsored");
 assert.equal(FB.cachedSponsored(record,null,[],at+15000),"");
 assert.equal(FB.cachedSponsored(record,null,[],at+15001),"");
 assert.equal(FB.cachedSponsored(record,null,[],at-1),"");
});
test("Build 269: reused live element ID supersedes cached old ad evidence",()=>{
 const saved={value:"sponsored",at:3000},live=label("Ordinary post");
 assert.equal(FB.cachedSponsored(saved,live,[],3001),"");
 assert.equal(FB.cachedSponsored(saved,live,["sponsored"],3001),"sponsored");
 live.textContent="Sponsored";assert.equal(FB.cachedSponsored(saved,live,["Sponsored"],3001),"sponsored");
});
test("Build 269: detached label with a short cache remains recognized",()=>{
 assert.equal(FB.cachedSponsored({value:"ad",at:5500},{isConnected:false,textContent:"Organic"},[],5700),"ad");
});
test("Build 269: cache rejects bad timestamps, arbitrary words, and unexpected shapes",()=>{
 for(const e of [null,{},123,{value:"friend",at:2},{value:"sponsored",at:NaN},
  {value:"sponsored",at:"not a timestamp"},{value:"sponsored",at:Infinity}]){
  assert.equal(FB.cachedSponsored(e,null,[],10),"");
 }
});
test("Build 269: a recycled label cannot rehide content after the 15-second limit",()=>{
 assert.equal(FB.cachedSponsored({value:"sponsored",at:0},null,[],500000),"");
});
test("Build 269: external string cache fixtures preserve earlier documented interface",()=>{
 assert.equal(FB.cachedSponsored("sponsored",null,[],100),"sponsored");
 assert.equal(FB.cachedSponsored("ordinary",null,[],100),"");
});
test("Build 269: no identity fields or user content in cached evidence",()=>{
 const source=fs.readFileSync(path.join(root,"src/facebook-ads.js"),"utf8");
 assert.ok(source.includes("Object.freeze({value:normalize(text),at:Date.now()})"));
 assert.ok(!source.includes("cache.set(id,textContent)"));
});
test("Build 269: actual scanner cache expiry uses bounded map traversal",()=>{
 const source=fs.readFileSync(path.join(root,"src/facebook-ads.js"),"utf8");
 assert.ok(source.includes("for(const [id,entry] of cache)"));
 assert.ok(source.includes("cache.delete(id)"));
});
test("Build 269: Orion popup includes exact-site guard on every command",()=>{
 const s=fs.readFileSync(path.join(root,"src/orion-popup.js"),"utf8");
 assert.ok(s.includes("site=hostFromUrl(current?.url"));
 assert.ok(s.includes("{action,site,paused:value}"));
 assert.ok(s.includes("response.site!==site"));
});
test("Build 269: Orion content refuses pause from a popup opened on another host",()=>{
 const code=fs.readFileSync(path.join(root,"src/orion-pause.js"),"utf8");
 let message=null;
 const browser={runtime:{onMessage:{addListener(fn){message=fn;}}},
  storage:{local:{get:()=>Promise.resolve({dkOrionPausedHosts:[]})},onChanged:{addListener(){}}}};
 const env={location:{hostname:"www.facebook.com"},browser};
 vm.runInNewContext(code,env,{timeout:1000});
 let response;
 const wrong=message({action:"dk-orion-set-pause",site:"example.org",paused:true},{},v=>{response=v;});
 assert.equal(wrong,false);assert.equal(response.ok,false);
});
test("Build 269: malformed Orion pause settings fail closed instead of silently resuming",async()=>{
 const code=fs.readFileSync(path.join(root,"src/orion-pause.js"),"utf8");
 let onPause=null;
 const browser={runtime:{onMessage:{addListener(){}}},storage:{
  local:{get:()=>Promise.resolve({dkOrionPausedHosts:{malformed:true}})},
  onChanged:{addListener(){}}
 }};
 const env={location:{hostname:"www.facebook.com"},browser};
 vm.runInNewContext(code,env,{timeout:1000});
 env.DKOrionPause.register(v=>{onPause=v;});
 for(let i=0;i<10;i++)await Promise.resolve();
 assert.equal(onPause,true);
 assert.equal(env.DKOrionPause.get().persistent,false);
});
test("Build 269: Firefox manifest stays isolated from Orion-only permissions",()=>{
 const m=require("../src/manifest.json");
 assert.ok(!m.content_scripts[0].js.includes("orion-pause.js"));
 assert.ok(m.content_scripts[0].js.indexOf("meta-agent-nesty.js")<
  m.content_scripts[0].js.indexOf("facebook-ads.js"));
 assert.equal(m.version,require("../package.json").version);
});
