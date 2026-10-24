/* DK Live Block: conservative URL tracking parameter cleanup for website navigation. */
(function(g){"use strict";
const TRACKING_KEYS=new Set(["utm_source","utm_medium","utm_campaign","utm_term","utm_content","utm_id","utm_source_platform","utm_creative_format","utm_marketing_tactic","fbclid","gclid","dclid","gbraid","wbraid","msclkid","yclid","ttclid","igshid","mc_cid","mc_eid","_hsenc","_hsmi","vero_conv","vero_id"]);
function stripTrackingParameters(raw){
 if(typeof raw!=="string"||raw.length>16000||!/^https?:\/\//i.test(raw))return null;
 try{
  const url=new URL(raw);if(!url.search)return null;
  let changed=false;
  for(const key of [...url.searchParams.keys()])if(TRACKING_KEYS.has(key.toLowerCase())){url.searchParams.delete(key);changed=true;}
  return changed?url.toString():null;
 }catch(_){return null;}
}
g.DKPrivacy={stripTrackingParameters,TRACKING_KEYS};
if(typeof module!=="undefined")module.exports=g.DKPrivacy;
})(typeof globalThis!=="undefined"?globalThis:this);
