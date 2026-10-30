"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict");
const D=require("../src/cosmetic-debug.js");
function element(){
 const data=new Map([["outline",{value:"1px solid blue",priority:""}]]);
 return {localName:"div",isConnected:true,getClientRects:()=>[1],
  style:{getPropertyValue:k=>data.get(k)?.value||"",
   getPropertyPriority:k=>data.get(k)?.priority||"",
   setProperty:(k,value,priority)=>data.set(k,{value,priority}),
   removeProperty:k=>data.delete(k),data}};
}
test("cosmetic debug counts matches but never reads page text or changes display",()=>{
 const item=element(),doc={querySelectorAll:s=>s===".advert"?[item]:[],
  documentElement:{},body:{},defaultView:{getComputedStyle:()=>({display:"block",visibility:"visible"})}};
 assert.deepEqual(D.inspect(doc,[".advert",".nothing"]),[
  {selector:".advert",matches:1,capped:false},
  {selector:".nothing",matches:0,capped:false}]);
 const view=D.create(doc),result=view.highlight(".advert");
 assert.equal(result.highlighted,1);
 assert.equal(item.style.getPropertyValue("outline"),"2px dashed #f59e0b");
 assert.equal(item.style.getPropertyValue("display"),"");
 view.restore();
 assert.equal(item.style.getPropertyValue("outline"),"1px solid blue");
 assert.equal(item.style.getPropertyValue("outline-offset"),"");
});
test("invalid and huge selectors are rejected without changing styles",()=>{
 const doc={querySelectorAll:()=>{throw Error("Unsupported");},body:{},documentElement:{}};
 const api=D.create(doc);
 assert.match(api.highlight("x".repeat(300)).error,/Invalid/);
 assert.match(api.highlight(":invalid(").error,/Unsupported/);
 assert.deepEqual(D.inspect(doc,[":invalid("])[0],{selector:":invalid(",matches:0,unsupported:true});
 assert.equal(D.inspect(doc,Array.from({length:100},()=>".ad")).length,D.MAX_SELECTORS);
});
