/* DK Live Block Build 36: strict source-tab popup/popunder protection.
   No URL patterns supplied by a site, no external lookups or injected scripts.
   This intentionally also stops user-clicked new tabs originating from a
   protected site unless the user explicitly grants one temporary opening. */
(function(root){"use strict";
const GRACE_MS=15000, CLAIM_MS=30000, MAX_CLAIMS=256;
const SITE=/^(?:thepiratebay\d*|1337x{1,2})\.[a-z]{2,12}$/;
function protectedHost(value){
 if(typeof value!=="string")return false;
 const host=value.toLowerCase().replace(/\.$/,"");
 if(!/^[a-z0-9.-]{4,253}$/.test(host)||host.includes(".."))return false;
 const labels=host.split(".");
 for(let i=0;i<labels.length-1;i++){
  const domain=labels.slice(i).join(".");
  // Require the candidate to be the actual registered-looking host,
  // not arbitrary subdomains of an unrelated host.
  if(SITE.test(domain))return true;
 }
 return false;
}
function shouldBlock(sourceHost,enabled,siteActive){
 return enabled===true&&siteActive===true&&protectedHost(sourceHost);
}
function validClock(t,duration=0){
 return Number.isSafeInteger(t)&&t>=0&&t<=Number.MAX_SAFE_INTEGER-duration;
}
function grantOnce(permits,tabId,now=Date.now()){
 if(!Number.isInteger(tabId)||tabId<0||!validClock(now,GRACE_MS))return false;
 permits.set(tabId,now+GRACE_MS);return true;
}
function consumeOnce(permits,tabId,now=Date.now()){
 const expires=permits.get(tabId);
 if(!Number.isInteger(tabId)||tabId<0||!validClock(now)||!validClock(expires)){
  permits.delete(tabId);return false;
 }
 permits.delete(tabId);
 return now>=expires-GRACE_MS&&now<=expires;
}
function permitActive(permits,tabId,now=Date.now()){
 const expires=permits.get(tabId);
 if(!Number.isInteger(tabId)||tabId<0||!validClock(now)||
    !validClock(expires)||now<expires-GRACE_MS||now>expires){
  permits.delete(tabId);return false;
 }
 return true;
}
function revoke(permits,tabId){permits.delete(tabId);}
function claim(claims,newTabId,sourceTabId,now=Date.now()){
 if(!Number.isInteger(newTabId)||newTabId<0||
    !Number.isInteger(sourceTabId)||sourceTabId<0||sourceTabId===newTabId||
    !validClock(now,CLAIM_MS))return false;
 for(const [key,entry] of claims){
  if(!Number.isFinite(entry?.when)||now<entry.when||now-entry.when>CLAIM_MS)claims.delete(key);
 }
 if(claims.has(newTabId))return false;
 claims.set(newTabId,{sourceTabId,when:now});
 while(claims.size>MAX_CLAIMS)claims.delete(claims.keys().next().value);
 return true;
}
function claimActive(claims,newTabId,now=Date.now()){
 const entry=claims.get(newTabId);
 if(!entry)return false;
 if(!Number.isInteger(newTabId)||newTabId<0||
    !Number.isInteger(entry.sourceTabId)||entry.sourceTabId<0||
    entry.sourceTabId===newTabId||!validClock(now)||
    !validClock(entry.when)||now<entry.when||now-entry.when>CLAIM_MS){
  claims.delete(newTabId);return false;
 }
 return true;
}
function allowTab(allowed,newTabId,now=Date.now()){
 if(!Number.isInteger(newTabId)||newTabId<0||!validClock(now,CLAIM_MS))
  return false;
 allowed.set(newTabId,{since:now,until:now+CLAIM_MS});
 while(allowed.size>MAX_CLAIMS)allowed.delete(allowed.keys().next().value);
 return true;
}
function tabAllowed(allowed,newTabId,now=Date.now()){
 const entry=allowed.get(newTabId);
 if(!entry)return false;
 if(!Number.isInteger(newTabId)||newTabId<0||
    !validClock(now)||!validClock(entry.since,CLAIM_MS)||
    entry.until!==entry.since+CLAIM_MS||
    now<entry.since||now>entry.until){
  allowed.delete(newTabId);return false;
 }
 return true;
}

// Agent Nesty 4: source-linked foreign popup sentinel. No destination ad list.
const NESTY_4=Object.freeze({id:"agent_nesty_4",title:"Agent Nesty 4",status:"armed",
 role:"Source-linked unwanted new-tab navigation"});
const NESTY_TTL_MS=15000,MAX_NESTY_LINKS=256;
function xnxxHost(host){
 if(typeof host!=="string")return false;
 const h=host.toLowerCase().replace(/\.$/,"");
 return h==="xnxx.com"||h.endsWith(".xnxx.com");
}
function nestyDestination(url){
 if(typeof url!=="string"||url.length>4096)return "unknown";
 try{
  const u=new URL(url);
  if(!["http:","https:"].includes(u.protocol)||u.username||u.password)return "unknown";
  return xnxxHost(u.hostname)?"same-site":"foreign";
 }catch(_){return "unknown";}
}
function nestyRead(links,child,now=Date.now()){
 const row=links?.get?.(child);
 if(!row)return null;
 if(!Number.isSafeInteger(child)||child<0||!validClock(now,NESTY_TTL_MS)||
  !validClock(row.when,NESTY_TTL_MS)||now<row.when||now-row.when>NESTY_TTL_MS||
  !Number.isSafeInteger(row.source)||row.source<0||row.source===child||!xnxxHost(row.site)){
  links.delete(child);return null;
 }
 return row;
}
function nestyTrack(links,child,source,site,now=Date.now()){
 if(!links?.set||!links?.delete||!Number.isSafeInteger(child)||child<0||
  !Number.isSafeInteger(source)||source<0||source===child||!xnxxHost(site)||
  !validClock(now,NESTY_TTL_MS))return false;
 for(const id of links.keys())nestyRead(links,id,now);
 const prior=nestyRead(links,child,now),clean=site.toLowerCase().replace(/\.$/,"");
 if(prior)return prior.source===source&&prior.site===clean;
 if(links.size>=MAX_NESTY_LINKS)links.delete(links.keys().next().value);
 links.set(child,{source,site:clean,when:now});return true;
}
function nestyCandidate(links,child,url,sourceSite,enabled,now=Date.now()){
 const row=nestyRead(links,child,now);
 return !!row&&enabled===true&&xnxxHost(sourceSite)&&
  row.site===sourceSite.toLowerCase().replace(/\.$/,"")&&nestyDestination(url)==="foreign";
}
function nestyClear(links,tab){
 links?.delete?.(tab);
 if(!Number.isSafeInteger(tab))return;
 for(const [id,row] of links||[])if(row?.source===tab)links.delete(id);
}

const API=Object.freeze({NESTY_4,xnxxHost,nestyDestination,nestyTrack,nestyRead,nestyCandidate,nestyClear,
 protectedHost,shouldBlock,grantOnce,consumeOnce,
 permitActive,revoke,claim,claimActive,allowTab,tabAllowed,
 GRACE_MS,CLAIM_MS,MAX_CLAIMS});
root.DKPopupTrap=API;
if(typeof module!=="undefined")module.exports=API;
})(typeof globalThis!=="undefined"?globalThis:this);
