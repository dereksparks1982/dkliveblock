"use strict";
/* Build 32: explicit user-triggered, read-only native inventory. */
const $=id=>document.getElementById(id);
function formatSize(bytes){
 if(!Number.isFinite(bytes)||bytes<0)return "Unknown size";
 if(bytes<1024)return bytes+" B";
 if(bytes<1024**2)return (bytes/1024).toFixed(1)+" KB";
 if(bytes<1024**3)return (bytes/(1024**2)).toFixed(1)+" MB";
 return (bytes/(1024**3)).toFixed(2)+" GB";
}
function render(items){
 const root=$("downloadRows");root.replaceChildren();
 for(const entry of items.slice(0,150)){
  if(!entry||typeof entry.name!=="string"||entry.name.length>180||
     !Number.isFinite(entry.size)||entry.size<0)continue;
  const row=document.createElement("div");row.className="dependency-row";
  const name=document.createElement("strong");name.textContent=entry.name;
  const details=document.createElement("span");
  details.textContent=formatSize(entry.size)+" · "+new Date(entry.modified*1000).toLocaleString();
  row.append(name,details);root.appendChild(row);
 }
}
$("scanDownloads").addEventListener("click",async()=>{
 const button=$("scanDownloads");button.disabled=true;
 $("downloadScanStatus").textContent="Checking optional native companion…";
 $("downloadRows").replaceChildren();
 try{
  if(!browser.permissions?.request||!browser.runtime?.sendNativeMessage)
   throw Error("This Firefox installation cannot use the optional companion.");
  const granted=await browser.permissions.request({permissions:["nativeMessaging"]});
  if(!granted)throw Error("Permission declined. Ad blocking is unaffected.");
  const result=await browser.runtime.sendNativeMessage("dk_live_block_companion",{protocol:1,action:"listDownloads"});
  if(!result||result.ok!==true||result.protocol!==1||!Array.isArray(result.items))
   throw Error(result?.error||"Companion unavailable or outdated.");
  if(typeof result.directory==="string"&&result.directory.length<500)
   $("downloadsPath").textContent=result.directory;
  render(result.items);
  $("downloadScanStatus").textContent=result.items.length+" local media file(s) found"+
   (result.truncated?" (showing a limited selection).":".");
 }catch(error){$("downloadScanStatus").textContent="Cannot inspect downloads: "+String(error.message||error).slice(0,150);}
 finally{button.disabled=false;}
});
$("downloadDependencies").addEventListener("click",()=>browser.tabs.create({url:browser.runtime.getURL("options.html#dependencies")}));
