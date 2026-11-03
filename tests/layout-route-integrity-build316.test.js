"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict");
const Layout=require("../src/layout-reflow.js");
function cls(initial){const s=new Set(initial.split(/\s+/).filter(Boolean));return{contains:x=>s.has(x),add:x=>s.add(x),remove:x=>s.delete(x)};}
function scene(kind){
 const grid={tagName:"UL",classList:cls("videos"),isConnected:true,closest:()=>null,children:[]};
 const win={location:{hostname:"www.pornhub.com",pathname:"/video/search",search:"?search=cats",hash:"#one"}};
 const doc={body:{},visibilityState:"visible",prerendering:false,fullscreenElement:null,
  querySelectorAll:()=>[grid],createElement:()=>({isConnected:false,remove(){this.isConnected=false}}),
  documentElement:{appendChild:x=>{x.isConnected=true;}}};
 function tile(i){return {tagName:"LI",isConnected:true,classList:cls("videoblock"),querySelector:()=>({}),
  getBoundingClientRect(){
   if(grid.classList.contains(Layout.GRID)&&!scene.changed){
    scene.changed=true;
    if(kind==="change-query")win.location.search="?search=dogs";
    if(kind==="change-hash")win.location.hash="#two";
    if(kind==="hidden")doc.visibilityState="hidden";
   }
   const left=i?grid.classList.contains(Layout.GRID)?232:570:0;
   return {left,right:left+220,top:0,bottom:140};
  }};}
 scene.changed=false;grid.children=[tile(0),tile(1)];
 return {grid,win,doc,controller:Layout.create(doc,win)};
}
test("Build 316: same path but different search query makes preview inconclusive",()=>{
 const f=scene("change-query"),r=f.controller.preview();
 assert.equal(r.ok,false);assert.equal(r.reason,"page-changed");
 assert.equal(f.grid.classList.contains(Layout.GRID),false);
});
test("Build 316: changed hash during preview aborts success",()=>{
 const f=scene("change-hash"),r=f.controller.preview();
 assert.equal(r.ok,false);assert.equal(r.reason,"page-changed");
});
test("Build 316: hidden tab before or during measurement is refused",()=>{
 const a=scene();a.doc.visibilityState="hidden";
 assert.equal(a.controller.preview().reason,"hidden-tab");
 const b=scene("hidden"),out=b.controller.preview();
 assert.equal(out.ok,false);assert.equal(out.reason,"page-changed");
});
test("Build 316: detached tile cannot be styled as a live video candidate",()=>{
 const f=scene(),tile=f.grid.children[1];tile.isConnected=false;
 assert.equal(Layout.videoTile(tile),false);assert.equal(Layout.candidate(f.grid),null);
 assert.equal(f.controller.preview().ok,false);
});
test("Build 316: stable preview still works, does not retain styling",()=>{
 const f=scene(),r=f.controller.preview();
 assert.equal(r.ok,true);assert.equal(r.restored,true);
 assert.equal(f.controller.status().enabled,false);
 assert.equal(require("../package.json").version,require("../src/manifest.json").version);
});