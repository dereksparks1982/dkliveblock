/* Coarse diagnostics for blocked YouTube requests. No URL paths,
   player IDs, account data, filter text or raw request payloads. */
(function(root){"use strict";
const Model=root.DKSiteDashboardModel||typeof require==="function"&&require("./site-dashboard-model.js");
const AD_HOSTS=["doubleclick.net","googlesyndication.com","googleadservices.com"];
function sub(host,domain){return host===domain||host.endsWith("."+domain);}
function isYouTube(site){return Model.hostname(site)&&
 (sub(site,"youtube.com")||sub(site,"youtube-nocookie.com")||sub(site,"youtu.be"));}
function summarize(snapshot){
 if(!snapshot?.ok||!isYouTube(snapshot.site))
  return {applicable:false};
 const events=Model.requestRows(snapshot);
 let firstPartyXHR=0,firstPartyImage=0,mediaBlocked=0,advertisingInfrastructure=0,other=0;
 const sources=new Set();
 for(const row of events){
  if(AD_HOSTS.some(x=>sub(row.host,x))){advertisingInfrastructure++;continue;}
  if(row.type==="media"){mediaBlocked++;continue;}
  if(sub(row.host,"youtube.com")||sub(row.host,"youtube-nocookie.com")){
   if(row.type==="xmlhttprequest"){firstPartyXHR++;sources.add(row.ruleEvidence?.subscription||"Unattributed active filter");}
   else if(row.type==="image"||row.type==="imageset")firstPartyImage++;
   else other++;
  }else other++;
 }
 const sortedSources=[...sources].filter(x=>typeof x==="string"&&x.length<=80)
  .slice(0,8).sort();
 return {applicable:true,recorded:events.length,firstPartyXHR,firstPartyImage,
  mediaBlocked,advertisingInfrastructure,other,
  firstPartySources:sortedSources,
  interpretation:firstPartyXHR>0?
   "Repeated first-party YouTube background requests were blocked. Their purpose is unknown; they could include playback or advertising metadata. Inspect the matched filter source before changing rules.":
   mediaBlocked>0?
   "One or more media requests were blocked; playback compatibility needs direct testing.":
   "No blocked first-party background requests or media streams were recorded. This does not prove the player is healthy or ads are blocked."};
}
const API=Object.freeze({isYouTube,summarize});
root.DKYouTubeTriage=API;
if(typeof module!=="undefined")module.exports=API;
})(typeof globalThis!=="undefined"?globalThis:this);
