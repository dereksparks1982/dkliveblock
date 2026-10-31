/* Bounded and independent YouTube feed/Shorts ad entry filter.
   No media bytes, remote scripts, browsing history, or account data. */
(function(root){"use strict";
const MAX_BYTES=1500000,MAX_NODES=6000,MAX_DEPTH=20,MAX_ARRAY=1000,MAX_KEYS=128,MAX_EDGES=10000;
const FEED=new Set(["/youtubei/v1/browse","/youtubei/v1/search"]);
const REEL="/youtubei/v1/reel_watch_sequence";
const ARRAYS=new Set(["contents","items","entries","continuationItems"]);
const ADS=new Set(["adSlotRenderer","promotedVideoRenderer",
 "promotedSparklesWebRenderer","inFeedAdLayoutRenderer","displayAdRenderer",
 "promotedSparklesTextSearchRenderer"]);
function kind(raw){
 try{
  const u=new URL(raw);
  if(u.protocol!=="https:"||u.username||u.password||
     !(u.hostname==="youtube.com"||u.hostname.endsWith(".youtube.com")))return "";
  return u.pathname===REEL?"shorts":FEED.has(u.pathname)?"feed":"";
 }catch(_){return "";}
}
function plain(x){return x!==null&&typeof x==="object"&&!Array.isArray(x);}
function adEntry(x,kindName){
 if(!plain(x))return false;
 if(kindName==="shorts"&&x.command?.reelWatchEndpoint?.adClientParams?.isAd===true)return true;
 for(const name of ADS)if(plain(x[name]))return true;
 const content=x.richItemRenderer?.content;
 if(plain(content))for(const name of ADS)if(plain(content[name]))return true;
 return false;
}
function prune(payload,url){
 const mode=kind(url);
 if(!mode||!plain(payload))return {changed:false,items:0};
 const queue=[{node:payload,depth:0}],seen=new WeakSet(),jobs=[];
 let inspected=0,total=0,edges=0;
 try{
  while(queue.length){
   const {node,depth}=queue.pop();
   if(!node||typeof node!=="object")continue;
   if(++inspected>MAX_NODES||depth>MAX_DEPTH)return {changed:false,items:0};
   if(seen.has(node))continue;
   seen.add(node);
   if(Array.isArray(node)){
    if(node.length>MAX_ARRAY)return {changed:false,items:0};
    for(let i=node.length-1;i>=0;i--)queue.push({node:node[i],depth:depth+1});
    continue;
   }
   const pairs=Object.entries(node);
   if(pairs.length>MAX_KEYS||(edges+=pairs.length)>MAX_EDGES)
    return {changed:false,items:0};
   for(const [name,child] of pairs){
    if(!child||typeof child!=="object")continue;
    if(ARRAYS.has(name)&&Array.isArray(child)){
     if(child.length>MAX_ARRAY)return {changed:false,items:0};
     const indices=[];
     for(let i=0;i<child.length;i++){
      if(adEntry(child[i],mode))indices.push(i);
      else queue.push({node:child[i],depth:depth+1});
     }
     if(indices.length){total+=indices.length;jobs.push({array:child,indices});}
    }else queue.push({node:child,depth:depth+1});
   }
  }
  if(!total)return {changed:false,items:0};
  // Preflight every target array before changing even one. Page-world data
  // can be frozen or sealed; those objects must remain completely untouched.
  for(const job of jobs){
   if(!Object.isExtensible(job.array)||Object.isFrozen(job.array)||
      !Object.getOwnPropertyDescriptor(job.array,"length")?.writable)
    return {changed:false,items:0};
   for(const index of job.indices)
    if(Object.getOwnPropertyDescriptor(job.array,String(index))?.writable===false)
     return {changed:false,items:0};
  }
  for(const job of jobs)for(let i=job.indices.length-1;i>=0;i--)
   job.array.splice(job.indices[i],1);
  return {changed:true,items:total};
 }catch(_){return {changed:false,items:0};}
}
function rewrite(url,text){
 if(!kind(url)||typeof text!=="string"||text.length>MAX_BYTES||text.length<2)
  return {text,changed:false,items:0};
 const prefix=text.startsWith(")]}'\n")?")]}'\n":"";
 let obj;try{obj=JSON.parse(prefix?text.slice(prefix.length):text);}catch(_){
  return {text,changed:false,items:0};
 }
 const r=prune(obj,url);
 return r.changed?{text:prefix+JSON.stringify(obj),changed:true,items:r.items}:
  {text,changed:false,items:0};
}
const API=Object.freeze({kind,adEntry,prune,rewrite,MAX_BYTES,MAX_NODES,MAX_DEPTH,MAX_ARRAY,MAX_KEYS,MAX_EDGES});
root.DKYouTubeFeed=API;
if(typeof module!=="undefined")module.exports=API;
})(typeof globalThis!=="undefined"?globalThis:this);
