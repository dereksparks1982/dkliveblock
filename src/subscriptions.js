/* DK Live Block: validation for optional user-supplied filter list URLs. */
(function(root){"use strict";
function validate(values){
 if(!Array.isArray(values))return {error:"Subscription list must be an array."};
 if(values.length>5)return {error:"Maximum five custom subscriptions."};
 const urls=[];
 for(const raw of values){
  if(typeof raw!=="string"||raw.length>2048)return {error:"Invalid subscription URL."};
  const value=raw.trim();if(!value)continue;
  try{
   const parsed=new URL(value);
   if(parsed.protocol!=="https:"||!parsed.hostname||parsed.username||parsed.password||parsed.hash)
    return {error:"Custom subscriptions require an HTTPS URL without credentials or fragments."};
   const h=parsed.hostname.toLowerCase();
   if(h==="localhost"||h.endsWith(".local")||h.endsWith(".internal")||h==="127.0.0.1"||h==="::1")
    return {error:"Local-network subscriptions are not supported."};
   if(!urls.includes(parsed.href))urls.push(parsed.href);
  }catch(_){return {error:"Invalid subscription URL."};}
 }
 return {urls};
}
root.DKSubscriptions={validate};
if(typeof module!=="undefined")module.exports=root.DKSubscriptions;
})(typeof globalThis!=="undefined"?globalThis:this);
