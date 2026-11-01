/* DK Live Block: view-only local site activity model. Never stores raw URLs. */
(function(root){"use strict";
const RESOURCE_TYPES=new Set(["main_frame","script","image","imageset","stylesheet","media","font","object",
 "xmlhttprequest","sub_frame","ping","beacon","websocket","other","popup"]);
const SCOPES=new Set(["temporary","session","remember"]);
function status(data){
 if(!data?.ok)return {label:"No website selected",detail:"Choose a normal HTTP(S) website tab."};
 if(!data.globalEnabled)return {label:"Protection disabled globally",
  detail:"Blocking is off everywhere until enabled in settings."};
 if(data.sitePaused)return {label:"Website allowlisted",
  detail:"Automatic filters are off for this website; explicitly selected request blocks can remain active."};
 if(data.temporarilyPaused)return {label:"Tab temporarily paused",
  detail:"This tab is paused; other tabs remain protected."};
 if(!data.siteActive)return {label:"Protection unavailable",
  detail:"Firefox has not enabled protection for this page."};
 return {label:"Blocking active",
  detail:"Ad and tracker filters are active for this website."};
}
function hostname(value){
 return typeof value==="string"&&value.length<=253&&
  /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)*$/.test(value)?value:"";
}
function number(value){return Number.isFinite(value)&&value>=0?Math.min(9999999,Math.floor(value)):0;}
function requestRows(data){
 if(!data?.requestLog)return [];
 return (Array.isArray(data.recentBlocks)?data.recentBlocks:[]).slice(0,250).flatMap(row=>{
  const host=hostname(row?.host),type=String(row?.type||"");
  if(!host||!/^[a-z_]{2,30}$/.test(type))return [];
  return [{host,type,when:Number.isFinite(row.when)?row.when:0,
   sequence:Number.isSafeInteger(row.sequence)&&row.sequence>=0?row.sequence:0,
   registeredDomain:hostname(row.registeredDomain)||host,
   ...(row.ruleEvidence&&typeof row.ruleEvidence==="object"?
    {ruleEvidence:{source:["Embedded Ghostery network filter","Native network filter (original list not determined)","Unknown filtering rule"].includes(row.ruleEvidence.source)?row.ruleEvidence.source:"Unknown filtering rule",
      subscription:typeof row.ruleEvidence.subscription==="string"&&
       /^[\p{L}\p{N} (),.+_-]{1,80}$/u.test(row.ruleEvidence.subscription)?
        row.ruleEvidence.subscription:"Unattributed active filter",
      pattern:typeof row.ruleEvidence.pattern==="string"&&
       (/^\|\|[a-z0-9.-]+\^$/.test(row.ruleEvidence.pattern)||
        ["Rule text not exposed by embedded matcher","No matched pattern was recorded","Matching pattern withheld: may contain a URL path or private parameter"].includes(row.ruleEvidence.pattern))?
       row.ruleEvidence.pattern:"Pattern withheld"}}:{}),
   ruleType:["popup","filter","engine","threat"].includes(row.ruleType)?row.ruleType:"engine"}];
 });
}
function popupRows(data){
 if(!data?.requestLog)return [];
 return (Array.isArray(data.popupHistory)?data.popupHistory:[]).slice(0,8).map(row=>({
  host:hostname(row?.destinationHost)||"Destination unknown",
  reason:row?.reason==="strict"?"Strict tab protection":"Popup filter",
  when:Number.isFinite(row?.when)?row.when:0
 }));
}
function customHosts(data){
 return (Array.isArray(data?.customAllowances)?data.customAllowances:[]).slice(0,150)
  .map(hostname).filter(Boolean);
}
function allowances(data){
 return (Array.isArray(data?.requestAllowances)?data.requestAllowances:[]).slice(0,150).flatMap(row=>{
  const host=hostname(row?.host);
  if(!host||!RESOURCE_TYPES.has(row.type)||!SCOPES.has(row.scope))return [];
  return [{host,type:row.type,scope:row.scope,
   expires:Number.isFinite(row.expires)?row.expires:0}];
 });
}
// Never project arbitrary data from a browser message into an export.
const ALLOW_REASONS=new Set([
 "global-disabled","site-allowlisted","tab-paused","protection-not-ready",
 "media-recovery","streaming-repair","authentication-preserved",
 "youtube-player-preserved","manual-exception","filter-engine-permitted","filter-exception",
 "decision-not-recorded"
]);
const ALLOW_METHOD=/^(GET|HEAD|POST|PUT|PATCH|DELETE|OPTIONS|CONNECT|TRACE|Unknown)$/;
function safeCounts(value,max=20){
 if(!value||typeof value!=="object"||Array.isArray(value))return {};
 return Object.fromEntries(Object.entries(value).slice(0,max).filter(([k,v])=>
  typeof k==="string"&&k.length<=50&&/^[a-zA-Z0-9-]+$/.test(k)&&
  Number.isSafeInteger(v)&&v>=0&&v<=9999999));
}
function permittedEvents(data){
 if(!data?.requestLog||!Array.isArray(data.allowedEvents))return [];
 return data.allowedEvents.slice(0,400).flatMap(row=>{
  const host=hostname(row?.host),type=String(row?.type||"");
  if(!host||!RESOURCE_TYPES.has(type)||type==="popup"||type==="main_frame")return [];
  return [{host,type,
   when:Number.isSafeInteger(row.when)&&row.when>=0?row.when:0,
   sequence:Number.isSafeInteger(row.sequence)&&row.sequence>=0?row.sequence:0,
   method:ALLOW_METHOD.test(row.method)?row.method:"Unknown",
   httpStatus:Number.isInteger(row.httpStatus)&&row.httpStatus>=100&&row.httpStatus<=599?
    row.httpStatus:null,
   reason:ALLOW_REASONS.has(row.reason)?row.reason:"decision-not-recorded"}];
 });
}
function permittedRows(data){
 const seen=new Map();
 for(const row of (data?.requestLog&&Array.isArray(data.allowedGroups)?data.allowedGroups:[]).slice(0,150)){
  const host=hostname(row?.host),type=String(row?.type||"");
  if(!host||!RESOURCE_TYPES.has(type)||type==="popup")continue;
  seen.set(host+"|"+type,{host,type,count:number(row.count),
   first:Number.isSafeInteger(row.first)&&row.first>=0?row.first:0,
   last:Number.isSafeInteger(row.last)&&row.last>=0?row.last:0,
   reasons:Object.fromEntries(Object.entries(safeCounts(row.reasons)).filter(([key])=>ALLOW_REASONS.has(key))),
   methods:Object.fromEntries(Object.entries(safeCounts(row.methods)).filter(([key])=>ALLOW_METHOD.test(key))),
   httpStatuses:Object.fromEntries(Object.entries(safeCounts(row.httpStatuses)).filter(([key])=>
    key==="Unknown"||/^[1-5][0-9]{2}$/.test(key))),
   observed:true,block:false});
 }
 for(const row of (Array.isArray(data.selectiveBlocks)?data.selectiveBlocks:[]).slice(0,300)){
  const host=hostname(row?.host),type=String(row?.type||"");
  if(!host||!RESOURCE_TYPES.has(type)||type==="popup")continue;
  const key=host+"|"+type;
  const value=seen.get(key)||{host,type,count:0,last:0,observed:false,block:false};
  value.block=true;seen.set(key,value);
 }
 return [...seen.values()];
}
// A blocked history entry is NOT a URL-specific filter. Controls apply to
// future requests on exactly this site + destination hostname + resource type.
function blockedControl(data,row){
 const host=hostname(row?.host),type=row?.type,site=hostname(data?.site);
 if(!site||!host||!RESOURCE_TYPES.has(type)||type==="popup"||
    type==="main_frame"||row?.ruleType==="popup")
  return {eligible:false,allowed:false,manualBlock:false};
 const allowed=allowances(data).some(x=>x.host===host&&x.type===type);
 const manualBlock=(Array.isArray(data?.selectiveBlocks)?data.selectiveBlocks:[])
  .some(x=>x?.host===host&&x?.type===type);
 return {eligible:!manualBlock,allowed,manualBlock};
}
const API=Object.freeze({status,hostname,number,requestRows,popupRows,customHosts,allowances,permittedRows,permittedEvents,blockedControl});
root.DKSiteDashboardModel=API;
if(typeof module!=="undefined")module.exports=API;
})(typeof globalThis!=="undefined"?globalThis:this);
