"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path");
const D=require("../src/facebook-runtime-diagnostics.js");
const R=require("../src/facebook-diagnostic-report.js");
const tab={id:3,url:"https://www.facebook.com/feed"};
function detector(d={}){return {ok:true,active:true,adRecognition:true,adapterLoaded:true,detector:{coreFull:1,coreEnabled:1,settingsReady:1,observerActive:1,scans:2,hidden:0,labelsClassified:0,labelsAnchored:0,...d}};}
function api(get,send=async()=>detector()){return {tabs:{get,sendMessage:send},runtime:{sendMessage:async()=>({ok:true}),getManifest:()=>({version:require("../package.json").version})}};}
test("Build 390: navigation and closed tabs invalidate an asynchronous report",async()=>{
 let n=0;
 await assert.rejects(()=>D.collect(api(async()=>({id:3,url:++n===1?tab.url:"https://www.facebook.com/groups"})),tab,R),/tab changed/);
 assert.equal(n,2);n=0;
 await assert.rejects(()=>D.collect(api(async()=>{if(++n===2)throw Error("closed");return tab;}),tab,R),/closed during inspection/);
});
test("Build 390: stable report is private and mixed evidence is not a clean success",async()=>{
 const report=await D.collect(api(async()=>tab,async()=>detector({hidden:1,labelsClassified:4,labelsAnchored:2,labelsUnanchored:2,privatePostText:"DO_NOT_EXPORT"})),tab,R);
 assert.equal(report.triage.code,"mixed-hide-evidence");
 assert.match(D.diagnosisText(report),/Unanchored attempts: 2/);
 assert.doesNotMatch(JSON.stringify(report),/DO_NOT_EXPORT|\/feed/);
 assert.equal(R.build(detector({hidden:1,labelsUnanchored:0}),null).triage.code,"dom-hide-observed");
 assert.equal(R.build(detector({hidden:0,labelsClassified:3,labelsAnchored:0,labelsUnanchored:3}),null).triage.code,"ad-label-not-anchored");
});
test("Build 390: repeated inspection clicks cannot race snapshot state",async()=>{
 const button=()=>({disabled:false,handlers:{},addEventListener(name,fn){this.handlers[name]=fn;}});
 const inspect=button(),save=button(),status={textContent:""};
 const doc={getElementById:id=>({fbCollectRuntime:inspect,fbExportRuntime:save,fbRuntimeStatus:status})[id]||null};
 let unlock,calls=0;const waiting=new Promise(resolve=>{unlock=resolve;});
 const browser=api(async()=>tab);browser.tabs.query=async()=>{calls++;await waiting;return [tab];};
 assert.equal(D.init(doc,browser,R,{}),true);
 inspect.handlers.click();inspect.handlers.click();await Promise.resolve();
 assert.equal(calls,1);assert.equal(save.disabled,true);
 unlock();for(let i=0;i<18;i++)await Promise.resolve();
 assert.equal(inspect.disabled,false);assert.equal(save.disabled,false);
});
test("Build 390: warnings do not reload YouTube watch tabs",()=>{
 const source=fs.readFileSync(path.join(__dirname,"../src/background.js"),"utf8");
 assert.ok(source.includes('DKAdaptiveYouTube.note(data.youtubeAdaptive,id,pageHost,"enforcement",false,now)'));
 assert.ok(!source.includes("await browser.tabs.reload(id)"));
});
