/* DK Live Block: bounded local DOM names for the licensed Ghostery engine.
   Does not collect page text, URLs, hrefs, form data or user input. */
(function(root){"use strict";
const MAX_CLASSES=64,MAX_IDS=32,MAX_NODES=360,MAX_RECORDS=40,MAX_CHILDREN=16;
const NAME=/^[a-zA-Z_][a-zA-Z0-9_-]{2,48}$/;
const SENSITIVE=/password|passwd|token|session|csrf|auth|account|email|login|credential/i;
function validName(s){return typeof s==="string"&&NAME.test(s)&&!SENSITIVE.test(s)&&
 !s.startsWith("dk-live-block-");}
function normalizeSignals(raw){
 if(!raw||typeof raw!=="object"||Array.isArray(raw))return {classes:[],ids:[]};
 function clean(values,max){
  if(!Array.isArray(values)||values.length>256)return [];
  const out=[],seen=new Set();
  for(const s of values){
   if(!validName(s)||seen.has(s))continue;
   seen.add(s);out.push(s);if(out.length===max)break;
  }
  return out;
 }
 return {classes:clean(raw.classes,MAX_CLASSES),ids:clean(raw.ids,MAX_IDS)};
}
function create(doc){
 const classes=new Set(),ids=new Set();let primed=false;
 function add(el){
  if(!el||el.nodeType!==1)return false;
  if(["SCRIPT","STYLE","INPUT","TEXTAREA","SELECT","OPTION"].includes(String(el.tagName||"").toUpperCase()))
   return false;
  let changed=false;
  if(validName(el.id)&&!ids.has(el.id)&&ids.size<MAX_IDS){ids.add(el.id);changed=true;}
  if(el.classList&&typeof el.classList[Symbol.iterator]==="function"){
   let n=0;
   for(const s of el.classList){
    if(++n>MAX_CHILDREN)break;
    if(validName(s)&&!classes.has(s)&&classes.size<MAX_CLASSES){classes.add(s);changed=true;}
   }
  }
  return changed;
 }
 function scan(start,max=MAX_NODES){
  if(!start||start.nodeType!==1)return false;
  let node=start,n=0,changed=false;
  while(node&&n++<max){
   changed=add(node)||changed;
   if(node.firstElementChild){node=node.firstElementChild;continue;}
   while(node!==start&&!node.nextElementSibling)node=node.parentElement;
   node=node===start?null:node.nextElementSibling;
  }
  return changed;
 }
 function prime(){if(!primed){primed=true;scan(doc?.body||doc?.documentElement);}}
 function observe(records){
  if(!Array.isArray(records))return false;
  prime();let changed=false;
  for(const r of records.slice(0,MAX_RECORDS)){
   if(r?.type==="attributes"&&["class","id"].includes(r.attributeName))
    changed=add(r.target)||changed;
   if(r?.type!=="childList"||!r.addedNodes)continue;
   let count=0;
   for(const el of r.addedNodes){
    if(++count>MAX_CHILDREN)break;
    changed=scan(el,MAX_CHILDREN)||changed;
   }
  }
  return changed;
 }
 return Object.freeze({
  observe,
  snapshot(){prime();return normalizeSignals({classes:[...classes],ids:[...ids]});},
  reset(){classes.clear();ids.clear();primed=false;}
 });
}
const API=Object.freeze({create,normalizeSignals,validName,MAX_CLASSES,MAX_IDS});
root.DKGhosteryDOM=API;
if(typeof module!=="undefined")module.exports=API;
})(typeof globalThis!=="undefined"?globalThis:this);
