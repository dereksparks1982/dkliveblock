"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict");
const Layout=require("../src/layout-reflow.js");
function cls(str){
 const set=new Set(str.split(/\s+/)),state={throwOnRemove:false,skipRemove:false};
 return {state,contains:x=>set.has(x),add:x=>set.add(x),
  remove(x){if(state.throwOnRemove)throw Error("stylesheet blocked");if(!state.skipRemove)set.delete(x);}};
}
function fixture(){
 const grid={tagName:"UL",classList:cls("videos"),isConnected:true,closest:()=>null,children:[]};
 const video=()=>({tagName:"LI",classList:cls("videoblock"),querySelector:()=>({})});
 grid.children=[video(),video()];
 const style={isConnected:false,refuse:false,remove(){if(this.refuse)throw Error("style in use");this.isConnected=false;}};
 const doc={body:{},querySelectorAll:()=>[grid],documentElement:{appendChild:()=>{style.isConnected=true;}},
  createElement:()=>style};
 const win={location:{hostname:"pornhub.com",pathname:"/"}};
 return {grid,doc,win,style,controller:Layout.create(doc,win)};
}
test("Build 315: when page changes, temporary grid and styles are removed",()=>{
 const f=fixture();assert.equal(f.controller.scan(),1);
 f.grid.children=[f.grid.children[0]];
 assert.equal(f.controller.scan(),0);
 assert.equal(f.controller.status().enabled,false);
 assert.equal(f.grid.classList.contains(Layout.GRID),false);
});
test("Build 315: refused CSS class removal stays tracked, retry works",()=>{
 const f=fixture();f.controller.scan();f.grid.classList.state.throwOnRemove=true;
 f.grid.children=[f.grid.children[0]];
 assert.equal(f.controller.scan(),0);assert.equal(f.controller.status().enabled,true);
 f.grid.classList.state.throwOnRemove=false;
 assert.equal(f.controller.restore(),true);assert.equal(f.controller.status().enabled,false);
});
test("Build 315: refused stylesheet removal cannot be reported as complete",()=>{
 const f=fixture();f.controller.scan();f.style.refuse=true;
 f.grid.children=[f.grid.children[0]];
 assert.equal(f.controller.scan(),0);assert.equal(f.controller.status().enabled,true);
 f.style.refuse=false;assert.equal(f.controller.restore(),true);
 assert.equal(f.controller.status().enabled,false);
});
test("Build 315: already disabled source grid never accidentally reflows a new route",()=>{
 const f=fixture();f.controller.scan();f.win.location.pathname="/unsupported";
 assert.equal(f.controller.scan(),0);assert.equal(f.controller.status().enabled,false);
 assert.equal(f.grid.classList.contains(Layout.GRID),false);
});
test("Build 315: stylesheet constant and permissions are unchanged",()=>{
 assert.ok(Layout.CSS.includes("grid-template-columns:repeat(auto-fill"));
 assert.equal(Layout.supports("facebook.com","/"),false);
 assert.equal(require("../src/manifest.json").version,require("../package.json").version);
});