/* DK Live Block Build 35: bounded, local-only, per-tab network monitor. */
(function(root){"use strict";
const MAX=1500;
const STATES=new Set(["pending","allowed","blocked","failed","redirected"]);
const METHOD=/^[A-Z]{1,12}$/;
function hostname(url){
 try{const u=new URL(url);return /^https?:$/.test(u.protocol)?u.hostname.toLowerCase():"";}
 catch(_){return "";}
}
function normalizeHost(host){return typeof host==="string"&&/^[a-z0-9.-]{1,253}$/.test(host)&&!host.includes("..")?host:"";}
function tabOK(tab){return Number.isInteger(tab)&&tab>=0;}
function start(sessions,tab,siteHost,now=Date.now()){
 const host=normalizeHost(siteHost);
 if(!tabOK(tab)||!host)return false;
 const existing=sessions.get(tab);
 if(existing&&existing.siteHost===host){
  existing.active=true;return true;
 }
 sessions.set(tab,{active:true,siteHost:host,startedAt:now,rows:[],byId:new Map(),
  seen:0,dropped:0,revision:0,counts:{pending:0,allowed:0,blocked:0,failed:0,redirected:0}});
 return true;
}
function stop(sessions,tab){const session=sessions.get(tab);if(!session)return false;session.active=false;return true;}
function clear(sessions,tab){
 const s=sessions.get(tab);if(!s)return false;
 s.rows=[];s.byId.clear();s.seen=0;s.dropped=0;s.revision++;
 s.counts={pending:0,allowed:0,blocked:0,failed:0,redirected:0};return true;
}
function remove(sessions,tab){sessions.delete(tab);}
function record(sessions,tab,siteHost,details,now=Date.now()){
 const s=sessions.get(tab);
 if(!s?.active||s.siteHost!==siteHost||!details||!tabOK(tab))return false;
 const dest=normalizeHost(hostname(details.url)),id=String(details.requestId??"").slice(0,90);
 if(!dest||!id)return false;
 if(s.byId.has(id))return true;
 const type=typeof details.type==="string"?details.type.replace(/[^a-z_]/gi,"").slice(0,30):"other";
 const method=typeof details.method==="string"&&METHOD.test(details.method)?details.method:"";
 const item={host:dest,type:type||"other",method,status:"pending",httpStatus:null,
  when:now,error:"",reason:""};
 s.rows.push(item);s.byId.set(id,item);s.seen++;s.counts.pending++;s.revision++;
 if(s.rows.length>MAX){
  const dropped=s.rows.shift();s.dropped++;
  for(const [key,value] of s.byId)if(value===dropped){s.byId.delete(key);break;}
 }
 return true;
}
function transition(sessions,tab,requestId,status,details={}){
 if(!STATES.has(status)||!tabOK(tab))return false;
 const s=sessions.get(tab),row=s?.byId.get(String(requestId??"").slice(0,90));
 if(!row)return false;
 if(row.status==="blocked"&&status!=="blocked")return false;
 if(row.status===status)return true;
 s.counts[row.status]=Math.max(0,s.counts[row.status]-1);
 s.counts[status]++;row.status=status;s.revision++;
 if(status==="allowed"&&Number.isInteger(details.statusCode)&&details.statusCode>=100&&details.statusCode<=599)
  row.httpStatus=details.statusCode;
 if(status==="failed"){
  const reason=String(details.error||"Network error");
  // Deliberately do not preserve arbitrary error text with URLs or tokens.
  row.error=/^[A-Za-z0-9_ -]{1,60}$/.test(reason)?reason:"Network error";
 }
 if(status==="blocked")row.reason="DK filter rule";
 if(status==="redirected")row.reason="Navigation or HTTP redirect";
 return true;
}
function note(sessions,tab,requestId,text){
 const session=sessions.get(tab),row=session?.byId.get(String(requestId??"").slice(0,90));
 if(!row||typeof text!=="string"||text.length>90)return false;
 row.reason=text;session.revision++;return true;
}
function syntheticBlock(sessions,tab,siteHost,url,type,now=Date.now()){
 const s=sessions.get(tab);if(!s?.active||s.siteHost!==siteHost)return false;
 const dest=normalizeHost(hostname(url));if(!dest)return false;
 const item={host:dest,type:String(type||"popup").replace(/[^a-z_]/gi,"").slice(0,30)||"popup",
  method:"",status:"blocked",httpStatus:null,when:now,error:"",reason:"Popup rule"};
 s.rows.push(item);s.seen++;s.counts.blocked++;s.revision++;
 if(s.rows.length>MAX){const removed=s.rows.shift();s.dropped++;
  for(const [id,row] of s.byId)if(row===removed){s.byId.delete(id);break;}}
 return true;
}
function snapshot(sessions,tab){
 const s=sessions.get(tab);
 if(!tabOK(tab)||!s)return {active:false,siteHost:"",seen:0,dropped:0,revision:0,
   counts:{pending:0,allowed:0,blocked:0,failed:0,redirected:0},rows:[]};
 return {active:s.active,siteHost:s.siteHost,seen:s.seen,dropped:s.dropped,
  startedAt:s.startedAt,revision:s.revision,counts:{...s.counts},
  rows:s.rows.map(({host,type,method,status,httpStatus,when,error,reason})=>
   ({host,type,method,status,httpStatus,when,error,reason}))};
}
const API=Object.freeze({MAX,start,stop,clear,remove,record,transition,note,syntheticBlock,snapshot,hostname});
root.DKNetworkMonitor=API;
if(typeof module!=="undefined")module.exports=API;
})(typeof globalThis!=="undefined"?globalThis:this);
