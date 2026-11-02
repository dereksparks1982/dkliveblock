"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path");
const FB=require("../src/facebook-ads.js");
const src=name=>fs.readFileSync(path.join(__dirname,"../src",name),"utf8");
function feed(label){
 const doc={body:{},documentElement:{},location:{hostname:"www.facebook.com"}};
 const win={location:{hostname:"www.facebook.com"},innerWidth:1300,
  getComputedStyle:child=>({order:String(child.order||0),display:"block",visibility:"visible"})};
 const author={contains:()=>false};
 const article={
  isConnected:true,parentElement:doc.body,closest:()=>null,contains:el=>el!==doc.body,
  style:{getPropertyValue(){return this.value||"";},getPropertyPriority(){return "";},
   setProperty(_,value){this.value=value;},removeProperty(){delete this.value;}},
  matches:q=>q.includes('[role="article"]')&&!q.startsWith("main,"),
  getBoundingClientRect:()=>({width:540,height:530,top:100,left:320}),
  getClientRects:()=>[{}]
 };
 const header={parentElement:article,textContent:"Advertiser "+label,
  getBoundingClientRect:()=>({height:75}),
  querySelector:q=>q.includes("h2")?author:null};
 const byline={nodeType:1,tagName:"SPAN",textContent:label,
  children:label.split("").map((c,i)=>({tagName:"SPAN",textContent:c,classList:[],
    children:[],order:i})),
  parentElement:header,getBoundingClientRect:()=>({top:130}),
  getAttribute:()=>null,closest:q=>q.includes('[role="article"]')?article:null,childNodes:[]};
 article.querySelector=q=>q.includes("h2,h3,h4")?author:null;
 article.querySelectorAll=q=>q.includes('[role="article"]')?[]:
  q.startsWith("span,a,")?[byline]:[];
 doc.querySelectorAll=q=>q.includes('[data-pagelet^="FeedUnit"]')?[article]:
  q.includes("main span")?[byline]:[];
 return {article,byline,win,doc};
}
test("Build 260: a Sponsored label split across nine spans reaches the scanner and hides its one post",()=>{
 const f=feed("Sponsored"),detector=FB.create(f.doc,f.win);
 assert.equal(detector.scan(),1);assert.equal(f.article.style.value,"none");
 assert.ok(detector.diagnostics().lastBylineSignals>=1);
 assert.equal(detector.diagnostics().hidden,1);
});
test("Build 260: split Ad label hides, organic post remains untouched",()=>{
 const ad=feed("Ad"),normal=feed("Organic");
 assert.equal(FB.create(ad.doc,ad.win).scan(),1);
 assert.equal(ad.article.style.value,"none");
 assert.equal(FB.create(normal.doc,normal.win).scan(),0);
 assert.equal(normal.article.style.value,undefined);
});
test("Build 260: Sponsored sidebar link climbs to complete card, not only the immediate link wrapper",()=>{
 const doc={body:{},documentElement:{}},win={innerWidth:1300};
 const p=(width,height,outer)=>({
  parentElement:outer,matches:()=>false,
  querySelector:q=>q==="img"?{}:null,querySelectorAll:()=>[],
  getBoundingClientRect:()=>({left:940,width,height})
 });
 const outer=p(350,350,doc.body),middle=p(335,115,outer),inner=p(180,30,middle);
 const link={tagName:"A",parentElement:inner,
  getAttribute:key=>({target:"rhcad2",rel:"noreferrer",href:"https://example.com"}[key]||""),
  closest:()=>null,getBoundingClientRect:()=>({left:1000,width:80,height:30})};
 assert.equal(FB.railAdLink(link),true);
 assert.equal(FB.rightRailLinkCard(link,doc,win),outer);
});
test("Build 260: Facebook scanner respects whole-page hide exception and has count-only diagnostics",()=>{
 const bg=src("background.js"),content=src("content.js");
 assert.match(bg,/!policy\.elemhide/);
 assert.match(bg,/profileFor\(h\)\?\.platform==="facebook"/);
 assert.match(content,/getFacebookDetectorStatus/);
 assert.match(content,/facebookRecognizer\?\.diagnostics/);
 const viewer=src("meta-intelligence.html"),ui=src("meta-intelligence-ui.js");
 assert.ok(viewer.includes('id="facebookDetectorDetails"'));
 assert.ok(ui.includes('"getFacebookDetectorStatus"'));
 assert.doesNotMatch(ui,/document\.cookie/);
});
