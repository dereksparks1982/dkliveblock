"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path");
const R=require("../src/layout-reflow.js"),ROOT=path.resolve(__dirname,"..");
function classes(initial=""){const s=new Set(initial.split(/\s+/).filter(Boolean));
 return {contains:k=>s.has(k),add:k=>s.add(k),remove:k=>s.delete(k)};}
function video(){return {tagName:"LI",classList:classes("videoblock"),
 querySelector:q=>q.includes("view_video.php")?{}:null};}
function slot(label=""){return {tagName:"LI",className:"advertisement-slot",id:"",
 textContent:"",classList:classes(),getAttribute:k=>k==="aria-label"?label:null,
 querySelector:()=>null};}
function list(children){return {tagName:"UL",classList:classes("videos"),isConnected:true,
 children,closest:()=>null};}
function env(groups,pathname="/"){
 const doc={body:{},documentElement:{appendChild:x=>{x.isConnected=true;}},
  querySelectorAll:()=>groups,createElement:()=>({isConnected:false,remove(){this.isConnected=false;}})};
 return {doc,win:{location:{hostname:"www.pornhub.com",pathname}}};
}
test("Build 289: read-only diagnostic gives aggregate safe counts, without DOM changes",()=>{
 const safe=list([video(),slot(),video()]),mixed=list([video(),video(),{tagName:"LI"}]);
 const {doc,win}=env([safe,mixed,list([video()])]),agent=R.create(doc,win);
 const children=safe.children.slice(),before=agent.diagnostics();
 assert.deepEqual([before.eligibleLists,before.videoTiles,before.emptyAdSlots,
  before.mixedLists,before.shortLists,before.appliedLists],[1,2,1,1,1,0]);
 assert.ok(Object.isFrozen(before));
 assert.equal(safe.classList.contains(R.GRID),false);
 assert.deepEqual(safe.children,children);
 assert.equal(agent.scan(),1);
 assert.equal(agent.diagnostics().appliedLists,1);
 agent.restore();
 assert.equal(agent.diagnostics().appliedLists,0);
});
test("Build 289: watch pages and unsupported listing paths refuse any reflow",()=>{
 for(const pathname of ["/view_video.php","/login","/video/search-advertiser"]){
  const {doc,win}=env([list([video(),video()])],pathname);
  const agent=R.create(doc,win);
  assert.equal(agent.diagnostics().supportedPage,false);
  assert.equal(agent.scan(),0);
 }
 assert.equal(R.supports("www.pornhub.com","/video/search"),true);
 assert.equal(R.supports("www.pornhub.com","/video/search/category"),true);
});
test("Build 289: unrelated accessible labels and interactive placeholders are protected",()=>{
 assert.equal(R.emptyAdSlot(slot("Advertisement")),true);
 assert.equal(R.emptyAdSlot(slot("Video settings")),false);
 const clickable=slot();clickable.querySelector=()=>({tagName:"BUTTON"});
 assert.equal(R.emptyAdSlot(clickable),false);
 const text=slot();text.textContent="Sponsored";
 assert.equal(R.emptyAdSlot(text),false);
 assert.equal(R.candidate(list([video(),text,video()])),null);
});
test("Build 289: caps and DOM errors refuse diagnosis and unbounded work",()=>{
 const long=list(Array.from({length:121},video)),{doc,win}=env([long]);
 const agent=R.create(doc,win);
 assert.equal(agent.diagnostics().oversizedLists,1);
 assert.equal(agent.scan(),0);
 doc.querySelectorAll=()=>{throw Error("dynamic DOM unavailable");};
 assert.equal(agent.diagnostics().inspectionUnavailable,true);
 assert.equal(agent.scan(),0);
});
test("Build 289: exact site dashboard bridge, no external scripts or broad automatic restyling",()=>{
 const html=fs.readFileSync(path.join(ROOT,"src/site-dashboard.html"),"utf8");
 const js=fs.readFileSync(path.join(ROOT,"src/site-dashboard.js"),"utf8");
 const bg=fs.readFileSync(path.join(ROOT,"src/background.js"),"utf8");
 const content=fs.readFileSync(path.join(ROOT,"src/content.js"),"utf8");
 assert.equal((html.match(/id="dashboardLayoutReflow"/g)||[]).length,1);
 assert.ok(html.includes('id="dashboardLayoutRefresh"'));
 assert.ok(js.includes('action:"getLayoutReflowStatus"'));
 assert.ok(js.includes("mixed/unsupported lists"));
 assert.ok(bg.includes("if(fromContent||!ownExtensionPage||!Number.isInteger(id)||id<0)"));
 assert.ok(bg.includes('action:"getLayoutReflowStatus"'));
 assert.ok(content.includes('msg.action==="getLayoutReflowStatus"'));
 assert.ok(content.includes("layoutReflow?.diagnostics?.()"));
 assert.doesNotMatch(js,/innerHTML\s*=|fetch\(|XMLHttpRequest/);
});
