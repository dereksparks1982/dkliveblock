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
