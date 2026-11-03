"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path");
const Layout=require("../src/layout-reflow.js");
const Scout=require("../src/nesty-layout-scout.js");
const Team=require("../src/nesty-team.js");
const ROOT=path.resolve(__dirname,"..");
function video(left,top=0,width=220,height=145){
 return {tagName:"LI",classList:{contains:k=>k==="videoblock"},
  querySelector:q=>q.includes("view_video.php")?{}:null,
  getBoundingClientRect:()=>({left,top,right:left+width,bottom:top+height})};
}
function list(children){return {tagName:"UL",classList:{contains:k=>k==="videos",
 add(){},remove(){}},isConnected:true,children,closest:()=>null};}
function env(lists,pathname="/"){
 const doc={body:{},querySelectorAll:()=>lists,createElement:()=>({isConnected:false,
  remove(){this.isConnected=false;}}),
  documentElement:{appendChild:x=>{x.isConnected=true;}}};
 const win={location:{hostname:"www.pornhub.com",pathname}};
 return {doc,win};
}
function metrics(geometry,options={}){
 return {supportedPage:true,scannedLists:1,eligibleLists:1,videoTiles:3,
 emptyAdSlots:0,mixedLists:0,shortLists:0,oversizedLists:0,appliedLists:0,
 appliedSlots:0,scans:0,geometry,...options};
}
const newScout=()=>Scout.create({location:{hostname:"pornhub.com"}},Team);
test("Build 291: same-row wide gaps are measured without copying coordinates",()=>{
 const left=video(0),right=video(570),before=[left,right];
 const measured=Layout.measureHorizontalGaps(before);
 assert.deepEqual(measured,{sampledTiles:2,sameRowPairs:1,widePairs:1,largestWideGapPx:352});
 assert.deepEqual(before,[left,right]);
 assert.equal(Object.isFrozen(measured),true);
 assert.doesNotMatch(JSON.stringify(measured),/view_video|left|right|top|bottom/);
});
test("Build 291: ordinary 12px card spacing and row wraps are not flagged",()=>{
 const normal=Layout.measureHorizontalGaps([video(0),video(232),video(464)]);
 assert.equal(normal.sameRowPairs,2);
 assert.equal(normal.widePairs,0);
 assert.equal(normal.largestWideGapPx,0);
 const wrapped=Layout.measureHorizontalGaps([video(0),video(0,180)]);
 assert.equal(wrapped.sampledTiles,2);
 assert.equal(wrapped.sameRowPairs,0);
 assert.equal(wrapped.widePairs,0);
});
test("Build 291: hidden, bizarre, throwing and overlapping geometry is skipped",()=>{
 const invis=video(0,0,0,0);
 const unusual=video(0);unusual.getBoundingClientRect=()=>({left:Infinity,right:220,top:0,bottom:145});
 const errors=video(0);errors.getBoundingClientRect=()=>{throw Error("page reflow unavailable");};
 const overlap=Layout.measureHorizontalGaps([video(0),video(100)]);
 assert.equal(overlap.widePairs,0);
 assert.equal(Layout.measureHorizontalGaps([invis,unusual,errors]).sampledTiles,0);
 const oversized=Layout.measureHorizontalGaps(Array.from({length:180},(_,i)=>video(i*220)));
 assert.ok(oversized.sampledTiles<=120);
 assert.ok(oversized.sameRowPairs<=119);
});
test("Build 291: actual Pornhub diagnostics include only aggregate geometry and are read-only",()=>{
 const v1=video(0),v2=video(570),group=list([v1,v2]),{doc,win}=env([group]);
 const controller=Layout.create(doc,win);
 const summary=controller.diagnostics();
 assert.equal(summary.eligibleLists,1);
 assert.equal(summary.geometry.sameRowPairs,1);
 assert.equal(summary.geometry.widePairs,1);
 assert.equal(summary.geometry.largestWideGapPx,352);
 assert.equal(Object.isFrozen(summary.geometry),true);
 assert.equal(group.classList.contains("dk-live-block-compact-video-grid"),false);
 assert.doesNotMatch(JSON.stringify(summary),/video_url|view_video|title|left|right|top|bottom/);
 assert.equal(controller.status().enabled,false);
});
test("Build 291: Nesty review stays inert, distinguishes wide gap and gap after reflow",()=>{
 const geometry={sampledTiles:3,sameRowPairs:2,widePairs:1,largestWideGapPx:352};
 const s=newScout(),r=s.review(metrics(geometry),{active:true});
 assert.equal(r.finding,"wide-video-gap-measured");
 assert.equal(r.nextStep,"consider-existing-setting");
 assert.equal(r.executable,false);
 assert.equal(r.automaticRules,false);
 const after=s.review(metrics(geometry,{appliedLists:1}),{active:true,enabled:true});
 assert.equal(after.finding,"wide-gap-after-reflow");
 assert.equal(after.nextStep,"compare-visual-layout");
 const noGap=s.review(metrics({...geometry,widePairs:0,largestWideGapPx:0}),{active:true});
 assert.equal(noGap.finding,"review-grid-spacing");
 assert.equal(noGap.visualVerificationRequired,true);
});
test("Build 291: Nesty rejects hostile/impossible geometry and accepts legacy count-only fixtures",()=>{
 const valid={sampledTiles:3,sameRowPairs:2,widePairs:1,largestWideGapPx:352};
 const s=newScout();
 for(const invalid of [null,[],{...valid,widePairs:3},
  {...valid,sampledTiles:5},{...valid,largestWideGapPx:5000},
  {...valid,largestWideGapPx:"352"},
  {...valid,widePairs:0},{...valid,privateTitle:"secret"},
  {...valid,sameRowPairs:5}]){
  assert.equal(Scout.normalize(metrics(invalid)),null);
  assert.equal(s.review(metrics(invalid),{active:true}),null);
 }
 assert.equal(s.review(metrics(undefined),{active:true}).finding,"review-grid-spacing");
});
test("Build 291: repetition signature distinguishes changed geometry but ignores scan count",()=>{
 const s=newScout(),g={sampledTiles:3,sameRowPairs:2,widePairs:1,largestWideGapPx:352};
 const base=metrics(g);
 assert.equal(s.review(base,{active:true}).repeatCount,1);
 assert.equal(s.review(metrics(g,{scans:2}),{active:true}).repeatCount,2);
 assert.equal(s.review(metrics({...g,largestWideGapPx:400}),{active:true}).repeatCount,1);
});
test("Build 291: source wiring remains single-scope, no new controls, dependencies or permissions",()=>{
 const manifest=require("../src/manifest.json"),pkg=require("../package.json");
 const dash=fs.readFileSync(path.join(ROOT,"src/site-dashboard.js"),"utf8");
 const layout=fs.readFileSync(path.join(ROOT,"src/layout-reflow.js"),"utf8");
 const runner=fs.readFileSync(path.join(ROOT,"scripts/test-local.sh"),"utf8");
 assert.equal(manifest.version,pkg.version);
 assert.match(dash,/r\.geometry\.sameRowPairs/);
 assert.match(dash,/wide-video-gap-measured/);
 assert.match(dash,/wide-gap-after-reflow/);
 assert.match(layout,/Math\.abs\(current\.top-previous\.top\)<=12/);
 assert.ok(runner.includes("tests/layout-geometry-build291.test.js"));
 assert.equal(manifest.content_scripts[0].js.filter(x=>x==="layout-reflow.js").length,1);
 assert.equal(manifest.permissions.includes("declarativeNetRequest"),false);
 assert.doesNotMatch(layout,/fetch\(|XMLHttpRequest|innerHTML\s*=/);
});
