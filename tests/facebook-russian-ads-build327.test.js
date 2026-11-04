"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict");
const FB=require("../src/facebook-ads.js"),Nesty=require("../src/meta-agent-nesty.js");
test("Build 327: exact short English and Russian advertisement disclosures",()=>{
 for(const value of ["Sponsored","Ad"," РЕКЛАМА ","Спонсировано","спонсировано"] )
  assert.equal(FB.isAdLabel(value),true,value);
 for(const value of ["рекламы","Рекламный","Рекламация","Это реклама","Sponsorship","Advice","ad campaign"])
  assert.equal(FB.isAdLabel(value),false,value);
});
test("Build 327: sponsored rail semantics include Russian but exclude generic Ad",()=>{
 for(const v of ["Sponsored","Реклама","СПОНСИРОВАНО","Спонсировано"])
  assert.equal(FB.isSponsoredLabel(v),v!=="СПОНСИРОВАНО",v);
 assert.equal(FB.isSponsoredLabel("Ad"),false);
 assert.equal(FB.isSponsoredLabel("Рекламодатель"),false);
});
test("Build 327: Russian label alone is not enough to hide an ordinary card",()=>{
 const body={nodeType:1},doc={body,documentElement:{},location:{hostname:"www.facebook.com"}};
 const style={value:"",getPropertyValue(){return this.value},getPropertyPriority(){return ""},setProperty(_,v){this.value=v},removeProperty(){this.value=""}};
 const card={nodeType:1,isConnected:true,children:[],style,matches:s=>s.includes('[role="article"]'),
  closest:()=>null,querySelector:()=>null,querySelectorAll:()=>[],getClientRects:()=>[{}],
  getBoundingClientRect:()=>({width:550,height:320})};
 doc.querySelectorAll=s=>s==='[role="article"],[data-pagelet^="FeedUnit"],[aria-posinset]'?[card]:[];
 const d=FB.create(doc,{location:{hostname:"www.facebook.com",pathname:"/"},innerWidth:1250});
 assert.equal(d.scan(),0);assert.equal(style.value,"");
});
test("Build 327: Meta specialist keeps localized tokens observational",()=>{
 assert.equal(Nesty.label?.("Реклама"),undefined,"label helper is private");
 assert.equal(FB.isAdLabel("Реклама"),true);
 const s=require("node:fs").readFileSync(require("node:path").join(__dirname,"../src/meta-agent-nesty.js"),"utf8");
 assert.ok(s.includes('s==="реклама"'));
});
test("Build 327: only Facebook detector touched; no permissions or version mismatch",()=>{
 const m=require("../src/manifest.json"),p=require("../package.json");
 assert.equal(m.version,p.version);assert.equal(p.version,"0.3.297");
 assert.ok(m.content_scripts[0].js.includes("facebook-ads.js"));
});
