"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict"),
 vm=require("node:vm"),fs=require("node:fs"),path=require("node:path");
const dir=path.resolve(__dirname,"..");
const source=p=>fs.readFileSync(path.join(dir,"src",p),"utf8");
const N=require("../src/meta-agent-nesty.js"),FB=require("../src/facebook-ads.js");
const node=(text,id="ad-label",tagName="SPAN")=>({nodeType:1,tagName,id,textContent:text});
test("Build 272 registers the bounded Agent Nesty Meta 06",()=>{
 assert.ok(N.agents.some(x=>x.id==="agent_nesty_meta_06"&&x.status==="armed"));
});
test("Meta 06 recognizes exact external Sponsored and Ad attribute signals",()=>{
 for(const text of ["Sponsored","Ad"]){
  const result=N.portalMutation({type:"attributes",attributeName:"style",target:node(text)});
  assert.equal(result?.id,"ad-label");
  assert.equal(result?.label,text.toLowerCase());
 }
});
test("Meta 06 does not use ordinary posts, invalid IDs or unrelated attribute changes",()=>{
 for(const text of ["Sponsored stories","my sponsored event","Ad revenue","Organic",""]){
  assert.equal(N.portalMutation({type:"attributes",attributeName:"style",target:node(text)}),null);
 }
 for(const obj of [node("Ad","bad id"),node("Sponsored","x","DIV"),node("Sponsored","x".repeat(91))])
  assert.equal(N.portalMutation({type:"attributes",attributeName:"style",target:obj}),null);
 assert.equal(N.portalMutation({type:"attributes",attributeName:"title",target:node("Sponsored")}),null);
});
test("Facebook uses Meta 06 only for bounded cache evidence",()=>{
 const win={location:{hostname:"www.facebook.com",pathname:"/"}};win.top=win;
 const fb=FB.create({location:win.location,body:{}},win);
 assert.equal(fb.observeMutation({type:"attributes",attributeName:"style",target:node("Sponsored")}),true);
 assert.equal(fb.diagnostics().cachedLabels,1);
 assert.equal(fb.observeMutation({type:"attributes",attributeName:"style",target:node("Organic","clean")}),false);
 assert.equal(fb.diagnostics().cachedLabels,1);
});
test("Orion pagehide prevents late pause callback restarting the scanner",()=>{
 let pause,scans=0;const events={};
 const doc={documentElement:{},visibilityState:"visible",addEventListener(){}};
 const win={location:{protocol:"https:",hostname:"www.facebook.com"},
  MutationObserver:class {observe(){} disconnect(){}},
  setTimeout:()=>1,clearTimeout(){},setInterval:()=>2,clearInterval(){},
  addEventListener:(name,fn)=>events[name]=fn};win.top=win;
 const env={document:doc,window:win,DKOrionPause:{register(fn){pause=fn;}},
  DKAdRecognition:{create:()=>({scan(){scans++;},restore(){}})},
  DKFacebookAds:{create:()=>null}};
 vm.runInNewContext(source("orion-dom.js"),env,{timeout:1000});
 pause(false);assert.equal(scans,1);
 events.pagehide();pause(false);assert.equal(scans,1);
 events.pageshow();assert.equal(scans,2);
 pause(true);pause(false);assert.equal(scans,3);
});
function pauseFixture(get){
 let onChange,onMessage,updated;
 const browser={runtime:{onMessage:{addListener(fn){onMessage=fn;}}},
  storage:{local:{get,set(value){updated=value;return Promise.resolve();}},onChanged:{addListener(fn){onChange=fn;}}}};
 browser.storage.local.get=get;
 const env={location:{hostname:"www.facebook.com"},browser};
 vm.runInNewContext(source("orion-pause.js"),env,{timeout:1000});
 return {env,storage:browser.storage.local,onChange:(v)=>onChange({dkOrionPausedHosts:{newValue:v}},"local"),
  onMessage:(action,paused)=>new Promise(resolve=>onMessage({action,site:"www.facebook.com",paused},{},resolve)),updated:()=>updated};
}
test("Orion ignores an old async read after a newer storage pause",async()=>{
 let finish;const promise=new Promise(r=>finish=r);
 const f=pauseFixture(()=>promise);
 f.onChange(["www.facebook.com"]);
 assert.equal(f.env.DKOrionPause.get().paused,true);
 finish({dkOrionPausedHosts:[]});
 for(let i=0;i<12;i++)await Promise.resolve();
 assert.equal(f.env.DKOrionPause.get().paused,true);
});
test("Orion rejects malformed storage changes without silently resuming",async()=>{
 const f=pauseFixture(()=>Promise.resolve({dkOrionPausedHosts:[]}));
 for(let i=0;i<12;i++)await Promise.resolve();
 f.onChange(["www.facebook.com",42]);
 assert.equal(f.env.DKOrionPause.get().paused,true);
 assert.equal(f.env.DKOrionPause.get().persistent,false);
 f.onChange([]);
 assert.equal(f.env.DKOrionPause.get().paused,false);
 assert.equal(f.env.DKOrionPause.get().persistent,true);
 f.onChange(Array(101).fill("example.com"));
 assert.equal(f.env.DKOrionPause.get().paused,true);
});
test("Orion save errors force conservative pause and report failure",async()=>{
 const f=pauseFixture(()=>Promise.resolve({dkOrionPausedHosts:[]}));
 for(let i=0;i<12;i++)await Promise.resolve();
 f.storage.set=()=>Promise.reject(Error("Storage denied"));
 const response=await f.onMessage("dk-orion-set-pause",false);
 assert.equal(response.ok,false);
 assert.equal(f.env.DKOrionPause.get().paused,true);
 assert.equal(f.env.DKOrionPause.get().persistent,false);
});
test("Build 272 packaging remains Orion-only and Firefox version is synchronized",()=>{
 assert.equal(require("../src/manifest.json").version,require("../package.json").version);
 const manifest=require("../src/manifest.json");
 assert.ok(!manifest.content_scripts[0].js.includes("orion-dom.js"));
 assert.ok(!manifest.content_scripts[0].js.includes("orion-pause.js"));
 assert.ok(!manifest.permissions.includes("declarativeNetRequest"));
});
