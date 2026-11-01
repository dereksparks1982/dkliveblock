/* DK Live Block: fixed MAIN-world literal property shim.
   Only user-authored site rules activate this packaged, nonprivileged code. */
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
function restore(st){
 try{
  const now=Object.getOwnPropertyDescriptor(st.object,st.name);
  if(now?.get!==st.get||now?.set!==st.set)return;
  if(st.previous){
   Object.defineProperty(st.object,st.name,st.assigned&&
    Object.prototype.hasOwnProperty.call(st.previous,"value")?
    {...st.previous,value:st.latest}:st.previous);
  }else if(st.assigned)Object.defineProperty(st.object,st.name,
   {configurable:true,enumerable:true,writable:true,value:st.latest});
  else delete st.object[st.name];
 }catch(_){}
}
function insert(row){
 let object=window;
 for(const part of row.pieces.slice(0,-1)){
  let d;try{d=Object.getOwnPropertyDescriptor(object,part);}catch(_){return;}
  if(!d||!Object.prototype.hasOwnProperty.call(d,"value"))return;
  object=d.value;
  if(!object||typeof object!=="object"&&typeof object!=="function")return;
 }
 const name=row.pieces[row.pieces.length-1];
 let previous;try{previous=Object.getOwnPropertyDescriptor(object,name);}catch(_){return;}
 if(previous&&!previous.configurable||!previous&&!Object.isExtensible(object))return;
 const st={object,name,previous,value:row.value,assigned:false,latest:previous?.value,
  get:null,set:null};
 st.get=()=>VALUES[row.value];
 st.set=x=>{st.assigned=true;st.latest=x;};
 try{
  Object.defineProperty(object,name,{configurable:true,enumerable:previous?.enumerable??true,
   get:st.get,set:st.set});
  active.set(row.path,st);
 }catch(_){}
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
 for(const [path,st] of active)if(!requested.has(path)||requested.get(path).value!==st.value){
  restore(st);active.delete(path);
 }
 for(const [path,r] of requested)if(!active.has(path))insert(r);
}
document.addEventListener(EVENT,e=>{try{apply(e?.detail);}catch(_){}},false);
})();
