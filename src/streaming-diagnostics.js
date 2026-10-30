/* Build 31: local-only, bounded streaming-page blocked-request diagnostics. */
(function(root){"use strict";
const MAX=60,TTL_MS=30*60*1000;
const TYPES=new Set(["media","xmlhttprequest","other"]);
const STREAMING=["youtube.com","youtube-nocookie.com","disneyplus.com"];
function streaming(host){
 return typeof host==="string"&&STREAMING.some(s=>host===s||host.endsWith("."+s));
}
function safeHost(value){
 return typeof value==="string"&&/^[a-z0-9.-]{1,253}$/.test(value)&&!value.includes("..")?value:"";
}
function recent(map,tabId,now=Date.now()){
 if(!Number.isInteger(tabId)||tabId<0)return [];
 const rows=map.get(tabId)||[];
 const safe=rows.filter(x=>x&&Number.isFinite(x.when)&&now-x.when>=0&&now-x.when<=TTL_MS).slice(-MAX);
 if(safe.length!==rows.length){if(safe.length)map.set(tabId,safe);else map.delete(tabId);}
 return safe.map(x=>({...x}));
}
function record(map,tabId,pageHost,requestHost,type,now=Date.now()){
 if(!Number.isInteger(tabId)||tabId<0||!streaming(pageHost)||!TYPES.has(type))return false;
 const domain=safeHost(requestHost);
 if(!domain||!Number.isFinite(now))return false;
 const rows=recent(map,tabId,now);
 const last=rows[rows.length-1];
 if(last&&last.host===domain&&last.type===type&&now-last.when<60000){
  last.count=Math.min(999,(last.count||1)+1);last.when=now;
 }else rows.push({host:domain,type,count:1,when:now});
 map.set(tabId,rows.slice(-MAX));
 return true;
}
function clear(map,tabId){map.delete(tabId);}
const API=Object.freeze({record,recent,clear,streaming,MAX,TTL_MS});
root.DKStreamingDiagnostics=API;
if(typeof module!=="undefined")module.exports=API;
})(typeof globalThis!=="undefined"?globalThis:this);
