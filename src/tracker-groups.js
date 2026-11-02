/* DK Live Block Build 239. Opt-in, hostname-only capture grouping. */
(function(root){"use strict";
const STATUSES=new Set(["blocked","allowed","failed","redirected","pending"]);
function group(snapshot,accessInspector,max=30){
 const out=new Map();
 if(!Array.isArray(snapshot?.rows)||!accessInspector?.describe||typeof snapshot.siteHost!=="string")return [];
 for(const event of snapshot.rows.slice(-1500)){
  if(!event||typeof event.host!=="string"||event.host.length>253||
    !/^[a-z0-9.-]+$/i.test(event.host)||typeof event.type!=="string"||
    !/^[a-z_]{2,24}$/.test(event.type)||!STATUSES.has(event.status)||
    ["main_frame","popup","document"].includes(event.type))continue;
  const purpose=accessInspector.describe(event.host,event.type,snapshot.siteHost);
  if(!purpose?.thirdParty)continue;
  const key=event.host+"|"+event.type;
  if(!out.has(key))out.set(key,{host:event.host,type:event.type,total:0,blocked:0,allowed:0,purpose});
  const row=out.get(key);
  row.total++;
  if(event.status==="blocked")row.blocked++;
  if(event.status==="allowed")row.allowed++;
 }
 return [...out.values()].sort((a,b)=>b.total-a.total||a.host.localeCompare(b.host)).slice(0,Math.max(1,Math.min(30,max)));
}
const API=Object.freeze({group});
root.DKTrackerGroups=API;
if(typeof module!=="undefined")module.exports=API;
})(typeof globalThis!=="undefined"?globalThis:this);
