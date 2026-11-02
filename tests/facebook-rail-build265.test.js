"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict");
const Facebook=require("../src/facebook-ads.js");
function fixture(label,location="right",contacts=false){
 const win={innerWidth:1400,location:{hostname:"www.facebook.com",pathname:"/"}};
 const doc={body:{contains:()=>true},documentElement:{},location:{hostname:"www.facebook.com"}};
 const x=location==="right"?990:120;
 const card={parentElement:doc.body,isConnected:true,
  getClientRects:()=>[{}],getBoundingClientRect:()=>({left:x,width:300,height:185,top:125}),
  matches:()=>false,querySelector:q=>q==="img"?{}:null,
  querySelectorAll:q=>q==="h1,h2,h3,h4,h5,h6,[role=\"heading\"]"&&contacts?
   [{textContent:"Contacts"}]:[],
  style:{value:"",getPropertyValue(){return this.value;},getPropertyPriority(){return "";},
   setProperty(_,v){this.value=v;},removeProperty(){this.value="";}}};
 const button={tagName:"BUTTON",textContent:"",children:[],parentElement:card,
  getBoundingClientRect:()=>({left:x+20,top:135,width:92,height:30}),
  getAttribute:k=>k==="aria-label"?label:k==="role"?"button":null,
  closest:()=>null};
 doc.querySelectorAll=q=>{
  // A button does not match a naked span selector. It is found only when
  // the complementary-region aria-label selector is present.
  if(q.includes('[role="complementary"] [aria-label]'))return [button];
  return [];
 };
 return {win,doc,button,card};
}
test("Build 265: Sponsored accessible button in right rail hides only ad card",()=>{
 const f=fixture("Sponsored");
 const blocker=Facebook.create(f.doc,f.win);
 assert.equal(blocker.scan(),1);
 assert.equal(f.card.style.value,"none");
 blocker.restore();assert.equal(f.card.style.value,"");
});
test("Build 265: ordinary accessible right-rail control is preserved",()=>{
 const f=fixture("Contacts");
 assert.equal(Facebook.create(f.doc,f.win).scan(),0);
 assert.equal(f.card.style.value,"");
});
test("Build 265: sponsored label outside right rail is not sufficient",()=>{
 const f=fixture("Sponsored","left");
 assert.equal(Facebook.create(f.doc,f.win).scan(),0);
 assert.equal(f.card.style.value,"");
});
test("Build 265: matching sidebar ad is rejected if container contains Contacts heading",()=>{
 const f=fixture("Sponsored","right",true);
 assert.equal(Facebook.create(f.doc,f.win).scan(),0);
 assert.equal(f.card.style.value,"");
});
