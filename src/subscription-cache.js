/* DK Live Block: conditional caching for filter subscriptions, no executable lists. */
(function(root){"use strict";
function safeTag(value){
 return typeof value==="string"&&value.length>=3&&value.length<=150&&!/[\r\n]/.test(value)&&/^(?:W\/)?"[^"]*"$/.test(value)?value:"";
}
function safeDate(value){
 if(typeof value!=="string"||value.length>90||!value||/[\r\n]/.test(value))return "";
 const parsed=Date.parse(value);
 return Number.isFinite(parsed)?new Date(parsed).toUTCString():"";
}
function headers(previous){
 if(!previous||typeof previous.text!=="string"||!previous.text)return {};
 const next={};const etag=safeTag(previous.etag),modified=safeDate(previous.lastModified);
 if(etag)next["If-None-Match"]=etag;
 else if(modified)next["If-Modified-Since"]=modified;
 return next;
}
function metadata(response,previous={},unchanged=false){
 const get=name=>{try{return response?.headers?.get?.(name)||"";}catch(_){return "";}};
 const etag=safeTag(get("etag"))||(unchanged?safeTag(previous.etag):"");
 const lastModified=safeDate(get("last-modified"))||(unchanged?safeDate(previous.lastModified):"");
 return {etag,lastModified};
}
function store(previous,result,now){
 if(result.unchanged&&!previous?.text)throw Error("Server returned not-modified without a cached filter list");
 const base=result.unchanged?previous:{text:result.text,updated:now};
 return {...base,...result.metadata,checked:now};
}
root.DKSubscriptionCache={safeTag,safeDate,headers,metadata,store};
if(typeof module!=="undefined")module.exports=root.DKSubscriptionCache;
})(typeof globalThis!=="undefined"?globalThis:this);
