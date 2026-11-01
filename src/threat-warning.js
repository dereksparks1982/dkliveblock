/* DK Live Block: short-lived, per-tab phishing interstitial grants.
   No URL path, query, fragment, browsing payload or credentials are stored. */
(function(root){"use strict";
const TTL_MS=180000,MAX_TABS=64;
function validNonce(x){return typeof x==="string"&&/^[0-9a-f]{32}$/.test(x);}
function clear(records,id){records.delete(id);}
function read(records,id,nonce,now=Date.now()){
 const r=records.get(id);
 if(!r||!validNonce(nonce)||r.nonce!==nonce)return null;
 if(!Number.isFinite(now)||now<r.created||now>r.expires){
  records.delete(id);return null;
 }
 return {host:r.host,updated:r.updated,created:r.created,expires:r.expires};
}
function issue(records,id,hostname,updated,now=Date.now(),random=root.crypto){
 if(!Number.isSafeInteger(id)||id<0||!root.DKThreatDB.valid(hostname)||
    !Number.isFinite(now)||now<=0||!random||typeof random.getRandomValues!=="function")
  return null;
 for(const [key,r] of records)
  if(!r||now<r.created||now>r.expires)records.delete(key);
 if(records.size>=MAX_TABS)records.delete(records.keys().next().value);
 const bytes=new Uint8Array(16);random.getRandomValues(bytes);
 const nonce=Array.from(bytes,x=>x.toString(16).padStart(2,"0")).join("");
 records.set(id,{nonce,host:hostname,updated:Number.isSafeInteger(updated)&&updated>0?updated:0,
  created:now,expires:now+TTL_MS});
 return nonce;
}
function url(runtime,nonce){
 return validNonce(nonce)&&runtime&&typeof runtime.getURL==="function"?
  runtime.getURL("blocked.html")+"#"+nonce:null;
}
const api=Object.freeze({TTL_MS,MAX_TABS,validNonce,clear,read,issue,url});
root.DKThreatWarning=api;
if(typeof module!=="undefined")module.exports=api;
})(typeof globalThis!=="undefined"?globalThis:this);
