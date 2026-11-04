"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path");
const src=fs.readFileSync(path.join(__dirname,"../src/facebook-full-core.js"),"utf8");
function body(name){
 const at=src.indexOf("function "+name+"(");
 assert.ok(at>=0,name+" not found");
 const end=src.indexOf("\n}",at);
 assert.ok(end>at,name+" ending missing");
 return src.slice(at,end+2);
}
test("Build 378: real shallow post label survives portal-depth rejection",()=>{
 const document={body:{name:"body"}};
 const call=new Function("isMobileLayout","MOBILE_SHALLOW_DEPTH_LIMIT",
  "SHALLOW_DEPTH_LIMIT","document",
  "let shallowPostLabelsRecovered=0;"+body("isImplausiblyShallow")+
  ";return {run:isImplausiblyShallow,count:()=>shallowPostLabelsRecovered};")(
   ()=>false,4,10,document);
 const make=(landmark=false,dialog=false,deep=false)=>{
  const chain=Array.from({length:deep?13:5},()=>({}));
  for(let i=0;i<chain.length-1;i++)chain[i].parentElement=chain[i+1];
  chain[chain.length-1].parentElement=document.body;
  chain[0].closest=selector=>selector.includes("role=\"article\"")?
   (landmark?{}:null):dialog?{}:null;
  return chain[0];
 };
 assert.equal(call.run(make(false)),true,"portal label remains excluded");
 assert.equal(call.run(make(true)),false,"real shallow feed post stays eligible");
 assert.equal(call.run(make(true,true)),true,"dialogs remain excluded");
 assert.equal(call.run(make(true,false,true)),false,"deep posts are not counted");
 assert.equal(call.count(),1);
});
test("Build 378: in-place Ad text edit queues only short byline candidates",()=>{
 const changed=[];
 const call=new Function("Node","settings","SPONSORED_TEXTS","labelKey",
  "INVISIBLE_CHARS_RE","adLabelPosition","scheduleScan","dkEnabled",
  "let inlineAdLabelEdits=0;"+body("noteInlineAdTextEdit")+
  ";return {run:noteInlineAdTextEdit,count:()=>inlineAdLabelEdits};")(
   {TEXT_NODE:3},{hideSponsored:true},new Set(["Ad","Sponsored"]),
   t=>t.replace(/^[\\s·•|]+|[\\s·•|]+$/g,""),/\\u200b/g,
   ()=>"byline",node=>changed.push(node),true);
 const parent={isConnected:true,closest:()=>null};
 for(const text of ["Ad","Sponsored ·"]){
  assert.equal(call.run({nodeType:3,textContent:text,parentElement:parent}),true);
 }
 for(const text of ["An Ad","Ads Manager","","A".repeat(70)]){
  assert.equal(call.run({nodeType:3,textContent:text,parentElement:parent}),false);
 }
 const off={isConnected:true,closest:()=>({})};
 assert.equal(call.run({nodeType:3,textContent:"Ad",parentElement:off}),false);
 assert.equal(call.count(),2);
 assert.deepEqual(changed,[parent,parent]);
});
test("Build 378: observer handles text edits without scanning arbitrary changes",()=>{
 assert.ok(src.includes('if (mutation.type === "characterData")'));
 assert.ok(src.includes("noteInlineAdTextEdit(mutation.target);"));
 assert.ok(src.includes("characterData: true,"));
 assert.ok(src.includes("inlineAdLabelEdits,shallowPostLabelsRecovered"));
 assert.ok(src.includes('!adLabelPosition(parent)'));
 assert.ok(src.includes("raw.length > 48"));
 assert.ok(src.includes('mutation.attributeName === "aria-label"'),
  "existing late ARIA recovery must remain");
});
