/* DK Live Block: secure user filter-list subscriptions. */
(function(root){"use strict";
function publicHost(hostname){
 const h=hostname.toLowerCase().replace(/\.$/,"");
 if(!h||!h.includes(".")||h.startsWith("[")||/^[\d.]+$/.test(h))return false;
 const local=["localhost","local","internal","lan","home","home.arpa","invalid"];
 return !local.some(x=>h===x||h.endsWith("."+x));
}
function validate(values){
 if(!Array.isArray(values))return {error:"Subscription list must be an array."};
 if(values.length>5)return {error:"Maximum five custom subscriptions."};
 const urls=[];
 for(const raw of values){
  if(typeof raw!=="string"||raw.length>2048)return {error:"Invalid subscription URL."};
  const value=raw.trim();if(!value)continue;
  try{
   const parsed=new URL(value);
   if(parsed.protocol!=="https:"||!publicHost(parsed.hostname)||parsed.username||parsed.password||parsed.hash)
    return {error:"Custom subscriptions require public HTTPS URLs without credentials or fragments."};
   if(!urls.includes(parsed.href))urls.push(parsed.href);
  }catch(_){return {error:"Invalid subscription URL."};}
 }
 return {urls};
}
root.DKSubscriptions={validate,publicHost};
if(typeof module!=="undefined")module.exports=root.DKSubscriptions;
})(typeof globalThis!=="undefined"?globalThis:this);
