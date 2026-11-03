"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path");
const FB=require("../src/facebook-ads.js");
function style(){
 return {value:"",priority:"",getPropertyValue(){return this.value;},
  getPropertyPriority(){return this.priority;},setProperty(_,v,p){this.value=v;this.priority=p||"";},
  removeProperty(){this.value="";this.priority="";}};
}
// Synthetic DOM based on the owner's screenshot: linked advertiser at the
// start of one post, compact "Ad ·" marker underneath, deeply nested wrappers.
// No role=article or FeedUnit marker, typical of changing React feed markup.
function fixture(labelText="Ad ·",{place="header",hasAuthor=true,withSecondPost=false}={}){
 const doc={body:{nodeType:1},documentElement:{},location:{hostname:"www.facebook.com"}};
 const win={innerWidth:1352,location:{hostname:"www.facebook.com",pathname:"/"}};
 const box=(left,top,width,height)=>({left,top,width,height,right:left+width,bottom:top+height});
 const card={nodeType:1,style:style(),isConnected:true,parentElement:doc.body,
  getClientRects:()=>[{}],getBoundingClientRect:()=>box(457,175,500,700),
  matches:()=>false,closest:()=>null,
  querySelector:q=>withSecondPost&&q.includes('[role="article"]')?{}:null,
  querySelectorAll:q=>q.includes('[role="article"]')&&withSecondPost?[{parentElement:card},{parentElement:card}]:[],
  children:[],textContent:"Meta Glasses Ad ·"};
 const header={nodeType:1,parentElement:card,textContent:"Meta Glasses Ad ·",
  getBoundingClientRect:()=>box(470,182,440,85)};
 const author={nodeType:1,tagName:"A",textContent:"Meta Glasses",parentElement:header,
  getBoundingClientRect:()=>box(525,196,114,19),contains:()=>false,closest:()=>null};
 header.querySelectorAll=()=>hasAuthor?[author]:[];
 let node=header;
 for(let i=0;i<13;i++){
  const outer=node;
  node={nodeType:1,parentElement:outer,textContent:"Ad ·",
   getBoundingClientRect:()=>box(523,208,65,25),
   querySelectorAll:()=>[]};
 }
 const byline={nodeType:1,tagName:"SPAN",textContent:labelText,
  children:[],childNodes:[{nodeType:3,textContent:labelText}],
  parentElement:node,isConnected:true,
  getBoundingClientRect:()=>box(525,place==="header"?218:456,30,16),
  getAttribute:()=>null,closest:()=>null,querySelectorAll:()=>[]};
 for(const item of [card,header,...walkAncestors(byline,header)]){
  item.contains=x=>{let n=x;while(n){if(n===item)return true;n=n.parentElement;}return false;};
  if(!item.querySelectorAll)item.querySelectorAll=()=>[];
 }
 const cardChildren=withSecondPost?Array.from({length:2},()=>({
   getBoundingClientRect:()=>box(460,200,440,310),
   matches:q=>q.includes('[role="article"]'),
   querySelector:()=>null
 })):[];
 card.children=cardChildren;
 doc.querySelectorAll=q=>q==="main span,[role=\"main\"] span,main a,[role=\"main\"] a"?[byline]:[];
 return {doc,win,card,byline,author,header};
}
function walkAncestors(from,until){
 const rows=[];let n=from.parentElement;
 while(n&&n!==until){rows.push(n);n=n.parentElement;}
 return rows;
}
test("Build 298: screenshot-like nested Ad under linked advertiser hides ONE whole card",()=>{
 const f=fixture();
 const detector=FB.create(f.doc,f.win);
 assert.equal(FB.isAdLabel("Ad ·"),true);
 assert.equal(FB.linkedAuthorAdByline(f.byline,f.card,f.win),true);
 assert.equal(FB.feedCardFrom(f.byline,f.doc),f.card);
 assert.equal(detector.scan(),1);
 assert.equal(f.card.style.value,"none");
 assert.equal(detector.diagnostics().lastBylineSignals>=1,true);
 assert.equal(detector.diagnostics().hidden,1);
 detector.restore();
 assert.equal(f.card.style.value,"");
});
test("Build 298: Sponsored badge under linked advertiser also qualifies",()=>{
 const f=fixture("Sponsored");
 assert.equal(FB.linkedAuthorAdByline(f.byline,f.card,f.win),true);
 assert.equal(FB.create(f.doc,f.win).scan(),1);
});
test("Build 298: ordinary feed author + organic label never disappears",()=>{
 for(const label of ["Public","Meta Glasses","Ad blocker review","Adventures","Video"]){
  const f=fixture(label);
  assert.equal(FB.create(f.doc,f.win).scan(),0,label);
  assert.equal(f.card.style.value,"",label);
 }
});
test("Build 298: body advertising words cannot hide an organic post",()=>{
 const f=fixture("Ad ·",{place:"body"});
 assert.equal(FB.linkedAuthorAdByline(f.byline,f.card,f.win),false);
 assert.equal(FB.create(f.doc,f.win).scan(),0);
});
test("Build 298: an ad label without a linked author is insufficient",()=>{
 const f=fixture("Ad",{hasAuthor:false});
 assert.equal(FB.linkedAuthorAdByline(f.byline,f.card,f.win),false);
 assert.equal(FB.create(f.doc,f.win).scan(),0);
});
test("Build 298: quoted ad labels, sidebar or form badges are never a post byline",()=>{
 const f=fixture();
 for(const region of ["p","blockquote","[role=\"dialog\"]","form","[role=\"complementary\"]"]){
  f.byline.closest=q=>q.includes(region)?{}:null;
  assert.equal(FB.linkedAuthorAdByline(f.byline,f.card,f.win),false,region);
 }
});
test("Build 298: multi-post wrappers and screen-wide sections cannot disappear",()=>{
 const f=fixture("Ad",{withSecondPost:true});
 assert.equal(FB.safeCard(f.card,f.doc),false);
 assert.equal(FB.create(f.doc,f.win).scan(),0);
});
test("Build 298: fast insertion detects a new ad but not ordinary content",()=>{
 const ad=fixture("Ad"),organic=fixture("Organic");
 const posted=FB.create(ad.doc,ad.win);
 assert.equal(posted.scanInserted([{type:"childList",target:ad.header,addedNodes:[ad.byline]}]),1,
  "fast scan should detect this deep linked-author byline without a global sweep");
 assert.equal(ad.card.style.value,"none");
 assert.equal(posted.scan(),0,"periodic scan must preserve an already hidden sponsored card");
 assert.equal(FB.create(organic.doc,organic.win).scanInserted([{type:"childList",
  target:organic.header,addedNodes:[organic.byline]}]),0);
});
test("Build 298: version and release regression registration",()=>{
 const pkg=require("../package.json"),manifest=require("../src/manifest.json");
 assert.equal(pkg.version,"0.3.268");
 assert.equal(manifest.version,pkg.version);
 const runner=fs.readFileSync(path.resolve(__dirname,"../scripts/test-local.sh"),"utf8");
 assert.ok(runner.includes("tests/facebook-linked-author-build298.test.js"));
 assert.ok(runner.includes("tests/facebook-build260.test.js"));
 assert.ok(manifest.content_scripts[0].js.includes("facebook-ads.js"));
 assert.equal(manifest.content_scripts[0].js.includes("vendor/facebook-sponsored-upstream.js"),false);
});
