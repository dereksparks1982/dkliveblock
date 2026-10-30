/* DK Live Block Build 24: local-only explicit YouTube save-for-later library. */
(function(root){"use strict";
const VIDEO_ID=/^[A-Za-z0-9_-]{11}$/;
const HOSTS=new Set(["youtube.com","www.youtube.com","m.youtube.com","music.youtube.com","www.youtube-nocookie.com","youtube-nocookie.com","youtu.be","www.youtu.be"]);
const MAX=300;
function parseVideo(url){
 try{
  const u=new URL(url);
  if(u.protocol!=="https:"||u.username||u.password||!HOSTS.has(u.hostname.toLowerCase()))return null;
  let id="";
  if(u.hostname==="youtu.be"||u.hostname==="www.youtu.be")id=u.pathname.slice(1);
  else if(u.pathname==="/watch")id=u.searchParams.get("v")||"";
  else if(/^\/(shorts|live)\/[A-Za-z0-9_-]{11}\/?$/.test(u.pathname))id=u.pathname.split("/")[2];
  if(!VIDEO_ID.test(id))return null;
  return {id,url:"https://www.youtube.com/watch?v="+id};
 }catch(_){return null;}
}
function safeTitle(s){return typeof s==="string"?(s.replace(/[\u0000-\u001f\u007f]/g," ").trim().slice(0,180)||"YouTube video"):"YouTube video";}
function seconds(n){return Number.isFinite(n)?Math.min(86400,Math.max(0,Math.floor(n))):0;}
function normalize(record){
 if(!record||typeof record!=="object")return null;
 const v=parseVideo(record.url);
 if(!v||record.id!==v.id)return null;
 return {id:v.id,url:v.url,title:safeTitle(record.title),position:seconds(record.position),savedAt:Number.isFinite(record.savedAt)?Math.min(Date.now(),Math.max(0,Math.floor(record.savedAt))):Date.now()};
}
function list(raw){
 if(!Array.isArray(raw))return [];
 const result=[],seen=new Set();
 for(const item of raw.slice(0,MAX*2)){
  const value=normalize(item);
  if(value&&!seen.has(value.id)){result.push(value);seen.add(value.id);}
  if(result.length===MAX)break;
 }
 return result.sort((a,b)=>b.savedAt-a.savedAt);
}
function save(raw,record){
 const value=normalize({...record,savedAt:Date.now()});
 if(!value)return null;
 return [value,...list(raw).filter(v=>v.id!==value.id)].slice(0,MAX);
}
function remove(raw,id){return VIDEO_ID.test(id||"")?list(raw).filter(v=>v.id!==id):null;}
function resumeUrl(entry){const value=normalize(entry);return value?value.url+(value.position?"&t="+value.position+"s":""):null;}
const API=Object.freeze({parseVideo,safeTitle,seconds,normalize,list,save,remove,resumeUrl,MAX});
root.DKVideoLibrary=API;
if(typeof module!=="undefined")module.exports=API;
})(typeof globalThis!=="undefined"?globalThis:this);
