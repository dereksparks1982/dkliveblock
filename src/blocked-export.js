/* DK Live Block: local, user-triggered blocked-request report builder.
   Exports only the sanitized tab-scoped evidence shown in the dashboard.
   Never stores full request URLs, headers, cookies, query strings or payloads. */
(function(root){"use strict";
const Model=root.DKSiteDashboardModel||typeof require==="function"&&require("./site-dashboard-model.js");
const Details=root.DKBlockDetails||typeof require==="function"&&require("./block-details.js");
const NOTE="Only destination hostnames, resource types, safe filter evidence and optional explicitly requested RDAP information are exported. No raw request URLs, paths, query strings, cookies or payloads. A blocked request is not proof of malware or a cause of playback failure.";
function short(value,limit=200){
 return String(value??"").replace(/[\u0000-\u001f\u007f-\u009f]/g," ").trim().slice(0,limit);
}
function safeDate(value){
 return typeof value==="number"&&Number.isFinite(value)&&value>0&&value<8640000000000000?
  new Date(value).toISOString():"Not recorded";
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
  nameservers:nameservers.filter(Details.valid),statuses:statuses.map(x=>short(x,80)).filter(Boolean)};
}
function rowKey(site,id,hostname){return String(id)+":"+site+":"+hostname;}
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
   matchedFilter:row.ruleEvidence?.pattern||"Not recorded",
   serviceOperator:info.operator,operatorEvidence:info.operatorEvidence,
   likelyPurpose:info.purpose,importance:info.importance,scopeOfEvidence:info.access,
   registration:safeRegistration(lookup),
   researchLinks:links
  };
 });
 return {format:"DK Live Block blocked-request report",schemaVersion:1,
  exportedAt:safeDate(now),website:snapshot.site,tabId:snapshot.tabId,
  scope:only?"individual request":"all retained blocked requests",
  totalBlockedOnTab:Model.number(snapshot.blocked),retainedRecords:all.length,
  exportedRecords:records.length,filterBackend:short(snapshot.filterBackend||"Unknown",70),
  privacyNotice:NOTE,requests:records};
}
function asText(report){
 const lines=["DK LIVE BLOCK | BLOCKED REQUEST DETAILS",
  "Exported: "+report.exportedAt,"Website: "+report.website,
  "Browser tab: "+report.tabId,"Scope: "+report.scope,
  "Blocked counter: "+report.totalBlockedOnTab,
  "Retained requests: "+report.retainedRecords,
  "Exported requests: "+report.exportedRecords,
  "Filtering backend: "+report.filterBackend,"",report.privacyNotice,""];
 for(const [index,item] of report.requests.entries()){
  lines.push("========================================================",
   "REQUEST "+(index+1)+" OF "+report.requests.length+
    " | EVENT "+item.eventNumber);
  for(const [field,label] of [
   ["timestamp","Time"],["destinationHostname","Destination hostname"],
   ["registrationDomain","Registration domain"],["resourceType","Resource type"],
   ["resourceDescription","Resource description"],["siteRelation","Relationship to website"],
   ["blockingReason","Why blocked"],["filterEngine","Filter engine"],
   ["matchedFilter","Matched filter evidence"],["serviceOperator","Service operator"],
   ["operatorEvidence","Operator evidence"],["likelyPurpose","Likely service purpose"],
   ["importance","Importance / possible impact"],["scopeOfEvidence","Evidence limitations"]])
   lines.push(label+": "+item[field]);
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
