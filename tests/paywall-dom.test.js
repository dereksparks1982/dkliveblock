"use strict";
const test=require("node:test"),assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
function setup({loaded=true,text="Subscribe to continue reading",paywallPopups=true,active=true,inline=false,player=false,articleWithinPopup=false,sensitive=false}={}){
 let listener,interval;
 class Style{
  constructor(){this.properties=new Map();}
  getPropertyValue(key){return this.properties.get(key)?.value||"";}
  getPropertyPriority(key){return this.properties.get(key)?.priority||"";}
  setProperty(key,value,priority=""){this.properties.set(key,{value,priority});}
  removeProperty(key){this.properties.delete(key);}
 }
 class Element{
  constructor(message,id,className){this.textContent=message;this.id=id;this.className=className;this.localName="div";this.style=new Style();this.isConnected=true;this.previousElementSibling=null;this.nextElementSibling=null;}
  getClientRects(){return [1];}
  getAttribute(){return null;}
  contains(){return false;}
  querySelector(query){return player||sensitive&&query.includes('password')?{}:null;}
  matches(selector){return selector.includes("backdrop")&&this.className==="backdrop";}
 }
 const modal=new Element(text,inline?"subscribe-teaser":"subscription-modal",inline?"subscribe":"modal");
 const backdrop=new Element("","backdrop","backdrop");
 modal.nextElementSibling=backdrop;backdrop.previousElementSibling=modal;
 const paragraphText="A previously downloaded article paragraph containing complete editorial writing for the reader. ";
 const paragraphs=Array.from({length:6},()=>({textContent:paragraphText.repeat(2)}));
 const article={querySelectorAll:selector=>selector==="p"?paragraphs:[]};
 modal.contains=node=>articleWithinPopup&&paragraphs.includes(node);
 const root={style:new Style(),scrollHeight:1600,isConnected:true},body={style:new Style(),isConnected:true};
 const preferences={active,paywallPopups};
 const browser={runtime:{
  onMessage:{addListener:fn=>{listener=fn;}},
  sendMessage:async()=>({...preferences,css:"",antiAdblock:false,cookieReject:false,youtubeSkip:false,procedural:[]})
 }};
 const document={
  documentElement:root,body,fullscreenElement:null,
  querySelector:()=>null,
  querySelectorAll:selector=>{
   if(selector==="article")return loaded?[article]:[];
   if(selector.includes("dialog")||selector.includes("paywall"))return [modal];
   return [];
  }
 };
 const window={innerHeight:650,getComputedStyle:el=>({
   visibility:"visible",display:"block",overflowY:el===root||el===body?"hidden":"visible",
   position:el===modal?(inline?"static":"fixed"):"static"
 })};
 const context=vm.createContext({
  browser,document,window,location:{hostname:"www.wsj.com",href:"https://www.wsj.com/articles/story"},
  Element,console,CSS:{},MutationObserver:class{},Date,setInterval:fn=>{interval=fn;},
  DKConsent:{},DKProcedural:{},
  DKCosmeticDebug:{create:()=>({restore(){},highlight(){return {ok:true};}}),inspect:()=>[]},
 });
 for(const name of ["paywall.js","video-assist.js","overlay-recovery.js","auth-protection.js","popup-guard.js","content.js"])
  vm.runInContext(fs.readFileSync(path.join(__dirname,"../src",name),"utf8"),context,{filename:name});
 return {modal,backdrop,root,preferences,tick:()=>interval(),refresh:async()=>{
  await listener({action:"refresh"});await new Promise(resolve=>setTimeout(resolve,0));
 }};
}
test("hide a subscription dialog over an already downloaded article",async()=>{
 const x=setup();await x.refresh();x.tick();
 assert.equal(x.modal.style.getPropertyValue("display"),"none");
 assert.equal(x.backdrop.style.getPropertyValue("display"),"none");
 assert.equal(x.root.style.getPropertyValue("overflow-y"),"auto");
 x.preferences.paywallPopups=false;await x.refresh();
 assert.equal(x.modal.style.getPropertyValue("display"),"");
 assert.equal(x.backdrop.style.getPropertyValue("display"),"");
 assert.equal(x.root.style.getPropertyValue("overflow-y"),"");
});
test("do not claim to unlock a server-side article that is not present",async()=>{
 const x=setup({loaded:false});await x.refresh();x.tick();
 assert.equal(x.modal.style.getPropertyValue("display"),"");
});
test("do not hide an article about subscriptions or an inline teaser",async()=>{
 const x=setup({text:"Donate to support journalism"});await x.refresh();x.tick();
 assert.equal(x.modal.style.getPropertyValue("display"),"");
 const inline=setup({inline:true});await inline.refresh();inline.tick();
 assert.equal(inline.modal.style.getPropertyValue("display"),"");
});
test("respect feature switches and never remove a video player",async()=>{
 const x=setup({paywallPopups:false});await x.refresh();x.tick();
 assert.equal(x.modal.style.getPropertyValue("display"),"");
 const playback=setup({player:true});await playback.refresh();playback.tick();
 assert.equal(playback.modal.style.getPropertyValue("display"),"");
 const paused=setup({active:false});await paused.refresh();paused.tick();
 assert.equal(paused.modal.style.getPropertyValue("display"),"");
});

test("never count the paywall's own paragraphs as a delivered article",async()=>{
 const x=setup({articleWithinPopup:true});
 await x.refresh();x.tick();
 assert.equal(x.modal.style.getPropertyValue("display"),"");
 assert.equal(x.backdrop.style.getPropertyValue("display"),"");
 assert.equal(x.root.style.getPropertyValue("overflow-y"),"");
});

test("payment and authentication overlays are preserved despite matching subscription wording",async()=>{
 const sensitive=setup({sensitive:true,text:"Subscribe to continue reading this article"});
 await sensitive.refresh();sensitive.tick();
 assert.equal(sensitive.modal.style.getPropertyValue("display"),"");
 assert.equal(sensitive.backdrop.style.getPropertyValue("display"),"");
 const payment=setup({text:"Confirm your payment. Subscribe to continue reading the full article"});
 await payment.refresh();payment.tick();
 assert.equal(payment.modal.style.getPropertyValue("display"),"");
});
