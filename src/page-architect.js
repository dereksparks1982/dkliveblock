/* DK Page Architect, phase 1: offline planning only. No DOM mutation.
   The real YouTube player, login, search and accessibility controls remain
   owned by their page; clean view must never fabricate player internals. */
(function(root){"use strict";
const REGIONS=Object.freeze(["masthead","player","title","actions","description","comments","related"]);
const DEFAULT=Object.freeze({masthead:true,player:true,title:true,actions:true,
 description:true,comments:false,related:false});
const KEYS=new Set(REGIONS);
function watch(raw){
 if(typeof raw!=="string"||raw.length>4096)return false;
 try{
  const u=new URL(raw);
  if(u.protocol!=="https:"||u.username||u.password||u.port||
   !["youtube.com","www.youtube.com","m.youtube.com"].includes(u.hostname)||
   u.pathname!=="/watch")return false;
  const ids=u.searchParams.getAll("v");
  return ids.length===1&&/^[a-zA-Z0-9_-]{11}$/.test(ids[0]);
 }catch(_){return false;}
}
function plan(raw,choices){
 if(!watch(raw))return Object.freeze({supported:false,enabled:false,regions:Object.freeze([]),
  reason:"unsupported-page"});
 if(choices===null||typeof choices!=="object"||Array.isArray(choices))
  return Object.freeze({supported:true,enabled:false,regions:Object.freeze([]),
   reason:"explicit-choice-required"});
 for(const key of Object.keys(choices))
  if(!KEYS.has(key)||typeof choices[key]!=="boolean")
   return Object.freeze({supported:true,enabled:false,regions:Object.freeze([]),
    reason:"invalid-choice"});
 const selection={...DEFAULT,...choices};
 // The player is mandatory and can never be replaced, reparented or hidden.
 selection.player=true;
 return Object.freeze({supported:true,enabled:true,
  regions:Object.freeze(REGIONS.filter(key=>selection[key])),reason:"ready"});
}
const API=Object.freeze({REGIONS,DEFAULT,watch,plan});
root.DKPageArchitect=API;
if(typeof module!=="undefined")module.exports=API;
})(typeof globalThis!=="undefined"?globalThis:this);
