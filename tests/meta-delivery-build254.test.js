"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict");
const FB=require("../src/facebook-ads.js"),Catalog=require("../src/meta-delivery-catalog.js");
const manifest=require("../src/manifest.json");
function stubCard(items,selfArticle=false){
 const c={
  isConnected:true,style:{setProperty(){}},
  matches:selector=>selfArticle&&selector.includes('[role="article"]')&&!selector.includes("main"),
  closest:()=>null,querySelector:()=>null,
  querySelectorAll:()=>items,
  getBoundingClientRect:()=>({width:530,height:460})
 };
 return c;
}
test("Build 254: 2-char Ad label split into spans is recognized without expensive generic scan",()=>{
 const child=t=>({tagName:"SPAN",children:[],textContent:t,classList:[],childNodes:[{nodeType:3,textContent:t}]});
 const el={tagName:"SPAN",children:[child("A"),child("d")],childNodes:[],textContent:"Ad"};
 assert.ok(FB.labelsOf(el,{}).some(FB.isAdLabel));
 const unrelated={...el,children:[child("M"),child("e")],textContent:"Me"};
 assert.ok(!FB.labelsOf(unrelated,{}).some(FB.isAdLabel));
});
test("Build 254: safely accept nested aria-posinset inside same article",()=>{
 const doc={body:{},documentElement:{}};
 const card=stubCard([],true);
 const outer={parentElement:card},inner={parentElement:outer};
 card.querySelectorAll=()=>[outer,inner];
 assert.equal(FB.safeCard(card,doc),true);
});
test("Build 254: reject wrapper spanning two independent feed posts",()=>{
 const doc={body:{},documentElement:{}};
 const c=stubCard([],false),a={parentElement:c,matches:()=>false},b={parentElement:c,matches:()=>false};
 c.querySelectorAll=()=>[a,b];
 assert.equal(FB.safeCard(c,doc),false);
});
test("Build 254: delivery catalog is inspection-only and requires corroborated signals",()=>{
 assert.ok(Catalog.entries.length>=20);
 assert.equal(Catalog.inspect(["sponsor_label"]).length,0);
 const matches=Catalog.inspect(["sponsored_data","response_schema"]);
 assert.ok(matches.some(x=>x.id==="graphql-sponsored"&&x.action==="review"));
 assert.equal(Catalog.inspect(["normal_post","author_name"]).length,0);
 for(const row of Catalog.entries)assert.ok(["review","observe"].includes(row.mode));
 assert.equal(manifest.version,require("../package.json").version);
 assert.ok(manifest.content_scripts[0].js.indexOf("meta-delivery-catalog.js")<
  manifest.content_scripts[0].js.indexOf("meta-module.js"));
});
