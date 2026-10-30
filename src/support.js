/* DK Live Block optional Patreon button.
   Keep disabled until the official creator page has been created and verified.
   No automatic requests, advertising, telemetry, or donation requirements. */
(function(root){"use strict";
const PATREON_URL=""; // Set only after the creator page exists, e.g. https://www.patreon.com/c/DKLiveBlock
const SUPPORT_EMAIL="elderredsoftworks@proton.me";
const REPORT_KINDS=Object.freeze({
 bug:"Bug report",
 unblocked:"Unblocked advertisement",
 broken:"Website broken",
 popup:"Unwanted popup or redirect",
 feature:"Feature request",
 other:"Other feedback"
});
function safeInput(value,max=1200){
 return typeof value==="string"?value.replace(/[\u0000-\u0008\u000b-\u001f\u007f]/g,"").trim().slice(0,max):"";
}
function hostnameOnly(value){
 const text=safeInput(value,500);
 if(!text)return "";
 try{
  const url=new URL(/^[a-z]+:\/\//i.test(text)?text:"https://"+text);
  if(!["http:","https:"].includes(url.protocol)||url.username||url.password)return "";
  const h=url.hostname.toLowerCase();
  return h.length<=253&&/^[a-z0-9.-]+$/.test(h)&&!h.includes("..")?h:"";
 }catch(_){return "";}
}
function buildReport({kind="bug",description="",steps="",website="",version=""}={}){
 if(!Object.hasOwn(REPORT_KINDS,kind))return null;
 const detail=safeInput(description,1800),reproduce=safeInput(steps,1200);
 if(detail.length<10)return null;
 const site=hostnameOnly(website);
 if(website&&(!site||String(website).length>500))return null;
 const ver=typeof version==="string"&&/^\d+\.\d+\.\d+$/.test(version)?version:"unknown";
 const subject="DK Live Block: "+REPORT_KINDS[kind];
 const body="Issue: "+REPORT_KINDS[kind]+
  "\nExtension version: "+ver+
  "\nAffected website: "+(site||"Not supplied")+
  "\n\nDescription:\n"+detail+
  "\n\nSteps to reproduce (optional):\n"+(reproduce||"Not supplied")+
  "\n\nPlease remove personal or sensitive details before sending.\n";
 return {subject,body};
}
function bugMailto(report){
 if(!report||typeof report.subject!=="string"||typeof report.body!=="string"||
    report.subject.length>160||report.body.length>5000)return "";
 return "mailto:"+SUPPORT_EMAIL+"?subject="+encodeURIComponent(report.subject)+
  "&body="+encodeURIComponent(report.body);
}
function validPatreonUrl(value){
 if(typeof value!=="string"||!value||value.length>300)return "";
 try{
  const u=new URL(value);
  if(u.protocol!=="https:"||u.username||u.password||u.port||
     !["patreon.com","www.patreon.com"].includes(u.hostname.toLowerCase())||
     u.search||u.hash||!/^\/(?:c\/)?[a-z0-9_-]{2,64}\/?$/i.test(u.pathname))return "";
  return u.href;
 }catch(_){return "";}
}
function installButton(button,{browserApi=typeof browser!=="undefined"?browser:null,url=PATREON_URL}={}){
 if(!button)return;
 const destination=validPatreonUrl(url);
 button.disabled=!destination;
 button.textContent=destination?"Support DK Live Block on Patreon":"Patreon · Coming soon";
 button.title=destination?"Open our optional Patreon support page in a new tab.":"Our Patreon page will be linked after it is created.";
 if(destination)button.addEventListener("click",()=>{
  if(!browserApi?.tabs?.create)return;
  try{browserApi.tabs.create({url:destination})?.catch?.(()=>{});}catch(_){}
 });
}
const api={validPatreonUrl,installButton,SUPPORT_EMAIL,REPORT_KINDS,hostnameOnly,buildReport,bugMailto};
root.DKSupport=api;
if(typeof module!=="undefined")module.exports=api;
})(typeof globalThis!=="undefined"?globalThis:this);
