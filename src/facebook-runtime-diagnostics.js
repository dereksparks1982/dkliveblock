/* DK Live Block: local-only Facebook runtime inspection.
   Reports are never uploaded or stored. The user explicitly exports JSON. */
(function(root){"use strict";
const MAX_TABS=32;
function facebookURL(value){
 if(typeof value!=="string"||value.length>4096)return false;
 try{
  const u=new URL(value);
  return u.protocol==="https:"&&!u.username&&!u.password&&!u.port&&
    (u.hostname==="facebook.com"||u.hostname.endsWith(".facebook.com"));
 }catch(_){return false;}
}
function candidateTabs(tabs){
 if(!Array.isArray(tabs))return [];
 return tabs.filter(t=>Number.isInteger(t?.id)&&t.id>=0&&facebookURL(t.url))
  .sort((a,b)=>Number(b.active)-Number(a.active)||
    (Number(b.lastAccessed)||0)-(Number(a.lastAccessed)||0)||
    a.id-b.id).slice(0,MAX_TABS);
}
function diagnosisText(report){
 if(!report||typeof report!=="object")return "No Facebook diagnostic report available.";
 const d=report.detector||{},t=report.triage||{};
 const num=k=>Number.isSafeInteger(d[k])?String(d[k]):"unknown";
 return "Result: "+(t.code||"unavailable")+
  "\nEngine enabled: "+num("coreEnabled")+
  " | settings loaded: "+num("settingsReady")+
  " | observer attached: "+num("observerActive")+
  "\nMatched labels: "+num("labelsClassified")+
  " | anchored labels: "+num("labelsAnchored")+
  " | hidden posts: "+num("hidden")+
  "\nLate text edits: "+num("inlineAdLabelEdits")+
  " | shallow labels recovered: "+num("shallowPostLabelsRecovered")+
  "\nNext: "+(t.next||"No specific conclusion.");
}
async function collect(api,tab,Report){
 if(!Number.isInteger(tab?.id)||!facebookURL(tab?.url))throw Error("Choose a Facebook tab.");
 if(!api?.tabs?.sendMessage||!api?.runtime?.sendMessage||!Report?.build)
  throw Error("Firefox diagnostics are not available.");
 let current=null;
 try{current=await api.tabs.get(tab.id);}catch(_){throw Error("Facebook tab was closed.");}
 if(!current||!facebookURL(current.url)||current.id!==tab.id)
  throw Error("The selected tab is no longer on Facebook.");
 let detector=null;
 try{detector=await api.tabs.sendMessage(tab.id,{action:"getFacebookDetectorStatus"});}
 catch(_){throw Error("Facebook content controller did not answer. Check its startup, not network rules.");}
 if(!detector?.ok)throw Error("Facebook content controller returned no status.");
 let graph=null;
 try{graph=await api.runtime.sendMessage({action:"getMetaGraphqlStats",tabId:tab.id});}
 catch(_){graph=null;}
 const report=Report.build(detector,graph);
 if(!report)throw Error("Cannot construct an aggregate report.");
 // Only the diagnostic builder's fixed schema and local extension version
 // cross into JSON. Never include tab URL, title, post text, IDs or cookies.
 return Object.freeze({...report,extensionVersion:String(api.runtime.getManifest()?.version||"").slice(0,30)});
}
function init(doc=root.document,api=root.browser,Report=root.DKFacebookDiagnosticReport,win=root){
 const collectButton=doc?.getElementById?.("fbCollectRuntime");
 const saveButton=doc?.getElementById?.("fbExportRuntime");
 const status=doc?.getElementById?.("fbRuntimeStatus");
 if(!collectButton||!saveButton||!status||!api?.tabs?.query)return false;
 let snapshot=null;
 async function check(){
  snapshot=null;saveButton.disabled=true;collectButton.disabled=true;
  status.textContent="Inspecting local Facebook engine…";
  try{
   const tabs=candidateTabs(await api.tabs.query({}));
   if(!tabs.length)throw Error("No open Facebook tab. Keep Facebook open while inspecting.");
   snapshot=await collect(api,tabs[0],Report);
   status.textContent=diagnosisText(snapshot);
   saveButton.disabled=false;
  }catch(err){status.textContent=String(err?.message||"Unable to inspect Facebook.");}
  finally{collectButton.disabled=false;}
 }
 collectButton.addEventListener("click",()=>{void check();});
 saveButton.addEventListener("click",()=>{
  if(!snapshot)return;
  const blob=new win.Blob([JSON.stringify(snapshot,null,2)+"\n"],{type:"application/json"});
  const url=win.URL.createObjectURL(blob),link=doc.createElement("a");
  link.href=url;link.download="dk-live-block-facebook-runtime-v"+
    snapshot.extensionVersion.replace(/[^0-9.]/g,"").slice(0,24)+".json";
  link.style.display="none";doc.body.appendChild(link);
  try{link.click();}finally{link.remove();win.setTimeout(()=>win.URL.revokeObjectURL(url),1000);}
 });
 return true;
}
const API=Object.freeze({facebookURL,candidateTabs,diagnosisText,collect,init});
root.DKFacebookRuntimeDiagnostics=API;
if(typeof module!=="undefined")module.exports=API;
if(typeof document!=="undefined"&&typeof browser!=="undefined")
 init(document,browser,root.DKFacebookDiagnosticReport,root);
})(typeof globalThis!=="undefined"?globalThis:this);
