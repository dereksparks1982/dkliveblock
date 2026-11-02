/* DK Live Block: evidence-based provider intelligence, no network activity or telemetry. */
(function(root){"use strict";
const TYPES=new Set(["ad","tracker","analytics","attribution","cdn","authentication","unknown"]);
const MAX=100,HOST=/^[a-z0-9.-]{1,253}$/;
function validHost(s){return typeof s==="string"&&HOST.test(s)&&s.includes(".")&&!s.includes("..");}
function normalize(record){
 if(!record||!validHost(record.host)||!TYPES.has(record.type))return null;
 const evidence=Array.isArray(record.evidence)?record.evidence.filter(x=>typeof x==="string"&&
  /^[a-z0-9_-]{2,48}$/.test(x)).slice(0,8):[];
 return Object.freeze({host:record.host.toLowerCase(),type:record.type,
  evidence:Object.freeze(evidence),source:"local-observation",confidence:evidence.length>=2?"corroborated":"unverified"});
}
function create(){
 const records=new Map();
 function observe(input){
  const row=normalize(input);if(!row)return null;
  if(records.has(row.host))records.delete(row.host);
  if(records.size>=MAX)records.delete(records.keys().next().value);
  records.set(row.host,row);return row;
 }
 function lookup(host){return validHost(host)?records.get(host.toLowerCase())||null:null;}
 function clear(){records.clear();}
 function list(){return [...records.values()];}
 return Object.freeze({observe,lookup,clear,list});
}
const API=Object.freeze({create,normalize,validHost});
root.DKProviderIntelligence=API;
if(typeof module!=="undefined")module.exports=API;
})(typeof globalThis!=="undefined"?globalThis:this);
