/* DK Live Block: view-only local site activity model. Never stores raw URLs. */
(function(root){"use strict";
const RESOURCE_TYPES=new Set(["script","image","imageset","stylesheet","media","font","object",
 "xmlhttprequest","sub_frame","ping","beacon","websocket","other","popup"]);
const SCOPES=new Set(["temporary","session","remember"]);
function status(data){
 if(!data?.ok)return {label:"No website selected",detail:"Choose a normal HTTP(S) website tab."};
 if(!data.globalEnabled)return {label:"Protection disabled globally",
  detail:"Blocking is off everywhere until enabled in settings."};
 if(data.sitePaused)return {label:"Website allowlisted",
  detail:"All blocking is disabled for this hostname and its subdomains."};
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
  if(!host||!RESOURCE_TYPES.has(type))return [];
  return [{host,type,when:Number.isFinite(row.when)?row.when:0}];
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
const API=Object.freeze({status,hostname,number,requestRows,popupRows,customHosts,allowances});
root.DKSiteDashboardModel=API;
if(typeof module!=="undefined")module.exports=API;
})(typeof globalThis!=="undefined"?globalThis:this);
