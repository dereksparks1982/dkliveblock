"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict"),
 fs=require("node:fs"),path=require("node:path");
const Layout=require("../src/layout-reflow.js"),ROOT=path.resolve(__dirname,"..");
function cls(initial=""){const set=new Set(initial.split(/\s+/).filter(Boolean));
 let blocked=false;return {contains:n=>set.has(n),add:n=>set.add(n),
 remove(n){if(blocked)throw Error("class removal blocked");set.delete(n);},
 block:b=>{blocked=b;}};}
function scene({fullscreen=false,failStyle=false}={}){
 const grid={tagName:"UL",classList:cls("videos"),isConnected:true,
  children:[],closest:()=>null};
 const video=n=>({tagName:"LI",classList:cls("videoblock"),
  querySelector:()=>({}),getBoundingClientRect(){
   const left=n?(grid.classList.contains(Layout.GRID)?232:570):0;
   return {left,right:left+220,top:0,bottom:145};}});
 grid.children.push(video(0),video(1));
 const doc={body:{},fullscreenElement:fullscreen?{}:null,
  querySelectorAll:()=>[grid],
  createElement:()=>({isConnected:false,remove(){
   if(failStyle)throw Error("stylesheet refused removal");
   this.isConnected=false;}}),
  documentElement:{appendChild:x=>{x.isConnected=true;}}};
 const controller=Layout.create(doc,{location:{hostname:"pornhub.com",pathname:"/"}});
 return {grid,controller};
}
test("Build 293: active fullscreen refuses temporary layout",()=>{
 const f=scene({fullscreen:true}),report=f.controller.preview();
 assert.equal(report.ok,false);
 assert.equal(report.reason,"fullscreen-active");
 assert.equal(f.grid.classList.contains(Layout.GRID),false);
});
test("Build 293: successful preview certifies restoration and original spacing",()=>{
 const f=scene(),report=f.controller.preview();
 assert.equal(report.ok,true);assert.equal(report.restored,true);
 assert.equal(f.controller.status().enabled,false);
 assert.equal(f.grid.classList.contains(Layout.GRID),false);
 assert.equal(f.controller.diagnostics().geometry.widePairs,1);
});
test("Build 293: stylesheet removal refusal cannot claim success",()=>{
 const f=scene({failStyle:true}),report=f.controller.preview();
 assert.equal(report.ok,false);
 assert.equal(report.reason,"restoration-incomplete");
 assert.equal(f.grid.classList.contains(Layout.GRID),false);
});
test("Build 293: failed grid class removal remains tracked for recovery",()=>{
 const f=scene();f.grid.classList.block(true);
 const result=f.controller.preview();
 assert.equal(result.ok,false);
 assert.equal(result.reason,"restoration-incomplete");
 assert.equal(f.grid.classList.contains(Layout.GRID),true);
 f.grid.classList.block(false);
 assert.equal(f.controller.restore(),true);
 assert.equal(f.grid.classList.contains(Layout.GRID),false);
});
test("Build 293: repeated previews never retain or duplicate video tiles",()=>{
 const f=scene(),tiles=f.grid.children.slice();
 for(let i=0;i<8;i++){
  assert.equal(f.controller.preview().ok,true);
  assert.equal(f.controller.status().enabled,false);
  assert.equal(f.grid.classList.contains(Layout.GRID),false);
  assert.deepEqual(f.grid.children,tiles);
 }
});
test("Build 293: extension origin, selected tab and pause gates remain intact",()=>{
 const bg=fs.readFileSync(path.join(ROOT,"src/background.js"),"utf8");
 const content=fs.readFileSync(path.join(ROOT,"src/content.js"),"utf8");
 for(const mark of ['msg.action==="previewLayoutReflow"',"fromContent||!ownExtensionPage",
  "activeTab(id,site)","data.settings.compactVideoGrids===true",
  "{frameId:0}","if(after!==live)","output.restored!==true"])
  assert.ok(bg.includes(mark),mark);
 assert.ok(content.includes("!active||compactVideoGrids||picking"));
});
test("Build 293: offline runner includes this suite, no new permissions",()=>{
 const m=require("../src/manifest.json"),pkg=require("../package.json");
 const reflow=fs.readFileSync(path.join(ROOT,"src/layout-reflow.js"),"utf8");
 const dashboard=fs.readFileSync(path.join(ROOT,"src/site-dashboard.js"),"utf8");
 const runner=fs.readFileSync(path.join(ROOT,"scripts/test-local.sh"),"utf8");
 assert.equal(m.version,pkg.version);
 assert.ok(runner.includes("tests/layout-rollback-build293.test.js"));
 assert.match(reflow,/reason:"restoration-incomplete"/);
 assert.match(dashboard,/Reload the tab to confirm the original layout/);
 assert.equal(m.permissions.includes("declarativeNetRequest"),false);
 assert.doesNotMatch(reflow,/fetch\(|XMLHttpRequest|innerHTML\s*=|sendBeacon\(/);
});
