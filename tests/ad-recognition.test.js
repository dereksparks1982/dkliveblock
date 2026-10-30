"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict");
require("../src/auth-protection.js");
require("../src/video-assist.js");
const A=require("../src/ad-recognition.js");
class Style{
 constructor(){this.data=new Map();}
 getPropertyValue(k){return this.data.get(k)?.v||"";}
 getPropertyPriority(k){return this.data.get(k)?.p||"";}
 setProperty(k,v,p=""){this.data.set(k,{v,p});}
 removeProperty(k){this.data.delete(k);}
}
function ad({cls="adsbygoogle",tag="ins",id="",aria="",attrs=[],excluded=false,closest=false}={}){
 const node={localName:tag,className:cls,id,style:new Style(),isConnected:true,
  matches:()=>excluded,querySelector:()=>excluded?{}:null,closest:()=>closest?{}:null,
  getClientRects:()=>[1],getAttribute:k=>k==="aria-label"?aria:attrs.find(x=>x[0]===k)?.[1]||null,
  hasAttribute:k=>attrs.some(x=>x[0]===k)};
 return node;
}
function documentFor(nodes){return {body:{},documentElement:{},querySelectorAll:()=>nodes};}
test("automatically recognizes unmistakable inline and GPT ad slots",()=>{
 for(const node of [
  ad(),ad({tag:"div",cls:"ad-slot"}),ad({tag:"div",id:"div-gpt-ad-123456"}),
  ad({cls:"",tag:"div",aria:"Advertisement"}),
  ad({tag:"div",cls:"",attrs:[["data-ad-client","ca-pub-1"],["data-ad-slot","12"]]})
 ])assert.equal(A.hasStrongSignal(node),true);
});
test("normal articles, branded content, and generic sponsored headlines are not hidden",()=>{
 for(const node of [
  ad({tag:"article",cls:"sponsored"}),ad({tag:"div",cls:"promotion"}),
  ad({tag:"div",cls:"advice"}),ad({tag:"div",aria:"Sponsored article"}),
  ad({tag:"div",aria:"Google Sign In"})
 ])assert.equal(A.hasStrongSignal(node),false);
});
test("protect players, forms, login dialogs and article containers even if ad labeled",()=>{
 for(const node of [ad({excluded:true}),ad({closest:true})]){
  const doc=documentFor([node]);
  assert.equal(A.safe(node,doc),false);
  assert.equal(A.create(doc,{}).scan(),0);
 }
});
test("only ad nodes are hidden and all changes can be reverted",()=>{
 const a=ad(),normal=ad({cls:"",tag:"section"}),doc=documentFor([a,normal]),scanner=A.create(doc,{});
 assert.equal(scanner.scan(),1);
 assert.equal(a.style.getPropertyValue("display"),"none");
 assert.equal(normal.style.getPropertyValue("display"),"");
 assert.equal(scanner.scan(),0);
 scanner.restore();
 assert.equal(a.style.getPropertyValue("display"),"");
 assert.equal(scanner.hiddenCount,0);
});
test("preserve original inline display and avoid overwriting a site's later changes",()=>{
 const x=ad();x.style.setProperty("display","inline-block","important");
 const scanner=A.create(documentFor([x]),{});
 scanner.scan();
 scanner.restore();
 assert.equal(x.style.getPropertyValue("display"),"inline-block");
 assert.equal(x.style.getPropertyPriority("display"),"important");
 scanner.scan();
 x.style.setProperty("display","block");
 scanner.restore();
 assert.equal(x.style.getPropertyValue("display"),"block");
});
test("bound scanning and hidden-element retention during long page sessions",()=>{
 const nodes=Array.from({length:200},()=>ad()),scanner=A.create(documentFor(nodes),{},8);
 assert.equal(scanner.scan(),6);
 scanner.scan();scanner.scan();
 assert.ok(scanner.hiddenCount<=8);
});
test("never hide the root body or an invalid detached element",()=>{
 const item=ad(),doc=documentFor([item]);
 assert.equal(A.safe(doc.body,doc),false);
 item.isConnected=false;
 assert.equal(A.safe(item,doc),false);
});

test("recognizes explicit ad unit pairs, labelled test ads and standard Google ad frames",()=>{
 for(const node of [
  ad({tag:"div",cls:"",attrs:[["data-ad-unit","leaderboard"],["data-ad-slot","header"]]}),
  ad({tag:"div",cls:"",attrs:[["data-testid","advertisement"]]}),
  ad({tag:"iframe",cls:"",id:"google_ads_iframe_123"})
 ])assert.equal(A.hasStrongSignal(node),true);
 for(const node of [
  ad({tag:"div",cls:"",attrs:[["data-ad-unit","hero"]]}),
  ad({tag:"div",cls:"",attrs:[["data-testid","sponsored-article"]]}),
  ad({tag:"iframe",cls:"",id:"video_iframe_123"})
 ])assert.equal(A.hasStrongSignal(node),false);
});
test("long candidate lists are fairly examined without hiding generic content",()=>{
 const nodes=Array.from({length:125},()=>ad({tag:"div",cls:"normal-content"}));
 const advertisement=ad({tag:"ins",cls:"adsbygoogle"});nodes.push(advertisement);
 const doc=documentFor(nodes),scanner=A.create(doc,{},6);
 assert.equal(scanner.scan(),0);
 assert.equal(scanner.scan(),1);
 assert.equal(advertisement.style.getPropertyValue("display"),"none");
 scanner.restore();
 assert.equal(advertisement.style.getPropertyValue("display"),"");
});
test("recognizer will not hide labelled ads nested in protected article or player contexts",()=>{
 for(const node of [
  ad({tag:"div",aria:"Advertisement",closest:true}),
  ad({tag:"iframe",id:"google_ads_iframe_123",excluded:true})
 ]){
  const doc=documentFor([node]);
  assert.equal(A.safe(node,doc),false);
  assert.equal(A.create(doc,{}).scan(),0);
 }
});
