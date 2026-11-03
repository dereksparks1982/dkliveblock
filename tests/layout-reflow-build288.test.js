"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path");
const R=require("../src/layout-reflow.js");
function classes(initial=""){const set=new Set(initial.split(/\s+/).filter(Boolean));return {
 contains:k=>set.has(k),add:k=>set.add(k),remove:k=>set.delete(k)};}
function video(){return {tagName:"LI",classList:classes("videoblock"),querySelector:q=>
 q.includes('view_video.php')?{href:"/view_video.php?viewkey=test"}:null};}
function slot(withChild=false){return {tagName:"LI",className:"advertisement-slot",id:"",textContent:"",
 classList:classes(),querySelector:()=>withChild?{tagName:"A"}:null};}
function list(children){return {tagName:"UL",classList:classes("videos"),children,
 isConnected:true,closest:()=>null};}
function documentFor(groups){let style=null;const doc={body:{},querySelectorAll:()=>groups,
 createElement:()=>({id:"",textContent:"",isConnected:false,remove(){this.isConnected=false;}})};
 doc.documentElement={appendChild:x=>{style=x;x.isConnected=true;}};
 return {doc,get style(){return style}};
}
test("Build 288: narrow Pornhub host and listing only; preserve video player",()=>{
 for(const h of ["pornhub.com","www.pornhub.com"])assert.equal(R.supports(h,"/"),true);
 for(const h of ["evilpornhub.com","pornhub.com.evil.test","www.xnxx.com","youtube.com"])
  assert.equal(R.supports(h,"/"),false);
 for(const p of ["/view_video.php","/login","/premium","/upload","/users/test"])
  assert.equal(R.supports("www.pornhub.com",p),false);
 assert.equal(R.supports("www.pornhub.com","/video"),true);
});
test("Build 288: only genuine linked video tiles and empty ad-marked nodes are eligible",()=>{
 const v=video(),ad=slot(),fake=slot(true),unknown={tagName:"LI",className:"promo",querySelector:()=>null};
 assert.equal(R.videoTile(v),true);
 assert.equal(R.emptyAdSlot(ad),true);
 assert.equal(R.emptyAdSlot(fake),false);
 assert.equal(R.candidate(list([v,video(),ad])).videos,2);
 assert.equal(R.candidate(list([v,video(),fake])),null);
 assert.equal(R.candidate(list([v,video(),unknown])),null);
 assert.equal(R.candidate(list([v,ad])),null);
});
test("Build 288: opt-in scan applies CSS classes without moving or duplicating videos",()=>{
 const v1=video(),v2=video(),ad=slot(),grid=list([v1,ad,v2]),fixture=documentFor([grid]);
 const r=R.create(fixture.doc,{location:{hostname:"www.pornhub.com",pathname:"/"}});assert.ok(r);
 const initial=grid.children.slice();
 assert.equal(r.scan(),1);
 assert.ok(grid.classList.contains(R.GRID));
 assert.ok(ad.classList.contains(R.EMPTY));
 assert.deepEqual(grid.children,initial);
 assert.equal(r.status().grids,1);assert.equal(r.status().emptySlots,1);
 assert.match(fixture.style.textContent,/grid-template-columns/);
 assert.match(fixture.style.textContent,/display:none!important/);
 assert.equal(r.scan(),1);
 assert.equal(r.status().emptySlots,1);
 r.restore();
 assert.equal(grid.classList.contains(R.GRID),false);
 assert.equal(ad.classList.contains(R.EMPTY),false);
 assert.equal(fixture.style.isConnected,false);
});
test("Build 288: empty placeholder turning interactive cancels reflow safely",()=>{
 const empty=slot(),g=list([video(),video(),empty]),fixture=documentFor([g]);
 const r=R.create(fixture.doc,{location:{hostname:"pornhub.com",pathname:"/"}});
 assert.equal(r.scan(),1);
 empty.querySelector=()=>({tagName:"A"});
 assert.equal(r.scan(),0);
 assert.equal(g.classList.contains(R.GRID),false);
 assert.equal(empty.classList.contains(R.EMPTY),false);
});
test("Build 288: guards unsupported framing, page changes, excessive lists",()=>{
 assert.equal(R.create({}, {location:{hostname:"evilpornhub.com"},top:{}}),null);
 const win={location:{hostname:"www.pornhub.com",pathname:"/video"}};
 const huge=list(Array.from({length:121},()=>video())),fixture=documentFor([huge]);
 const r=R.create(fixture.doc,win);
 assert.equal(r.scan(),0);
 fixture.doc.querySelectorAll=()=>[list([video(),video()])];
 assert.equal(r.scan(),1);
 win.location.pathname="/view_video.php";
 assert.equal(r.scan(),0);assert.equal(r.status().enabled,false);
});
test("Build 288: settings are explicit opt-in and original controls unchanged",()=>{
 const root=path.resolve(__dirname,"..");
 const m=require("../src/manifest.json"),pkg=require("../package.json");
 const bg=fs.readFileSync(path.join(root,"src/background.js"),"utf8");
 const options=fs.readFileSync(path.join(root,"src/options.html"),"utf8");
 const content=fs.readFileSync(path.join(root,"src/content.js"),"utf8");
 const settings=fs.readFileSync(path.join(root,"src/settings.js"),"utf8");
 assert.equal(m.version,pkg.version);
 assert.ok(m.content_scripts[0].js.indexOf("layout-reflow.js")<
    m.content_scripts[0].js.indexOf("content.js"));
 assert.match(bg,/compactVideoGrids:false/);
 assert.match(bg,/typeof s.compactVideoGrids==="boolean"/);
 assert.match(settings,/"compactVideoGrids"/);
 assert.equal((options.match(/id="compactVideoGrids"/g)||[]).length,1);
 assert.ok(content.includes("layoutReflow?.restore()"));
});
