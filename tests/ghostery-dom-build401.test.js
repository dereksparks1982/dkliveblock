"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict");
const DOM=require("../src/ghostery-dom.js");
function el(id="",classes=[],tagName="DIV"){
 return {nodeType:1,id,classList:classes,tagName,firstElementChild:null,nextElementSibling:null,parentElement:null};
}
test("Build 401: only bounded, non-sensitive CSS names leave the sampler",()=>{
 const root=el("main-panel",["sponsor-card","user-session","sponsor-card"]);
 const child=el("promo-slot",["advertisement","auth-token","other-slot"]);
 root.firstElementChild=child;child.parentElement=root;
 const c=DOM.create({body:root}),s=c.snapshot();
 assert.deepEqual(s.ids,["main-panel","promo-slot"]);
 assert.deepEqual(s.classes,["sponsor-card","advertisement","other-slot"]);
 assert.equal("hrefs" in s,false);assert.equal("text" in s,false);
});
test("Build 401: native DOM updates are deduplicated and change-sensitive",()=>{
 const d=DOM.create({body:el("root-box")});
 d.snapshot();
 const added=el("inline-ad",["new-promo"]);
 assert.equal(d.observe([{type:"childList",addedNodes:[added]}]),true);
 assert.equal(d.observe([{type:"childList",addedNodes:[added]}]),false);
 assert.equal(d.observe([{type:"attributes",attributeName:"style",target:added}]),false);
 assert.deepEqual(d.snapshot().classes,["new-promo"]);
});
test("Build 401: malformed/untrusted feature arrays and private names fail closed",()=>{
 const ids=Array(400).fill("foo-bar");
 assert.deepEqual(DOM.normalizeSignals({classes:"bad",ids}),{classes:[],ids:[]});
 assert.deepEqual(DOM.normalizeSignals({classes:["ok-card","auth-login","contact@email.invalid","dk-live-block-style"],ids:["slot-id"]}),
  {classes:["ok-card"],ids:["slot-id"]});
});
test("Build 401: bounded classes/IDs, reset and forbidden input element data",()=>{
 const root=el("root-holder"),h=DOM.create({body:root});h.snapshot();
 const batch=Array.from({length:120},(_,i)=>el("id-"+i,["class-"+i]));
 assert.equal(h.observe([{type:"childList",addedNodes:batch}]),true);
 assert.ok(h.snapshot().ids.length<=32);assert.ok(h.snapshot().classes.length<=64);
 const input=el("private-field",["secret-slot"],"INPUT");
 h.observe([{type:"childList",addedNodes:[input]}]);
 assert.equal(h.snapshot().ids.includes("private-field"),false);
 h.reset();assert.deepEqual(h.snapshot().ids,["root-holder"]);
});
