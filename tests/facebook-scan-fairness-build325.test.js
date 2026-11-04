"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict");
const FB=require("../src/facebook-ads.js");
const ARTICLE='[role="article"],[data-pagelet^="FeedUnit"],[aria-posinset]';
function card(ad=false){
 const style={value:"",priority:"",getPropertyValue(){return this.value;},
  getPropertyPriority(){return this.priority;},setProperty(_,v,p){this.value=v;this.priority=p||"";},
  removeProperty(){this.value="";this.priority="";}};
 return {nodeType:1,isConnected:true,style,children:[],
  matches:s=>s.includes('[role="article"]')&&!s.startsWith("main"),
  closest:()=>null,querySelector:s=>ad&&s.includes("/ads/about/")?{}:null,
  querySelectorAll:()=>[],getClientRects:()=>[{}],
  getBoundingClientRect:()=>({width:550,height:360,top:100,left:350})};
}
function setup(cards,bylines=[],references=[]){
 const body={nodeType:1},doc={body,documentElement:{nodeType:1},
  location:{hostname:"www.facebook.com"},
  querySelectorAll(s){
   if(s===ARTICLE)return cards;
   if(s==='main span,[role="main"] span,main a,[role="main"] a')return bylines;
   if(s==='main [aria-labelledby],main use,[role="main"] [aria-labelledby],[role="main"] use')return references;
   return [];
  }};
 const win={location:{hostname:"www.facebook.com",pathname:"/"},innerWidth:1300};
 return FB.create(doc,win);
}
test("Build 325: article after first 240 is eventually checked and hidden",()=>{
 const organic=Array.from({length:249},()=>card());
 const ad=card(true),d=setup([...organic,ad]);
 assert.equal(d.scan(),0);
 assert.equal(ad.style.value,"");
 assert.equal(d.diagnostics().articleCursor,240);
 assert.equal(d.scan(),1);
 assert.equal(ad.style.value,"none");
 assert.equal(d.diagnostics().articleCursor,230);
 d.restore();assert.equal(ad.style.value,"");
});
test("Build 325: exhausted article window wraps and never labels organic posts",()=>{
 const entries=Array.from({length:511},()=>card()),d=setup(entries);
 for(let i=0;i<4;i++)assert.equal(d.scan(),0);
 assert.equal(entries.some(x=>x.style.value==="none"),false);
 assert.ok(d.diagnostics().articleCursor>=0);
});
test("Build 325: empty DOM work queues are safe and do not divide by zero",()=>{
 const d=setup([]);assert.equal(d.scan(),0);
 assert.equal(d.diagnostics().articleCursor,0);
 assert.equal(d.diagnostics().bylineCursor,0);
 assert.equal(d.diagnostics().referenceCursor,0);
});
test("Build 325: bounded byline and portal-reference windows rotate",()=>{
 const s=require("node:fs").readFileSync(require("node:path").join(__dirname,"../src/facebook-ads.js"),"utf8");
 for(const entry of [["bylineCursor","bylineInspected",2400],["referenceCursor","referenceInspected",1200]])
  assert.ok(s.includes('('+entry[0]+'+'+entry[1]+')%'));
 assert.ok(s.includes("Math.min(2400,bylines.length)"));
 assert.ok(s.includes("Math.min(1200,refs.length)"));
 assert.doesNotMatch(s,/fetch\s*\(|sendBeacon\s*\(/);
});
test("Build 325: version and Firefox extension remain consistent",()=>{
 const m=require("../src/manifest.json"),p=require("../package.json");
 assert.equal(m.version,p.version);
 assert.match(p.version,/^0\.3\.\d+$/);
 assert.ok(m.permissions.includes("webRequestBlocking"));
});
