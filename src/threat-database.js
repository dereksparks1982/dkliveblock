/* DK Live Block: self-contained local threat-intelligence matching.
   Remote feeds contain DOMAIN DATA ONLY, never scripts or filtering code.
   A listing is sourced phishing intelligence, not an ownership verdict. */
(function(root){"use strict";
const SOURCE=Object.freeze({
 id:"phishing-army",name:"Phishing Army",category:"phishing",
 url:"https://phishing.army/download/phishing-army-domains.txt",
 information:"https://phishing.army/blocking-policy/",
 licensing:"https://phishing.army/license/"
});
const MAX_BYTES=12000000,MAX_DOMAINS=250000,MIN_DOMAINS=50,MAX_OVERRIDES=250;
const AGE_MS=86400000;
const DEMO=new Set(["amiprotected.it","www.amiprotected.it"]);
function valid(host){
 if(typeof host!=="string"||host.length>253||host.length<4||
    host!==host.toLowerCase()||!host.includes(".")||host.endsWith(".")||
    /[\s/@:?#\\]/.test(host)||/^(?:\d+\.){3}\d+$/.test(host))return false;
 const labels=host.split(".");
 if(labels.length<2||labels.some(s=>s.length<1||s.length>63||
     !/^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/.test(s)))return false;
 if(["local","localhost","lan","internal","test","invalid","example","onion","home"].includes(labels.at(-1)))return false;
 return true;
}
function overrides(input){
 if(!Array.isArray(input)||input.length>MAX_OVERRIDES||
    input.some(x=>typeof x!=="string"||!valid(x)))return null;
 return [...new Set(input)];
}
function parse(text,minimum=MIN_DOMAINS){
 if(typeof text!=="string"||!text||text.length>MAX_BYTES||/[\u0000]/.test(text))
  return {error:"Threat feed missing, oversized, or invalid."};
 const lines=text.split(/\r?\n/),hosts=new Set();
 if(lines.length>MAX_DOMAINS*2+2000)return {error:"Threat feed has too many lines."};
 let invalid=0,considered=0;
 for(const raw of lines){
  const line=raw.trim().toLowerCase();
  if(!line||line.startsWith("#")||line.startsWith("!"))continue;
  considered++;
  if(!valid(line)){
   invalid++;if(invalid>50)return {error:"Threat feed contains too many invalid entries."};
   continue;
  }
  if(!DEMO.has(line))hosts.add(line);
  if(hosts.size>MAX_DOMAINS)return {error:"Threat feed exceeds maximum domain count."};
 }
 if(considered===0||hosts.size<minimum||invalid>Math.max(3,Math.floor(considered*0.01)))
  return {error:"Threat feed is too small or malformed."};
 return {hosts,count:hosts.size};
}
function restore(cache,now=Date.now()){
 if(!cache||typeof cache!=="object"||!Number.isSafeInteger(cache.updated)||
    cache.updated<=0||cache.updated>now+3600000)return {hosts:new Set(),updated:0,count:0};
 const p=parse(cache.text);
 if(p.error)return {hosts:new Set(),updated:0,count:0};
 return {hosts:p.hosts,updated:cache.updated,count:p.count};
}
function shouldReplace(previous,next){
 const prior=previous?.count||0;
 if(!next?.hosts||!Number.isSafeInteger(next.count)||next.count<MIN_DOMAINS)return false;
 // Keep last-good coverage on suspicious large drops or malformed responses.
 if(prior>=200&&next.count<Math.floor(prior*0.40))return false;
 return true;
}
function match(db,host,exceptions=[]){
 if(!db||!db.hosts||!valid(host)||exceptions.includes(host))return null;
 // Exact hostname only. Never widen a tenant entry to a shared hosting root.
 if(db.hosts.has(host))return {host,category:SOURCE.category,source:SOURCE.name,
  sourceUrl:SOURCE.information,updated:db.updated};
 return null;
}
function status(db,enabled,overrideCount=0,now=Date.now()){
 const updated=Number.isSafeInteger(db?.updated)?db.updated:0;
 return {enabled:enabled===true,ready:!!(db?.count&&updated),
  source:SOURCE.name,category:SOURCE.category,count:db?.count||0,updated,
  stale:updated>0&&now-updated>AGE_MS*3,
  overrides:overrideCount,license:SOURCE.licensing,sourceUrl:SOURCE.information};
}
const api=Object.freeze({SOURCE,MAX_BYTES,MAX_DOMAINS,MIN_DOMAINS,
 MAX_OVERRIDES,AGE_MS,valid,parse,restore,shouldReplace,match,overrides,status});
root.DKThreatDB=api;
if(typeof module!=="undefined")module.exports=api;
})(typeof globalThis!=="undefined"?globalThis:this);
