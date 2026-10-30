"use strict";
const test=require("node:test"),assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
function setup({text="Ad blocker detected. Please disable your ad blocker.",hasVideo=false,active=true,antiAdblock=true,inline=false,sensitive=false}={}){
 let listener,interval;
 class Style {
  constructor(){this.map=new Map();}
  getPropertyValue(k){return this.map.get(k)?.value||"";}
  getPropertyPriority(k){return this.map.get(k)?.priority||"";}
  setProperty(k,value,priority=""){this.map.set(k,{value,priority});}
  removeProperty(k){this.map.delete(k);}
 }
 class Element{
  constructor(label){this.textContent=label;this.style=new Style();this.isConnected=true;this.localName="div";this.id=inline?"adblock-article":"adblock-modal";this.className=inline?"article":"modal";this.previousElementSibling=null;this.nextElementSibling=null;}
  getClientRects(){return [1];}contains(){return false;}
  querySelector(query){return hasVideo||sensitive&&query.includes('password')?{}:null;}
  getAttribute(){return null;}
 }
 const modal=new Element(text);
 const root={style:new Style(),scrollHeight:1800,isConnected:true},body={style:new Style(),isConnected:true};
 const state={active,antiAdblock};
 const browser={runtime:{onMessage:{addListener:fn=>{listener=fn;}},sendMessage:async()=>({active:state.active,css:"",youtubeSkip:false,cookieReject:false,antiAdblock:state.antiAdblock,procedural:[]})}};
 const document={documentElement:root,body,fullscreenElement:null,querySelectorAll:()=>[modal],querySelector:()=>null};
 const window={innerHeight:700,getComputedStyle:el=>({visibility:"visible",display:"block",position:inline?"static":"fixed",overflowY:el===modal?"visible":"hidden"})};
 const location={hostname:"youtube.com",href:"https://www.youtube.com/watch?v=test"};
 const context=vm.createContext({browser,document,window,location,Element,console,CSS:{},MutationObserver:class{},Date,setInterval:fn=>{interval=fn;},DKConsent:{cookieContext:()=>false},DKProcedural:{matches:()=>false}});
 for(const name of ["anti-adblock.js","video-assist.js","overlay-recovery.js","auth-protection.js","popup-guard.js","content.js"]){
  vm.runInContext(fs.readFileSync(path.join(__dirname,"../src",name),"utf8"),context,{filename:name});
 }
 return {state,modal,root,body,tick:()=>interval(),refresh:async()=>{await listener({action:"refresh"});await new Promise(resolve=>setTimeout(resolve,0));}};
}
test("recognizes and hides an anti-adblock popup without removing the video player",async()=>{
 const x=setup();await x.refresh();x.tick();
 assert.equal(x.modal.style.getPropertyValue("display"),"none");
 assert.equal(x.root.style.getPropertyValue("overflow-y"),"auto");
 x.state.active=false;await x.refresh();
 assert.equal(x.modal.style.getPropertyValue("display"),"");
 assert.equal(x.root.style.getPropertyValue("overflow-y"),"");
});
test("feature toggle and non-adblock overlays are left alone",async()=>{
 const disabled=setup({antiAdblock:false});await disabled.refresh();disabled.tick();
 assert.equal(disabled.modal.style.getPropertyValue("display"),"");
 const paywall=setup({text:"Subscribe to continue watching."});await paywall.refresh();paywall.tick();
 assert.equal(paywall.modal.style.getPropertyValue("display"),"");
});
test("never hide any popup containing a video player",async()=>{
 const x=setup({hasVideo:true});await x.refresh();x.tick();
 assert.equal(x.modal.style.getPropertyValue("display"),"");
});
test("leave article text about ad blockers alone unless shown as a popup",async()=>{
 const x=setup({inline:true});await x.refresh();x.tick();
 assert.equal(x.modal.style.getPropertyValue("display"),"");
});

test("recognize AP's disable-ad-blocker request only when shown as an overlay",async()=>{
 const ap=setup({text:"Support independent journalism. Please consider disabling your ad blocker or donate to support our reporting."});
 await ap.refresh();ap.tick();
 assert.equal(ap.modal.style.getPropertyValue("display"),"none");
 const story=setup({text:"Please read our article about ad blockers and their impact."});
 await story.refresh();story.tick();
 assert.equal(story.modal.style.getPropertyValue("display"),"");
});

test("do not hide login and authentication dialogs that mention adblock",async()=>{
 const login=setup({sensitive:true});
 await login.refresh();login.tick();
 assert.equal(login.modal.style.getPropertyValue("display"),"");
 assert.equal(login.root.style.getPropertyValue("overflow-y"),"");
});
