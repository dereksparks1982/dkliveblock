/* DK Live Block: local, user-triggered blocked-request report builder.
   Exports only the sanitized tab-scoped evidence shown in the dashboard.
   Never stores full request URLs, headers, cookies, query strings or payloads. */
(function(root){"use strict";
const Model=root.DKSiteDashboardModel||typeof require==="function"&&require("./site-dashboard-model.js");
const Details=root.DKBlockDetails||typeof require==="function"&&require("./block-details.js");
const Triage=root.DKYouTubeTriage||typeof require==="function"&&require("./youtube-triage.js");
const NOTE="Only destination hostnames, resource types, safe filter evidence and optional explicitly requested RDAP information are exported. No raw request URLs, paths, query strings, cookies or payloads. A blocked request is not proof of malware or a cause of playback failure.";
function short(value,limit=200){
 return String(value??"").replace(/[\u0000-\u001f\u007f-\u009f]/g," ").trim().slice(0,limit);
}
function safeDate(value){
 return typeof value==="number"&&Number.isFinite(value)&&value>0&&value<8640000000000000?
  new Date(value).toISOString():"Not recorded";
}
function publicFields(input,depth=0){
 if(depth>6)return "Further nesting omitted";
 if(typeof input==="string")return short(input,500);
 if(typeof input==="number")return Number.isFinite(input)?input:null;
 if(typeof input==="boolean"||input===null)return input;
 if(Array.isArray(input))return input.slice(0,30).map(x=>publicFields(x,depth+1));
 if(!input||typeof input!=="object")return null;
 const output={};
 for(const key of Object.keys(input).slice(0,30)){
  if(!/^[a-zA-Z][a-zA-Z0-9_-]{0,60}$/.test(key))continue;
  output[key]=publicFields(input[key],depth+1);
 }
 return output;
}
function safeRegistration(value){
 if(!value?.ok)return {status:"Not fetched; registration lookups require an explicit click."};
 const raw=value,statuses=Array.isArray(raw.statuses)?raw.statuses.slice(0,8):[],
  nameservers=Array.isArray(raw.nameservers)?raw.nameservers.slice(0,8):[];
 return {status:"User-requested public registration data; not proof of request operator",
  domain:Details.valid(raw.domain)?raw.domain:"Unknown",
  registeredOrganization:short(raw.organization)||"Not publicly disclosed",
  registrar:short(raw.registrar)||"Not disclosed",
  registered:short(raw.registered,30)||"Not disclosed",
  updated:short(raw.updated,30)||"Not disclosed",
  expires:short(raw.expires,30)||"Not disclosed",
  nameservers:nameservers.filter(Details.valid),statuses:statuses.map(x=>short(x,80)).filter(Boolean),
  checkedAt:safeDate(raw.checked),publicRegistration:publicFields(raw.publicRecord),
  firefoxDNS:publicFields(raw.dns),hostingNetwork:publicFields(raw.hosting),
  hostingSampleIP:short(raw.hostingAddress,48),
  threatListing:publicFields(raw.threatListing)};
}
function rowKey(site,id,hostname){return String(id)+":"+site+":"+hostname;}
// Include the same privacy-scrubbed YouTube diagnostics in the regular blocked
// export so the owner need not collect two reports for each comparison run.
// Never interpret silence as proof that ads were removed.
function youtubePlaybackEvidence(snapshot){
 if(!Triage.isYouTube(snapshot?.site))return null;
 const YT=root.DKYouTubeReport||
  (typeof require==="function"?require("./youtube-report.js"):null);
 if(!YT?.build)return null;
 const report=YT.build(snapshot);
 const r=report.responseFiltering;
 return {
  experimentMode:report.experimentMode,
  responseFiltering:{
   enabled:r.enabled,supported:r.supported,
   playerRequests:r.playerRequests,observed:r.observed,
   modified:r.modified,fields:r.fields,unchanged:r.unchanged,
   refused:r.refused,oversized:r.oversized,timedOut:r.timedOut,
   errors:r.errors,skippedBusy:r.skippedBusy,skippedHeaders:r.skippedHeaders,
   attachAttempts:r.attachAttempts,attached:r.attached,
   errorStages:r.errorStages,pagePrunes:r.pagePrunes,byKind:r.byKind,bootstrap:r.bootstrap
  },
  note:"Coarse local observations only; no playback events is not proof of ad-free playback. "+
   "Bootstrap observations originate from untrusted page events."
 };
}
function build(snapshot,only=null,registrations=new Map(),now=Date.now()){
 if(!snapshot?.ok||!Details.valid(snapshot.site)||!Number.isSafeInteger(snapshot.tabId)||
  snapshot.tabId<0)throw Error("Select an active website tab before exporting.");
 if(snapshot.requestLog!==true)throw Error("Private request logging is disabled; there are no recorded entries to export.");
 const all=Model.requestRows(snapshot);
 const entries=only?all.filter(r=>r.host===only.host&&r.type===only.type&&
  r.sequence===only.sequence&&r.when===only.when):all;
 if(only&&entries.length!==1)throw Error("Selected request changed. Refresh the dashboard.");
 if(!entries.length)throw Error("No blocked requests have been retained for export.");
 const records=entries.map(row=>{
  const info=Details.summary(row.host,row.type,snapshot.site,row.ruleType);
  const lookup=registrations instanceof Map?
   registrations.get(rowKey(snapshot.site,snapshot.tabId,row.host)):undefined;
  const links=Details.researchLinks(row.host,row.registeredDomain);
  if(info.operatorUrl)links.unshift({label:"Service operator website",url:info.operatorUrl});
  return {
   eventNumber:row.sequence||"Not recorded",timestamp:safeDate(row.when),
   destinationHostname:row.host,registrationDomain:row.registeredDomain,
   resourceType:row.type,resourceDescription:info.resource,
   siteRelation:info.thirdParty===null?"Unknown":info.thirdParty?"Third party":"First party or subdomain",
   blockingReason:info.why,
   filterEngine:row.ruleEvidence?.source||"Not recorded",
   filterSource:row.ruleEvidence?.subscription||"Unattributed active filter",
   matchedFilter:row.ruleEvidence?.pattern||"Not recorded",
   serviceOperator:info.operator,operatorEvidence:info.operatorEvidence,
   likelyPurpose:info.purpose,importance:info.importance,scopeOfEvidence:info.access,
   // This is a present-day setting, not proof the historical block was wrong.
   currentControl:(()=>{
    const c=Model.blockedControl(snapshot,row);
    return {eligible:c.eligible,allowanceActive:c.allowed,
     manuallyBlocked:c.manualBlock,
     scope:"current website + destination hostname + resource type"};
   })(),
   registration:safeRegistration(lookup),
   researchLinks:links
  };
 });
 return {format:"DK Live Block blocked-request report",schemaVersion:1,
  exportedAt:safeDate(now),website:snapshot.site,tabId:snapshot.tabId,
  scope:only?"individual request":"all retained blocked requests",
  totalBlockedOnTab:Model.number(snapshot.blocked),retainedRecords:all.length,
  exportedRecords:records.length,filterBackend:short(snapshot.filterBackend||"Unknown",70),
  privacyNotice:NOTE,youtubeCompatibility:Triage.summarize(snapshot),
  youtubePlaybackEvidence:youtubePlaybackEvidence(snapshot),
  playbackDiagnostics:Array.isArray(snapshot.playbackDiagnostics)?snapshot.playbackDiagnostics.slice(0,30).flatMap(row=>{
   if(!["enforcement","buffering","media-error","ad-showing"].includes(row?.kind))return [];
   return [{kind:row.kind,when:safeDate(row.when),blockedMediaNearby:row.blockedMediaNearby===true}];
  }):[],requests:records};
}
function asText(report){
 const lines=["DK LIVE BLOCK | BLOCKED REQUEST DETAILS",
  "Exported: "+report.exportedAt,"Website: "+report.website,
  "Browser tab: "+report.tabId,"Scope: "+report.scope,
  "Blocked counter: "+report.totalBlockedOnTab,
  "Retained requests: "+report.retainedRecords,
  "Exported requests: "+report.exportedRecords,
  "Filtering backend: "+report.filterBackend,"",report.privacyNotice,"",
  "PLAYBACK DIAGNOSTICS (not proof of a filtering-rule cause)"];
 if(report.youtubeCompatibility?.applicable){
  const t=report.youtubeCompatibility;
  lines.push("YOUTUBE COMPATIBILITY EVIDENCE",
   "First-party blocked XHR: "+t.firstPartyXHR,
   "First-party blocked image: "+t.firstPartyImage,
   "Blocked media: "+t.mediaBlocked,
   "Advertising-network blocks: "+t.advertisingInfrastructure,
   "Matched first-party rule sources: "+t.firstPartySources.join(", "),
   t.interpretation,"");
  const y=report.youtubePlaybackEvidence;
  if(y){
   lines.push("YOUTUBE PLAYER-DATA OBSERVATIONS (not proof of ad removal)",
    "Temporary experiment mode: "+y.experimentMode,
    "Response filtering enabled: "+y.responseFiltering.enabled,
    "Player response requests: "+y.responseFiltering.playerRequests,
    "Response bodies observed: "+y.responseFiltering.observed,
    "Response bodies modified: "+y.responseFiltering.modified,
    "YouTube JSON refusals: "+y.responseFiltering.refused,
    "Response filtering errors: "+y.responseFiltering.errors,
    "Response filter attachment attempts: "+y.responseFiltering.attachAttempts,
    "Response filters attached: "+y.responseFiltering.attached);
   for(const stage of ["attach","data","stop","stream"])
    lines.push("Response error stage "+stage+": "+
     y.responseFiltering.errorStages[stage]);
   for(const kind of ["bootstrap","json-parse","fetch-json","fetch-text","xhr-json","xhr-text"])
    lines.push("Untrusted page bridge "+kind+" prune samples: "+
     y.responseFiltering.pagePrunes[kind]);
   for(const event of y.responseFiltering.bootstrap){
    lines.push("Bootstrap "+event.phase+": "+event.state+
     " / ad fields "+event.adFields+" / refusal "+event.refused+
     (typeof event.playerMetadataCleaned==="boolean"?
      " / cleaned late player metadata "+event.playerMetadataCleaned:""));
   }
   if(!y.responseFiltering.bootstrap.length)
    lines.push("No first-load bootstrap observations were recorded.");
   lines.push(y.note,"");
  }
 }
 if(!report.playbackDiagnostics?.length)lines.push("No playback-health incidents recorded; this does NOT confirm that ads were removed.");
 if(report.playbackDiagnostics?.some(x=>x.kind==="ad-showing"))
  lines.push("ad-showing: YouTube player advertised an ad state, not proof of an ad played or blocked.");
 else for(const event of report.playbackDiagnostics)
  lines.push(event.when+" · "+event.kind+(event.blockedMediaNearby?" · blocked media nearby":""));
 lines.push("");
 for(const [index,item] of report.requests.entries()){
  lines.push("========================================================",
   "REQUEST "+(index+1)+" OF "+report.requests.length+
    " | EVENT "+item.eventNumber);
  for(const [field,label] of [
   ["timestamp","Time"],["destinationHostname","Destination hostname"],
   ["registrationDomain","Registration domain"],["resourceType","Resource type"],
   ["resourceDescription","Resource description"],["siteRelation","Relationship to website"],
   ["blockingReason","Why blocked"],["filterEngine","Filter engine"],
   ["filterSource","Matched filter source"],
   ["matchedFilter","Matched filter evidence"],["serviceOperator","Service operator"],
   ["operatorEvidence","Operator evidence"],["likelyPurpose","Likely service purpose"],
   ["importance","Importance / possible impact"],["scopeOfEvidence","Evidence limitations"]])
   lines.push(label+": "+item[field]);
  const control=item.currentControl;
  lines.push("Request history note: This entry was blocked when recorded; its current setting may differ.",
   "Currently manually allowed: "+(control?.allowanceActive===true),
   "Current explicit manual block: "+(control?.manuallyBlocked===true),
   "Current toggle eligible: "+(control?.eligible===true),
   "Control scope: "+(control?.scope||"unavailable"));
  const r=item.registration;
  lines.push("Registration lookup: "+r.status);
  if(r.domain){
   lines.push("  Registered domain: "+r.domain,
    "  Registered organization: "+r.registeredOrganization,
    "  Registrar: "+r.registrar,
    "  Registration date: "+r.registered,
    "  Updated: "+r.updated,"  Expires: "+r.expires,
    "  Nameservers: "+(r.nameservers.join(", ")||"Not disclosed"),
    "  Domain statuses: "+(r.statuses.join(", ")||"Not disclosed"));
  }
  if(r.publicRegistration)lines.push("Public registration details: "+JSON.stringify(r.publicRegistration,null,2));
  if(r.firefoxDNS)lines.push("Firefox DNS evidence: "+JSON.stringify(r.firefoxDNS,null,2));
  if(r.hostingNetwork)lines.push("Sampled IP network RDAP: "+JSON.stringify(r.hostingNetwork,null,2));
  if(r.threatListing)lines.push("Threat database evidence: "+JSON.stringify(r.threatListing,null,2));
  lines.push("Relevant research links:");
  for(const link of item.researchLinks)lines.push("  "+link.label+": "+link.url);
  lines.push("");
 }
 return lines.join("\n")+"\n";
}
function filename(report,format){
 if(format!=="txt"&&format!=="json")throw Error("Unsupported export type");
 const site=short(report.website||"website",100).replace(/[^a-z0-9.-]/gi,"-");
 const stamp=short(report.exportedAt||"",30).replace(/[:.]/g,"-").replace(/[^a-z0-9T-]/gi,"");
 return "dk-live-block-"+site+"-"+(report.scope==="individual request"?"request":"all-blocked")+
  "-"+stamp+"."+format;
}
function download(report,format="txt",env={}){
 if(!report||!Array.isArray(report.requests)||!report.requests.length)
  throw Error("No blocked requests to export");
 if(format!=="txt"&&format!=="json")throw Error("Unsupported export type");
 const doc=env.document||(typeof document!=="undefined"?document:null);
 const URLApi=env.URL||(typeof URL!=="undefined"?URL:null);
 const BlobType=env.Blob||(typeof Blob!=="undefined"?Blob:null);
 const schedule=env.setTimeout||(typeof setTimeout!=="undefined"?setTimeout:null);
 if(!doc?.body||!URLApi?.createObjectURL||!BlobType||!schedule)
  throw Error("Browser download is unavailable");
 const name=filename(report,format),
  data=format==="json"?JSON.stringify(report,null,2)+"\n":asText(report),
  blob=new BlobType([data],{type:format==="json"?"application/json;charset=utf-8":"text/plain;charset=utf-8"});
 const href=URLApi.createObjectURL(blob);
 let anchor;
 try{
  anchor=doc.createElement("a");anchor.href=href;anchor.download=name;anchor.hidden=true;
  doc.body.appendChild(anchor);anchor.click();
 }finally{
  anchor?.remove();
  schedule(()=>URLApi.revokeObjectURL(href),60000);
 }
 return {filename:name,bytes:blob.size||data.length,records:report.requests.length};
}
const API=Object.freeze({build,asText,filename,download,rowKey});
root.DKBlockedExport=API;
if(typeof module!=="undefined")module.exports=API;
})(typeof globalThis!=="undefined"?globalThis:this);
