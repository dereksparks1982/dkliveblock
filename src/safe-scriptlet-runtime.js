/* DK Live Block: fixed MAIN-world literal property shim.
   User-authored site rules only; no remote subscription script execution.
   Intermediate data properties can be assigned after document_start. */
(function(){"use strict";
const EVENT="dk-live-block:safe-scriptlets";
const VALUES=Object.freeze({true:true,false:false,null:null,undefined:void 0,0:0,1:1});
const NAME=/^[A-Za-z_$][A-Za-z0-9_$]{0,39}$/;
const BAD=new Set(["__proto__","constructor","prototype","document","location","navigator",
 "fetch","XMLHttpRequest","eval","Function","globalThis","self","top","parent",
 "frames","opener","browser","chrome","history","JSON","Promise","crypto",
 "localStorage","sessionStorage","cookieStore"]);
const active=new Map();
const parseLiteral=JSON.parse;
function verified(row){
 if(!row||row.name!=="set-constant"||typeof row.path!=="string"||
  row.path.length>120||!Object.prototype.hasOwnProperty.call(VALUES,row.value))return null;
 const pieces=row.path.split(".");
 if(!pieces.length||pieces.length>3||pieces.some(s=>!NAME.test(s)||BAD.has(s)))return null;
 return {path:row.path,pieces,value:row.value};
}
function objectLike(x){return x!==null&&(typeof x==="object"||typeof x==="function");}
function restore(link){
 try{
  const now=Object.getOwnPropertyDescriptor(link.object,link.name);
  if(now?.get!==link.get||now?.set!==link.set)return;
  if(link.previous){
   const original=link.previous;
   Object.defineProperty(link.object,link.name,link.assigned?
    {...original,value:link.latest}:original);
  }else if(link.assigned)Object.defineProperty(link.object,link.name,
   {configurable:true,enumerable:true,writable:true,value:link.latest});
  else delete link.object[link.name];
 }catch(_){}
}
function removeAfter(state,depth){
 for(let i=state.links.length-1;i>=0;i--){
  const link=state.links[i];
  if(link.depth>depth){restore(link);state.links.splice(i,1);}
 }
}
function install(row,object,depth,state){
 if(!objectLike(object))return false;
 const name=row.pieces[depth],leaf=depth===row.pieces.length-1;
 let previous;
 try{
  previous=Object.getOwnPropertyDescriptor(object,name);
  // Never invoke an inherited getter or replace an inherited accessor.
  if(!previous&&name in object)return false;
 }catch(_){return false;}
 if(previous&&!Object.prototype.hasOwnProperty.call(previous,"value"))
  return false;
 // Already-created object chains need no intermediate trap: preserve
 // existing site descriptors and allow several user shims under one object.
 if(!leaf&&previous&&objectLike(previous.value)&&
    (depth===0||!previous.configurable))
  return install(row,previous.value,depth+1,state);
 if(previous&&!previous.configurable)return false;
 if(!previous){
  try{if(!Object.isExtensible(object))return false;}catch(_){return false;}
 }
 const link={object,name,depth,previous,assigned:false,latest:previous?.value,
  get:null,set:null};
 if(leaf){
  link.get=()=>VALUES[row.value];
  link.set=x=>{link.assigned=true;link.latest=x;};
 }else{
  link.get=()=>link.latest;
  link.set=x=>{
   link.assigned=true;
   // No stale shims may survive on an object which the page replaced.
   removeAfter(state,depth);
   link.latest=x;
   if(objectLike(x))install(row,x,depth+1,state);
  };
 }
 try{
  Object.defineProperty(object,name,{configurable:true,
   enumerable:previous?.enumerable??true,get:link.get,set:link.set});
  state.links.push(link);
 }catch(_){return false;}
 if(!leaf&&objectLike(link.latest))install(row,link.latest,depth+1,state);
 return true;
}
function insert(row){
 const state={value:row.value,links:[]};
 if(install(row,window,0,state)&&state.links.length)
  active.set(row.path,state);
}
function apply(payload){
 if(typeof payload==="string"){
  if(payload.length>6000)return;
  try{payload=parseLiteral(payload);}catch(_){return;}
 }
 const requested=new Map();
 if(Array.isArray(payload))for(const input of payload.slice(0,24)){
  const r=verified(input);if(r&&!requested.has(r.path))requested.set(r.path,r);
 }
 for(const [path,state] of active){
  if(!requested.has(path)||requested.get(path).value!==state.value){
   removeAfter(state,-1);active.delete(path);
  }
 }
 for(const [path,row] of requested)if(!active.has(path))insert(row);
}
document.addEventListener(EVENT,e=>{try{apply(e?.detail);}catch(_){}},false);
})();
