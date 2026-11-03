"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict"),
 fs=require("node:fs"),path=require("node:path");
const Layout=require("../src/layout-reflow.js");
function cls(names=""){const set=new Set(names.split(/\s+/).filter(Boolean));return {
 contains:k=>set.has(k),add:k=>set.add(k),remove:k=>set.delete(k)};}
function scene(mode="stable"){
 let changed=false;
 const grid={tagName:"UL",classList:cls("videos"),isConnected:true,
  closest:()=>null,children:[]};
 const win={location:{hostname:"www.pornhub.com",pathname:"/"}};
 function tile(index){return {tagName:"LI",classList:cls("videoblock"),
  querySelector:()=>({}),getBoundingClientRect(){
   if(grid.classList.contains(Layout.GRID)&&!changed){
    changed=true;
    if(mode==="replace-tiles")grid.children=[tile(0),tile(1)];
    if(mode==="reverse-tiles")grid.children.reverse();
    if(mode==="change-route")win.location.pathname="/video/search";
    if(mode==="fullscreen")doc.fullscreenElement={};
   }
   const left=index===0?0:grid.classList.contains(Layout.GRID)?232:570;
   return {left,right:left+220,top:0,bottom:145};
  }};}
 grid.children=[tile(0),tile(1)];
 const doc={body:{},fullscreenElement:null,querySelectorAll:()=>[grid],
  createElement(){return {isConnected:false,remove(){this.isConnected=false;}};},
  documentElement:{appendChild:el=>{el.isConnected=true;}}};
 const controller=Layout.create(doc,win);
 return {grid,doc,win,controller};
}
test("Build 294: stable matched thumbnails still compare and restore",()=>{
 const f=scene(),out=f.controller.preview();
 assert.equal(out.ok,true);assert.equal(out.restored,true);
 assert.equal(out.before.geometry.widePairs,1);
 assert.equal(out.after.geometry.widePairs,0);
 assert.equal(f.grid.classList.contains(Layout.GRID),false);
 assert.equal(f.controller.status().enabled,false);
 assert.equal(JSON.stringify(out).includes("children"),false);
 assert.equal(JSON.stringify(out).includes("view_video.php"),false);
});
test("Build 294: same count, different video objects refuses a success",()=>{
 const f=scene("replace-tiles"),before=f.grid.children.slice(),out=f.controller.preview();
 assert.equal(out.ok,false);assert.equal(out.reason,"page-changed");
 assert.equal(f.grid.children.length,before.length);
 assert.notEqual(f.grid.children[0],before[0]);
 assert.equal(f.grid.classList.contains(Layout.GRID),false);
});
test("Build 294: same thumbnail objects in changed order are not comparable",()=>{
 const f=scene("reverse-tiles"),before=f.grid.children.slice(),out=f.controller.preview();
 assert.equal(out.ok,false);assert.equal(out.reason,"page-changed");
 assert.equal(f.grid.children[0],before[1]);
 assert.equal(f.grid.classList.contains(Layout.GRID),false);
});
test("Build 294: changing allowed Pornhub paths or entering fullscreen aborts result",()=>{
 for(const mode of ["change-route","fullscreen"]){
  const f=scene(mode),out=f.controller.preview();
  assert.equal(out.ok,false,mode);
  assert.equal(out.reason,"page-changed",mode);
  assert.equal(f.grid.classList.contains(Layout.GRID),false);
 }
});
test("Build 294: test inventory, existing permissions and source-only privacy",()=>{
 const root=path.resolve(__dirname,".."),
  runner=fs.readFileSync(path.join(root,"scripts/test-local.sh"),"utf8"),
  source=fs.readFileSync(path.join(root,"src/layout-reflow.js"),"utf8"),
  pkg=require("../package.json"),manifest=require("../src/manifest.json");
 assert.equal(pkg.version,manifest.version);
 assert.equal(pkg.version,"0.3.264");
 assert.ok(runner.includes("tests/layout-identity-build294.test.js"));
 assert.ok(source.includes("samePreviewTargets(originalTargets,afterTargets)"));
 assert.ok(source.includes("samePreviewTargets(originalTargets,previewTargets())"));
 assert.doesNotMatch(source,/fetch\(|XMLHttpRequest|sendBeacon\(|innerHTML\s*=/);
 assert.equal(manifest.permissions.includes("declarativeNetRequest"),false);
});
