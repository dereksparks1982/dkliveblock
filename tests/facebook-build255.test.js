"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict");
const FB=require("../src/facebook-ads.js");
function makeMenu(label){return {getAttribute:key=>key==="aria-label"?label:null,closest:()=>null};}
function scenario(){
 const doc={body:{},documentElement:{}},menu=makeMenu("Open menu for Sponsored content");
 const author={contains:()=>false};
 function wrap(width,height,outer){
  return {parentElement:outer,isConnected:true,matches:()=>false,closest:()=>null,
   contains:x=>x===menu,style:{setProperty(){}},
   getBoundingClientRect:()=>({width,height,left:300,top:40}),
   querySelector:q=>q.includes("h2,h3")?author:null,
   querySelectorAll:q=>q==="[aria-label]"?[menu]:[]};
 }
 const feed=wrap(1040,1700,doc.body),card=wrap(550,750,feed),header=wrap(520,165,card);
 menu.parentElement=header;
 return {doc,menu,card,header,feed};
}
test("Build 255 exact accessible Sponsored menu label recognized",()=>{
 assert.equal(FB.sponsoredMenu(makeMenu("Open menu for Sponsored content")),true);
 assert.equal(FB.sponsoredMenu(makeMenu("Open menu for Mary's Sponsored content")),true);
 assert.equal(FB.sponsoredMenu(makeMenu("Open menu for regular post")),false);
});
test("Build 255 choose complete card, not header and never entire feed",()=>{
 const x=scenario();
 assert.equal(FB.sponsoredFeedCard(x.menu,x.doc,{innerWidth:1200}),x.card);
});
test("Build 255 do not classify unrelated post menus as Sponsored",()=>{
 const x=scenario();x.menu.getAttribute=()=> "More options for normal post";
 assert.equal(FB.sponsoredFeedCard(x.menu,x.doc,{innerWidth:1200}),null);
});
