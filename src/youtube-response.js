/* DK Live Block: bounded, Firefox-only YouTube player JSON ad-field filtering.
   Independently written. No media bytes, DRM, OAuth, remote JS, page scripts,
   ad-unblocking fallback or browsing-history storage. */
(function(root){"use strict";
const MAX_BYTES=1500000,MAX_TABS=100;
// Load the same bounded feed helper in Firefox's background global and in
// direct Node tests. Optional at runtime: fail open, never block playback.
const Feed=root.DKYouTubeFeed||(typeof require==="function"?require("./youtube-feed.js"):null);
const AD_FIELDS=["adPlacements","adSlots","playerAds"];
const records=new Map();
const EMPTY=()=>({playerRequests:0,observed:0,modified:0,fields:0,unchanged:0,oversized:0,errors:0});
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
function eligible(details,pageHost){
 if(!details||details.type!=="xmlhttprequest"||details.method!=="POST"||
    details.statusCode!==200||!Number.isInteger(details.tabId)||details.tabId<0||
    !validPage(pageHost)||!target(details.url))return false;
 if(details.documentUrl){
  try{if(new URL(details.documentUrl).hostname!==pageHost)return false;}
  catch(_){return false;}
 }
 return true;
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
function note(tab,outcome){
 if(!Number.isInteger(tab)||tab<0)return;
 const v=records.get(tab)||EMPTY();
 if(outcome==="modified")v.modified++;
 else if(outcome==="unchanged")v.unchanged++;
 else if(outcome==="oversized")v.oversized++;
 else v.errors++;
 v.observed++;if(outcome==="modified")v.fields+=arguments[2]||0;
 if(records.has(tab))records.delete(tab);records.set(tab,v);
 if(records.size>MAX_TABS)records.delete(records.keys().next().value);
}
function observeRequest(tab){
 if(!Number.isInteger(tab)||tab<0)return;
 const v=records.get(tab)||EMPTY();
 v.playerRequests=Math.min(1000000000,v.playerRequests+1);
 if(records.has(tab))records.delete(tab);
 records.set(tab,v);
 if(records.size>MAX_TABS)records.delete(records.keys().next().value);
}
function stats(tab){return {...(records.get(tab)||EMPTY())};}
function clear(tab){records.delete(tab);}
function attach(details,webRequest){
 if(!safeHeaders(details)||typeof webRequest?.filterResponseData!=="function")return false;
 let filter;try{filter=webRequest.filterResponseData(details.requestId);}catch(_){note(details.tabId,"error");return false;}
 let chunks=[],length=0,overflow=false,ended=false;
 function writeOriginal(){
  for(const chunk of chunks)filter.write(chunk);
  chunks=[];
 }
 function finish(){
  if(ended)return;ended=true;
  try{filter.close();}catch(_){try{filter.disconnect();}catch(_){}}
 }
 filter.ondata=event=>{
  if(ended)return;
  try{
   const chunk=new Uint8Array(event.data);
   if(overflow){filter.write(chunk);return;}
   if(length+chunk.byteLength>MAX_BYTES){
    overflow=true;writeOriginal();filter.write(chunk);note(details.tabId,"oversized");return;
   }
   chunks.push(chunk);length+=chunk.byteLength;
  }catch(_){
   try{writeOriginal();filter.disconnect();}catch(__){finish();}
   ended=true;note(details.tabId,"error");
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
    note(details.tabId,"modified",result.fields);
   }else{writeOriginal();note(details.tabId,"unchanged");}
  }catch(_){
   try{writeOriginal();}catch(__){}
   note(details.tabId,"error");
  }finally{chunks=[];finish();}
 };
 filter.onerror=()=>{
  if(ended)return;
  try{writeOriginal();filter.disconnect();}catch(_){finish();}
  ended=true;note(details.tabId,"error");
 };
 return true;
}
const API=Object.freeze({MAX_BYTES,AD_FIELDS,validPage,target,eligible,safeHeaders,rewrite,attach,observeRequest,stats,clear});
root.DKYouTubeResponse=API;
if(typeof module!=="undefined")module.exports=API;
})(typeof globalThis!=="undefined"?globalThis:this);
