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
// Read-only discovery. Never returns live elements, HTML, text, URLs or IDs.
// Unknown YouTube markup fails closed instead of hiding page infrastructure.
const SELECTORS=Object.freeze({
 masthead:Object.freeze(["ytd-masthead","#masthead"]),
 player:Object.freeze(["#movie_player","ytd-player"]),
 title:Object.freeze(["ytd-watch-metadata #title","h1.ytd-watch-metadata"]),
 actions:Object.freeze(["ytd-menu-renderer.ytd-watch-metadata","#top-level-buttons-computed"]),
 description:Object.freeze(["ytd-text-inline-expander","#description"]),
 comments:Object.freeze(["ytd-comments","#comments"]),
 related:Object.freeze(["#related","ytd-watch-next-secondary-results-renderer"])
});
function discover(doc,raw){
 const empty=Object.freeze({supported:false,ready:false,found:Object.freeze([]),missing:Object.freeze([])});
 if(!watch(raw)||!doc||typeof doc.querySelector!=="function")return empty;
 const found=[],missing=[];
 for(const key of REGIONS){
  let exists=false;
  for(const selector of SELECTORS[key]){
   try{if(doc.querySelector(selector)){exists=true;break;}}
   catch(_){return empty;}
  }
  (exists?found:missing).push(key);
 }
 // The real player is never replaced or moved. If it is not present,
 // Page Architect must not perform any cosmetic modifications.
 const ready=found.includes("player")&&found.includes("masthead");
 return Object.freeze({supported:true,ready,
  found:Object.freeze(found),missing:Object.freeze(missing)});
}
function preview(raw,choices,doc){
 const p=plan(raw,choices),d=discover(doc,raw);
 return Object.freeze({supported:p.supported&&d.supported,
  ready:p.enabled&&d.ready,
  selected:p.regions,
  missing:Object.freeze(d.missing.filter(region=>p.regions.includes(region))),
  reason:!p.enabled?p.reason:!d.ready?"missing-page-foundation":"ready"});
}
const API=Object.freeze({REGIONS,DEFAULT,watch,plan,discover,preview});
root.DKPageArchitect=API;
if(typeof module!=="undefined")module.exports=API;
})(typeof globalThis!=="undefined"?globalThis:this);
