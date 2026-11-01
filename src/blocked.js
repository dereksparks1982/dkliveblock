"use strict";
/* Extension-owned warning page. URL fragment carries a random nonce ONLY.
   Hostname/evidence come from a tab-bound, short-lived background record. */
const $=id=>document.getElementById(id);
const nonce=location.hash.slice(1);
function show(message){$("status").textContent=message;}
async function send(action,confirm=false){
 try{return await browser.runtime.sendMessage({action,nonce,confirm});}
 catch(_){return {error:"The extension could not verify this warning. Close the tab."};}
}
async function load(){
 const details=await send("getThreatWarning");
 if(!details||!details.ok){
  $("blockedHost").textContent="Warning unavailable";
  $("reason").textContent="This warning expired or was not created for this tab.";
  show(details?.error||"Close this tab to return to safety.");
  return;
 }
 $("blockedHost").textContent=details.host;
 $("reason").textContent="DK Live Block stopped a website navigation before it loaded.";
 $("feedUpdated").textContent=details.updated?
  new Date(details.updated).toLocaleString():"Unavailable (cached list date unknown)";
 $("override").hidden=false;
}
$("acknowledge").addEventListener("change",event=>{
 $("proceed").disabled=!event.target.checked;
});
$("proceed").addEventListener("click",async()=>{
 if(!$("acknowledge").checked)return;
 $("proceed").disabled=true;
 show("Saving the exact-host exception…");
 const answer=await send("proceedThreatWarning",true);
 if(answer?.error){show(answer.error);$("proceed").disabled=!$("acknowledge").checked;}
});
$("leave").addEventListener("click",async()=>{
 const answer=await send("closeThreatWarning",true);
 if(answer?.error)show(answer.error);
});
load();
