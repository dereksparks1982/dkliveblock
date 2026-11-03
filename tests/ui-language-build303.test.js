"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path");
require("../src/ui-language-tools.js");const UI=require("../src/ui-language.js");
const source=fs.readFileSync(path.join(__dirname,"../src/ui-language.js"),"utf8");
function fixture(){
 const doc={nodeType:9,documentElement:null},html={nodeType:1,tagName:"HTML",parentElement:null,ownerDocument:doc};
 const paragraph={nodeType:1,tagName:"P",parentElement:html,ownerDocument:doc};
 const code={nodeType:1,tagName:"CODE",parentElement:html,ownerDocument:doc};
 const text={nodeType:3,nodeValue:"Start capture",parentElement:paragraph};
 const hidden={nodeType:3,nodeValue:"Start capture",parentElement:code};
 function el(tag,attrs){const a={...attrs};return {nodeType:1,tagName:tag,parentElement:html,ownerDocument:doc,isContentEditable:false,value:"private input",getAttribute:k=>a[k]??null,setAttribute:(k,v)=>{a[k]=v;}};}
 const input=el("INPUT",{placeholder:"Start capture"}),button=el("BUTTON",{"aria-label":"Start capture",title:"Stop capture"});
 doc.documentElement=html;doc.createTreeWalker=(root,kind)=>{const a=kind===4?[text,hidden]:[paragraph,code,input,button];let i=0;return {nextNode(){return a[i++]||null;}};};
 return {doc,text,hidden,input,button};
}
test("Build 303: utility dictionary transforms DOM text and restores English",()=>{
 const f=fixture();UI.apply(f.doc,"ru");assert.equal(f.text.nodeValue,"Начать запись");assert.equal(f.hidden.nodeValue,"Start capture");
 UI.apply(f.doc,"en");assert.equal(f.text.nodeValue,"Start capture");});
test("Build 303: input placeholder and ARIA attributes translate, never input value",()=>{
 const f=fixture();UI.apply(f.doc,"ru");assert.equal(f.input.getAttribute("placeholder"),"Начать запись");assert.equal(f.input.value,"private input");
 assert.equal(f.button.getAttribute("aria-label"),"Начать запись");assert.equal(f.button.getAttribute("title"),"Остановить запись");
 UI.apply(f.doc,"en");assert.equal(f.input.getAttribute("placeholder"),"Start capture");assert.equal(f.input.value,"private input");});
test("Build 303: dynamic labels are re-translated safely",()=>{
 const f=fixture();UI.apply(f.doc,"ru");f.text.nodeValue="Stop capture";f.button.setAttribute("aria-label","Stop capture");UI.apply(f.text,"ru");UI.apply(f.button,"ru");
 assert.equal(f.text.nodeValue,"Остановить запись");assert.equal(f.button.getAttribute("aria-label"),"Остановить запись");
 UI.apply(f.doc,"en");assert.equal(f.text.nodeValue,"Stop capture");assert.equal(f.button.getAttribute("aria-label"),"Stop capture");});
test("Build 303: mutation observer handles only three approved attributes",()=>{
 assert.ok(source.includes('else if(r.type==="attributes")attributes(r.target,current);'));
 assert.ok(source.includes('attributeFilter:["aria-label","title","placeholder"]'));
 assert.equal(UI.translate("real.example","ru"),"real.example");
 const m=require("../src/manifest.json");assert.equal(m.version,require("../package.json").version);
});