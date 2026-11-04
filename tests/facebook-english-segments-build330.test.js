"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict");
const Nesty=require("../src/meta-agent-nesty.js");
function split(text,reverse=false){
 const chunks=[...text];if(chunks.length>8){chunks.splice(7,chunks.length-7,...[chunks.slice(7).join("")]);}
 const arr=reverse?[...chunks].reverse():chunks;
 const children=arr.map((t,i)=>({tagName:"SPAN",textContent:t,children:[],classList:{length:0},order:reverse?arr.length-1-i:i}));
 return {el:{children},win:{getComputedStyle:n=>({order:String(n.order),display:"inline",visibility:"visible"})}};
}
test("Build 330: ordinary segmented Sponsored is detected",()=>{
 const a=split("Sponsored");assert.ok(Nesty.segmentedLabels(a.el,a.win).some(x=>x.toLowerCase()==="sponsored"));
});
test("Build 330: scrambled Sponsored is reconstructed from fixed signature",()=>{
 const a=split("Sponsored",true);assert.ok(Nesty.segmentedLabels(a.el,a.win).some(x=>x==="Sponsored"));
});
test("Build 330: two-letter backwards Ad is reconstructed only when ordered",()=>{
 const a=split("Ad",true);assert.ok(Nesty.segmentedLabels(a.el,a.win).includes("Ad"));
});
test("Build 330: anagrams without correct CSS ordering are not accepted",()=>{
 const a=split("Sponsored",true);a.win.getComputedStyle=()=>({order:"0",display:"inline",visibility:"visible"});
 assert.deepEqual(Nesty.segmentedLabels(a.el,a.win),[]);
 const organic=split("Wednesday");assert.deepEqual(Nesty.segmentedLabels(organic.el,organic.win),[]);
});
test("Build 330: the previous Russian segmented decoder remains functional",()=>{
 const a=split("Реклама",true);assert.ok(Nesty.segmentedLabels(a.el,a.win).includes("Реклама"));
 assert.equal(require("../src/manifest.json").version,require("../package.json").version);
});
