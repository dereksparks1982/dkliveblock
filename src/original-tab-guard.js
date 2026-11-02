/* DK Live Block: original-tab popunder takeover protection.
   Some ad systems navigate the user's existing video tab to an advertiser and
   move the requested video into a new tab. Do not close the new video tab.
   Only one observed source/destination pair is covered; no global redirect denylist. */
(function(root){"use strict";
const TTL_MS=30000,MAX_SOURCES=128,NESTY5_MS=4500;
const NESTY_5=Object.freeze({id:"agent_nesty_5",title:"Agent Nesty 5",status:"armed",
 role:"Evidence-gated original XNXX video-tab takeover guard"});
function site(host){
 if(typeof host!=="string")return false;
 const h=host.toLowerCase().replace(/\.$/,"");
 return h==="xnxx.com"||h.endsWith(".xnxx.com");
}
function hostname(url){
 if(typeof url!=="string"||url.length>4096)return "";
 try{
  const u=new URL(url);
  return u.protocol==="https:"||u.protocol==="http:"?u.hostname.toLowerCase():"";
 }catch(_){return "";}
}
function adDestination(url){
 const h=hostname(url);
 return h==="stripchat.com"||h.endsWith(".stripchat.com");
}
function plausibleVideoTab(url){
 if(url===""||url==="about:blank")return true;
 return site(hostname(url));
}
function confirmedVideo(url){
 if(!site(hostname(url)))return false;
 try{const u=new URL(url);
  return !u.username&&!u.password&&/^\/video(?:[-_\/]|$)/i.test(u.pathname)&&u.pathname.length<300;
 }catch(_){return false;}
}
function foreign(url){
 if(typeof url!=="string"||url.length>4096)return false;
 try{const u=new URL(url);
  return (u.protocol==="https:"||u.protocol==="http:")&&
    !u.username&&!u.password&&!!u.hostname&&!site(u.hostname);
 }catch(_){return false;}
}
function validNow(now){return Number.isSafeInteger(now)&&now>=0&&now<=Number.MAX_SAFE_INTEGER-TTL_MS;}
function recent(row,now){
 return !!row&&validNow(now)&&validNow(row.at)&&now>=row.at&&now-row.at<=TTL_MS;
}
function note(map,sourceId,childId,sourceHost,childUrl,now=Date.now()){
 if(!map?.set||!map?.delete||!Number.isSafeInteger(sourceId)||sourceId<0||
    !Number.isSafeInteger(childId)||childId<0||sourceId===childId||
    !site(sourceHost)||!plausibleVideoTab(childUrl)||!validNow(now))return false;
 for(const [id,row] of map)if(!recent(row,now))map.delete(id);
 if(!map.has(sourceId)&&map.size>=MAX_SOURCES)map.delete(map.keys().next().value);
 map.set(sourceId,{at:now,childId,site:sourceHost.toLowerCase().replace(/\.$/,""),
  videoAt:confirmedVideo(childUrl)?now:null});
 return true;
}
function confirmVideo(map,childId,url,now=Date.now()){
 if(!Number.isSafeInteger(childId)||childId<0||!validNow(now)||!confirmedVideo(url))return false;
 let found=false;
 for(const row of map?.values?.()||[]){
  if(row?.childId===childId&&recent(row,now)&&now-row.at<=NESTY5_MS){
   row.videoAt=now;found=true;
  }
 }
 return found;
}
function shouldBlockNesty5(map,details,currentHost,active,now=Date.now()){
 if(active!==true||details?.type!=="main_frame"||
   !Number.isSafeInteger(details.tabId)||details.tabId<0||
   !site(currentHost)||!foreign(details.url)||!validNow(now)||
   details.method&&String(details.method).toUpperCase()!=="GET")return false;
 const origin=details.originUrl||details.documentUrl||"";
 if(origin&&!site(hostname(origin)))return false;
 const row=map?.get?.(details.tabId);
 return recent(row,now)&&site(row.site)&&
  Number.isSafeInteger(row.childId)&&row.childId>=0&&row.childId!==details.tabId&&
  Number.isSafeInteger(row.videoAt)&&row.videoAt>=row.at&&
  now>=row.videoAt&&now-row.at<=NESTY5_MS&&now-row.videoAt<=NESTY5_MS;
}
function shouldBlock(map,details,currentHost,active,now=Date.now()){
 if(active!==true||details?.type!=="main_frame"||
    !Number.isSafeInteger(details.tabId)||details.tabId<0||
    !site(currentHost)||!adDestination(details.url)||!validNow(now)||
    (details.method&&String(details.method).toUpperCase()!=="GET"))return false;
 // An explicit, different document origin must never inherit a cached tab host.
 const origin=details.originUrl||details.documentUrl||"";
 if(origin&&!site(hostname(origin)))return false;
 // Require a recent source-linked second tab before canceling the original
 // tab's navigation. An originating site alone is NOT evidence of hijacking:
 // the user might intentionally visit that destination in the current tab.
 const row=map?.get?.(details.tabId);
 return recent(row,now)&&site(row.site)&&
  Number.isSafeInteger(row.childId)&&row.childId>=0&&
  row.childId!==details.tabId;
}
function clear(map,tabId){
 map?.delete?.(tabId);
 if(!Number.isSafeInteger(tabId))return;
 for(const [id,row] of map||[])if(row?.childId===tabId)map.delete(id);
}
const api={note,confirmVideo,shouldBlockNesty5,shouldBlock,clear,site,
 adDestination,plausibleVideoTab,confirmedVideo,foreign,NESTY_5,NESTY5_MS};
root.DKOriginalTabGuard=api;
if(typeof module!=="undefined")module.exports=api;
})(typeof globalThis!=="undefined"?globalThis:this);
