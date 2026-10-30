"use strict";
const $=id=>document.getElementById(id);
let tab=null,current=null,videoContext=null;
const QUALITIES=new Set(["compatible","best","audio"]);
function videoMessage(message){$("videoDownloadStatus").textContent=message;}
async function refreshDownloadStatus(){
 if(!videoContext)return;
 try{
  const job=await browser.runtime.sendMessage({action:"videoDownloadStatus"});
  const same=job?.id===videoContext.id;
  const running=job?.state==="running"||job?.state==="cancelling";
  $("videoProgress").hidden=!(same&&running);
  $("videoProgress").value=same?Math.min(100,Math.max(0,job.progress||0)):0;
  $("cancelVideo").hidden=!(same&&running);
  $("cancelVideo").disabled=job?.state==="cancelling";
  $("downloadVideo").disabled=running;
  if(same&&job.state==="running")videoMessage(job.phase==="merging"?"Merging video and audio with FFmpeg…":
   job.phase==="processing"?"Processing downloaded media…":
   $("videoProgress").value>=100?"Finishing media transfer…":
   "Downloading: "+$("videoProgress").value+"%. Closing the popup will not cancel the job.");
  else if(same&&job.state==="cancelling")videoMessage("Cancelling download…");
  else if(same&&job.state==="complete")videoMessage("Download complete. Saved to ~/.local/share/dk-live-block/downloads/");
  else if(same&&job.state==="cancelled")videoMessage("Download cancelled. Partial files are preserved for a manual retry.");
  else if(same&&job.state==="interrupted")videoMessage("Previous Firefox session ended during this download. Choose Download This Video to retry and resume available partial data.");
  else if(same&&job.state==="failed")videoMessage("Download failed: "+(job.error||"See dependency settings."));
  else if(running)videoMessage("A different video is currently downloading.");
  if(same&&["interrupted","cancelled","failed"].includes(job.state))
   $("downloadVideo").textContent="Retry Download";
  else $("downloadVideo").textContent="Download This Video";
 }catch(_){}
}
function showVideoTools(){
 videoContext=DKVideoLibrary.parseVideo(tab?.url);
 $("videoTools").hidden=!videoContext;
 if(!videoContext)return;
 $("videoTitle").textContent=DKVideoLibrary.safeTitle(tab.title||"YouTube video");
 refreshDownloadStatus().catch(()=>{});
}
async function saveVideo(){
 if(!videoContext)return;
 $("saveVideo").disabled=true;
 try{
  let position=0;
  try{const reply=await browser.tabs.sendMessage(tab.id,{action:"getVideoPosition"});position=reply?.position||0;}catch(_){}
  const result=await browser.runtime.sendMessage({action:"saveVideo",tabId:tab.id,videoId:videoContext.id,
   title:tab.title,position});
  videoMessage(result?.ok?"Saved to My Saved Videos at "+Math.floor(position/60)+"m "+Math.floor(position%60)+"s.":result?.error||"Could not save video.");
 }catch(error){videoMessage(error.message);}
 finally{$("saveVideo").disabled=false;}
}
async function downloadVideo(){
 if(!videoContext)return;
 const quality=$("videoQuality").value;
 if(!QUALITIES.has(quality))return videoMessage("Select a supported download quality.");
 if(!window.confirm("Download this YouTube video using verified local yt-dlp? It will save to ~/.local/share/dk-live-block/downloads/. Only download videos you are authorized to save."))return;
 $("downloadVideo").disabled=true;
 try{
  if(!browser.permissions?.request||!await browser.permissions.request({permissions:["nativeMessaging"]})){
   videoMessage("Native companion permission is required for downloading.");return;
  }
  const result=await browser.runtime.sendMessage({action:"startVideoDownload",tabId:tab.id,videoId:videoContext.id,quality});
  videoMessage(result?.ok?"Download requested. Open this menu again to check progress.":result?.error||"Could not start download.");
  if(result?.ok)await refreshDownloadStatus();
 }catch(error){videoMessage("Download unavailable: "+error.message);}
 finally{$("downloadVideo").disabled=false;}
}
async function load(){
 [tab]=await browser.tabs.query({active:true,currentWindow:true});
 current=await browser.runtime.sendMessage({action:"status",tabId:tab.id,url:tab.url});
 $("count").textContent=(current.tabBlocked||0).toLocaleString();
 $("issues").textContent=String(current.networkIssueCount||0);
 $("popups").textContent=String(current.popupHiddenCount||0);
 $("strictPopupRow").hidden=!current.strictPopupAvailable||!current.strictPopupEnabled;
 $("strictPopupBlocked").textContent=String(current.strictPopupBlocked||0);
 $("permitNextPopup").disabled=!current.strictPopupEnabled;
 $("strictPopupMessage").textContent=current.popupPermitActive?
  "One new tab is temporarily allowed. This permission expires within 15 seconds.":
  "Unrequested new tabs from this site are blocked.";
 $("mediaRecoveryRow").hidden=!current.mediaRecoveryAvailable;
 $("streamingDiagnosticsRow").hidden=!current.mediaRecoveryAvailable;
 $("streamingIssueCount").textContent=String(current.streamingIssueCount||0);
 $("streamingRepairNotice").hidden=!(current.streamingAllowancesCount>0);
 $("mediaWarning").hidden=!current.mediaRecoveryAvailable;
 $("mediaRecovery").textContent=current.mediaRecoveryEnabled?"Disable media rescue":"Enable media rescue";
 $("mediaRecovery").disabled=!current.siteActive;
 $("enabled").checked=current.enabled;$("site").textContent=current.host||"Browser page";
 $("toggle").textContent=current.sitePaused?"Resume on site":"Pause on site";
 $("toggle").disabled=!current.host||!current.enabled;
 $("temporary").textContent=current.temporarilyPaused?"Resume this tab":"Pause this tab";
 $("temporary").disabled=!current.host||!current.enabled||current.sitePaused;
 $("picker").disabled=!current.host||!current.siteActive;
 $("popupProtectionRow").hidden=!current.popupProtectionAvailable;
 $("popupProtection").disabled=!current.siteActive;
 $("popupProtection").textContent=current.popupProtectionPaused?"Resume popup cleanup":"Disable popup cleanup here";
 $("info").textContent=(current.networkRules||0).toLocaleString()+" network rules · "+(current.cosmeticRules||0).toLocaleString()+" cosmetic filters";
 showVideoTools();
}
$("enabled").addEventListener("change",async()=>{await browser.runtime.sendMessage({action:"setGlobal",enabled:$("enabled").checked,tabId:tab.id,url:tab.url});await load();});
$("toggle").addEventListener("click",async()=>{await browser.runtime.sendMessage({action:"toggleSite",url:tab.url,tabId:tab.id,disable:!current.sitePaused});await browser.tabs.reload(tab.id);await load();});
$("temporary").addEventListener("click",async()=>{
 await browser.runtime.sendMessage({action:"toggleTabPause",tabId:tab.id,url:tab.url,paused:!current.temporarilyPaused});
 await browser.tabs.reload(tab.id);await load();
});
$("permitNextPopup").addEventListener("click",async()=>{
 if(!current?.strictPopupEnabled)return;
 $("permitNextPopup").disabled=true;
 try{
  const result=await browser.runtime.sendMessage({action:"permitNextPopupTab",tabId:tab.id});
  $("strictPopupMessage").textContent=result.ok?
   "You have 15 seconds to open one new tab. A site-generated ad tab could use this allowance first.":
   result.error||"Unable to allow a new tab.";
 }catch(error){$("strictPopupMessage").textContent=error.message;}
 finally{$("permitNextPopup").disabled=false;}
});
$("popupProtection").addEventListener("click",async()=>{
 if(!current?.popupProtectionAvailable)return;
 $("popupProtection").disabled=true;
 try{
  const result=await browser.runtime.sendMessage({action:"toggleSitePopupProtection",
   url:tab.url,tabId:tab.id,pause:!current.popupProtectionPaused});
  if(result.error){$("info").textContent=result.error;return;}
  await browser.tabs.reload(tab.id);await load();
 }catch(e){$("info").textContent=e.message;}finally{$("popupProtection").disabled=false;}
});
$("mediaRecovery").addEventListener("click",async()=>{
 if(!current?.mediaRecoveryAvailable)return;
 $("mediaRecovery").disabled=true;
 try{
  const result=await browser.runtime.sendMessage({action:"toggleMediaRecovery",url:tab.url,tabId:tab.id,enabled:!current.mediaRecoveryEnabled});
  if(result.error){$("info").textContent=result.error;return;}
  await browser.tabs.reload(tab.id);
  await load();
 }catch(e){$("info").textContent=e.message;}finally{$("mediaRecovery").disabled=false;}
});
$("picker").addEventListener("click",async()=>{try{const result=await browser.tabs.sendMessage(tab.id,{action:"startPicker"});if(result.ok)window.close();}catch(e){$("info").textContent="Reload the tab and try again."; }});
$("update").addEventListener("click",async()=>{$("update").disabled=true;try{const result=await browser.runtime.sendMessage({action:"updateLists"});$("info").textContent=result.updated+" changed; "+result.checked+" checked; "+result.errors.length+" failed.";}catch(e){$("info").textContent=e.message;}finally{$("update").disabled=false;}});
$("undo").addEventListener("click",async()=>{const r=await browser.runtime.sendMessage({action:"undoElementRule",url:tab.url,tabId:tab.id});$("info").textContent=r.ok?"Last hidden element restored. Reload this tab.":r.error;});
$("recovery").addEventListener("click",()=>browser.runtime.openOptionsPage());
$("settings").addEventListener("click",()=>browser.runtime.openOptionsPage());
$("dependencies").addEventListener("click",()=>browser.tabs.create({url:browser.runtime.getURL("options.html#dependencies")}));
$("networkMonitor").addEventListener("click",()=>browser.tabs.create({
 url:browser.runtime.getURL("network-monitor.html"+(Number.isInteger(tab?.id)?"?tab="+tab.id:""))
}));
$("streamingDiagnostics").addEventListener("click",()=>browser.tabs.create({url:browser.runtime.getURL("options.html#streaming-diagnostics")}));
$("savedVideos").addEventListener("click",()=>browser.tabs.create({url:browser.runtime.getURL("library.html")}));
$("myDownloads").addEventListener("click",()=>browser.tabs.create({url:browser.runtime.getURL("downloads.html")}));
$("saveVideo").addEventListener("click",saveVideo);
$("downloadVideo").addEventListener("click",downloadVideo);
$("cancelVideo").addEventListener("click",async()=>{
 if(!videoContext)return;
 $("cancelVideo").disabled=true;
 try{const result=await browser.runtime.sendMessage({action:"cancelVideoDownload",videoId:videoContext.id});
  videoMessage(result.ok?"Cancelling download…":result.error||"Unable to cancel.");
 }catch(error){videoMessage(error.message);}
 await refreshDownloadStatus();
});
setInterval(()=>{if(videoContext)refreshDownloadStatus().catch(()=>{});},1500);
load().catch(e=>$("info").textContent=e.message);

DKSupport.installButton($("patreonSupport"));
