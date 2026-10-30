"use strict";
const $=id=>document.getElementById(id);
let tab=null,current=null;
async function load(){
 [tab]=await browser.tabs.query({active:true,currentWindow:true});
 current=await browser.runtime.sendMessage({action:"status",tabId:tab.id,url:tab.url});
 $("count").textContent=(current.tabBlocked||0).toLocaleString();
 $("issues").textContent=String(current.networkIssueCount||0);
 $("popups").textContent=String(current.popupHiddenCount||0);
 $("mediaRecoveryRow").hidden=!current.mediaRecoveryAvailable;
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
}
$("enabled").addEventListener("change",async()=>{await browser.runtime.sendMessage({action:"setGlobal",enabled:$("enabled").checked,tabId:tab.id,url:tab.url});await load();});
$("toggle").addEventListener("click",async()=>{await browser.runtime.sendMessage({action:"toggleSite",url:tab.url,tabId:tab.id,disable:!current.sitePaused});await browser.tabs.reload(tab.id);await load();});
$("temporary").addEventListener("click",async()=>{
 await browser.runtime.sendMessage({action:"toggleTabPause",tabId:tab.id,url:tab.url,paused:!current.temporarilyPaused});
 await browser.tabs.reload(tab.id);await load();
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
load().catch(e=>$("info").textContent=e.message);
