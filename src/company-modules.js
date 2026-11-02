/* DK Live Block company modules: local, factual routing only.
   Vendor ownership is descriptive, NOT proof that any request is an ad.
   Do not capture private content, credentials, messages, or history. */
(function(root){"use strict";
const profiles=Object.freeze({
 meta:Object.freeze({label:"Meta",platforms:Object.freeze(["facebook","instagram","threads","whatsapp"]),
  signals:Object.freeze(["sponsored-label","ad-action-menu","ad-attribution","feed-card","late-dom"]),
  engines:Object.freeze(["facebook-dom"])}),
 youtube:Object.freeze({label:"YouTube",platforms:Object.freeze(["youtube"]),
  signals:Object.freeze(["player-ad-fields","feed-sponsored","playback-health"]),
  engines:Object.freeze(["youtube-feed","youtube-response","adaptive-youtube"])}),
 reddit:Object.freeze({label:"Reddit",platforms:Object.freeze(["reddit"]),signals:Object.freeze(["sponsored-post","sidebar-ad","promoted-badge"]),engines:Object.freeze([])})
});
const domains=Object.freeze({
 facebook:["facebook.com","fb.com","fbcdn.net"],
 instagram:["instagram.com","cdninstagram.com"],
 threads:["threads.net","threads.com"],
 whatsapp:["whatsapp.com","whatsapp.net"],
 youtube:["youtube.com","youtube-nocookie.com","youtu.be","googlevideo.com","ytimg.com"],
 reddit:["reddit.com","redd.it"]
});
function cleanHost(value){
 if(typeof value!=="string"||value.length>253)return "";
 const s=value.toLowerCase().replace(/\.$/,"");
 return /^[a-z0-9.-]+$/.test(s)&&s.split(".").every(x=>x.length>0&&x.length<=63)?s:"";
}
function subdomain(host,domain){return host===domain||host.endsWith("."+domain);}
function platformFor(hostname){
 const host=cleanHost(hostname);if(!host)return null;
 for(const [name,list]of Object.entries(domains))
  if(list.some(domain=>subdomain(host,domain)))return name;
 return null;
}
function companyFor(hostname){
 const platform=platformFor(hostname);
 return platform==="youtube"?"youtube":platform==="reddit"?"reddit":platform&&profiles.meta.platforms.includes(platform)?"meta":null;
}
function profileFor(hostname){
 const company=companyFor(hostname);
 return company?Object.freeze({company,platform:platformFor(hostname),profile:profiles[company]}):null;
}
const API=Object.freeze({profiles,domains,cleanHost,platformFor,companyFor,profileFor});
root.DKCompanyModules=API;
if(typeof module!=="undefined")module.exports=API;
})(typeof globalThis!=="undefined"?globalThis:this);
