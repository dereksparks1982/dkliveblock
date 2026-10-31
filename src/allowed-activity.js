/* DK Live Block: passive local tally of permitted completed requests.
   Only exact destination host, resource type, coarse time and count. No URLs,
   cookies, request headers, paths, or telemetry. No automatic network polling. */
(function(root){"use strict";
const TYPES=new Set(["script","image","imageset","stylesheet","media","font","object",
 "xmlhttprequest","sub_frame","ping","beacon","websocket","other"]);
const MAX_GROUPS=150,MAX_BLOCKS=300,MAX_COUNT=9999999;
function hostname(value){
 if(typeof value!=="string"||value.length>253||value!==value.toLowerCase())return "";
 const parts=value.split(".");
 return parts.length>=2&&parts.every(p=>/^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/.test(p))?value:"";
}
function destination(url){
 try{const u=new URL(url);return ["http:","https:"].includes(u.protocol)?hostname(u.hostname.toLowerCase()):"";}
 catch(_){return "";}
}
function valid(site,host,type){return !!(hostname(site)&&hostname(host)&&TYPES.has(type));}
function observe(table,tabId,site,url,type,now=Date.now()){
 const dest=destination(url);
 if(!Number.isInteger(tabId)||tabId<0||!valid(site,dest,type)||!Number.isFinite(now))return false;
 let activity=table.get(tabId);
 if(!activity||activity.site!==site){activity={site,total:0,groups:new Map()};table.set(tabId,activity);}
 activity.total=Math.min(MAX_COUNT,activity.total+1);
 const key=dest+"|"+type;
 let row=activity.groups.get(key);
 if(!row){row={host:dest,type,count:0,last:now};activity.groups.set(key,row);}
 row.count=Math.min(MAX_COUNT,row.count+1);row.last=now;
 // Refresh insertion order and discard oldest host/type groups when capped.
 activity.groups.delete(key);activity.groups.set(key,row);
 if(activity.groups.size>MAX_GROUPS)activity.groups.delete(activity.groups.keys().next().value);
 return true;
}
function snapshot(table,tabId,site){
 const value=table.get(tabId);
 if(!value||value.site!==site)return {total:0,groups:[]};
 return {total:value.total,groups:[...value.groups.values()].reverse().map(row=>({...row}))};
}
function clear(table,tabId){table.delete(tabId);}
function key(site,host,type){return site+"|"+host+"|"+type;}
function restore(rows){
 if(!Array.isArray(rows))return [];
 const found=new Map();
 for(const row of rows.slice(0,MAX_BLOCKS*3)){
  if(!row||!valid(row.site,row.host,row.type))continue;
  const rule={site:row.site,host:row.host,type:row.type};
  found.set(key(rule.site,rule.host,rule.type),rule);
  if(found.size>=MAX_BLOCKS)break;
 }
 return [...found.values()];
}
function matches(blocks,site,host,type){
 return valid(site,host,type)&&blocks.some(r=>r.site===site&&r.host===host&&r.type===type);
}
function list(blocks,site){return blocks.filter(row=>row.site===site).map(row=>({...row}));}
function toggle(blocks,site,host,type,block){
 if(!valid(site,host,type)||typeof block!=="boolean")return {error:"Invalid website, hostname or request type."};
 const existing=blocks.findIndex(r=>r.site===site&&r.host===host&&r.type===type);
 if(block){
  if(existing>=0)return {ok:true,changed:false,blocked:true,rows:blocks};
  if(blocks.length>=MAX_BLOCKS)return {error:"Maximum number of selective blocks reached."};
  return {ok:true,changed:true,blocked:true,rows:[...blocks,{site,host,type}]};
 }
 if(existing<0)return {ok:true,changed:false,blocked:false,rows:blocks};
 return {ok:true,changed:true,blocked:false,rows:blocks.filter((_,i)=>i!==existing)};
}
const API=Object.freeze({TYPES,MAX_GROUPS,MAX_BLOCKS,hostname,destination,observe,snapshot,
 clear,restore,matches,list,toggle});
root.DKAllowedActivity=API;
if(typeof module!=="undefined")module.exports=API;
})(typeof globalThis!=="undefined"?globalThis:this);
