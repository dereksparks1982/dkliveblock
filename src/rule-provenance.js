/* Active-rule source mapping. Never expose raw matched request URLs,
   private filter text or user-subscription URLs to the dashboard. */
(function(root){"use strict";
const LIMIT=250000;
function clean(value){
 return typeof value==="string"&&value.length>0&&value.length<=80&&
  /^[\p{L}\p{N} (),.+_-]+$/u.test(value)?value:"Unattributed active filter";
}
function create(sections,parse=x=>DKRules.network(x)){
 const keys=new Map();let count=0,truncated=false;
 if(!Array.isArray(sections))return {keys,count,truncated};
 outer:for(const entry of sections){
  if(typeof entry?.text!=="string")continue;
  const source=clean(entry.name);
  for(const line of entry.text.split(/\r?\n/)){
   if(!line||line[0]==="!"||line[0]==="[")continue;
   if(count++>=LIMIT){truncated=true;break outer;}
   let parsed;try{parsed=parse(line);}catch(_){continue;}
   if(!parsed?.key||parsed.badfilter||parsed.special||parsed.removeparam)continue;
   if(!keys.has(parsed.key))keys.set(parsed.key,new Set());
   keys.get(parsed.key).add(source);
  }
 }
 return {keys,count,truncated};
}
function identify(rule,index){
 if(rule?.p==="[User-selected block]")return "User-selected host/type block";
 if(rule?.p==="[Ghostery network filter]")return "Embedded Ghostery filter match";
 if(!rule?.key)return "Unattributed active filter";
 const set=index?.keys?.get(rule.key);
 if(!set?.size)return "Unattributed active filter";
 return set.size>1?"Multiple active filter sources":clean([...set][0]);
}
const api=Object.freeze({clean,create,identify,LIMIT});
root.DKRuleProvenance=api;
if(typeof module!=="undefined")module.exports=api;
})(typeof globalThis!=="undefined"?globalThis:this);
