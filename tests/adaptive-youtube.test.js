"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict");
const A=require("../src/adaptive-youtube.js");
const Y=require("../src/youtube-experiment.js");
test("Build 185 dormant defenses require repeated independent playback failures plus blocked media",()=>{
 const state=new Map(),start=100000;
 assert.equal(A.mode(state,10,"www.youtube.com",start),"combined");
 // A clean playback-failure sequence is independent of ad or enforcement cues.
 assert.equal(A.note(state,10,"www.youtube.com","buffering",false,start).changed,false);
 assert.equal(A.note(state,10,"www.youtube.com","media-error",true,start+1000).changed,false,
  "too-close signals must not count twice");
 const switched=A.note(state,10,"www.youtube.com","media-error",true,start+25000);
 assert.equal(switched.changed,true);
 assert.equal(switched.mode,"response-only");
 assert.equal(A.mode(state,10,"www.youtube.com",start+25001),"response-only");
 assert.deepEqual({...Y.policy(switched.mode)},{response:true,bridge:false,observe:false});
 assert.equal(A.status(state,10,"www.youtube.com",start+25001).active,true);
 assert.equal(A.mode(state,10,"www.youtube.com",switched.expires),"combined",
  "short fallback must expire into original combined mode");
});
test("Build 185 blocked-media evidence is required and prior failures expire",()=>{
 const state=new Map(),start=200000;
 A.note(state,3,"music.youtube.com","buffering",false,start);
 const second=A.note(state,3,"music.youtube.com","media-error",false,start+25000);
 assert.equal(second.changed,false);
 assert.equal(A.mode(state,3,"music.youtube.com",start+25001),"combined");
 assert.equal(A.note(state,3,"music.youtube.com","buffering",true,start+A.WINDOW_MS+1).changed,false,
  "expired observations cannot trigger a fallback alone");
 assert.equal(A.note(state,3,"music.youtube.com","buffering",true,start+A.WINDOW_MS+25002).changed,true);
});
test("Build 185 adaptive defense stays inside one tab and one official YouTube host",()=>{
 const state=new Map();
 A.note(state,7,"www.youtube.com","buffering",true,100000);
 A.note(state,7,"www.youtube.com","media-error",true,125000);
 assert.equal(A.mode(state,7,"youtube.com",125001),"combined",
  "host change clears old fallback");
 assert.equal(A.mode(state,8,"www.youtube.com",125001),"combined");
 assert.equal(A.note(state,4,"youtube.com.attacker.invalid","buffering",true,100000).changed,false);
 assert.equal(A.note(state,-1,"www.youtube.com","buffering",true,100000).changed,false);
 assert.equal(state.size,0);
});
test("Build 185 manual experiment modes always supersede adaptive fallback",()=>{
 const adaptive=new Map(),manual=new Map();
 A.note(adaptive,1,"www.youtube.com","buffering",true,100000);
 A.note(adaptive,1,"www.youtube.com","media-error",true,125000);
 assert.equal(Y.set(manual,1,"www.youtube.com","bridge-only",125001),true);
 const requested=Y.get(manual,1,"www.youtube.com",125002);
 assert.equal(requested,"bridge-only");
 assert.equal(Y.policy(requested).bridge,true);
 A.clear(adaptive,1);
 assert.equal(A.mode(adaptive,1,"www.youtube.com",125003),"combined");
});
test("Build 185 site/clock bounds, memory caps and private report shape",()=>{
 const state=new Map();
 for(let i=0;i<A.MAX_TABS+10;i++)
  A.note(state,i,"youtube.com","buffering",true,100000);
 assert.equal(state.size,A.MAX_TABS);
 assert.equal(A.mode(state,0,"youtube.com",100001),"combined");
 assert.equal(A.note(state,200,"youtube.com","buffering",true,NaN).changed,false);
 const fresh=A.status(state,201,"youtube.com",100000);
 assert.deepEqual(fresh,{active:false,mode:"combined",expires:0,reason:""});
 const serial=JSON.stringify([...state.values()]);
 assert.equal(/https?:|\/watch\?|videoId|title|SECRET/.test(serial),false);
});
test("Build 185 adaptive fallback is loaded before background and only uses existing modes",()=>{
 const fs=require("node:fs"),path=require("node:path");
 const manifest=JSON.parse(fs.readFileSync(path.join(__dirname,"../src/manifest.json"),"utf8"));
 const a=manifest.background.scripts.indexOf("adaptive-youtube.js");
 const b=manifest.background.scripts.indexOf("background.js");
 assert.ok(a>=0&&a<b);
 const background=fs.readFileSync(path.join(__dirname,"../src/background.js"),"utf8");
 assert.match(background,/DKAdaptiveYouTube\.note\(/);
 assert.match(background,/DKAdaptiveYouTube\.clear\(/);
 assert.match(background,/youtubeAdaptive:DKYouTubeExperiment\.validSite/);
 assert.doesNotMatch(background,/DKAdaptiveYouTube\.allowMedia|DKAdaptiveYouTube\.disableFiltering/);
});

test("Build 187 observed YouTube ad state is context, not a fault or filtering permit",()=>{
 const state=new Map();
 const first=A.note(state,187,"www.youtube.com","ad-showing",false,100000);
 assert.equal(first.changed,false);
 assert.equal(A.mode(state,187,"www.youtube.com",100000),"combined");
 const early=A.note(state,187,"www.youtube.com","buffering",true,125000);
 assert.equal(early.changed,false);
 const later=A.note(state,187,"www.youtube.com","media-error",true,150000);
 assert.equal(later.changed,false,
  "an ad state must suppress switching away from normal protections");
 assert.equal(A.mode(state,187,"www.youtube.com",150001),"combined");
});

// Build 369: bounded refusal recovery uses existing tab-local player isolation.
test("Build 369 refusal selects player pass-through, retains network filters and expires",()=>{
 const store=new Map(),now=100000,host="www.youtube.com";
 const first=A.recoverRefusal(store,9,host,now);
 assert.equal(first.changed,true);assert.equal(first.mode,"player-pass-through");
 assert.equal(A.mode(store,9,host,now+1),"player-pass-through");
 assert.deepEqual({...Y.policy(A.mode(store,9,host,now+1))},
  {response:false,bridge:false,observe:true});
 assert.equal(A.status(store,9,host,now+1).reason,"observed-youtube-playback-refusal");
 assert.equal(A.recoverRefusal(store,9,host,now+2000).changed,false);
 assert.equal(A.mode(store,9,host,first.expires),"combined");
});
test("Build 369 recovery is tab-scoped and refuses spoofed hosts",()=>{
 const store=new Map();
 assert.equal(A.recoverRefusal(store,2,"youtube.com.attacker.invalid",100000).changed,false);
 assert.equal(A.recoverRefusal(store,-1,"www.youtube.com",100000).changed,false);
 assert.equal(A.recoverRefusal(store,3,"www.youtube.com",100000).changed,true);
 assert.equal(A.mode(store,4,"www.youtube.com",100001),"combined");
 assert.equal(A.mode(store,3,"music.youtube.com",100001),"combined");
});
test("Build 369 background retries a refusal only through bounded isolation",()=>{
 const fs=require("node:fs"),path=require("node:path");
 const code=fs.readFileSync(path.join(__dirname,"../src/background.js"),"utf8");
 assert.match(code,/DKAdaptiveYouTube\\.recoverRefusal\\(/);
 assert.match(code,/if\\(recovered\\.changed\\)/);
 assert.match(code,/await browser\\.tabs\\.reload\\(id\\)/);
 assert.doesNotMatch(code,/DKAdaptiveYouTube\\.allowMedia|DKAdaptiveYouTube\\.disableFiltering/);
});
