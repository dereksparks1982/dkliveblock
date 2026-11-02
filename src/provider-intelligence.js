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
  const previous=records.get(row.host);
  if(previous)records.delete(row.host);
  if(records.size>=MAX)records.delete(records.keys().next().value);
  const blocked=row.evidence.includes("request_blocked");
  const allowed=row.evidence.includes("request_allowed");
  // Aggregate only counts; never preserve request IDs, URLs or page content.
  const aggregate=Object.freeze({...row,
   allowed:Math.min(100000,(previous?.allowed||0)+(allowed?1:0)),
   blocked:Math.min(100000,(previous?.blocked||0)+(blocked?1:0)),
   confidence:row.type==="unknown"?"unverified":row.confidence});
  records.set(row.host,aggregate);return aggregate;
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
