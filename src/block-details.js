/* DK Live Block: observed evidence vs research hints; never infer malware from a block. */
(function(root){"use strict";
const KNOWN=Object.freeze([
 ["youtube.com","Google LLC (YouTube)","Video hosting and playback infrastructure; this particular request's purpose cannot be verified from its hostname","https://www.youtube.com/about/"],
 ["google.com","Google LLC","Google service resources; the purpose of this particular image or data request cannot be verified from its hostname","https://about.google/"],
 ["doubleclick.net","Google LLC","Online advertising delivery and measurement","https://www.google.com/"],
 ["googlesyndication.com","Google LLC","Advertising placement and delivery","https://www.google.com/"],
 ["googleadservices.com","Google LLC","Advertising links and measurement","https://www.google.com/"],
 ["google-analytics.com","Google LLC","Site analytics and audience measurement","https://www.google.com/"],
 ["adsrvr.org","The Trade Desk","Programmatic advertising delivery and measurement","https://www.thetradedesk.com/"],
 ["adnxs.com","Microsoft (Xandr)","Programmatic advertising infrastructure","https://www.microsoft.com/"],
 ["criteo.com","Criteo","Advertising retargeting and measurement","https://www.criteo.com/"],
 ["taboola.com","Taboola","Sponsored recommendations and advertisements","https://www.taboola.com/"],
 ["outbrain.com","Outbrain","Sponsored content recommendations","https://www.outbrain.com/"],
 ["scorecardresearch.com","Comscore","Audience and website measurement","https://www.comscore.com/"],
 ["facebook.net","Meta","Social advertising and analytics infrastructure","https://about.meta.com/"]
]);
function valid(host){return typeof host==="string"&&host.length<=253&&/^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)*$/.test(host);}
function summary(host,type,site,ruleType){
 const name=valid(host)?host:"";
 const item=KNOWN.find(row=>name===row[0]||name.endsWith("."+row[0]));
 const resource={
  script:"JavaScript",image:"Image",imageset:"Image",stylesheet:"Stylesheet",
  xmlhttprequest:"Background data",sub_frame:"Embedded frame",media:"Audio or video",
  font:"Web font",websocket:"WebSocket",ping:"Ping",beacon:"Beacon",popup:"New tab/window",
  other:"Other network request",object:"Embedded content"
 }[type]||"Unknown resource";
 const source=valid(site)?site:"";
 const third=source&&name?name!==source&&!name.endsWith("."+source)&&!source.endsWith("."+name):null;
 const purpose=item?item[2]:"Not verified from the network log; this may be advertising, analytics, essential content or something else.";
 const importance=item&&["youtube.com","google.com"].includes(item[0])?
  "Not established. This hostname serves essential and optional resources; an image block may be a false positive.":
  item?"Likely nonessential advertising/analytics traffic; some site functionality may still depend on it.":
  ["media","font","stylesheet","script","xmlhttprequest"].includes(type)?
  "Could affect website functionality. Blocking alone does not establish that it is nonessential.":
  "Not established. A blocked request is not proof of danger or malicious behavior.";
 const why=ruleType==="popup"?"Blocked by a popup/new-tab rule or protection policy.":
  ruleType==="filter"?"Matched a locally applied network filtering rule.":
  "Blocked by the extension's active filtering engine; the exact filter/list may not be available.";
 return {host:name,resource,thirdParty:third,operator:item?item[1]:"Unverified",
  operatorEvidence:item?"Curated service-operator reference, not proof of the domain's legal registrant.":"No trusted local operator mapping for this hostname.",
  operatorUrl:item?item[3]:"",purpose,importance,why,
  access:"Observed a browser network request. This does not imply access to your computer, files, camera, microphone or passwords."};
}
function researchLinks(host,registeredDomain=host){
 if(!valid(host))return [];
 const domain=encodeURIComponent(host);
 const registration=encodeURIComponent(valid(registeredDomain)?registeredDomain:host);
 return [
  {label:"Domain registration (RDAP)",url:"https://rdap.org/domain/"+registration},
  {label:"ICANN Lookup",url:"https://lookup.icann.org/en/lookup"},
  {label:"VirusTotal domain report",url:"https://www.virustotal.com/gui/domain/"+domain+"/details"},
  {label:"urlscan.io domain activity",url:"https://urlscan.io/domain/"+domain}
 ];
}
const api=Object.freeze({valid,summary,researchLinks});
root.DKBlockDetails=api;
if(typeof module!=="undefined")module.exports=api;
})(typeof globalThis!=="undefined"?globalThis:this);
