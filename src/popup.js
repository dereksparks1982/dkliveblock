"use strict";
const $=id=>document.getElementById(id);
let tab=null,current=null;
async function load(){
 [tab]=await browser.tabs.query({active:true,currentWindow:true});
 current=await browser.runtime.sendMessage({action:"status",tabId:tab.id,url:tab.url});
 $("count").textContent=(current.tabBlocked||0).toLocaleString();
 $("enabled").checked=current.enabled;$("site").textContent=current.host||"Browser page";
 $("toggle").textContent=current.sitePaused?"Resume on site":"Pause on site";
 $("toggle").disabled=!current.host||!current.enabled;
 $("temporary").textContent=current.temporarilyPaused?"Resume this tab":"Pause this tab";
 $("temporary").disabled=!current.host||!current.enabled||current.sitePaused;
 $("picker").disabled=!current.host||!current.siteActive;
 $("info").textContent=(current.networkRules||0).toLocaleString()+" network rules · "+(current.cosmeticRules||0).toLocaleString()+" cosmetic filters";
}
$("enabled").addEventListener("change",async()=>{await browser.runtime.sendMessage({action:"setGlobal",enabled:$("enabled").checked,tabId:tab.id,url:tab.url});await load();});
$("toggle").addEventListener("click",async()=>{await browser.runtime.sendMessage({action:"toggleSite",url:tab.url,tabId:tab.id,disable:!current.sitePaused});await browser.tabs.reload(tab.id);await load();});
$("temporary").addEventListener("click",async()=>{
 await browser.runtime.sendMessage({action:"toggleTabPause",tabId:tab.id,url:tab.url,paused:!current.temporarilyPaused});
 await browser.tabs.reload(tab.id);await load();
});
$("picker").addEventListener("click",async()=>{try{const result=await browser.tabs.sendMessage(tab.id,{action:"startPicker"});if(result.ok)window.close();}catch(e){$("info").textContent="Reload the tab and try again."; }});
$("update").addEventListener("click",async()=>{$("update").disabled=true;try{const result=await browser.runtime.sendMessage({action:"updateLists"});$("info").textContent=result.updated+" lists updated; "+result.errors.length+" failed.";}catch(e){$("info").textContent=e.message;}finally{$("update").disabled=false;}});
$("undo").addEventListener("click",async()=>{const r=await browser.runtime.sendMessage({action:"undoElementRule",url:tab.url,tabId:tab.id});$("info").textContent=r.ok?"Last hidden element restored. Reload this tab.":r.error;});
$("settings").addEventListener("click",()=>browser.runtime.openOptionsPage());
load().catch(e=>$("info").textContent=e.message);
