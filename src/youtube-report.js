/* One-click YouTube compatibility evidence. Hostname/type only, no paths,
   video IDs, account data, page source, request payloads or uploads. */
(function(root){"use strict";
const Model=root.DKSiteDashboardModel||typeof require==="function"&&require("./site-dashboard-model.js");
const Triage=root.DKYouTubeTriage||typeof require==="function"&&require("./youtube-triage.js");
const Outcome=root.DKYouTubeOutcome||typeof require==="function"&&require("./youtube-outcome.js");
const Advice=root.DKYouTubeCompatibilityAdvice||typeof require==="function"&&require("./youtube-compatibility-advice.js");
const COUNTERS=["playerRequests","observed","modified","fields","unchanged","refused","oversized","timedOut","errors","skippedBusy","skippedHeaders","attachAttempts","attached"];
function number(value){return Number.isSafeInteger(value)&&value>=0?Math.min(value,1e9):0;}
function cleanSource(s){return typeof s==="string"&&s.length<=80&&/^[\p{L}\p{N} (),.+_-]+$/u.test(s)?s:"Unattributed"; }
// The Dashboard separately validates the live hostname. Here we check
// exact tab identity and navigation equality, only in temporary memory.
// A private watch URL must never enter the exported compatibility report.
function unchangedTab(before,after,tabId){
 return Number.isInteger(tabId)&&tabId>=0&&before?.id===tabId&&after?.id===tabId&&
  typeof before.url==="string"&&before.url.length>0&&before.url.length<=4096&&
  before.url===after.url;
}
function build(s,now=Date.now()){
 if(!s?.ok||!Triage.isYouTube(s.site)||!Number.isSafeInteger(s.tabId)||s.tabId<0)
  throw Error("Select a current YouTube tab.");
 const responses={enabled:s.youtubeResponse?.enabled===true,
  supported:s.youtubeResponse?.supported===true};
 for(const k of COUNTERS)responses[k]=number(s.youtubeResponse?.[k]);
 responses.pagePrunes={};
 for(const kind of ["bootstrap","json-parse","fetch-json","fetch-text","xhr-json","xhr-text"])
  responses.pagePrunes[kind]=number(s.youtubeResponse?.pagePrunes?.[kind]);
 responses.errorStages={};
 for(const stage of ["attach","data","stop","stream"])
  responses.errorStages[stage]=number(s.youtubeResponse?.errorStages?.[stage]);
 responses.byKind={};
 for(const kind of ["player","prefetch","feed","next","playlist","shorts"]){
  const row=s.youtubeResponse?.byKind?.[kind];
  responses.byKind[kind]={requests:number(row?.requests),seen:number(row?.seen),
   changed:number(row?.changed),refused:number(row?.refused)};
 }
 // Only the canonical coarse bootstrap fields may enter a user export.
 // Page-world observations can be spoofed and never prove actual YouTube state.
 const phases=new Set(["pre-enable","post-enable","late-1s","late-3s"]);
 const states=new Set(["absent","data","accessor","other"]);
 responses.bootstrap=(Array.isArray(s.youtubeResponse?.bootstrap)?s.youtubeResponse.bootstrap:[])
  .slice(0,4).filter(x=>x&&phases.has(x.phase)&&states.has(x.state)&&
   Number.isInteger(x.adFields)&&x.adFields>=0&&x.adFields<=3)
  .map(x=>({phase:x.phase,state:x.state,adFields:x.adFields,
   refused:x.refused===true,initialData:x.initialData===true,
   ...(typeof x.playerMetadataCleaned==="boolean"?
    {playerMetadataCleaned:x.playerMetadataCleaned}:{})}));
 const blocked=Model.requestRows(s).slice(0,250).map(r=>{
  const c=Model.blockedControl(s,r);
  return {hostname:r.host,resourceType:r.type,
   filterSource:cleanSource(r.ruleEvidence?.subscription),
   currentlyAllowed:c.allowed,manualBlock:c.manualBlock};
 });
 const permitted=Model.permittedRows(s).slice(0,200).map(r=>({
  hostname:r.host,resourceType:r.type,count:number(r.count),
  manuallyBlocked:r.block===true
 }));
 const playback=(Array.isArray(s.playbackDiagnostics)?s.playbackDiagnostics:[])
  .slice(0,30).filter(x=>["enforcement","buffering","media-error","ad-skip","ad-showing"].includes(x?.kind))
  .map(x=>({kind:x.kind,blockedMediaNearby:x.blockedMediaNearby===true}));
 const playbackAssessment=Outcome.summarize(s),networkEvidence=Triage.summarize(s);
 return {format:"DK Live Block YouTube compatibility report",schemaVersion:1,
  experimentMode:["combined","response-only","bridge-only","observe","player-pass-through"].includes(s.youtubeTestMode)?
   s.youtubeTestMode:"combined",
  exportedAt:new Date(now).toISOString(),website:s.site,tabId:s.tabId,
  protectionEnabled:s.globalEnabled===true,siteAllowlisted:s.sitePaused===true,
  temporaryPause:s.temporarilyPaused===true,requestLogEnabled:s.requestLog===true,
  filterBackend:["native","hybrid"].includes(s.filterBackend)?s.filterBackend:"Unknown",
  blockedCount:number(s.blocked),permittedCount:number(s.allowedRequests),
  responseFiltering:responses,playback,playbackAssessment,networkEvidence,
  compatibilityAdvice:Advice.assess({playbackAssessment,networkEvidence,responseFiltering:responses}),
  blocked,permitted,
  limitations:"Counts show local observations, not proof of ad-free playback. An ad-skip event records a button click, not confirmed ad removal. An ad-showing event is a player-state indicator, not independently confirmed ad playback. Does not export URLs, paths, video IDs, titles, cookies, headers, authentication, request bodies or browser history. No upload."};
}
function asText(report){
 const lines=["DK LIVE BLOCK | YOUTUBE COMPATIBILITY", "Exported: "+report.exportedAt,
  "Website: "+report.website,"Tab: "+report.tabId,"Protection: "+report.protectionEnabled,
  "Site allowlisted: "+report.siteAllowlisted,"Tab paused: "+report.temporaryPause,
  "Captured request logging: "+report.requestLogEnabled,
  "Filter backend: "+report.filterBackend,
  "Temporary experiment mode: "+report.experimentMode,
  "Blocked count: "+report.blockedCount,
  "Permitted count: "+report.permittedCount,
  "Player-response filtering enabled: "+report.responseFiltering.enabled,
  "Firefox response filter available: "+report.responseFiltering.supported];
 for(const key of COUNTERS)lines.push("YouTube JSON "+key+": "+report.responseFiltering[key]);
 for(const stage of ["attach","data","stop","stream"])
  lines.push("YouTube response error stage "+stage+": "+
   report.responseFiltering.errorStages[stage]);
 lines.push("Page bridge prune observations (untrusted page-world events, max 16):");
 for(const kind of ["bootstrap","json-parse","fetch-json","fetch-text","xhr-json","xhr-text"])
  lines.push("Page bridge "+kind+" prune samples: "+report.responseFiltering.pagePrunes[kind]);
 for(const kind of ["player","prefetch","feed","next","playlist","shorts"]){
  const row=report.responseFiltering.byKind[kind];
  lines.push(kind+" JSON: "+row.requests+" requested, "+row.seen+
   " processed, "+row.changed+" modified, "+row.refused+" refused/error");
 }
 lines.push("","YOUTUBE BOOTSTRAP (UNTRUSTED PAGE-WORLD OBSERVATIONS)");
 for(const x of report.responseFiltering.bootstrap||[])
  lines.push(x.phase+": "+x.state+" / ad structures "+x.adFields+
   " / refused "+x.refused+" / initial feed data "+x.initialData);
 if(!report.responseFiltering.bootstrap?.length)lines.push("No bootstrap observations recorded.");
 lines.push("","COMPATIBILITY TRIAGE (CORRELATION, NOT CAUSATION)");
 for(const code of report.compatibilityAdvice?.signals||[])lines.push("Signal: "+code);
 lines.push("Root cause independently established: no");
 lines.push("","PLAYBACK HEALTH","Evidence classification: "+report.playbackAssessment.category,
  "Confirmed ad-free playback: no (not established by local diagnostics)");
 for(const x of report.playback)lines.push(x.kind+(x.blockedMediaNearby?" (blocked media nearby)":""));
 if(!report.playback.length)lines.push("No player health observations.");
 else if(report.playback.some(x=>x.kind==="ad-showing"))
  lines.push("ad-showing means YouTube marked its player as in an ad state; it does not prove the ad played or was blocked.");
 lines.push("","BLOCKED HOST/TYPE OBSERVATIONS");
 for(const row of report.blocked)lines.push(row.hostname+" · "+row.resourceType+
  " · "+row.filterSource+" · currently allowed "+row.currentlyAllowed+
  " · manual block "+row.manualBlock);
 lines.push("","PERMITTED HOST/TYPE OBSERVATIONS");
 for(const row of report.permitted)lines.push(row.hostname+" · "+row.resourceType+" · "+row.count+" · manual block "+row.manuallyBlocked);
 lines.push("",report.limitations);
 return lines.join("\n")+"\n";
}
function download(report,kind,env={}){
 if(!report?.format||!["txt","json"].includes(kind))throw Error("Invalid report format");
 const doc=env.document||(typeof document!=="undefined"?document:null);
 const Url=env.URL||(typeof URL!=="undefined"?URL:null);
 const BlobCtor=env.Blob||(typeof Blob!=="undefined"?Blob:null);
 const timer=env.setTimeout||(typeof setTimeout!=="undefined"?setTimeout:null);
 if(!doc?.body||!Url?.createObjectURL||!BlobCtor||!timer)throw Error("Local download unavailable");
 const payload=kind==="json"?JSON.stringify(report,null,2)+"\n":asText(report);
 const blob=new BlobCtor([payload],{type:kind==="json"?"application/json;charset=utf-8":"text/plain;charset=utf-8"});
 const name="dk-live-block-youtube-compat-"+report.exportedAt.replace(/[^a-z0-9T-]/gi,"-").slice(0,35)+"."+kind;
 const url=Url.createObjectURL(blob);let a;
 try{a=doc.createElement("a");a.href=url;a.download=name;a.hidden=true;doc.body.appendChild(a);a.click();}
 finally{a?.remove();timer(()=>Url.revokeObjectURL(url),60000);}
 return {filename:name,bytes:blob.size||payload.length};
}
const API=Object.freeze({build,asText,download,unchangedTab});
root.DKYouTubeReport=API;
if(typeof module!=="undefined")module.exports=API;
})(typeof globalThis!=="undefined"?globalThis:this);
