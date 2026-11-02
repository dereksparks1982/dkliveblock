"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict");
const FB=require("../src/facebook-ads.js");
function railFixture(labelText,contacts=false){
 const win={innerWidth:1350,location:{hostname:"www.facebook.com",pathname:"/"},
  getComputedStyle:child=>({order:String(child.order||0),display:"block",visibility:"visible"})};
 const doc={body:{contains:()=>true},documentElement:{},location:{hostname:"www.facebook.com"}};
 const card={parentElement:doc.body,isConnected:true,style:{
  value:"",getPropertyValue(){return this.value;},getPropertyPriority(){return "";},
  setProperty(_,v){this.value=v;},removeProperty(){this.value="";}},
  getClientRects:()=>[{}],
  getBoundingClientRect:()=>({left:945,width:310,height:190,top:100}),
  matches:()=>false,querySelector:q=>q==="img"?{}:null,
  querySelectorAll:q=>q==="h1,h2,h3,h4,h5,h6,[role=\"heading\"]"&&contacts?
   [{textContent:"Contacts"}]:[]};
 const label={tagName:"SPAN",textContent:labelText,
  children:labelText.split("").map((c,order)=>({
   tagName:"SPAN",textContent:c,children:[],classList:{length:0},order})),
  parentElement:card,getBoundingClientRect:()=>({left:1000,top:110,width:90,height:22}),
  getAttribute:()=>null,closest:()=>null};
 doc.querySelectorAll=q=>{
  if(q.startsWith("span,[role=\"complementary\"] div,aside div"))return [label];
  return [];
 };
 return {doc,win,card,label};
}
test("Build 264: obfuscated nine-span right-rail Sponsored label hides its own card",()=>{
 const f=railFixture("Sponsored");
 const r=FB.create(f.doc,f.win);
 assert.equal(FB.labelsOf(f.label,f.win).some(FB.isAdLabel),true);
 assert.equal(r.scan(),1);
 assert.equal(f.card.style.value,"none");
 assert.equal(r.diagnostics().lastRailSignals,1);
});
test("Build 264: ordinary right rail label stays visible",()=>{
 const f=railFixture("Contacts");
 const r=FB.create(f.doc,f.win);
 assert.equal(r.scan(),0);
 assert.equal(f.card.style.value,"");
});
test("Build 264: Contacts heading protects larger right-rail containers",()=>{
 const f=railFixture("Sponsored",true);
 const r=FB.create(f.doc,f.win);
 assert.equal(r.scan(),0);
 assert.equal(f.card.style.value,"");
});
