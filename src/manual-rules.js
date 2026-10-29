/* DK Live Block: safe builder for user-initiated site exceptions. */
(function(root){"use strict";
function validHost(input){
 if(typeof input!=="string"||!input||input.length>253||input!==input.toLowerCase())return false;
 const labels=input.split(".");
 return labels.length>=2&&labels.every(label=>/^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/.test(label));
}
function allowHostOnSite(site,requestHost){
 if(!validHost(site)||!validHost(requestHost))return null;
 return "@@||"+requestHost+"^$domain="+site;
}
function listSiteExceptions(text,site){
 if(!validHost(site)||typeof text!=="string")return [];
 const prefix="@@||",suffix="^$domain="+site;
 const hosts=new Set();
 for(const line of text.split(/\r?\n/)){
  const value=line.trim();
  if(!value.startsWith(prefix)||!value.endsWith(suffix))continue;
  const h=value.slice(prefix.length,-suffix.length);
  if(validHost(h)&&value===allowHostOnSite(site,h))hosts.add(h);
 }
 return [...hosts].sort();
}
function removeSiteException(text,site,requestHost){
 const line=allowHostOnSite(site,requestHost);
 if(!line||typeof text!=="string")return {error:"Invalid site or request hostname."};
 const entries=text.split("\n"),next=entries.filter(x=>x.trim()!==line);
 if(next.length===entries.length)return {error:"No matching site exception."};
 return {text:next.join("\n"),removed:entries.length-next.length};
}
root.DKManualRules={validHost,allowHostOnSite,listSiteExceptions,removeSiteException};
if(typeof module!=="undefined")module.exports=root.DKManualRules;
})(typeof globalThis!=="undefined"?globalThis:this);
