"use strict";
const test=require("node:test"),assert=require("node:assert/strict");
const {create}=require("../src/overlay-recovery.js");
class Style{
 constructor(){this.properties=new Map();}
 getPropertyValue(key){return this.properties.get(key)?.value||"";}
 getPropertyPriority(key){return this.properties.get(key)?.priority||"";}
 setProperty(key,value,priority=""){this.properties.set(key,{value,priority});}
 removeProperty(key){this.properties.delete(key);}
}
function element({name="div",role="",unsafe=false}={}){
 return {localName:name,isConnected:true,style:new Style(),textContent:"Please disable your ad blocker",
  previousElementSibling:null,nextElementSibling:null,
  matches:query=>unsafe&&query.includes("video"),
  querySelector:query=>unsafe&&query.includes("video")?{}:null};
}
function setup(limit=24){
 const root=element({name:"html"}),body=element({name:"body"}),doc={documentElement:root,body,fullscreenElement:null};
 root.scrollHeight=1800;
 const win={innerHeight:700,getComputedStyle:node=>({overflowY:node===root||node===body?"hidden":"visible"})};
 const engine=create(doc,win,limit);
 return {doc,win,engine,root,body};
}
test("hide verified dialog, remove adjacent backdrop, restore both exactly",()=>{
 const {engine}=setup(),popup=element(),scrim=element();
 scrim.matches=selector=>selector.includes("scrim");
 popup.previousElementSibling=scrim;scrim.nextElementSibling=popup;
 popup.style.setProperty("display","flex");
 scrim.style.setProperty("display","block");
 assert.equal(engine.hide(popup),true);
 assert.equal(engine.hideBackdropAround(popup),1);
 assert.equal(popup.style.getPropertyValue("display"),"none");
 assert.equal(scrim.style.getPropertyPriority("display"),"important");
 engine.restore();
 assert.equal(popup.style.getPropertyValue("display"),"flex");
 assert.equal(scrim.style.getPropertyValue("display"),"block");
 assert.equal(engine.hiddenCount,0);
});
test("a notice reappearing on the same node is re-hidden without losing baseline style",()=>{
 const {engine}=setup(),popup=element();
 popup.style.setProperty("display","grid");
 assert.equal(engine.hide(popup),true);
 popup.style.setProperty("display","block");
 assert.equal(engine.hide(popup),true);
 engine.restore();
 assert.equal(popup.style.getPropertyValue("display"),"grid");
});
test("do not clobber a website's independent style change after recovery",()=>{
 const {engine}=setup(),popup=element();
 popup.style.setProperty("display","block");
 engine.hide(popup);
 popup.style.setProperty("display","grid");
 engine.restore();
 assert.equal(popup.style.getPropertyValue("display"),"grid");
});
test("unlock scroll only for genuine locked, non-fullscreen pages and restore prior styling",()=>{
 const {engine,doc,root,body}=setup();
 root.style.setProperty("overflow-y","hidden");
 body.style.setProperty("overflow-y","clip");
 assert.equal(engine.unlockScroll(),true);
 assert.equal(root.style.getPropertyValue("overflow-y"),"auto");
 assert.equal(body.style.getPropertyValue("overflow-y"),"auto");
 engine.restore();
 assert.equal(root.style.getPropertyValue("overflow-y"),"hidden");
 assert.equal(body.style.getPropertyValue("overflow-y"),"clip");
 doc.fullscreenElement={};
 assert.equal(engine.unlockScroll(),false);
});
test("never hide player, article, main, navigation, password form or root",()=>{
 const {engine,doc}=setup();
 for(const name of ["video","audio","article","main","nav","header","footer"]){
  const x=element({name});x.matches=query=>query.includes(name);
  assert.equal(engine.hide(x),false,name);
 }
 assert.equal(engine.hide(element({unsafe:true})),false);
 assert.equal(engine.hide(doc.body),false);
 assert.equal(engine.hide(doc.documentElement),false);
});
test("do not hide generic siblings or a backdrop containing a player",()=>{
 const {engine}=setup(),popup=element(),other=element();
 popup.nextElementSibling=other;
 assert.equal(engine.hideBackdropAround(popup),0);
 other.matches=selector=>selector.includes("backdrop");
 other.querySelector=selector=>selector.includes("video")?{}:null;
 assert.equal(engine.hideBackdropAround(popup),0);
});
test("tracking remains bounded and detached elements are pruned",()=>{
 const {engine}=setup(2),a=element(),b=element(),c=element();
 assert.equal(engine.hide(a),true);
 assert.equal(engine.hide(b),true);
 assert.equal(engine.hide(c),false);
 a.isConnected=false;engine.prune();
 assert.equal(engine.hiddenCount,1);
 assert.equal(engine.hide(c),true);
});

test("never hide verification, one-time-code, CAPTCHA or payment controls",()=>{
 const {engine}=setup();
 for(const marker of ["password","one-time-code","cc-number","captcha"]){
  const x=element();
  x.querySelector=selector=>selector.includes(marker)?{}:null;
  assert.equal(engine.hide(x),false,marker);
 }
});

test("move keyboard focus out of a hidden notice without touching unrelated controls",()=>{
 const {engine,doc}=setup(),popup=element();
 let blurs=0;
 const inside={blur(){blurs++;}},outside={blur(){blurs+=10;}};
 popup.contains=node=>node===inside;
 doc.activeElement=inside;
 assert.equal(engine.hide(popup),true);
 assert.equal(blurs,1);
 doc.activeElement=outside;
 popup.style.setProperty("display","block"); // site made the gate visible again
 assert.equal(engine.hide(popup),true);
 assert.equal(blurs,1,"Unrelated focused controls must not be touched");
 engine.restore();
});
