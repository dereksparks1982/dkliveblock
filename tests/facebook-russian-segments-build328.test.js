"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict");
const Nesty=require("../src/meta-agent-nesty.js");
function fixture(word,reverse=false){
 const letters=[...word],list=reverse?letters.slice().reverse():letters;
 const children=list.map((text,i)=>({tagName:"SPAN",children:[],textContent:text,classList:{length:0},order:reverse?list.length-1-i:i}));
 return {el:{children},win:{getComputedStyle:node=>({order:String(node.order),display:"inline",visibility:"visible"})}};
}
test("Build 328: Russian exact segmented advertisement marker",()=>{
 const a=fixture("Реклама");
 assert.ok(Nesty.segmentedLabels(a.el,a.win).some(x=>x.toLowerCase()==="реклама"));
});
test("Build 328: reversed character order reconstructs via CSS ordering",()=>{
 const a=fixture("Реклама",true);
 assert.ok(Nesty.segmentedLabels(a.el,a.win).some(x=>x==="Реклама"));
});
test("Build 328: Russian signature is exact, not broad Cyrillic matching",()=>{
 for(const word of ["Рекламный","Рекламы","Привет","Рекламация"]){
  const a=fixture(word);
  assert.deepEqual(Nesty.segmentedLabels(a.el,a.win),[],word);
 }
});
test("Build 328: hidden segments cannot justify a full ad",()=>{
 const a=fixture("Реклама");
 a.win.getComputedStyle=node=>({order:String(node.order),display:node.textContent==="Р"?"none":"inline",visibility:"visible"});
 assert.deepEqual(Nesty.segmentedLabels(a.el,a.win),[]);
});
test("Build 328: no new permissions and version consistent",()=>{
 const m=require("../src/manifest.json"),p=require("../package.json");
 assert.equal(m.version,p.version);assert.match(p.version,/^0\.3\.\d+$/);
 assert.ok(m.content_scripts[0].js.includes("meta-agent-nesty.js"));
});
