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
function grantOnce(permits,tabId,now=Date.now()){
 if(!Number.isInteger(tabId)||tabId<0)return false;
 permits.set(tabId,now+GRACE_MS);return true;
}
function consumeOnce(permits,tabId,now=Date.now()){
 const expires=permits.get(tabId);
 if(!Number.isFinite(expires))return false;
 permits.delete(tabId);
 return now<=expires;
}
function revoke(permits,tabId){permits.delete(tabId);}
function claim(claims,newTabId,sourceTabId,now=Date.now()){
 if(!Number.isInteger(newTabId)||newTabId<0||
    !Number.isInteger(sourceTabId)||sourceTabId<0||sourceTabId===newTabId)return false;
 for(const [key,entry] of claims){
  if(now-entry.when>CLAIM_MS)claims.delete(key);
 }
 if(claims.has(newTabId))return false;
 claims.set(newTabId,{sourceTabId,when:now});
 while(claims.size>MAX_CLAIMS)claims.delete(claims.keys().next().value);
 return true;
}
const API=Object.freeze({protectedHost,shouldBlock,grantOnce,consumeOnce,revoke,claim,
 GRACE_MS,CLAIM_MS,MAX_CLAIMS});
root.DKPopupTrap=API;
if(typeof module!=="undefined")module.exports=API;
})(typeof globalThis!=="undefined"?globalThis:this);
