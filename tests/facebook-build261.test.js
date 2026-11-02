"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict");
const FB=require("../src/facebook-ads.js");
function css(){
 return {value:"",getPropertyValue(){return this.value;},getPropertyPriority(){return "";},
  setProperty(_,value){this.value=value;},removeProperty(){this.value="";}};
}
function market(labelText,top=130){
 const doc={body:{},documentElement:{}},
  win={location:{hostname:"www.facebook.com",pathname:"/marketplace/browse"},innerWidth:1200};
 const grid={children:[],parentElement:doc.body,matches:()=>false};
 for(let i=0;i<8;i++)grid.children.push({
  parentElement:grid,isConnected:true,style:css(),
  getBoundingClientRect:()=>({width:230,height:250,top:100,left:350}),
  getClientRects:()=>[{}],matches:()=>false,
  querySelector:q=>q.includes("/marketplace/item/")?{}:null,
  querySelectorAll:q=>q.includes("/marketplace/item/")?[{}]:[]
 });
 const tile=grid.children[0];
 const label={nodeType:1,tagName:"SPAN",children:[],textContent:labelText,
  childNodes:[{nodeType:3,textContent:labelText}],parentElement:tile,
  getAttribute:()=>null,closest:()=>null,
  getBoundingClientRect:()=>({top,left:370,width:100,height:18})};
 doc.querySelectorAll=q=>q.includes("main span")?[label]:[];
 return {doc,win,tile,label,grid};
}
function mobile(labelText,placement="header",visible=true){
 const body={classList:{contains:name=>name==="html-renderer"}};
 const doc={body,documentElement:{}},win={
  location:{hostname:"m.facebook.com",pathname:"/"},innerWidth:380
 };
 const feed={children:[],clientWidth:380,parentElement:body,matches:()=>false};
 const card={parentElement:feed,isConnected:true,style:css(),children:[],
  offsetWidth:visible?376:0,offsetHeight:visible?270:0,
  getBoundingClientRect:()=>({width:visible?376:0,height:visible?270:0,top:100,left:0}),
  getClientRects:()=>visible?[{}]:[],matches:()=>false,querySelector:()=>null,
  querySelectorAll:()=>[]};
 feed.children=Array.from({length:12},(_,i)=>i===0?card:{parentElement:feed});
 let label;
 const header={parentElement:card,contains:el=>placement==="header"&&el===label};
 const bodyPart={parentElement:card,contains:()=>false};
 card.firstElementChild=header;
 label={nodeType:1,tagName:"SPAN",children:[],textContent:labelText,
  childNodes:[{nodeType:3,textContent:labelText}],
  parentElement:placement==="header"?header:bodyPart,
  getAttribute:()=>null,closest:()=>null,getBoundingClientRect:()=>({top:130})};
 doc.querySelectorAll=q=>q.includes("span,a,")?[label]:[];
 return {doc,win,card,label};
}
test("Build 261: Marketplace Sponsored badge hides only own tile",()=>{
 const {doc,win,tile}=market("Sponsored",130);
 const detector=FB.create(doc,win);
 assert.equal(detector.scan(),1);assert.equal(tile.style.value,"none");
 detector.restore();assert.equal(tile.style.value,"");
});
test("Build 261: ordinary Marketplace listing remains, and Sponsored in body is not an ad badge",()=>{
 for(const [word,top] of [["Organic",130],["Sponsored",320]]){
  const {doc,win,tile}=market(word,top);
  assert.equal(FB.create(doc,win).scan(),0);
  assert.equal(tile.style.value,"");
 }
});
test("Build 261: desktop safe-card scanner does not delete entire Marketplace grid",()=>{
 const {doc,label,grid}=market("Sponsored");
 assert.equal(FB.marketplaceTileFrom(label,doc),grid.children[0]);
 assert.notEqual(FB.marketplaceTileFrom(label,doc),grid);
});
test("Build 261: mobile Sponsored and Ad bylines hide a rendered post",()=>{
 for(const label of ["Sponsored","Ad"]){
  const {doc,win,card}=mobile(label);
  assert.equal(FB.create(doc,win).scan(),1,label);
  assert.equal(card.style.value,"none");
 }
});
test("Build 261: quoted/mobile body Sponsored text, hidden virtual posts, and organic posts survive",()=>{
 for(const [label,place,visible] of [
  ["Sponsored","body",true],["Sponsored","header",false],
  ["Organic","header",true]]){
  const {doc,win,card}=mobile(label,place,visible);
  assert.equal(FB.create(doc,win).scan(),0,label);
  assert.equal(card.style.value,"");
 }
});
test("Build 261: byte-for-byte upstream MIT reference remains vendored, not activated",()=>{
 const manifest=require("../src/manifest.json");
 assert.equal(manifest.version,"0.3.231");
 for(const entry of manifest.content_scripts)
  assert.ok(!entry.js.includes("vendor/facebook-sponsored-upstream.js"));
});
