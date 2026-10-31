/* Explicit, privacy-bounded report across CURRENT browser tabs.
   No new capture, no permanent log, never exports tab titles or page URLs. */
(function(root){"use strict";
const Blocked=root.DKBlockedExport||typeof require==="function"&&require("./blocked-export.js");
const Allowed=root.DKAllowedExport||typeof require==="function"&&require("./allowed-export.js");
const Model=root.DKSiteDashboardModel||typeof require==="function"&&require("./site-dashboard-model.js");
const MAX_TABS=25;
function build(snapshots,now=Date.now()){
 if(!Array.isArray(snapshots))throw Error("No open website tabs available.");
 const unique=new Set(),sites=[];
 for(const data of snapshots.slice(0,MAX_TABS)){
  if(!data?.ok||!Model.hostname(data.site)||!Number.isSafeInteger(data.tabId)||data.tabId<0||
     unique.has(data.tabId))continue;
  unique.add(data.tabId);
  let blocked=null,permitted=null;
  if(data.requestLog===true&&Model.requestRows(data).length)
   blocked=Blocked.build(data,null,new Map(),now);
  if(Model.permittedRows(data).length)
   permitted=Allowed.build(data,null,now);
  sites.push({website:data.site,tabId:data.tabId,
   protectionEnabled:data.globalEnabled===true,
   websiteAllowlisted:data.sitePaused===true,tabPaused:data.temporarilyPaused===true,
   blockedCount:Model.number(data.blocked),permittedCount:Model.number(data.allowedRequests),
   blocked,permitted});
 }
 if(!sites.length)throw Error("No current HTTP(S) website tabs available to report.");
 return {format:"DK Live Block open-website session report",schemaVersion:1,
  exportedAt:new Date(now).toISOString(),includedTabs:sites.length,maximumTabs:MAX_TABS,
  privacyNotice:"User-triggered export of currently open websites only. Does not include page URLs, titles, cookies, request paths, queries, headers, logins, or payloads. Not a complete browsing-history report. Data reflects captured events and may omit traffic that was not logged.",
  websites:sites};
}
function asText(report){
 const lines=["DK LIVE BLOCK | CURRENT OPEN WEBSITE REPORT",
  "Exported: "+report.exportedAt,
  "Website tabs included: "+report.includedTabs,
  "",report.privacyNotice,""];
 for(const [i,site] of report.websites.entries()){
  lines.push("===========================================================",
   "WEBSITE "+(i+1)+" / "+report.websites.length+": "+site.website,
   "Tab number: "+site.tabId,"Blocking enabled: "+site.protectionEnabled,
   "Website allowlisted: "+site.websiteAllowlisted,"Tab paused: "+site.tabPaused,
   "Blocked count: "+site.blockedCount,"Permitted count: "+site.permittedCount,"");
  if(site.blocked)lines.push(Blocked.asText(site.blocked));
  if(site.permitted)lines.push(Allowed.asText(site.permitted));
  if(!site.blocked&&!site.permitted)lines.push("No retained request details for this website.");
  lines.push("");
 }
 return lines.join("\n")+"\n";
}
function download(report,format="json",env={}){
 if(!report?.websites?.length)throw Error("Nothing to export.");
 if(format!=="txt"&&format!=="json")throw Error("Unsupported export format.");
 const doc=env.document||(typeof document!=="undefined"?document:null);
 const BlobType=env.Blob||(typeof Blob!=="undefined"?Blob:null);
 const UrlType=env.URL||(typeof URL!=="undefined"?URL:null);
 const timer=env.setTimeout||(typeof setTimeout!=="undefined"?setTimeout:null);
 if(!doc?.body||!BlobType||!UrlType?.createObjectURL||!timer)
  throw Error("Local browser download is unavailable.");
 const body=format==="json"?JSON.stringify(report,null,2)+"\n":asText(report);
 const name="dk-live-block-open-websites-"+report.exportedAt.replace(/[^a-z0-9T-]/gi,"-").slice(0,35)+"."+format;
 const blob=new BlobType([body],{type:format==="json"?"application/json;charset=utf-8":"text/plain;charset=utf-8"});
 const url=UrlType.createObjectURL(blob);let a;
 try{
  a=doc.createElement("a");a.href=url;a.download=name;a.hidden=true;
  doc.body.appendChild(a);a.click();
 }finally{
  a?.remove();timer(()=>UrlType.revokeObjectURL(url),60000);
 }
 return {filename:name,sites:report.websites.length};
}
const API=Object.freeze({build,asText,download,MAX_TABS});
root.DKSessionExport=API;
if(typeof module!=="undefined")module.exports=API;
})(typeof globalThis!=="undefined"?globalThis:this);
