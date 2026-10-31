"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path");
const root=path.resolve(__dirname,"..");
test("Build 57 browser VM fixtures supply the content-script dependencies",()=>{
 const manifest=JSON.parse(fs.readFileSync(path.join(root,"src/manifest.json"),"utf8"));
 const loaded=manifest.content_scripts[0].js;
 assert.ok(loaded.indexOf("cosmetic-debug.js")>=0);
 assert.ok(loaded.indexOf("cosmetic-debug.js")<loaded.indexOf("content.js"));
 for(const file of ["video-dom","overlay-observer","popup-refresh","anti-adblock-dom","paywall-dom","ad-observer"]){
  const text=fs.readFileSync(path.join(root,"tests",file+".test.js"),"utf8");
  assert.match(text,/DKCosmeticDebug:/,file+" has a cosmetic-debug VM stub");
 }
 const anti=fs.readFileSync(path.join(root,"tests/anti-adblock-dom.test.js"),"utf8");
 assert.match(anti,/DKStreamingWatch:/);
});

test("Build 138 procedural CSS restoration never overwrites later page style changes",()=>{
 const src=fs.readFileSync(path.join(root,"src/content.js"),"utf8");
 const begin=src.indexOf(" function restoreHidden(){");
 const end=src.indexOf(" function hideProcedural(){",begin);
 assert.ok(begin>=0&&end>begin);
 const snippet=src.slice(begin,end);
 const made=(map)=>new Function("hidden",snippet+" return restoreHidden;")(map);
 const state={value:"none",priority:"important",removed:false};
 const element={isConnected:true,style:{
  getPropertyValue(){return state.value;},
  getPropertyPriority(){return state.priority;},
  setProperty(_name,value,priority){state.value=value;state.priority=priority;},
  removeProperty(){state.value="";state.priority="";state.removed=true;}
 }};
 const map=new Map([[element,{value:"grid",priority:""}]]);
 made(map)();
 assert.equal(state.value,"grid");
 assert.equal(map.size,0);
 const changed=new Map([[element,{value:"inline-block",priority:""}]]);
 state.value="block";state.priority="";
 made(changed)();
 assert.equal(state.value,"block");
 assert.equal(changed.size,0);
 state.value="none";state.priority="important";
 made(new Map([[element,{value:"",priority:""}]]))();
 assert.equal(state.removed,true);
});
