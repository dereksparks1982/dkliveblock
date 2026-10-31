/* Local Firefox export for permitted requests. No raw URL, page path, cookie,
   query string, request payload, or third-party upload. */
(function(root){"use strict";
const Model=root.DKSiteDashboardModel||typeof require==="function"&&require("./site-dashboard-model.js");
const Details=root.DKBlockDetails||typeof require==="function"&&require("./block-details.js");
const NOTICE="Recorded completed subresource requests and saved manual choices, not a security verdict or a list of advertisements. Hostname/type grouping is bounded. A count may exceed retained groups. No request URLs, paths, parameters, cookies, headers, or payloads are included.";
function iso(value){
 return typeof value==="number"&&Number.isFinite(value)&&value>0&&value<8640000000000000?
  new Date(value).toISOString():"Not recorded";
}
function scope(state){
 if(!state.globalEnabled)return "Global protection disabled";
 if(state.temporarilyPaused)return "Tab paused";
 if(state.sitePaused)return "Site allowlisted: automatic filters disabled";
 return state.siteActive?"Normal protection active":"Protection unavailable";
}
function build(snapshot,only=null,now=Date.now()){
 if(!snapshot?.ok||!Model.hostname(snapshot.site)||!Number.isSafeInteger(snapshot.tabId)||snapshot.tabId<0)
  throw Error("Choose a current website tab before exporting.");
 const rows=Model.permittedRows(snapshot);
 const included=only?rows.filter(row=>row.host===only.host&&row.type===only.type):rows;
 if(only&&included.length!==1)throw Error("Selected permitted destination has changed. Refresh the dashboard.");
 if(!included.length)throw Error("No permitted requests or saved selective controls to export.");
 const requests=included.map(row=>{
  const info=Details.summary(row.host,row.type,snapshot.site,"");
  const links=Details.researchLinks(row.host);
  if(info.operatorUrl)links.unshift({label:"Service operator website",url:info.operatorUrl});
  return {destinationHostname:row.host,resourceType:row.type,
   resourceDescription:info.resource,completedRequests:row.count,
   lastCompletedAt:iso(row.last),observedInCurrentTab:row.observed,
   selectiveBlocking:row.block?"Block future matching hostname and type":"No selective block",
   siteRelation:info.thirdParty===null?"Unknown":info.thirdParty?"Third party":"First party or subdomain",
   serviceOperator:info.operator,operatorEvidence:info.operatorEvidence,
   typicalPurpose:info.purpose,importance:info.importance,
   scopeOfEvidence:info.access,
   researchLinks:links};
 });
 const total=Model.number(snapshot.allowedRequests);
 return {format:"DK Live Block permitted-request report",schemaVersion:1,exportedAt:iso(now),
  website:snapshot.site,tabId:snapshot.tabId,
  scope:only?"one permitted destination/type":"all retained permitted destination/type groups",
  status:scope(snapshot),requestLogEnabled:snapshot.requestLog===true,
  totalCompletedRequestsOnTab:total,exportedGroups:requests.length,
  observedGroups:rows.filter(row=>row.observed).length,
  savedManualBlockingChoices:rows.filter(row=>row.block).length,
  privacyNotice:NOTICE,requests};
}
function asText(report){
 const lines=["DK LIVE BLOCK | PERMITTED REQUEST DETAILS",
  "Exported: "+report.exportedAt,"Website: "+report.website,
  "Browser tab: "+report.tabId,"Scope: "+report.scope,
  "Protection: "+report.status,"Private request logging enabled: "+report.requestLogEnabled,
  "Completed permitted requests on selected tab: "+report.totalCompletedRequestsOnTab,
  "Observed destination/type groups: "+report.observedGroups,
  "Saved selective blocks: "+report.savedManualBlockingChoices,
  "Exported groups: "+report.exportedGroups,"",report.privacyNotice,""];
 for(const [i,row] of report.requests.entries()){
  lines.push("======================================================",
   "PERMITTED DESTINATION "+(i+1)+" OF "+report.requests.length);
  for(const [field,label] of [
   ["destinationHostname","Hostname"],["resourceType","Resource type"],
   ["resourceDescription","Resource description"],["completedRequests","Completed requests"],
   ["lastCompletedAt","Last completed"],["observedInCurrentTab","Observed in this tab"],
   ["selectiveBlocking","Selective rule"],["siteRelation","Site relationship"],
   ["serviceOperator","Service operator"],["operatorEvidence","Operator evidence"],
   ["typicalPurpose","Typical service purpose (inferred)"],
   ["importance","Essential or optional?"],["scopeOfEvidence","Evidence limitations"]
  ])lines.push(label+": "+row[field]);
  lines.push("Research links:");
  for(const link of row.researchLinks)lines.push("  "+link.label+": "+link.url);
  lines.push("");
 }
 return lines.join("\n")+"\n";
}
function filename(report,kind){
 if(kind!=="txt"&&kind!=="json")throw Error("Unsupported report format");
 return "dk-live-block-"+report.website.replace(/[^a-z0-9.-]/gi,"-")+
  (report.scope==="one permitted destination/type"?"-permitted-request-":"-all-permitted-")+
  report.exportedAt.replace(/[^a-z0-9T-]/gi,"-").slice(0,35)+"."+kind;
}
function download(report,kind="txt",env={}){
 if(!report||!Array.isArray(report.requests)||!report.requests.length)
  throw Error("There is no permitted request report to export.");
 const name=filename(report,kind),body=kind==="json"?JSON.stringify(report,null,2)+"\n":asText(report);
 const doc=env.document||(typeof document!=="undefined"?document:null);
 const BlobType=env.Blob||(typeof Blob!=="undefined"?Blob:null);
 const UrlType=env.URL||(typeof URL!=="undefined"?URL:null);
 const timer=env.setTimeout||(typeof setTimeout!=="undefined"?setTimeout:null);
 if(!doc?.body||!BlobType||!UrlType?.createObjectURL||!timer)
  throw Error("Local browser download is unavailable.");
 const blob=new BlobType([body],{type:kind==="json"?"application/json;charset=utf-8":"text/plain;charset=utf-8"});
 const href=UrlType.createObjectURL(blob);let anchor;
 try{
  anchor=doc.createElement("a");anchor.href=href;anchor.download=name;anchor.hidden=true;
  doc.body.appendChild(anchor);anchor.click();
 }finally{
  anchor?.remove();
  timer(()=>UrlType.revokeObjectURL(href),60000);
 }
 return {filename:name,records:report.requests.length,bytes:blob.size||body.length};
}
const API=Object.freeze({build,asText,filename,download});
root.DKAllowedExport=API;
if(typeof module!=="undefined")module.exports=API;
})(typeof globalThis!=="undefined"?globalThis:this);
