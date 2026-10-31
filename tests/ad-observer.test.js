"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
test("Build 56 debounce only schedules one scan and keeps site pause functional",async()=>{
 const timers=[],watchers=[];let mutation,scans=0,restores=0,handler;
 let settings={active:true,css:"",antiAdblock:false,paywallPopups:false,
  distractionControl:false,adRecognition:true,procedural:[],youtubeSkip:false};
 class Observer{
  constructor(fn){mutation=fn;}
  observe(_node,opts){watchers.push(opts);}
  disconnect(){}
 }
 const doc={body:{},documentElement:{},fullscreenElement:null,querySelector:()=>null,
  querySelectorAll:()=>[],createElement:()=>({isConnected:false,remove(){}})};
 const context=vm.createContext({document:doc,Date,MutationObserver:Observer,
  browser:{runtime:{onMessage:{addListener:fn=>{handler=fn;}},sendMessage:async()=>settings}},
  location:{hostname:"news.example",href:"https://news.example/"},
  window:{addEventListener(){}},
  DKVideoAssist:{createController:()=>({scan(){}}),isStreamingHost:()=>false},
  DKAdRecognition:{create:()=>({scan(){scans++;},restore(){restores++;}}),
   relevantMutation:r=>r.type==="childList"&&!!r.addedNodes?.length},
  DKOverlayRecovery:{create:()=>({restore(){},prune(){},wasHidden(){return false;}})},
  DKCosmeticDebug:{create:()=>({restore(){}})},
  DKPopupGuard:{shouldInspectMutation:()=>false},
  setTimeout:fn=>{timers.push(fn);return timers.length;},setInterval:()=>{}});
 vm.runInContext(fs.readFileSync(path.join(__dirname,"../src/content.js"),"utf8"),context);
 await new Promise(resolve=>setTimeout(resolve,0));
 assert.equal(scans,1);
 assert.ok(watchers[0].attributeFilter.includes("data-ad-slot"));
 assert.ok(watchers[0].attributeFilter.includes("data-google-query-id"));
 assert.ok(watchers[0].attributeFilter.includes("name"));
 const event=[{type:"childList",addedNodes:[{}]}];
 mutation(event);mutation(event);
 assert.equal(timers.length,1);
 timers.shift()();
 assert.equal(scans,2);
 mutation([{type:"attributes",attributeName:"style",target:{}}]);
 assert.equal(timers.length,0);
 settings={...settings,adRecognition:false};
 handler({action:"refresh"});
 await new Promise(resolve=>setTimeout(resolve,0));
 assert.equal(restores,1);
 mutation(event);
 assert.equal(timers.length,0);
});
