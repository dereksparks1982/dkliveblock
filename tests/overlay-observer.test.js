"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
test("new modal inserted after load triggers one debounced scan",async()=>{
 const callbacks={};let scheduled=[],interval=null,visible=[];
 class Style {
  constructor(){this.props=new Map();}
  getPropertyValue(k){return this.props.get(k)?.value||"";}
  getPropertyPriority(k){return this.props.get(k)?.priority||"";}
  setProperty(k,v,priority=""){this.props.set(k,{value:v,priority});}
  removeProperty(k){this.props.delete(k);}
 }
 class Element{
  constructor(text){this.textContent=text;this.localName="div";this.id="adblock-modal";this.className="modal";
   this.isConnected=true;this.style=new Style();this.previousElementSibling=null;this.nextElementSibling=null;}
  contains(){return false;}
  querySelector(){return null;}
  getClientRects(){return [1];}
  getAttribute(){return null;}
 }
 const root={scrollHeight:1200,isConnected:true,style:new Style()},body={isConnected:true,style:new Style()};
 const doc={documentElement:root,body,fullscreenElement:null,querySelector:()=>null,querySelectorAll:()=>visible};
 const win={innerHeight:700,getComputedStyle:()=>({display:"block",visibility:"visible",overflowY:"hidden",position:"fixed"})};
 const fakeBrowser={runtime:{onMessage:{addListener:fn=>{callbacks.message=fn;}},sendMessage:async()=>({active:true,antiAdblock:true,paywallPopups:false,css:"",cookieReject:false,youtubeSkip:false,procedural:[]})}};
 class Observer{
  constructor(fn){callbacks.mutation=fn;}
  observe(_root,options){callbacks.observed=options;}
  disconnect(){}
 }
 const context=vm.createContext({document:doc,window:win,location:{hostname:"news.example",href:"https://news.example/"},
  Element,MutationObserver:Observer,browser:fakeBrowser,CSS:{},console,Date,
  DKConsent:{},DKAuthProtection:require("../src/auth-protection.js"),DKPopupGuard:require("../src/popup-guard.js"),DKOverlayRecovery:require("../src/overlay-recovery.js"),DKVideoAssist:require("../src/video-assist.js"),DKPaywall:{hasLoadedArticle:()=>false},DKProcedural:{},DKAntiAdblock:require("../src/anti-adblock.js"),
  setTimeout:fn=>{scheduled.push(fn);return scheduled.length;},setInterval:fn=>{interval=fn;}});
 vm.runInContext(fs.readFileSync(path.join(__dirname,"../src/content.js"),"utf8"),context);
 await new Promise(resolve=>setTimeout(resolve,0));
 assert.equal(callbacks.observed.childList,true);
 assert.equal(callbacks.observed.subtree,true);
 assert.equal(callbacks.observed.attributes,true);
 assert.ok(callbacks.observed.attributeFilter.includes("style"));
 // Complete the initial empty-page scan.
 while(scheduled.length)scheduled.shift()();
 assert.equal(visible.length,0);
 const popup=new Element("Ad blocker detected. Please disable your ad blocker.");
 visible.push(popup);
 callbacks.mutation([{addedNodes:[popup]}]);
 callbacks.mutation([{addedNodes:[popup]}]);
 assert.equal(scheduled.length,1,"Repeated mutations should be debounced");
 scheduled.shift()();
 assert.equal(popup.style.getPropertyValue("display"),"none");
 callbacks.mutation([{type:"attributes",target:popup}]);
 assert.equal(scheduled.length,0,"Our own style change should not rescan");
 callbacks.mutation([{type:"attributes",target:new Element("Please disable your ad blocker.")}]);
 assert.equal(scheduled.length,1,"External style changes should trigger one scan");
 scheduled.shift()();
 assert.equal(popup.style.getPropertyValue("display"),"none");
 assert.equal(typeof interval,"function");
 callbacks.mutation([{type:"attributes",target:{localName:"div",id:"clock",className:"clock"}}]);
 assert.equal(scheduled.length,0,"Unrelated attribute changes must not rescan page");
});
