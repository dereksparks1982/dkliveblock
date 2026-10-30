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
function safeNote(s){return typeof s==="string"?s.replace(/[\u0000-\u0008\u000b-\u001f\u007f]/g,"").trim().slice(0,500):"";}
function seconds(n){return Number.isFinite(n)?Math.min(86400,Math.max(0,Math.floor(n))):0;}
function normalize(record){
 if(!record||typeof record!=="object")return null;
 const v=parseVideo(record.url);
 if(!v||record.id!==v.id)return null;
 return {id:v.id,url:v.url,title:safeTitle(record.title),position:seconds(record.position),
  savedAt:Number.isFinite(record.savedAt)?Math.min(Date.now(),Math.max(0,Math.floor(record.savedAt))):Date.now(),
  note:safeNote(record.note),favorite:record.favorite===true,watched:record.watched===true};
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
 const existing=list(raw).find(v=>v.id===value.id);
 if(existing){value.note=existing.note;value.favorite=existing.favorite;value.watched=existing.watched;}
 return [value,...list(raw).filter(v=>v.id!==value.id)].slice(0,MAX);
}
function remove(raw,id){return VIDEO_ID.test(id||"")?list(raw).filter(v=>v.id!==id):null;}
function updateMetadata(raw,id,changes){
 if(!VIDEO_ID.test(id||"")||!changes||typeof changes!=="object"||Array.isArray(changes))return null;
 const existing=list(raw);
 const original=existing.find(v=>v.id===id);
 if(!original)return null;
 const edits={};
 if("note" in changes){if(typeof changes.note!=="string"||changes.note.length>5000)return null;edits.note=safeNote(changes.note);}
 if("favorite" in changes){if(typeof changes.favorite!=="boolean")return null;edits.favorite=changes.favorite;}
 if("watched" in changes){if(typeof changes.watched!=="boolean")return null;edits.watched=changes.watched;}
 if(!Object.keys(edits).length)return null;
 return existing.map(v=>v.id===id?{...v,...edits}:v);
}
const BACKUP_FORMAT="DK-Live-Block-video-library";
function exportBackup(raw){
 return {format:BACKUP_FORMAT,version:1,exportedAt:new Date().toISOString(),videos:list(raw)};
}
function importBackup(value){
 if(!value||typeof value!=="object"||value.format!==BACKUP_FORMAT||value.version!==1||
    !Array.isArray(value.videos)||value.videos.length>MAX*2)return null;
 // Reject malformed records rather than silently importing a deceptive partial backup.
 for(const item of value.videos)if(!normalize(item))return null;
 return list(value.videos);
}
function merge(raw,additional){
 if(!Array.isArray(additional)||additional.length>MAX*2)return null;
 const existing=list(raw);
 const safe=list(additional);
 return list([...safe,...existing]);
}
function search(raw,term,order="newest",filter="all"){
 const query=String(term||"").trim().toLocaleLowerCase().slice(0,150);
 const items=list(raw).filter(x=>(filter==="favorites"?x.favorite:
  filter==="unfinished"?!x.watched:filter==="watched"?x.watched:true)&&
  (!query||x.title.toLocaleLowerCase().includes(query)||x.id.includes(query)||
   x.note.toLocaleLowerCase().includes(query)));
 if(order==="oldest")return items.sort((a,b)=>a.savedAt-b.savedAt);
 if(order==="title")return items.sort((a,b)=>a.title.localeCompare(b.title));
 return items;
}
function resumeUrl(entry){const value=normalize(entry);return value?value.url+(value.position?"&t="+value.position+"s":""):null;}
const API=Object.freeze({parseVideo,safeTitle,safeNote,seconds,normalize,list,save,remove,updateMetadata,resumeUrl,MAX,exportBackup,importBackup,merge,search,BACKUP_FORMAT});
root.DKVideoLibrary=API;
if(typeof module!=="undefined")module.exports=API;
})(typeof globalThis!=="undefined"?globalThis:this);
