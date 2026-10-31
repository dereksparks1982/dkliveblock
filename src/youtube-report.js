/* One-click YouTube compatibility evidence. Hostname/type only, no paths,
   video IDs, account data, page source, request payloads or uploads. */
(function(root){"use strict";
const Model=root.DKSiteDashboardModel||typeof require==="function"&&require("./site-dashboard-model.js");
const Triage=root.DKYouTubeTriage||typeof require==="function"&&require("./youtube-triage.js");
const COUNTERS=["playerRequests","observed","modified","fields","unchanged","oversized","timedOut","errors","skippedBusy","skippedHeaders"];
function number(value){return Number.isSafeInteger(value)&&value>=0?Math.min(value,1e9):0;}
function cleanSource(s){return typeof s==="string"&&s.length<=80&&/^[\p{L}\p{N} (),.+_-]+$/u.test(s)?s:"Unattributed"; }
function build(s,now=Date.now()){
 if(!s?.ok||!Triage.isYouTube(s.site)||!Number.isSafeInteger(s.tabId)||s.tabId<0)
  throw Error("Select a current YouTube tab.");
 const responses={enabled:s.youtubeResponse?.enabled===true,
  supported:s.youtubeResponse?.supported===true};
 for(const k of COUNTERS)responses[k]=number(s.youtubeResponse?.[k]);
 responses.byKind={};
 for(const kind of ["player","feed","shorts"]){
  const row=s.youtubeResponse?.byKind?.[kind];
  responses.byKind[kind]={requests:number(row?.requests),seen:number(row?.seen),
   changed:number(row?.changed)};
 }
 const blocked=Model.requestRows(s).slice(0,250).map(r=>({
  hostname:r.host,resourceType:r.type,
  filterSource:cleanSource(r.ruleEvidence?.subscription)
 }));
 const permitted=Model.permittedRows(s).slice(0,200).map(r=>({
  hostname:r.host,resourceType:r.type,count:number(r.count),
  manuallyBlocked:r.block===true
 }));
 const playback=(Array.isArray(s.playbackDiagnostics)?s.playbackDiagnostics:[])
  .slice(0,30).filter(x=>["enforcement","buffering","media-error"].includes(x?.kind))
  .map(x=>({kind:x.kind,blockedMediaNearby:x.blockedMediaNearby===true}));
 return {format:"DK Live Block YouTube compatibility report",schemaVersion:1,
  exportedAt:new Date(now).toISOString(),website:s.site,tabId:s.tabId,
  protectionEnabled:s.globalEnabled===true,siteAllowlisted:s.sitePaused===true,
  temporaryPause:s.temporarilyPaused===true,requestLogEnabled:s.requestLog===true,
  filterBackend:typeof s.filterBackend==="string"?s.filterBackend.slice(0,60):"Unknown",
  blockedCount:number(s.blocked),permittedCount:number(s.allowedRequests),
  responseFiltering:responses,playback,
  networkEvidence:Triage.summarize(s),blocked,permitted,
  limitations:"Counts show local observations, not proof of ad-free playback. Does not export URLs, paths, video IDs, titles, cookies, headers, authentication, request bodies or browser history. No upload."};
}
function asText(report){
 const lines=["DK LIVE BLOCK | YOUTUBE COMPATIBILITY", "Exported: "+report.exportedAt,
  "Website: "+report.website,"Tab: "+report.tabId,"Protection: "+report.protectionEnabled,
  "Site allowlisted: "+report.siteAllowlisted,"Tab paused: "+report.temporaryPause,
  "Captured request logging: "+report.requestLogEnabled,
  "Filter backend: "+report.filterBackend,"Blocked count: "+report.blockedCount,
  "Permitted count: "+report.permittedCount,
  "Player-response filtering enabled: "+report.responseFiltering.enabled,
  "Firefox response filter available: "+report.responseFiltering.supported];
 for(const key of COUNTERS)lines.push("YouTube JSON "+key+": "+report.responseFiltering[key]);
 for(const kind of ["player","feed","shorts"]){
  const row=report.responseFiltering.byKind[kind];
  lines.push(kind+" JSON: "+row.requests+" requested, "+row.seen+
   " processed, "+row.changed+" modified");
 }
 lines.push("","PLAYBACK HEALTH");
 for(const x of report.playback)lines.push(x.kind+(x.blockedMediaNearby?" (blocked media nearby)":""));
 if(!report.playback.length)lines.push("No player health observations.");
 lines.push("","BLOCKED HOST/TYPE OBSERVATIONS");
 for(const row of report.blocked)lines.push(row.hostname+" · "+row.resourceType+" · "+row.filterSource);
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
const API=Object.freeze({build,asText,download});
root.DKYouTubeReport=API;
if(typeof module!=="undefined")module.exports=API;
})(typeof globalThis!=="undefined"?globalThis:this);
