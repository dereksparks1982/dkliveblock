/* DK Live Block: bounded, Firefox-only YouTube player JSON ad-field filtering.
   Independently written. No media bytes, DRM, OAuth, remote JS, page scripts,
   ad-unblocking fallback or browsing-history storage. */
(function(root){"use strict";
const MAX_BYTES=1500000,MAX_TABS=100,MAX_DELAY_MS=4000,MAX_FILTERS=16,MAX_PER_TAB=4;
const liveByTab=new Map(),versions=new Map();let liveCount=0;
// Load the same bounded feed helper in Firefox's background global and in
// direct Node tests. Optional at runtime: fail open, never block playback.
const Feed=root.DKYouTubeFeed||(typeof require==="function"?require("./youtube-feed.js"):null);
const AD_FIELDS=["adPlacements","adSlots","playerAds"];
const records=new Map();
const kinds=()=>({player:{requests:0,seen:0,changed:0},feed:{requests:0,seen:0,changed:0},shorts:{requests:0,seen:0,changed:0}});
function category(url){
 const feed=Feed?.kind(url);if(feed)return feed;
 return target(url)?"player":"";
}
const EMPTY=()=>({playerRequests:0,observed:0,modified:0,fields:0,unchanged:0,oversized:0,timedOut:0,errors:0,skippedBusy:0,skippedHeaders:0,byKind:kinds()});
function sub(host,domain){return host===domain||host.endsWith("."+domain);}
function validPage(host){return typeof host==="string"&&
 (sub(host,"youtube.com")||sub(host,"youtube-nocookie.com"));}
function target(url){
 try{
  const u=new URL(url);
  if(u.protocol!=="https:"||u.username||u.password||!sub(u.hostname,"youtube.com"))return false;
  return u.pathname==="/youtubei/v1/player"||u.pathname==="/youtubei/v1/get_watch"||
   (Feed&&!!Feed.kind(url));
 }catch(_){return false;}
}
function requestEligible(details,pageHost){
 if(!details||details.type!=="xmlhttprequest"||
  String(details.method||"").toUpperCase()!=="POST"||
  !Number.isInteger(details.tabId)||details.tabId<0||
  !validPage(pageHost)||!target(details.url))return false;
 const source=details.documentUrl||details.originUrl||"";
 try{
  const page=new URL(source);
  return page.protocol==="https:"&&!page.username&&!page.password&&page.hostname===pageHost;
 }catch(_){return false;}
}
function eligible(details,pageHost){
 return details?.statusCode===200&&requestEligible(details,pageHost);
}
function header(headers,name){
 const row=(Array.isArray(headers)?headers:[]).find(h=>
  typeof h?.name==="string"&&h.name.toLowerCase()===name);
 return typeof row?.value==="string"?row.value:"";
}
function safeHeaders(details){
 const headers=details.responseHeaders||[];
 const mime=header(headers,"content-type");
 if(!/^\s*(?:application\/json|text\/json)\s*(?:;|$)/i.test(mime))return false;
 const charset=/;\s*charset\s*=\s*["']?([a-z0-9_-]+)/i.exec(mime)?.[1];
 if(charset&&!["utf-8","utf8"].includes(charset.toLowerCase()))return false;
 const size=header(headers,"content-length");
 if(size&&(!/^\d+$/.test(size)||Number(size)>MAX_BYTES))return false;
 return true;
}
function plain(x){return !!x&&typeof x==="object"&&!Array.isArray(x);}
function pruneObject(obj){
 if(!plain(obj)||obj.playabilityStatus&&obj.playabilityStatus.status&&obj.playabilityStatus.status!=="OK")return 0;
 if(!plain(obj.streamingData)&&!plain(obj.videoDetails)&&!plain(obj.playerResponse))return 0;
 let changed=0;
 for(const key of AD_FIELDS){
  if(Object.prototype.hasOwnProperty.call(obj,key)&&
   (Array.isArray(obj[key])||plain(obj[key]))){
   delete obj[key];changed++;
  }
 }
 return changed;
}
function rewrite(text,url=""){
 if(url&&Feed&&Feed.kind(url)){
  const r=Feed.rewrite(url,text);
  return {text:r.text,changed:r.changed,fields:r.items};
 }
 if(typeof text!=="string"||text.length>MAX_BYTES||text.length<2)return {text,changed:false,fields:0};
 const prefix=text.startsWith(")]}'\n")?")]}'\n":"";
 let payload;try{payload=JSON.parse(prefix?text.slice(prefix.length):text);}catch(_){return {text,changed:false,fields:0};}
 if(!plain(payload)||payload.playabilityStatus?.status&&
     payload.playabilityStatus.status!=="OK")
  return {text,changed:false,fields:0};
 // Refused outer responses are never rewritten, even with playable nested data.
 // Only known ad-only fields on a recognized playable response.
 let fields=pruneObject(payload);
 if(plain(payload.playerResponse))fields+=pruneObject(payload.playerResponse);
 else if(typeof payload.playerResponse==="string"&&payload.playerResponse.length<=MAX_BYTES/2){
  try{
   const child=JSON.parse(payload.playerResponse);
   const count=pruneObject(child);
   if(count){payload.playerResponse=JSON.stringify(child);fields+=count;}
  }catch(_){/* Unknown child: leave unchanged. */}
 }
 if(!fields)return {text,changed:false,fields:0};
 return {text:prefix+JSON.stringify(payload),changed:true,fields};
}
function note(tab,outcome,fields=0,url=""){
 if(!Number.isInteger(tab)||tab<0)return;
 const v=records.get(tab)||EMPTY();
 const entry=v.byKind[category(url)];
 if(entry){entry.seen++;if(outcome==="modified")entry.changed++;}
 if(outcome==="modified")v.modified++;
 else if(outcome==="unchanged")v.unchanged++;
 else if(outcome==="oversized")v.oversized++;
 else if(outcome==="timedOut")v.timedOut++;
 else v.errors++;
 v.observed++;if(outcome==="modified")v.fields+=fields;
 if(records.has(tab))records.delete(tab);records.set(tab,v);
 if(records.size>MAX_TABS)records.delete(records.keys().next().value);
}
function observeRequest(tab,url=""){
 if(!Number.isInteger(tab)||tab<0)return;
 const v=records.get(tab)||EMPTY();
 v.playerRequests=Math.min(1000000000,v.playerRequests+1);
 const entry=v.byKind[category(url)];
 if(entry)entry.requests=Math.min(1000000000,entry.requests+1);
 if(records.has(tab))records.delete(tab);
 records.set(tab,v);
 if(records.size>MAX_TABS)records.delete(records.keys().next().value);
}
function stats(tab){
 const v=records.get(tab)||EMPTY();
 return {...v,byKind:{player:{...v.byKind.player},feed:{...v.byKind.feed},shorts:{...v.byKind.shorts}}};
}
function clear(tab){
 records.delete(tab);
 if(!Number.isInteger(tab)||tab<0)return;
 // Only active response filters can post a late callback. No active stream
 // means there is no old generation to retain or evict incorrectly.
 if((liveByTab.get(tab)||0)>0)versions.set(tab,(versions.get(tab)||0)+1);
 else versions.delete(tab);
}
function attach(details,webRequest,clock=root){
 if(typeof webRequest?.filterResponseData!=="function")return false;
 if(!safeHeaders(details)){
  const tab=details?.tabId;
  if(Number.isInteger(tab)&&tab>=0){
   const v=records.get(tab)||EMPTY();
   v.skippedHeaders=Math.min(1000000000,v.skippedHeaders+1);
   if(records.has(tab))records.delete(tab);
   records.set(tab,v);
   if(records.size>MAX_TABS)records.delete(records.keys().next().value);
  }
  return false;
 }
 const tab=details.tabId;
 if(!Number.isInteger(tab)||tab<0)return false;
 const generation=versions.get(tab)||0;
 function noteCurrent(outcome,fields=0){
  if((versions.get(tab)||0)===generation)
   note(tab,outcome,fields,details.url);
 }
 if(liveCount>=MAX_FILTERS||(liveByTab.get(tab)||0)>=MAX_PER_TAB){
  const v=records.get(tab)||EMPTY();
  v.skippedBusy++;
  if(records.has(tab))records.delete(tab);
  records.set(tab,v);
  if(records.size>MAX_TABS)records.delete(records.keys().next().value);
  return false;
 }
 let filter;try{filter=webRequest.filterResponseData(details.requestId);}catch(_){noteCurrent("error");return false;}
 liveCount++;
 liveByTab.set(tab,(liveByTab.get(tab)||0)+1);
 let chunks=[],length=0,overflow=false,ended=false,deadline=null;
 function clearDeadline(){
  if(deadline!==null&&typeof clock?.clearTimeout==="function")try{clock.clearTimeout(deadline);}catch(_){}
  deadline=null;
 }
 function writeOriginal(){
  for(const chunk of chunks)filter.write(chunk);
  chunks=[];
 }
 function finish(disconnect=false){
  if(ended)return;ended=true;clearDeadline();chunks=[];
  liveCount=Math.max(0,liveCount-1);
  const remaining=(liveByTab.get(tab)||1)-1;
  if(remaining>0)liveByTab.set(tab,remaining);
  else{
   liveByTab.delete(tab);
   // All earlier streams ended; a future tab ID reuse starts fresh.
   versions.delete(tab);
  }
  try{if(disconnect)filter.disconnect();else filter.close();}
  catch(_){if(!disconnect)try{filter.disconnect();}catch(__){}}
 }
 filter.ondata=event=>{
  if(ended)return;
  try{
   const chunk=new Uint8Array(event.data);
   if(overflow){filter.write(chunk);return;}
   if(length+chunk.byteLength>MAX_BYTES){
    overflow=true;writeOriginal();filter.write(chunk);
    noteCurrent("oversized");finish(true);return;
   }
   chunks.push(chunk);length+=chunk.byteLength;
  }catch(_){
   try{writeOriginal();}catch(__){}
   noteCurrent("error");finish(true);
  }
 };
 filter.onstop=()=>{
  if(ended)return;
  if(overflow){finish();return;}
  try{
   const bytes=new Uint8Array(length);let offset=0;
   for(const chunk of chunks){bytes.set(chunk,offset);offset+=chunk.byteLength;}
   const original=new TextDecoder("utf-8",{fatal:true}).decode(bytes);
   const result=rewrite(original,details.url);
   if(result.changed){
    filter.write(new TextEncoder().encode(result.text));
    noteCurrent("modified",result.fields);
   }else{writeOriginal();noteCurrent("unchanged");}
  }catch(_){
   try{writeOriginal();}catch(__){}
   noteCurrent("error");
  }finally{chunks=[];finish();}
 };
 filter.onerror=()=>{
  if(ended)return;
  try{writeOriginal();}catch(_){}
  noteCurrent("error");finish(true);
 };
 // Firefox keeps the response suspended until the extension finishes it.
 if(typeof clock?.setTimeout==="function"){
  try{
   deadline=clock.setTimeout(()=>{
    if(ended)return;
    try{writeOriginal();}catch(_){}
    noteCurrent("timedOut");finish(true);
   },MAX_DELAY_MS);
   deadline?.unref?.();
  }catch(_){deadline=null;}
 }
 return true;
}
const API=Object.freeze({MAX_BYTES,MAX_DELAY_MS,MAX_FILTERS,MAX_PER_TAB,AD_FIELDS,validPage,target,requestEligible,eligible,safeHeaders,rewrite,attach,observeRequest,stats,clear});
root.DKYouTubeResponse=API;
if(typeof module!=="undefined")module.exports=API;
})(typeof globalThis!=="undefined"?globalThis:this);
