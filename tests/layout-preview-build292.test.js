"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict"),
 fs=require("node:fs"),path=require("node:path");
const Reflow=require("../src/layout-reflow.js"),Scout=require("../src/nesty-layout-scout.js"),
 Team=require("../src/nesty-team.js");
const ROOT=path.resolve(__dirname,"..");
function classes(input=""){const set=new Set(input.split(/\s+/).filter(Boolean));return {
 contains:k=>set.has(k),add:k=>set.add(k),remove:k=>set.delete(k)};}
function fixture({broken=false,afterError=false}={}){
 let grid,style;const children=[];
 function video(index){return {tagName:"LI",classList:classes("videoblock"),
  querySelector:q=>q.includes("view_video.php")?{}:null,
  getBoundingClientRect(){
   if(afterError&&grid.classList.contains(Reflow.GRID))throw Error("page layout changed");
   const compact=grid.classList.contains(Reflow.GRID);
   const left=index===0?0:compact?232:570;
   return {left,right:left+220,top:0,bottom:145};
  }};}
 grid={tagName:"UL",classList:classes("videos"),children,
  isConnected:true,closest:()=>null};
 children.push(video(0),video(1));
 if(broken)children.push({tagName:"LI",id:"settings",textContent:"Account"});
 const doc={body:{},querySelectorAll:q=>q==="ul.videos"?[grid]:[],
  documentElement:{appendChild(x){x.isConnected=true;style=x;}},
  createElement(){return {isConnected:false,remove(){this.isConnected=false;}}}};
 const agent=Reflow.create(doc,{location:{hostname:"www.pornhub.com",pathname:"/"}});
 return {agent,grid,children,get style(){return style}};
}
function scout(){return Scout.create({location:{hostname:"www.pornhub.com"}},Team);}
test("Build 292 temporary preview measures a large original gap and immediately restores",()=>{
 const f=fixture(),before=f.agent.diagnostics();
 assert.equal(before.geometry.widePairs,1);
 const result=f.agent.preview();
 assert.equal(result.ok,true);
 assert.equal(result.restored,true);
 assert.equal(result.before.geometry.largestWideGapPx,352);
 assert.equal(result.after.geometry.widePairs,0);
 assert.equal(f.agent.status().enabled,false);
 assert.equal(f.grid.classList.contains(Reflow.GRID),false);
 assert.equal(f.style.isConnected,false);
 assert.equal(f.agent.diagnostics().geometry.widePairs,1);
});
test("Build 292 review identifies bounded positive comparison without claiming verified blocking",()=>{
 const result=fixture().agent.preview(),review=scout().compare(result.before,result.after);
 assert.equal(review.outcome,"fewer-wide-gaps");
 assert.equal(review.comparable,true);
 assert.equal(review.widePairsBefore,1);
 assert.equal(review.widePairsAfter,0);
 assert.equal(review.visualVerificationRequired,true);
 assert.equal(review.executable,false);
 assert.equal(review.automaticRules,false);
 assert.equal(typeof scout().apply,"undefined");
 assert.ok(Object.isFrozen(review));
});
test("Build 292 disabled, mixed and already-enabled layouts fail safely",()=>{
 const f=fixture();
 assert.equal(f.agent.scan(),1);
 assert.equal(f.agent.preview().ok,false);
 assert.equal(f.agent.status().enabled,true);
 f.agent.restore();
 const mixed=fixture({broken:true});
 assert.equal(mixed.agent.preview().ok,false);
 assert.equal(mixed.agent.status().enabled,false);
});
test("Build 292 exceptions during after-measurement leave CSS fully restored",()=>{
 const f=fixture({afterError:true});
 const result=f.agent.preview();
 assert.equal(result.ok,false);
 assert.equal(f.agent.status().enabled,false);
 assert.equal(f.grid.classList.contains(Reflow.GRID),false);
 assert.equal(f.style.isConnected,false);
});
test("Build 292 comparisons reject changed tile counts and malformed geometry",()=>{
 const orig=fixture().agent.preview();
 const altered={...orig.after,videoTiles:orig.after.videoTiles+1};
 assert.equal(Scout.normalize(altered).videoTiles,3);
 assert.equal(scout().compare(orig.before,altered).outcome,"inconclusive");
 const wrap={...orig.after,geometry:{...orig.after.geometry,sameRowPairs:0}};
 assert.equal(scout().compare(orig.before,wrap).outcome,"inconclusive");
 assert.equal(scout().compare(orig.before,orig.before).outcome,"no-measured-change");
 assert.equal(scout().compare({...orig.before,supportedPage:false},orig.after),null);
});
test("Build 292 source only exposes explicit extension-authorized preview and dashboard UI",()=>{
 const root=ROOT,manifest=require("../src/manifest.json");
 const content=fs.readFileSync(path.join(root,"src/content.js"),"utf8");
 const bg=fs.readFileSync(path.join(root,"src/background.js"),"utf8");
 const html=fs.readFileSync(path.join(root,"src/site-dashboard.html"),"utf8");
 const ui=fs.readFileSync(path.join(root,"src/site-dashboard.js"),"utf8");
 assert.ok(bg.includes('if(msg.action==="previewLayoutReflow")'));
 assert.ok(bg.includes('data.settings.compactVideoGrids===true'));
 assert.ok(bg.includes('!ownExtensionPage'));
 assert.ok(content.includes('msg.action==="previewLayoutReflow"'));
 assert.ok(content.includes("!active||compactVideoGrids||picking"));
 assert.ok(ui.includes('window.confirm("Briefly preview compact video spacing'));
 assert.ok(ui.includes('action:"previewLayoutReflow"'));
 assert.equal((html.match(/id="dashboardLayoutCompare"/g)||[]).length,1);
 assert.equal(manifest.version,require("../package.json").version);
 assert.equal(manifest.permissions.includes("declarativeNetRequest"),false);
});
