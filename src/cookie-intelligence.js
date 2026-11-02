/* DK Live Block cookie intelligence and decisions (foundation).
   Never store cookie values or infer a vendor/purpose from a name or domain.
   No browser.cookies access or network interception in this module. */
(function(root){"use strict";
const MAX_OBSERVATIONS=300,MAX_DECISIONS=300;
const ACTIONS=new Set(["allow","block"]);
const SOURCES=new Set(["http-response","browser-change","existing-cookie","unknown"]);
const HOST=/^[a-z0-9.-]{1,253}$/i;
function validHost(value){
 if(typeof value!=="string"||!HOST.test(value)||!value.includes(".")||
  value.includes(".."))return false;
 return value.split(".").every(label=>label.length<=63&&
  /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/i.test(label));
}
function cleanHost(value){
 const s=String(value||"").replace(/^\./,"").toLowerCase();
 return validHost(s)?s:"";
}
function validName(value){
 return typeof value==="string"&&value.length>0&&value.length<=256&&
  !/[\x00-\x20\x7f;=]/.test(value);
}
function key(site,domain,name){return JSON.stringify([site,domain,name]);}
function cookieMetadata(input){
 if(!input||typeof input!=="object")return null;
 const domain=cleanHost(input.domain),name=input.name;
 if(!domain||!validName(name))return null;
 const source=SOURCES.has(input.source)?input.source:"unknown";
 const sameSite=["no_restriction","lax","strict","unspecified"].includes(input.sameSite)?
  input.sameSite:"unknown";
 return Object.freeze({
  domain,name,path:typeof input.path==="string"&&input.path.startsWith("/")?
    input.path.slice(0,256):"/",
  secure:input.secure===true,httpOnly:input.httpOnly===true,
  sameSite,session:input.session===true,
  expiration:Number.isFinite(input.expirationDate)?Math.max(0,Math.trunc(input.expirationDate)):null,
  partitioned:input.partitioned===true,
  source,purpose:"unknown",owner:"unverified",
  // Explicitly omit value, header text, cookie IDs, full URLs and user profile.
 });
}
function create(){
 const observations=new Map(),decisions=new Map();
 function observe(entry){
  const row=cookieMetadata(entry);if(!row)return null;
  const eventKey=key(row.domain,row.path,row.name);
  if(observations.has(eventKey))observations.delete(eventKey);
  if(observations.size>=MAX_OBSERVATIONS)observations.delete(observations.keys().next().value);
  observations.set(eventKey,row);return row;
 }
 function decide(entry){
  const site=cleanHost(entry?.site),domain=cleanHost(entry?.domain),name=entry?.name;
  if(!site||!domain||!validName(name)||!ACTIONS.has(entry?.action))return false;
  const k=key(site,domain,name);
  if(decisions.has(k))decisions.delete(k);
  if(decisions.size>=MAX_DECISIONS)decisions.delete(decisions.keys().next().value);
  decisions.set(k,Object.freeze({site,domain,name,action:entry.action}));
  return true;
 }
 function choice(site,domain,name){
  const s=cleanHost(site),d=cleanHost(domain);
  if(!s||!d||!validName(name))return null;
  return decisions.get(key(s,d,name))?.action||null;
 }
 function revoke(site,domain,name){
  const s=cleanHost(site),d=cleanHost(domain);
  return !!(s&&d&&validName(name)&&decisions.delete(key(s,d,name)));
 }
 function listObservations(){return [...observations.values()];}
 function listDecisions(){return [...decisions.values()];}
 function clearObservations(){observations.clear();}
 function clearDecisions(){decisions.clear();}
 return Object.freeze({observe,decide,choice,revoke,listObservations,listDecisions,
  clearObservations,clearDecisions});
}
const API=Object.freeze({create,cookieMetadata,cleanHost,validName});
root.DKCookieIntelligence=API;
if(typeof module!=="undefined")module.exports=API;
})(typeof globalThis!=="undefined"?globalThis:this);
