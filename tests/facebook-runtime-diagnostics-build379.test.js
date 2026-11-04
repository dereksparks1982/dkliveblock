"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path");
const D=require("../src/facebook-runtime-diagnostics.js");
const R=require("../src/facebook-diagnostic-report.js");
const source=p=>fs.readFileSync(path.join(__dirname,"..",p),"utf8");
test("Build 379: only exact HTTPS Facebook tabs are eligible",()=>{
 for(const url of ["https://facebook.com/","https://www.facebook.com/","https://web.facebook.com/"])
  assert.equal(D.facebookURL(url),true,url);
 for(const url of ["http://www.facebook.com/","https://notfacebook.com/",
  "https://www.facebook.com.evil.test/","https://evil@www.facebook.com/",
  "https://www.facebook.com:444/","about:blank",null])
  assert.equal(D.facebookURL(url),false,String(url));
 const x=D.candidateTabs([{id:3,url:"https://www.facebook.com/",active:false,lastAccessed:900},
 {id:1,url:"https://www.facebook.com/",active:true,lastAccessed:100},
 {id:2,url:"https://facebook.com.evil.test/",active:true}]);
 assert.deepEqual(x.map(t=>t.id),[1,3]);
});
test("Build 379: safely collects aggregate live Facebook status only",async()=>{
 const calls=[],tab={id:4,url:"https://www.facebook.com/"};
 const fake={tabs:{get:async()=>tab,sendMessage:async(id,msg)=>{
  calls.push(["content",id,msg.action]);return {ok:true,active:true,adRecognition:true,
   adapterLoaded:true,detector:{coreFull:1,coreEnabled:1,settingsReady:1,
    observerActive:1,scans:3,labelsClassified:12,labelsAnchored:0,hidden:0,
    privatePostText:"must be discarded"}};
 }},runtime:{sendMessage:async msg=>{calls.push(["background",msg.tabId,msg.action]);
  return {ok:true,enabled:true,siteActive:true,supported:true,stats:{attached:3}};},
 getManifest:()=>({version:"0.3.349"})}};
 const report=await D.collect(fake,tab,R);
 assert.equal(report.extensionVersion,"0.3.349");
 assert.equal(report.triage.code,"ad-label-not-anchored");
 assert.equal(report.detector.labelsClassified,12);
 assert.equal("privatePostText" in report.detector,false);
 assert.ok(!JSON.stringify(report).includes("facebook.com"));
 assert.deepEqual(calls,[["content",4,"getFacebookDetectorStatus"],["background",4,"getMetaGraphqlStats"]]);
 assert.match(D.diagnosisText(report),/ad-label-not-anchored/);
});
test("Build 379: missing controller has an explicit failure, never a false success",async()=>{
 const tab={id:9,url:"https://www.facebook.com/"};
 const fake={tabs:{get:async()=>tab,sendMessage:async()=>{throw Error("disconnected");}},
 runtime:{sendMessage:async()=>({ok:true})}};
 await assert.rejects(()=>D.collect(fake,tab,R),/content controller did not answer/);
 await assert.rejects(()=>D.collect(fake,{id:8,url:"https://evil.test/"},R),/Choose a Facebook tab/);
});
test("Build 379: settings has manual-only bilingual export controls",()=>{
 const html=source("src/facebook-full-settings.html");
 for(const id of ["fbCollectRuntime","fbExportRuntime","fbRuntimeStatus"])
  assert.ok(html.includes('id="'+id+'"'),id);
 assert.ok(html.includes('src="facebook-diagnostic-report.js"'));
 assert.ok(html.includes('src="facebook-runtime-diagnostics.js"'));
 assert.ok(html.includes('data-ru='));
 const js=source("src/facebook-runtime-diagnostics.js");
 assert.ok(!js.includes("storage.local.set"));
 assert.ok(!js.includes("fetch("));
 assert.ok(!js.includes("sendBeacon("));
 assert.ok(!js.includes("setInterval("));
 const manifest=require("../src/manifest.json");
 assert.equal(manifest.version,require("../package.json").version);
});

test("Build 379: viewing diagnostics is opt-in and exporting requires second click",async()=>{
 const button=()=>({disabled:false,handlers:{},addEventListener(name,fn){this.handlers[name]=fn;}});
 const collectButton=button(),saveButton=button();saveButton.disabled=true;
 const status={textContent:""},nodes={fbCollectRuntime:collectButton,
  fbExportRuntime:saveButton,fbRuntimeStatus:status};
 let exported=0,queried=0,created=0,revoked=0;
 const doc={getElementById:id=>nodes[id]||null,
  body:{appendChild(){}},
  createElement:()=>({style:{},click(){exported++;},remove(){}})};
 const tab={id:5,url:"https://www.facebook.com/"};
 const api={tabs:{query:async()=>{queried++;return [tab];},
   get:async()=>tab,sendMessage:async()=>({ok:true,active:true,
    adRecognition:true,adapterLoaded:true,detector:{coreFull:1,
    coreEnabled:1,settingsReady:1,observerActive:1,scans:3,labelsClassified:1,
    labelsAnchored:0,hidden:0}})},
  runtime:{sendMessage:async()=>({ok:true}),getManifest:()=>({version:"0.3.349"})}};
 const win={Blob:class{constructor(){}},URL:{
  createObjectURL:()=>{created++;return "blob:local";},
  revokeObjectURL:()=>{revoked++;}},setTimeout:fn=>fn()};
 assert.equal(D.init(doc,api,R,win),true);
 assert.equal(queried,0);assert.equal(exported,0);
 collectButton.handlers.click();
 for(let i=0;i<12;i++)await Promise.resolve();
 assert.equal(queried,1);
 assert.equal(saveButton.disabled,false);
 assert.match(status.textContent,/ad-label-not-anchored/);
 assert.equal(exported,0);
 saveButton.handlers.click();
 assert.equal(exported,1);
 assert.equal(created,1);
 assert.equal(revoked,1);
});
