/* DK Live Block Build 39: local, bounded popup activity history.
   Only hostnames and safe labels, never URL paths, query strings or payloads. */
(function(root){"use strict";
const MAX=100,TTL=2*60*60*1000;
const REASONS=new Set(["strict","filter"]);
function hostname(url){
 if(typeof url!=="string"||url.length>2000)return "";
 try{const parsed=new URL(url);
  if(!["http:","https:"].includes(parsed.protocol))return "";
  const h=parsed.hostname.toLowerCase();
  return /^[a-z0-9.-]{1,253}$/.test(h)&&!h.includes("..")?h:"";
 }catch(_){return "";}
}
function validHost(host){return typeof host==="string"&&host.length<=253&&
 /^[a-z0-9.-]+$/.test(host)&&!host.includes("..");}
function getRecent(history,sourceId,siteHost,now=Date.now()){
 const session=history.get(sourceId);
 if(!session||session.siteHost!==siteHost)return [];
 session.rows=session.rows.filter(x=>now-x.when<TTL);
 if(!session.rows.length){history.delete(sourceId);return [];}
 return session.rows.slice().reverse().map(r=>({
  when:r.when,sourceHost:r.sourceHost,destinationHost:r.destinationHost||"",
  reason:r.reason,outcome:"blocked",
  detail:r.destinationHost?"Hostname observed by Firefox":"Destination not observed (blank tab or unavailable)"
 }));
}
function add(history,sourceId,siteHost,newTabId,targetUrl,reason,now=Date.now()){
 if(!Number.isInteger(sourceId)||sourceId<0||!validHost(siteHost)||!REASONS.has(reason))return false;
 let session=history.get(sourceId);
 if(!session||session.siteHost!==siteHost){
  session={siteHost,rows:[]};history.set(sourceId,session);
 }
 session.rows=session.rows.filter(x=>now-x.when<TTL);
 if(session.rows.some(r=>r.newTabId===newTabId&&Number.isInteger(newTabId)&&newTabId>=0))return false;
 session.rows.push({newTabId:Number.isInteger(newTabId)?newTabId:-1,
  sourceHost:siteHost,destinationHost:hostname(targetUrl),reason,when:now});
 while(session.rows.length>MAX)session.rows.shift();
 return true;
}
function enrich(history,sourceId,newTabId,targetUrl,now=Date.now()){
 const target=hostname(targetUrl),session=history.get(sourceId);
 if(!target||!session||!Number.isInteger(newTabId)||newTabId<0)return false;
 const row=session.rows.find(r=>r.newTabId===newTabId&&now-r.when<TTL);
 if(!row||row.destinationHost)return false;
 row.destinationHost=target;return true;
}
function clear(history,tabId){history.delete(tabId);}
const API=Object.freeze({MAX,TTL,add,enrich,getRecent,clear,hostname});
root.DKPopupHistory=API;
if(typeof module!=="undefined")module.exports=API;
})(typeof globalThis!=="undefined"?globalThis:this);
