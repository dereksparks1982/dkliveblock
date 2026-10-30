/* DK Live Block: explicit opt-in, pinned yt-dlp installer and tool detection. */
"use strict";
(function(){
 const $=id=>document.getElementById(id);
 const catalog=DKDependencyCatalog;
 const DEP_PATH="~/.local/share/dk-live-block/dependencies/";
 const PINNED_YT_DLP="2026.10.26";
 let companionReady=false;
 function manageButtons(installEnabled=false,removeEnabled=false){
  $("installYtDlp").disabled=!installEnabled;
  $("removeYtDlp").disabled=!removeEnabled;
 }
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
  if(item.id==="yt-dlp"){
   const controls=document.createElement("div");
   controls.className="dependency-actions";
   const install=document.createElement("button");
   install.id="installYtDlp";install.type="button";install.disabled=true;
   install.textContent="Install verified yt-dlp";
   const remove=document.createElement("button");
   remove.id="removeYtDlp";remove.type="button";remove.disabled=true;
   remove.textContent="Remove managed copy";
   controls.append(install,remove);row.appendChild(controls);
  }
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
 async function refreshStatus(){
  const reply=await browser.runtime.sendNativeMessage(catalog.HOST_NAME,{action:"status",protocol:catalog.PROTOCOL});
  if(!reply||reply.protocol!==catalog.PROTOCOL||reply.ok!==true||!reply.tools||typeof reply.tools!=="object")
   throw Error("The companion returned an unsupported response.");
  companionReady=true;
  if(typeof reply.directory==="string"&&reply.directory.length<500)
   $("dependencyPath").textContent=reply.directory;
  for(const item of catalog.ITEMS){
   if(!item.detect)continue;
   const state=$("dependency-state-"+item.id);
   const result=reply.tools[item.id];
   const code=result&&typeof result==="object"?result.status:"";
   state.textContent=code==="local"?"Detected in DK dependencies folder (version not verified)":
     code==="system"?"Detected on system PATH (not managed by DK)":"Not detected";
  }
  const local=reply.tools["yt-dlp"]?.status==="local";
  manageButtons(!local,local);
 }
 async function manage(action){
  if(!companionReady)return say("Connect the optional Linux companion first.");
  if(action!=="installTool"&&action!=="removeTool")return;
  const adding=action==="installTool";
  const prompt=adding?
   "Install yt-dlp "+PINNED_YT_DLP+" (about 40 MB) from the official GitHub release? DK will verify its pinned SHA-256 before installation. No program will run.":
   "Remove only the exact, checksum-verified yt-dlp binary installed in DK's dependency folder? A changed file will be preserved.";
  if(!window.confirm(prompt))return;
  manageButtons(false,false);
  say(adding?"Downloading and verifying the pinned yt-dlp release…":"Checking the installed yt-dlp before removal…");
  try{
   const reply=await browser.runtime.sendNativeMessage(catalog.HOST_NAME,{
    action,protocol:catalog.PROTOCOL,toolId:"yt-dlp",confirmation:"explicit-user-action"
   });
   if(!reply||reply.protocol!==catalog.PROTOCOL||reply.ok!==true)
    throw Error(reply?.error||"Companion rejected the request. You may need to reinstall the updated companion.");
   await refreshStatus();
   say(adding?"Pinned yt-dlp "+PINNED_YT_DLP+" installation checked: "+reply.state+".":
    "Managed yt-dlp removal checked: "+reply.state+".");
  }catch(error){
   say("Dependency operation failed: "+String(error.message||error).slice(0,160));
   try{await refreshStatus();}catch(_){companionReady=false;manageButtons();}
  }
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
   await refreshStatus();
   say("Linux companion connected. Optional yt-dlp management is available.");
  }catch(_){
   companionReady=false;manageButtons();
   say("Companion unavailable or incompatible. Optional tool management requires the updated companion; ad blocking still works.");
   for(const item of catalog.ITEMS)if(item.detect)
    $("dependency-state-"+item.id).textContent="Companion not connected";
  }finally{button.disabled=false;}
 }
 render();
 $("checkDependencies").addEventListener("click",check);
 $("installYtDlp").addEventListener("click",()=>manage("installTool"));
 $("removeYtDlp").addEventListener("click",()=>manage("removeTool"));
})();
