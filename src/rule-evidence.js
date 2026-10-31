/* Privacy-preserving explanation of local filtering evidence.
   Exact URL paths/query strings and arbitrary custom regular expressions stay private. */
(function(root){"use strict";
const SIMPLE=/^\|\|([a-z0-9](?:[a-z0-9.-]{0,251}[a-z0-9])?)\^$/i;
function explain(value){
 const pattern=typeof value==="string"?value.trim():"";
 if(pattern==="[Ghostery network filter]")
  return {source:"Embedded Ghostery network filter",pattern:"Rule text not exposed by embedded matcher"};
 const match=SIMPLE.exec(pattern);
 if(match&&match[1].includes(".")&&!match[1].includes("..")&&
    match[1].split(".").every(part=>part.length<=63&&!part.startsWith("-")&&!part.endsWith("-")))
  return {source:"Native network filter (original list not determined)",pattern:pattern.toLowerCase()};
 if(!pattern)return {source:"Unknown filtering rule",pattern:"No matched pattern was recorded"};
 return {source:"Native network filter (original list not determined)",
  pattern:"Matching pattern withheld: may contain a URL path or private parameter"};
}
const api=Object.freeze({explain});
root.DKRuleEvidence=api;
if(typeof module!=="undefined")module.exports=api;
})(typeof globalThis!=="undefined"?globalThis:this);
