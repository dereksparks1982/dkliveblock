/* Build 33: explicit, temporary single-tab streaming request exceptions. */
(function(root){"use strict";
const TTL_MS=10*60*1000,MAX=10;
const TYPES=new Set(["media","xmlhttprequest","other"]);
const STREAMING=["youtube.com","youtube-nocookie.com","disneyplus.com"];
function isStreamingHost(host){return typeof host==="string"&&STREAMING.some(s=>host===s||host.endsWith("."+s));}
function validHost(host){return typeof host==="string"&&/^[a-z0-9.-]{1,253}$/.test(host)&&!host.includes("..");}
function list(table,tabId,now=Date.now()){
 if(!Number.isInteger(tabId)||tabId<0)return [];
 const existing=table.get(tabId)||[];
 const current=existing.filter(row=>row&&row.expires>now&&row.expires<=now+TTL_MS);
 if(current.length) table.set(tabId,current);
 else table.delete(tabId);
 return current.map(row=>({...row}));
}
function allow(table,tabId,pageHost,requestHost,type,now=Date.now()){
 if(!Number.isInteger(tabId)||tabId<0||!isStreamingHost(pageHost)||!validHost(requestHost)||
   !TYPES.has(type)||!Number.isFinite(now))return false;
 const existing=list(table,tabId,now).filter(row=>row.pageHost===pageHost);
 const current=existing.find(row=>row.host===requestHost&&row.type===type);
 if(current)current.expires=now+TTL_MS;
 else {
  if(existing.length>=MAX)return false;
  existing.push({pageHost,host:requestHost,type,expires:now+TTL_MS});
 }
 table.set(tabId,existing);
 return true;
}
function matches(table,tabId,pageHost,requestHost,type,now=Date.now()){
 if(!isStreamingHost(pageHost)||!TYPES.has(type))return false;
 return list(table,tabId,now).some(row=>row.pageHost===pageHost&&
   row.host===requestHost&&row.type===type);
}
function clear(table,tabId){table.delete(tabId);}
const API=Object.freeze({allow,matches,list,clear,isStreamingHost,validHost,TTL_MS,MAX});
root.DKStreamingRepair=API;
if(typeof module!=="undefined")module.exports=API;
})(typeof globalThis!=="undefined"?globalThis:this);
