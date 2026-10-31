/* DK Live Block: conservative URL tracking parameter cleanup for website navigation. */
(function(g){"use strict";
const TRACKING_KEYS=new Set(["utm_source","utm_medium","utm_campaign","utm_term","utm_content","utm_id","utm_source_platform","utm_creative_format","utm_marketing_tactic","fbclid","gclid","dclid","gbraid","wbraid","msclkid","yclid","ttclid","igshid","mc_cid","mc_eid","_hsenc","_hsmi","vero_conv","vero_id"]);
const SIGNED_KEYS=new Set([
 "signature","sig","x-amz-signature","x-goog-signature","x-amz-credential",
 "x-goog-credential","x-amz-security-token","key-pair-id","policy",
 "samlresponse","samlrequest","relaystate","oauth_token","oauth_verifier",
 "code","state","code_challenge","id_token","access_token",
 "token","auth","expires","x-amz-date","x-goog-date",
 "utm_token","utm_auth","utm_signature","utm_sig","utm_state",
 "utm_code","utm_key","utm_expires","utm_session","utm_nonce",
 "x-amz-algorithm","x-goog-algorithm","x-goog-security-token"
]);
function signedOrAuth(url){
 if(url.username||url.password)return true;
 // Some OAuth/SSO flows deliver authorization state in the fragment,
 // including hash-router callback URLs. Do not alter even unrelated query
 // parameters during these redirects.
 if(/(?:^|[&#?])(?:access_token|id_token|oauth_token|code|state|session_state|samlresponse|relaystate)=/i.test(url.hash||""))
  return true;
 for(const key of url.searchParams.keys())
  if(SIGNED_KEYS.has(key.toLowerCase()))return true;
 return false;
}
function preserveNavigation(raw){
 // A rewrite by ANY filter engine can corrupt a signed query, even when only
 // an unrelated UTM parameter changes. Treat bad or nonweb URLs as protected.
 if(typeof raw!=="string"||raw.length>16000||!/^https?:\/\//i.test(raw))return true;
 try{
  const url=new URL(raw);
  return !["http:","https:"].includes(url.protocol)||signedOrAuth(url);
 }catch(_){return true;}
}
function stripTrackingParameters(raw){
 if(typeof raw!=="string"||raw.length>16000||!/^https?:\/\//i.test(raw))return null;
 try{
  const url=new URL(raw);if(!url.search||signedOrAuth(url))return null;
  let changed=false;
  for(const key of [...url.searchParams.keys()])if(TRACKING_KEYS.has(key.toLowerCase())){url.searchParams.delete(key);changed=true;}
  return changed?url.toString():null;
 }catch(_){return null;}
}
g.DKPrivacy={stripTrackingParameters,TRACKING_KEYS,SIGNED_KEYS,signedOrAuth,preserveNavigation};
if(typeof module!=="undefined")module.exports=g.DKPrivacy;
})(typeof globalThis!=="undefined"?globalThis:this);
