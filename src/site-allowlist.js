/* DK Live Block Build 46: one durable site allowlist, backed by settings.paused.
 * A stored hostname covers itself and its subdomains. Never store URL paths,
 * query strings, credentials or wildcard filter rules here. */
(function(root){"use strict";
const LIMIT=500;
function host(value){
 if(typeof value!=="string")return "";
 const raw=value.trim();
 if(!raw||raw.length>2100||/\s/.test(raw))return "";
 try{
  const candidate=/^[a-z][a-z0-9+.-]*:\/\//i.test(raw)?raw:"https://"+raw;
  const u=new URL(candidate);
  if(!["http:","https:"].includes(u.protocol)||u.username||u.password)return "";
  const h=u.hostname.toLowerCase().replace(/\.$/,"");
  return typeof DKManualRules!=="undefined"&&DKManualRules.validHost(h)?h:"";
 }catch(_){return "";}
}
function normalize(saved){
 if(!Array.isArray(saved))return [];
 const out=[];
 for(const h of saved){
  if(typeof h!=="string"||!DKManualRules.validHost(h)||out.includes(h))continue;
  out.push(h);
  if(out.length>=LIMIT)break;
 }
 return out;
}
function match(saved,target){
 if(!DKManualRules.validHost(target))return "";
 const matches=normalize(saved).filter(h=>target===h||target.endsWith("."+h));
 return matches.sort((a,b)=>b.length-a.length)[0]||"";
}
function add(saved,input){
 const h=host(input);
 if(!h)return {error:"Enter a valid http(s) website or hostname."};
 const entries=normalize(saved),matched=match(entries,h);
 if(matched)return {ok:true,entries,matched,unchanged:true};
 if(entries.length>=LIMIT)return {error:"The allowed websites list is full (500 entries)."};
 return {ok:true,entries:[...entries,h],matched:h,unchanged:false};
}
function remove(saved,input){
 const h=host(input);if(!h)return {error:"Invalid website hostname."};
 const entries=normalize(saved),next=entries.filter(x=>x!==h);
 if(next.length===entries.length)return {error:"Website is not in the allowlist."};
 return {ok:true,entries:next,removed:h};
}
function resume(saved,target){
 if(!DKManualRules.validHost(target))return {error:"Invalid website hostname."};
 const entries=normalize(saved),matching=entries.filter(h=>target===h||target.endsWith("."+h));
 if(!matching.length)return {error:"This website is not allowlisted."};
 return {ok:true,entries:entries.filter(h=>!matching.includes(h)),removed:matching};
}
const api=Object.freeze({LIMIT,host,normalize,match,add,remove,resume});
root.DKSiteAllowlist=api;
if(typeof module!=="undefined")module.exports=api;
})(typeof globalThis!=="undefined"?globalThis:this);