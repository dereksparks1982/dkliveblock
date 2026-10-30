/* DK Live Block optional Patreon button.
   Keep disabled until the official creator page has been created and verified.
   No automatic requests, advertising, telemetry, or donation requirements. */
(function(root){"use strict";
const PATREON_URL=""; // Set only after the creator page exists, e.g. https://www.patreon.com/c/DKLiveBlock
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
const api={validPatreonUrl,installButton};
root.DKSupport=api;
if(typeof module!=="undefined")module.exports=api;
})(typeof globalThis!=="undefined"?globalThis:this);
