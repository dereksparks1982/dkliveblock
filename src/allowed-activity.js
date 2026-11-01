/* DK Live Block: local permitted-request evidence, with bounded individual
   completed events and exact reason codes. No URLs, path/query, cookies, headers,
   payloads, request IDs, or telemetry. No automatic network polling. */
(function(root){"use strict";
const TYPES=new Set(["script","image","imageset","stylesheet","media","font","object",
 "xmlhttprequest","sub_frame","ping","beacon","websocket","other"]);
const MAX_GROUPS=150,MAX_EVENTS=400,MAX_BLOCKS=300,MAX_COUNT=9999999;
const REASONS=Object.freeze({
 "global-disabled":"Global DK Live Block protection was disabled.",
 "site-allowlisted":"The current website was on the site allowlist; automatic ad/tracker rules were skipped.",
 "tab-paused":"Protection was temporarily paused for this browser tab.",
 "protection-not-ready":"The filtering engine was not initialized when this request began.",
 "media-recovery":"User-enabled media-only playback recovery exempted this media request.",
 "streaming-repair":"A temporary site/hostname/type playback repair allowance matched.",
 "authentication-preserved":"A narrowly identified authentication request was protected from automatic filtering.",
 "youtube-player-preserved":"A YouTube player JSON request was retained for the selected compatibility filtering route.",
 "manual-exception":"A user-approved site/hostname/type exception overrode an automatic block decision.",
 "filter-engine-permitted":"Active filtering inspected the request and did not choose to block it.",
 "decision-not-recorded":"This request completed, but the exact initial filtering decision was not captured."
});
const METHOD=/^(GET|HEAD|POST|PUT|PATCH|DELETE|OPTIONS|CONNECT|TRACE)$/;
function metadata(meta){
 const source=meta&&typeof meta==="object"?meta:{};
 const reason=Object.hasOwn(REASONS,source.reason)?source.reason:"decision-not-recorded";
 const method=typeof source.method==="string"&&METHOD.test(source.method)?source.method:"Unknown";
 const status=Number.isInteger(source.statusCode)&&source.statusCode>=100&&source.statusCode<=599?
  source.statusCode:null;
 return {reason,method,status};
}
function bump(counts,key){
 counts[key]=Math.min(MAX_COUNT,(counts[key]||0)+1);
}
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
function observe(table,tabId,site,url,type,now=Date.now(),extra={}){
 const dest=destination(url);
 if(!Number.isInteger(tabId)||tabId<0||!valid(site,dest,type)||
    !Number.isSafeInteger(now)||now<0)return false;
 let activity=table.get(tabId);
 if(!activity||activity.site!==site){
  activity={site,total:0,groups:new Map(),events:[]};table.set(tabId,activity);
 }
 const info=metadata(extra);
 activity.total=Math.min(MAX_COUNT,activity.total+1);
 const key=dest+"|"+type;
 let row=activity.groups.get(key);
 if(!row){row={host:dest,type,count:0,first:now,last:now,
  reasons:Object.create(null),methods:Object.create(null),httpStatuses:Object.create(null)};
  activity.groups.set(key,row);
 }
 row.count=Math.min(MAX_COUNT,row.count+1);row.last=now;
 bump(row.reasons,info.reason);bump(row.methods,info.method);
 bump(row.httpStatuses,info.status===null?"Unknown":String(info.status));
 activity.events.push({host:dest,type,when:now,sequence:activity.total,method:info.method,
  httpStatus:info.status,reason:info.reason});
 if(activity.events.length>MAX_EVENTS)activity.events.shift();
 // Refresh insertion order and discard oldest host/type groups when capped.
 activity.groups.delete(key);activity.groups.set(key,row);
 if(activity.groups.size>MAX_GROUPS)activity.groups.delete(activity.groups.keys().next().value);
 return true;
}
function snapshot(table,tabId,site){
 const value=table.get(tabId);
 if(!value||value.site!==site)return {total:0,groups:[],events:[]};
 return {total:value.total,
  groups:[...value.groups.values()].reverse().map(row=>({
   ...row,reasons:{...row.reasons},methods:{...row.methods},httpStatuses:{...row.httpStatuses}
  })),
  events:value.events.slice().reverse().map(row=>({...row}))};
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
const API=Object.freeze({TYPES,MAX_GROUPS,MAX_EVENTS,MAX_BLOCKS,REASONS,hostname,destination,metadata,observe,snapshot,
 clear,restore,matches,list,toggle});
root.DKAllowedActivity=API;
if(typeof module!=="undefined")module.exports=API;
})(typeof globalThis!=="undefined"?globalThis:this);
