/* DK Live Block: fixed MAIN-world literal property shims.
   Only explicitly user-authored, domain-scoped rules select these operations.
   A bounded shared prefix tree keeps late-created sibling paths consistent. */
(function(){"use strict";
const EVENT="dk-live-block:safe-scriptlets";
const VALUES=Object.freeze({true:true,false:false,null:null,undefined:void 0,0:0,1:1});
const NAME=/^[A-Za-z_$][A-Za-z0-9_$]{0,39}$/;
const BAD=new Set(["__proto__","constructor","prototype","document","location","navigator",
 "fetch","XMLHttpRequest","eval","Function","globalThis","self","top","parent",
 "frames","opener","browser","chrome","history","JSON","Promise","crypto",
 "localStorage","sessionStorage","cookieStore"]);
const parseLiteral=JSON.parse;
let active=[],lastSignature="";
function verified(row){
 if(!row||row.name!=="set-constant"||typeof row.path!=="string"||
  row.path.length>120||!Object.prototype.hasOwnProperty.call(VALUES,row.value))return null;
 const pieces=row.path.split(".");
 if(!pieces.length||pieces.length>3||pieces.some(s=>!NAME.test(s)||BAD.has(s)))return null;
 return {path:row.path,pieces,value:row.value};
}
function objectLike(x){return x!==null&&(typeof x==="object"||typeof x==="function");}
function node(){return {children:new Map(),value:null};}
function tree(rows){
 const root=node();
 for(const r of rows){
  let current=root,blocked=false;
  for(const piece of r.pieces){
   if(current.value!==null){blocked=true;break;}
   if(!current.children.has(piece))current.children.set(piece,node());
   current=current.children.get(piece);
  }
  if(!blocked&&!current.children.size&&current.value===null)current.value=r.value;
 }
 return root;
}
function restore(link){
 for(let i=link.children.length-1;i>=0;i--)restore(link.children[i]);
 link.children.length=0;
 if(!link.installed)return;
 try{
  const d=Object.getOwnPropertyDescriptor(link.object,link.name);
  if(d?.get!==link.get||d?.set!==link.set)return;
  if(link.previous){
   const previous=link.previous;
   const data=link.assigned&&previous.writable?
    {...previous,value:link.latest}:previous;
   Object.defineProperty(link.object,link.name,data);
  }else if(link.assigned)Object.defineProperty(link.object,link.name,
   {configurable:true,enumerable:true,writable:true,value:link.latest});
  else delete link.object[link.name];
 }catch(_){}
}
function installChildren(value,branch,links){
 if(!objectLike(value))return;
 for(const [name,child] of branch.children){
  // Keep processing siblings independently if a hostile object throws.
  try{const link=install(value,name,child);if(link)links.push(link);}catch(_){}
 }
}
function install(object,name,branch){
 if(!objectLike(object))return null;
 let previous;
 try{
  previous=Object.getOwnPropertyDescriptor(object,name);
  if(!previous&&name in object)return null;
 }catch(_){return null;}
 if(previous&&!Object.prototype.hasOwnProperty.call(previous,"value"))return null;
 const leaf=branch.value!==null;
 if(previous&&(!previous.configurable||!previous.writable)){
  // A read-only intermediate may be traversed, never replaced.
  // A writable, locked intermediate might be replaced without notice;
  // refuse it instead of leaving stale interceptors on abandoned objects.
  if(!leaf&&!previous.writable&&objectLike(previous.value)){
   const link={installed:false,children:[]};
   installChildren(previous.value,branch,link.children);
   return link;
  }
  return null;
 }
 if(!previous){
  try{if(!Object.isExtensible(object))return null;}catch(_){return null;}
 }
 const link={object,name,previous,installed:false,assigned:false,
  latest:previous?.value,children:[],get:null,set:null};
 link.get=leaf?()=>VALUES[branch.value]:()=>link.latest;
 link.set=x=>{
  if(!leaf){
   for(let i=link.children.length-1;i>=0;i--)restore(link.children[i]);
   link.children=[];
  }
  link.assigned=true;link.latest=x;
  if(!leaf)installChildren(x,branch,link.children);
 };
 try{
  Object.defineProperty(object,name,{configurable:true,
   enumerable:previous?.enumerable??true,get:link.get,set:link.set});
  link.installed=true;
 }catch(_){return null;}
 if(!leaf)installChildren(link.latest,branch,link.children);
 return link;
}
function apply(payload){
 if(typeof payload==="string"){
  if(payload.length>6000)return;
  try{payload=parseLiteral(payload);}catch(_){return;}
 }
 const rows=[],seen=new Set();
 if(Array.isArray(payload))for(const input of payload.slice(0,24)){
  const r=verified(input);
  if(r&&!seen.has(r.path)){seen.add(r.path);rows.push(r);}
 }
 // Event dispatch runs synchronously; identical updates do not reset
 // property descriptors or replay page assignments on SPA refresh.
 const signature=JSON.stringify(rows.map(r=>[r.path,r.value]));
 if(signature===lastSignature)return;
 for(let i=active.length-1;i>=0;i--)restore(active[i]);
 active=[];
 lastSignature=signature;
 installChildren(window,tree(rows),active);
}
document.addEventListener(EVENT,e=>{try{apply(e?.detail);}catch(_){}},false);
})();
