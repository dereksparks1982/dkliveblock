"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
function create({host="www.youtube.com",active=true,skip=true,label="Skip Ad",cls="ytp-ad-skip-button",visible=true}={}){
 let listener,interval,skips=0,refreshCalls=0;
 const state={active,skip},events={};
 const button={
  className:cls,isConnected:true,disabled:false,textContent:label,
  getAttribute:name=>name==="aria-label"?label:null,
  getClientRects:()=>visible?[1]:[],
  closest:()=>null,click:()=>{skips++;}
 };
 const doc={documentElement:{},body:{},fullscreenElement:null,
  querySelectorAll:selector=>selector.includes("ytp-ad-skip-button")?[button]:[],
  querySelector:()=>null};
 const window={innerHeight:700,addEventListener:(name,fn)=>events[name]=fn};
 const browser={runtime:{onMessage:{addListener:fn=>listener=fn},
  sendMessage:async()=>{refreshCalls++;return {active:state.active,youtubeSkip:state.skip,
   antiAdblock:false,paywallPopups:false,cookieReject:false,css:"",procedural:[]};}}};
 const context=vm.createContext({
  browser,document:doc,window,location:{hostname:host,href:"https://"+host+"/watch?v=1"},
  CSS:{},Date,console,MutationObserver:class{observe(){}disconnect(){}},
  DKConsent:{},DKProcedural:{},DKPaywall:{},DKAntiAdblock:{},
  setInterval:fn=>{interval=fn;return 1;}
 });
 for(const file of ["video-assist.js","overlay-recovery.js","auth-protection.js","popup-guard.js","content.js"])
  vm.runInContext(fs.readFileSync(path.join(__dirname,"../src",file),"utf8"),context,{filename:file});
 return {state,button,events,step:()=>interval?.(),skips:()=>skips,refreshCalls:()=>refreshCalls,
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
