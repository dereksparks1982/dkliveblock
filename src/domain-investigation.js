/* DK Live Block: explicit, evidence-labelled public domain investigation.
   No browsing history, private page URLs, credentials or raw responses stored. */
(function(root){"use strict";
const MAX_TEXT=200,MAX_ITEMS=24;
function clean(value,max=MAX_TEXT){
 return typeof value==="string"?value.replace(/[\u0000-\u001f\u007f-\u009f]/g," ").trim().slice(0,max):"";
}
function hostname(host){return typeof host==="string"&&host.length<=253&&
 /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)*$/.test(host);}
function vcard(entity){
 const fields=Array.isArray(entity?.vcardArray?.[1])?entity.vcardArray[1]:[];
 const detail={};
 for(const name of ["org","fn","title","email","tel","adr"]){
  const row=fields.find(x=>Array.isArray(x)&&x[0]===name);
  if(!row)continue;
  const raw=row[3];
  const str=Array.isArray(raw)?raw.map(s=>clean(s,80)).filter(Boolean).join(", "):clean(raw);
  if(str)detail[name]=str;
 }
 return detail;
}
function entities(input){
 if(!Array.isArray(input))return [];
 const out=[],queue=input.slice(0,MAX_ITEMS);
 while(queue.length&&out.length<MAX_ITEMS){
  const row=queue.shift();
  if(!row||typeof row!=="object")continue;
  const roles=Array.isArray(row.roles)?row.roles.filter(x=>typeof x==="string").slice(0,8).map(x=>clean(x,60)):[];
  const detail={roles,handle:clean(row.handle,100),...vcard(row)};
  if(roles.length||Object.keys(detail).length>2)out.push(detail);
  if(Array.isArray(row.entities))queue.push(...row.entities.slice(0,8));
 }
 return out;
}
function events(input){
 if(!Array.isArray(input))return [];
 return input.slice(0,MAX_ITEMS).flatMap(x=>
  typeof x?.eventAction==="string"?[{
   action:clean(x.eventAction,80),date:clean(x.eventDate,80),
   actor:clean(x.eventActor,100)
  }]:[]);
}
function paragraphs(rows){
 if(!Array.isArray(rows))return [];
 return rows.slice(0,12).flatMap(x=>{
  const lines=Array.isArray(x?.description)?x.description.slice(0,4).map(v=>clean(v,240)).filter(Boolean):[];
  return lines.length?[{title:clean(x.title,120),description:lines}]:[];
 });
}
function links(rows){
 if(!Array.isArray(rows))return [];
 return rows.slice(0,MAX_ITEMS).flatMap(link=>{
  try{
   const url=new URL(link?.href);
   if(url.protocol!=="https:"||url.username||url.password||
      !hostname(url.hostname))return [];
   return [{relation:clean(link.rel,70),label:clean(link.title,100),
    url:url.origin+url.pathname.slice(0,300)}];
  }catch(_){return [];}
 });
}
function registration(r){
 if(!r||typeof r!=="object"||Array.isArray(r))return null;
 const nameservers=(Array.isArray(r.nameservers)?r.nameservers:[])
  .slice(0,MAX_ITEMS).map(x=>clean(x?.ldhName,253).toLowerCase()).filter(hostname);
 return {
  handle:clean(r.handle,120),ldhName:clean(r.ldhName,253).toLowerCase(),
  unicodeName:clean(r.unicodeName,253),type:clean(r.objectClassName,80),
  status:(Array.isArray(r.status)?r.status:[]).slice(0,MAX_ITEMS).map(x=>clean(x,100)),
  events:events(r.events),nameservers,dnssec:r.secureDNS&&typeof r.secureDNS==="object"?
    {delegationSigned:r.secureDNS.delegationSigned===true,dsDataCount:Array.isArray(r.secureDNS.dsData)?r.secureDNS.dsData.length:0}:null,
  entities:entities(r.entities),notices:paragraphs(r.notices),remarks:paragraphs(r.remarks),
  links:links(r.links),
  port43:clean(r.port43,200)
 };
}
function ipAddress(value){
 if(typeof value!=="string"||value.length>48)return false;
 if(/^\d{1,3}(?:\.\d{1,3}){3}$/.test(value))
  return value.split(".").map(Number).every(n=>n>=0&&n<=255);
 return /^[a-f0-9:]{3,45}$/i.test(value)&&value.includes(":");
}
function dns(data){
 if(!data||typeof data!=="object")return {status:"Not available",addresses:[]};
 const addresses=Array.isArray(data.addresses)?[...new Set(data.addresses.filter(ipAddress))].slice(0,12):[];
 return {status:addresses.length?"Resolved by Firefox":"No addresses returned",
  addresses,canonicalName:hostname(data.canonicalName)?data.canonicalName:"",
  isTRR:typeof data.isTRR==="boolean"?data.isTRR:null};
}
function publicIPv4(value){
 if(!ipAddress(value)||value.includes(":"))return false;
 const [a,b,c]=value.split(".").map(Number);
 return !(a===0||a===10||a===127||a>=224||a===169&&b===254||
   a===172&&b>=16&&b<=31||a===192&&b===168||a===100&&b>=64&&b<=127||
   a===192&&b===0||a===198&&b>=18&&b<=19||
   a===198&&b===51&&c===100||a===203&&b===0&&c===113);
}
function network(r){
 if(!r||typeof r!=="object"||Array.isArray(r))return null;
 return {handle:clean(r.handle,120),name:clean(r.name,180),
  type:clean(r.type,80),country:clean(r.country,10),
  startAddress:ipAddress(r.startAddress)?r.startAddress:"",
  endAddress:ipAddress(r.endAddress)?r.endAddress:"",
  ipVersion:clean(r.ipVersion,15),
  status:(Array.isArray(r.status)?r.status:[]).slice(0,12).map(x=>clean(x,100)),
  entities:entities(r.entities),events:events(r.events),
  remarks:paragraphs(r.remarks),links:links(r.links)};
}
const api=Object.freeze({clean,hostname,vcard,entities,events,paragraphs,links,
 registration,dns,publicIPv4,network});
root.DKDomainInvestigation=api;
if(typeof module!=="undefined")module.exports=api;
})(typeof globalThis!=="undefined"?globalThis:this);
