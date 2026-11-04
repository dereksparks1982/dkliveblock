"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict");
const FB=require("../src/facebook-ads.js");
function fixture(ads=[true,false]){
 const body={nodeType:1},doc={body,documentElement:{},location:{hostname:"www.facebook.com"}};
 const make=ad=>{
  const style={v:"",p:"",getPropertyValue(){return this.v},getPropertyPriority(){return this.p},
   setProperty(_,v,p){this.v=v;this.p=p||""},removeProperty(){this.v="";this.p=""}};
  const card={nodeType:1,isConnected:true,style,children:[],closest:()=>null,
   matches:s=>s.includes('[role="article"]')&&!s.startsWith("main"),
   querySelector:s=>ad&&s.includes("/ads/about/")?{}:null,querySelectorAll:()=>[],
   getClientRects:()=>[{}],getBoundingClientRect:()=>({width:540,height:340,top:100,left:320})};
  return card;
 };
 const cards=ads.map(make);
 doc.elementFromPoint=(_,y)=>({closest:()=>y<450?cards[0]:cards[1]||cards[0]});
 doc.querySelectorAll=()=>[];
 const win={location:{hostname:"www.facebook.com",pathname:"/"},innerWidth:1200,innerHeight:800};
 return {cards,doc,win,d:FB.create(doc,win)};
}
test("Build 357: on-screen ad is hidden before global feed rotation",()=>{
 const f=fixture();
 assert.equal(f.d.scan(),1);assert.equal(f.cards[0].style.v,"none");
 assert.equal(f.cards[1].style.v,"");
 assert.equal(f.d.diagnostics().visibleHidden,1);
});
test("Build 357: a second viewport check does not re-hide existing card",()=>{
 const f=fixture();
 assert.equal(f.d.scanVisible(),1);
 assert.equal(f.d.scanVisible(),0);
 assert.equal(f.d.diagnostics().visibleScans,2);
 f.d.restore();assert.equal(f.cards[0].style.v,"");
});
test("Build 357: no ad evidence means visible organic posts remain visible",()=>{
 const f=fixture([false,false]);
 assert.equal(f.d.scanVisible(),0);
 assert.deepEqual(f.cards.map(c=>c.style.v),["",""]);
});
test("Build 357: missing viewport capability and specialized pages fail open",()=>{
 const f=fixture();
 f.win.innerHeight=0;assert.equal(f.d.scanVisible(),0);
 f.win.innerHeight=800;delete f.doc.elementFromPoint;
 assert.equal(f.d.scanVisible(),0);
 const g=fixture();g.win.location.pathname="/marketplace/";
 assert.equal(g.d.scanVisible(),0);
});
test("Build 357: scrolling is rate-limited, gated, and never invokes broad scans",()=>{
 const fs=require("node:fs"),path=require("node:path");
 const content=fs.readFileSync(path.join(__dirname,"../src/content.js"),"utf8");
 assert.match(content,/window\.addEventListener\("scroll"/);
 assert.match(content,/facebookVisibleTimer=setTimeout\(/);
 assert.match(content,/if\(!active\|\|!adRecognition\|\|picking\)return/);
 assert.match(content,/facebookRecognizer\?\.scanVisible\?\.\(\)/);
 assert.equal(require("../package.json").version,require("../src/manifest.json").version);
});
