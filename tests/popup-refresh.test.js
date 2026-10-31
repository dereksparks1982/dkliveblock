"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
test("late settings replies cannot undo newer popup protection state",async()=>{
 const pending=[],events={};let restarts=0,style;
 const page={appendChild:node=>{node.isConnected=true;style=node;}};
 const body={},document={
  documentElement:page,body,querySelector:()=>null,querySelectorAll:()=>[],
  createElement:()=>({isConnected:false,textContent:"",remove(){this.isConnected=false;}})
 };
 const runtime={onMessage:{addListener:()=>{}},sendMessage:()=>new Promise(resolve=>pending.push(resolve))};
 const browser={runtime};
 const recovery={
  restore(){restarts++;},prune(){},wasHidden(){return false;},
  hide(){return false;},hideBackdropAround(){return 0;},unlockScroll(){return false;}
 };
 const context=vm.createContext({
  document,browser,window:{addEventListener:(key,fn)=>events[key]=fn},
  location:{hostname:"news.example",href:"https://news.example/story"},
  DKOverlayRecovery:{create:()=>recovery},DKVideoAssist:{createController:()=>({scan(){}}),isStreamingHost:()=>false},
  DKPopupGuard:{shouldInspectMutation:()=>false,protectedDialog:()=>false},
  DKConsent:{},DKPaywall:{},DKAntiAdblock:{},DKProcedural:{},
  DKCosmeticDebug:{create:()=>({restore(){},highlight(){return {ok:true};}}),inspect:()=>[]},
  MutationObserver:class{observe(){}disconnect(){}},setInterval:()=>{}
 });
 vm.runInContext(fs.readFileSync(path.join(__dirname,"../src/content.js"),"utf8"),context);
 assert.equal(pending.length,1);
 events.popstate();
 assert.equal(pending.length,2);
 pending[1]({active:true,css:".new-rule {display:none!important}",antiAdblock:true,paywallPopups:true,distractionControl:true,procedural:[]});
 await new Promise(resolve=>setTimeout(resolve,0));
 assert.equal(style?.textContent,".new-rule {display:none!important}");
 pending[0]({active:false,css:"",antiAdblock:false,paywallPopups:false,distractionControl:false,procedural:[]});
 await new Promise(resolve=>setTimeout(resolve,0));
 assert.equal(style?.isConnected,true);
 assert.equal(restarts,0);
 events.popstate();
 pending[2]({active:true,css:".new-rule {display:none!important}",antiAdblock:true,paywallPopups:true,distractionControl:true,procedural:[]});
 await new Promise(resolve=>setTimeout(resolve,0));
 assert.equal(restarts,0,"Unchanged settings should not restore and flash hidden popups");
 events.popstate();
 pending[3]({active:false,css:"",antiAdblock:false,paywallPopups:false,distractionControl:false,procedural:[]});
 await new Promise(resolve=>setTimeout(resolve,0));
 assert.equal(restarts,1,"Disabling protection restores suppressed popups exactly once");
 assert.equal(style.isConnected,false);
});
