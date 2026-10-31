"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
function create({host="www.youtube.com",active=true,skip=true,label="Skip Ad",cls="ytp-ad-skip-button",visible=true}={}){
 let listener,interval,skips=0,refreshCalls=0,timerSerial=0;
 const timers=new Map(),observers=[];
 const state={active,skip},events={};
 const button={
  className:cls,isConnected:true,disabled:false,textContent:label,
  getAttribute:name=>name==="aria-label"?label:null,
  getClientRects:()=>visible?[1]:[],
  closest:()=>null,click:()=>{skips++;}
 };
 let currentButton=button;
 const doc={documentElement:{},body:{},fullscreenElement:null,
  querySelectorAll:selector=>selector.includes("ytp-ad-skip-button")?[currentButton]:[],
  querySelector:()=>null};
 const window={innerHeight:700,addEventListener:(name,fn)=>events[name]=fn};
 const browser={runtime:{onMessage:{addListener:fn=>listener=fn},
  sendMessage:async()=>{refreshCalls++;return {active:state.active,youtubeSkip:state.skip,
   antiAdblock:false,paywallPopups:false,cookieReject:false,css:"",procedural:[]};}}};
 const context=vm.createContext({
  browser,document:doc,window,location:{hostname:host,href:"https://"+host+"/watch?v=1"},
  CSS:{},Date,console,MutationObserver:class{constructor(fn){this.fn=fn;observers.push(this);}observe(_,options){this.options=options;}disconnect(){this.disconnected=true;}},
  setTimeout:fn=>{const id=++timerSerial;timers.set(id,fn);return id;},clearTimeout:id=>timers.delete(id),
  DKConsent:{},DKProcedural:{},DKPaywall:{},DKAntiAdblock:{},
  setInterval:fn=>{interval=fn;return 1;}
 });
 for(const file of ["video-assist.js","streaming-watch.js","overlay-recovery.js","auth-protection.js","popup-guard.js","content.js"])
  vm.runInContext(fs.readFileSync(path.join(__dirname,"../src",file),"utf8"),context,{filename:file});
 return {state,button,events,step:()=>interval?.(),skips:()=>skips,refreshCalls:()=>refreshCalls,
  drain:()=>{const batch=[...timers];timers.clear();for(const [,fn] of batch)fn();},
  nextAd:()=>{currentButton={...button,click:()=>{skips++;}};},
  firePlayerMutation:()=>{for(const o of observers)if(o.options?.attributeFilter?.includes("disabled"))
   o.fn([{type:"attributes",attributeName:"class",target:{nodeType:1,matches:()=>true,closest:()=>null,querySelector:()=>null}}]);},
  activeWatchers:()=>observers.filter(o=>o.options?.attributeFilter?.includes("disabled")&&!o.disconnected).length,
  ready:async()=>{await new Promise(resolve=>setTimeout(resolve,0));},
  refresh:async()=>{await listener({action:"refresh"});await new Promise(resolve=>setTimeout(resolve,0));}};
}
test("content script loads with the streaming helper in the correct order",()=>{
 const manifest=JSON.parse(fs.readFileSync(path.join(__dirname,"../src/manifest.json"),"utf8"));
 const scripts=manifest.content_scripts[0].js;
 assert.ok(scripts.indexOf("video-assist.js")<scripts.indexOf("content.js"));
 assert.ok(manifest.background.scripts.indexOf("video-assist.js")<manifest.background.scripts.indexOf("background.js"));
});

test("YouTube skip controls are clicked once and never clicked repeatedly at high frequency",async()=>{
 const x=create();await x.ready();x.step();x.step();x.step();
 assert.equal(x.skips(),1);
});
test("YouTube ad skip assistant never clicks an ordinary Skip Intro control",async()=>{
 const x=create({cls:"",label:"Skip Intro"});await x.ready();x.step();
 assert.equal(x.skips(),0);
});
test("non-YouTube streaming sites never receive automatic skip clicks",async()=>{
 const x=create({host:"www.disneyplus.com"});await x.ready();x.step();
 assert.equal(x.skips(),0);
});
test("pausing protection or turning off the assistant stops automatic clicks",async()=>{
 const noSkip=create({skip:false});await noSkip.ready();noSkip.step();
 assert.equal(noSkip.skips(),0);
 const paused=create({active:false});await paused.ready();paused.step();
 assert.equal(paused.skips(),0);
});
test("YouTube single-page navigation refreshes protection settings",async()=>{
 const x=create();await x.ready();
 const before=x.refreshCalls();
 assert.equal(typeof x.events["yt-navigate-finish"],"function");
 await x.events["yt-navigate-finish"]();
 await new Promise(resolve=>setTimeout(resolve,0));
 assert.ok(x.refreshCalls()>before);
 x.state.skip=false;
 await x.refresh();x.step();
 assert.equal(x.skips(),0);
});

test("Build 21: preroll and a new midroll control respond to player mutations",async()=>{
 const x=create();await x.ready();
 assert.equal(x.activeWatchers(),1);
 x.drain();assert.equal(x.skips(),1);
 x.nextAd();x.firePlayerMutation();x.drain();
 assert.equal(x.skips(),2);
});
test("Build 21: paused assistant detaches watcher and Disney+ never installs it",async()=>{
 const x=create();await x.ready();x.drain();
 x.state.skip=false;await x.refresh();
 assert.equal(x.activeWatchers(),0);
 x.nextAd();x.firePlayerMutation();x.drain();assert.equal(x.skips(),1);
 const disney=create({host:"www.disneyplus.com"});await disney.ready();
 assert.equal(disney.activeWatchers(),0);
});

test("Build 57 navigation resets stale skip cooldown, ordinary scans retain it",async()=>{
 const x=create();await x.ready();x.step();x.step();
 assert.equal(x.skips(),1);
 await x.events["yt-navigate-finish"]();await x.ready();x.step();
 assert.equal(x.skips(),2);
});
