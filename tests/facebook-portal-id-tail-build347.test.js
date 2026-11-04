"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict");
const FB=require("../src/facebook-ads.js");
const portal=(id,t)=>({id,nodeType:1,tagName:"SPAN",children:[],childNodes:[],textContent:t,getAttribute:()=>null,querySelectorAll:()=>[]});
test("Build 347: head and tail of 120 portal ids each receive half budget",()=>{
 const nodes=Array.from({length:120},(_,i)=>i),s=FB.samplePortalIds(nodes);
 assert.equal(s.length,60);assert.deepEqual(s.slice(0,3),[0,1,2]);
 assert.deepEqual(s.slice(-3),[117,118,119]);
});
test("Build 347: late Sponsored portal is cached even past 60 id elements",()=>{
 const ids=[...Array.from({length:119},(_,i)=>portal("n"+i,"Normal")),portal("late","Sponsored")];
 const wrapper={nodeType:1,id:"",querySelectorAll:()=>ids},d=FB.create({body:{nodeType:1},documentElement:{}},{location:{hostname:"www.facebook.com",pathname:"/"}});
 assert.equal(d.observeMutation({type:"childList",target:{},addedNodes:[],removedNodes:[wrapper]}),true);
 assert.equal(d.diagnostics().cachedLabels,1);
 assert.equal(d.diagnostics().hidden,0);
});
test("Build 347: ordinary late portal never becomes an ad",()=>{
 const ids=[...Array.from({length:119},(_,i)=>portal("n"+i,"Normal")),portal("end","Sponsorship")];
 const d=FB.create({body:{nodeType:1},documentElement:{}},{location:{hostname:"www.facebook.com",pathname:"/"}});
 d.observeMutation({type:"childList",target:{},addedNodes:[],removedNodes:[{nodeType:1,querySelectorAll:()=>ids}]});
 assert.equal(d.diagnostics().cachedLabels,0);
});
test("Build 347: malformed and short id arrays are safe",()=>{
 for(const x of [null,undefined,"bad",{length:-1},{length:1000001}])assert.deepEqual(FB.samplePortalIds(x),[]);
 assert.deepEqual(FB.samplePortalIds([1,2,3]),[1,2,3]);
});
test("Build 347: cache bound and Firefox version unchanged",()=>{
 const s=require("node:fs").readFileSync(require("node:path").join(__dirname,"../src/facebook-ads.js"),"utf8");
 assert.match(s,/cache\.size>=200/);
 assert.equal(require("../src/manifest.json").version,require("../package.json").version);
});
