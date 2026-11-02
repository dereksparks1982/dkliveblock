/* DK Live Block: bounded evidence dispatcher, not an autonomous rule generator. */
(function(root){"use strict";
const MAX_DETECTORS=16;
function create(){
 const detectors=new Map();
 function register(id,fn){
  if(typeof id!=="string"||!/^[a-z][a-z0-9-]{1,39}$/.test(id)||
    typeof fn!=="function"||detectors.has(id)||detectors.size>=MAX_DETECTORS)return false;
  detectors.set(id,fn);return true;
 }
 function inspect(context){
  if(!context||typeof context!=="object")return [];
  const out=[];
  for(const [id,fn] of detectors){
   try{
    const result=fn(context);
    if(result?.matched===true&&Array.isArray(result.evidence)&&
       result.evidence.length>=2&&result.evidence.slice(0,8).every(v=>
        typeof v==="string"&&/^[a-z0-9_-]{2,48}$/.test(v)))
     out.push(Object.freeze({id,evidence:Object.freeze(result.evidence.slice(0,8)),
       action:"review"}));
   }catch(_){}
  }
  return out;
 }
 return Object.freeze({register,inspect});
}
const API=Object.freeze({create});
root.DKAdaptiveDispatcher=API;
if(typeof module!=="undefined")module.exports=API;
})(typeof globalThis!=="undefined"?globalThis:this);
