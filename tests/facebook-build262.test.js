"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict"),
 fs=require("node:fs"),path=require("node:path");
const source=fs.readFileSync(path.join(__dirname,"../src/facebook-ads.js"),"utf8");
const FB=require("../src/facebook-ads.js");
function span(text,children=[],classes=0,order=0){
 const el={nodeType:1,tagName:"SPAN",textContent:text,children,order,
  classList:{length:classes},childNodes:[],getAttribute:()=>null};
 el.querySelectorAll=selector=>{
  if(selector!=="span")return [];
  const all=[];function walk(node){for(const child of node.children){all.push(child);walk(child);}}
  walk(el);return all;
 };
 return el;
}
test("Build 262: nested CSS-ordered letters decode Sponsored",()=>{
 const a=span("Spon",["S","p","o","n"].map((c,i)=>span(c,[],0,i)));
 const b=span("sored",["s","o","r","e","d"].map((c,i)=>span(c,[],0,i)));
 const target=span("Sponsored",[a,b]);
 const win={getComputedStyle:child=>({order:String(child.order),display:"block",visibility:"visible"})};
 assert.equal(FB.splitLabelRoot(target),null);
 assert.ok(FB.labelsOf(target,win).some(FB.isAdLabel));
});
test("Build 262: nested character decoys do not turn organic words into ads",()=>{
 const a=span("xx",["x","x","u","p"].map((c,i)=>span(c,[],0,i)));
 const b=span("ordinary",["o","s","e","n","t"].map((c,i)=>span(c,[],0,i)));
 const target=span("unrelated",[a,b]);
 assert.ok(!FB.labelsOf(target,{}).some(FB.isAdLabel));
});
test("Build 262: two card-sized sibling articles cannot be hidden as one",()=>{
 const child=()=>({getBoundingClientRect:()=>({width:460,height:280}),
   matches:selector=>selector.includes('[role="article"]'),querySelector:()=>null});
 const doc={body:{},documentElement:{}};
 const card={children:[child(),child()],isConnected:true,style:{setProperty(){}},
  matches:selector=>selector.includes('[role="article"]')&&!selector.startsWith("main"),
  closest:()=>null,querySelector:()=>null,querySelectorAll:()=>[],
  getBoundingClientRect:()=>({width:550,height:800})};
 assert.equal(FB.holdsSeparatePostSiblings(card),true);
 assert.equal(FB.safeCard(card,doc),false);
});
function recycleFixture(){
 const clock={at:10000};
 class Clock extends Date {static now(){return clock.at;}}
 const mod={exports:{}};
 new Function("Date","module",source)(Clock,mod);
 const facebook=mod.exports;
 let sponsored=true;
 const doc={body:{},documentElement:{},location:{hostname:"www.facebook.com"}},
 win={location:{hostname:"www.facebook.com"},innerWidth:1200};
 const style={value:"",priority:"",getPropertyValue(){return this.value;},
  getPropertyPriority(){return this.priority;},setProperty(_,v,p){this.value=v;this.priority=p||"";},
  removeProperty(){this.value="";this.priority="";}};
 const card={style,isConnected:true,children:[],
  matches:selector=>selector.includes('[role="article"]')&&!selector.startsWith("main"),
  closest:()=>null,getClientRects:()=>[{}],
  getBoundingClientRect:()=>({width:550,height:420}),
  querySelector:selector=>sponsored&&selector.includes("/ads/about/")?{}:null,
  querySelectorAll:()=>[],contains:()=>true};
 doc.querySelectorAll=selector=>selector.includes('[data-pagelet^="FeedUnit"]')?[card]:[];
 return {clock,card,fb:facebook.create(doc,win),setSponsored:v=>sponsored=v};
}
test("Build 262: changing a hidden ad into a normal post restores it after two corroborated checks",()=>{
 const {clock,card,fb,setSponsored}=recycleFixture();
 assert.equal(fb.scan(),1);assert.equal(card.style.value,"none");
 setSponsored(false);
 fb.observeMutation({type:"childList",target:card,removedNodes:[],addedNodes:[]});
 clock.at+=2100;fb.scan();
 assert.equal(card.style.value,"none"); // avoid transient unhide
 clock.at+=1100;fb.scan();
 assert.equal(card.style.value,"");
 assert.equal(fb.diagnostics().recycledRestored,1);
});
test("Build 262: changed ad with surviving ad evidence remains hidden",()=>{
 const {clock,card,fb}=recycleFixture();
 assert.equal(fb.scan(),1);
 fb.observeMutation({type:"childList",target:card,removedNodes:[],addedNodes:[]});
 clock.at+=2100;fb.scan();clock.at+=1300;fb.scan();
 assert.equal(card.style.value,"none");
 assert.equal(fb.diagnostics().recycledRestored,0);
});
test("Build 262: no upstream standalone blockers or third-party runtime dependencies activated",()=>{
 const manifest=require("../src/manifest.json");
 assert.equal(manifest.version,"0.3.232");
 assert.ok(manifest.content_scripts[0].js.includes("facebook-ads.js"));
 assert.ok(manifest.content_scripts.every(s=>!s.js.includes("vendor/facebook-sponsored-upstream.js")));
});
