/* DK Live Block: opt-in read-only local tool detection. No remote executable code. */
"use strict";
(function(){
 const $=id=>document.getElementById(id);
 const catalog=DKDependencyCatalog;
 const DEP_PATH="~/.local/share/dk-live-block/dependencies/";
 function say(message){$("dependencyStatus").textContent=message;}
 function addRow(item){
  const row=document.createElement("div");row.className="dependency-row";
  const detail=document.createElement("div");detail.className="dependency-description";
  const title=document.createElement("strong");title.textContent=item.name;
  const explanation=document.createElement("p");explanation.textContent=item.summary;
  const state=document.createElement("small");state.className="dependency-state";
  state.id="dependency-state-"+item.id;
  state.textContent=item.group==="application"?"Optional recommendation":item.detect?"Not checked":"Manual setup; no detection";
  detail.append(title,explanation,state);
  const link=document.createElement("a");link.className="dependency-link";
  link.textContent=item.group==="application"?"Official website":"Official download / instructions";
  link.href=catalog.isTrustedLink(item.url)?item.url:"#";
  link.target="_blank";link.rel="noopener noreferrer";
  row.append(detail,link);
  return row;
 }
 function render(){
  $("dependencyPath").textContent=DEP_PATH;
  const tools=$("dependencyTools"),apps=$("recommendedApplications");
  tools.replaceChildren();apps.replaceChildren();
  for(const item of catalog.ITEMS)
   (item.group==="tool"?tools:apps).appendChild(addRow(item));
  $("companionHelp").href="https://github.com/dereksparks1982/dkliveblock/blob/main/docs/COMPANION.md";
 }
 async function check(){
  const button=$("checkDependencies");button.disabled=true;say("Checking local companion…");
  try{
   if(!browser.permissions?.contains||!browser.permissions?.request||!browser.runtime?.sendNativeMessage)
    throw Error("This Firefox installation does not expose native messaging.");
   // Request immediately from the click handler so Firefox retains user activation.
   // When already granted, Firefox resolves this without a new prompt.
   const granted=await browser.permissions.request({permissions:["nativeMessaging"]});
   if(!granted){say("Native messaging permission declined. Normal ad blocking is unaffected.");return;}
   const reply=await browser.runtime.sendNativeMessage(catalog.HOST_NAME,{action:"status",protocol:catalog.PROTOCOL});
   if(!reply||reply.protocol!==catalog.PROTOCOL||reply.ok!==true||!reply.tools||typeof reply.tools!=="object")
    throw Error("The companion returned an unsupported response.");
   say("Linux companion connected. Detection only; no programs were launched or installed.");
   if(typeof reply.directory==="string"&&reply.directory.length<500)
    $("dependencyPath").textContent=reply.directory;
   for(const item of catalog.ITEMS){
    if(!item.detect)continue;
    const state=$("dependency-state-"+item.id);
    const result=reply.tools[item.id];
    // Never interpret arbitrary native status as HTML or a download instruction.
    const code=result&&typeof result==="object"?result.status:"";
    state.textContent=code==="local"?"Detected in DK dependencies folder (not version-verified)":
      code==="system"?"Detected on system PATH (not version-verified)":
      "Not detected";
   }
  }catch(_){
   say("Companion unavailable or incompatible. Install it only if you want local tool detection; ad blocking still works.");
   for(const item of catalog.ITEMS)if(item.detect)
    $("dependency-state-"+item.id).textContent="Companion not connected";
  }finally{button.disabled=false;}
 }
 render();$("checkDependencies").addEventListener("click",check);
})();
