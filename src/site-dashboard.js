"use strict";
const $=id=>document.getElementById(id),Model=DKSiteDashboardModel;
let current=null,requestToken=0,loading=false;
function notice(message){$("dashboardMessage").textContent=String(message||"").slice(0,220);}
function line(text,buttonLabel=null,onClick=null){
 const container=document.createElement("div");container.className="dashboard-line";
 const desc=document.createElement("span");desc.textContent=text;container.appendChild(desc);
 if(buttonLabel&&onClick){
  const button=document.createElement("button");button.type="button";
  button.textContent=buttonLabel;
  button.addEventListener("click",async()=>{
   if(button.disabled)return;
   button.disabled=true;
   try{await onClick();}catch(error){notice(error?.message||"Action failed.");}
   finally{button.disabled=false;}
  });
  container.appendChild(button);
 }
 return container;
}
function time(value){
 if(!Number.isFinite(value)||value<=0)return "Time unavailable";
 return new Date(value).toLocaleTimeString();
}
function render(collection,data,empty,create){
 const panel=$(collection);panel.replaceChildren();
 if(!data.length){panel.textContent=empty;return;}
 for(const row of data)panel.appendChild(create(row));
}
function selected(){const id=Number($("dashboardTab").value);return Number.isInteger(id)&&id>=0&&$("dashboardTab").value!==""?id:null;}
function openLocal(page){return browser.tabs.create({url:browser.runtime.getURL(page)});}
async function selectTabs(preferred=null){
 const previous=selected(),list=await browser.tabs.query({currentWindow:true});
 const picker=$("dashboardTab");picker.replaceChildren();
 const blank=document.createElement("option");blank.value="";blank.textContent="Choose a website tab";
 picker.appendChild(blank);
 for(const tab of list){
  if(!Number.isInteger(tab.id)||!/^https?:\/\//i.test(tab.url||""))continue;
  const option=document.createElement("option");option.value=String(tab.id);
  const host=Model.hostname(new URL(tab.url).hostname.toLowerCase());
  if(!host)continue;
  option.textContent=host+" · Tab "+tab.id+" · "+String(tab.title||"").slice(0,65);
  picker.appendChild(option);
 }
 const choices=[preferred,previous].filter(id=>Number.isInteger(id)&&id>=0);
 const active=list.find(tab=>tab.active&&/^https?:\/\//i.test(tab.url||""));
 if(active)choices.push(active.id);
 for(const id of choices){
  if([...picker.options].some(option=>option.value===String(id))){
   picker.value=String(id);break;
  }
 }
 await refresh();
}
function setButtons(d){
 $("dashboardAllowlist").disabled=!d?.ok||!d.globalEnabled;
 $("dashboardPause").disabled=!d?.ok||!d.globalEnabled||d.sitePaused;
 $("dashboardCookie").disabled=!d?.ok||!d.siteActive||!d.cookieRejectEnabled;
 $("dashboardDistraction").disabled=!d?.ok||!d.siteActive||!d.distractionEnabled;
 $("dashboardClearLog").disabled=!d?.ok||!d.requestLog;
 $("dashboardMonitor").disabled=!d?.ok;
 $("dashboardAllowlist").textContent=d?.sitePaused?"Remove from allowlist":"Allowlist website";
 $("dashboardPause").textContent=d?.temporarilyPaused?"Resume this tab":"Pause this tab";
 $("dashboardCookie").textContent=d?.cookieRejectPaused?"Resume cookie rejection here":"Pause cookie rejection here";
 $("dashboardDistraction").textContent=d?.distractionPaused?"Resume distraction cleanup here":"Pause distraction cleanup here";
}
function clearDisplay(message){
 current=null;setButtons(null);
 $("dashboardSite").textContent="No site selected";
 $("dashboardShield").textContent="No website selected";
 $("dashboardExplanation").textContent=message;
 for(const id of ["dashboardBlocked","dashboardOverlays","dashboardTabsStopped"])
  $(id).textContent="0";
 for(const id of ["dashboardRecent","dashboardPopupHistory","dashboardCustomAllowances",
  "dashboardRequestAllowances"])$(id).replaceChildren();
 $("dashboardLogState").textContent="";
 $("dashboardFilterDetails").textContent="";
 notice(message);
}
async function verifyCurrentTab(){
 if(!current?.ok)throw Error("Choose a website tab.");
 const tab=await browser.tabs.get(current.tabId);
 if(!/^https?:\/\//i.test(tab.url||"")||
    Model.hostname(new URL(tab.url).hostname.toLowerCase())!==current.site)
  throw Error("The selected tab navigated. Refresh before changing its settings.");
 return tab;
}
async function perform(action,confirmText=null,reload=false){
 if(loading||!current?.ok)return;
 const data=current;
 if(confirmText&&!window.confirm(confirmText))return;
 try{
  const tab=await verifyCurrentTab();
  const response=await browser.runtime.sendMessage({action,tabId:data.tabId,
   url:tab.url,allowed:action==="setSiteAllowed"?!data.sitePaused:undefined,
   paused:action==="toggleTabPause"?!data.temporarilyPaused:undefined});
  if(response?.error)throw Error(response.error);
  if(reload)await browser.tabs.reload(data.tabId);
  notice("Change saved. Updating site status.");
  await refresh();
 }catch(error){notice(error?.message||"Could not update site.");}
}
async function toggleFeature(feature){
 if(loading||!current?.ok)return;
 const data=current;
 try{
  await verifyCurrentTab();
  const paused=feature==="cookieReject"?!data.cookieRejectPaused:!data.distractionPaused;
  const response=await browser.runtime.sendMessage({action:"setSiteFeaturePaused",
   tabId:data.tabId,feature,paused});
  if(!response?.ok)throw Error(response?.error||"Could not update website cleanup.");
  await browser.tabs.reload(data.tabId);
  await refresh();
 }catch(error){notice(error?.message||"Could not change cleanup.");}
}
async function revokeHost(host){
 if(!current?.ok||!window.confirm("Remove the saved allow rule for "+host+" on "+current.site+"?"))return;
 const data=current;await verifyCurrentTab();
 const r=await browser.runtime.sendMessage({action:"removeSiteException",tabId:data.tabId,
  url:"https://"+data.site+"/",host});
 if(r?.error)throw Error(r.error);
 await refresh();
}
async function revokeRequest(row){
 if(!current?.ok||!window.confirm("Revoke "+row.scope+" exception: "+row.host+
   " ("+row.type+") for "+current.site+"?"))return;
 const data=current;await verifyCurrentTab();
 const r=await browser.runtime.sendMessage({action:"revokeMonitoredRequest",tabId:data.tabId,
  host:row.host,type:row.type,scope:row.scope});
 if(!r?.ok)throw Error(r?.error||"Could not revoke.");
 await refresh();
}
function display(d){
 current=d;setButtons(d);
 const summary=Model.status(d);
 $("dashboardSite").textContent=d.site;
 $("dashboardShield").textContent=summary.label;
 $("dashboardExplanation").textContent=summary.detail;
 $("dashboardBlocked").textContent=Model.number(d.blocked).toLocaleString();
 $("dashboardOverlays").textContent=Model.number(d.popupHidden).toLocaleString();
 $("dashboardTabsStopped").textContent=Model.number(d.scamTabsBlocked).toLocaleString();
 const requests=Model.requestRows(d);
 $("dashboardLogState").textContent=!d.requestLog?
  "Private request logging is OFF. Turn it on in Settings to show future blocks.":
  requests.length?requests.length+" recent blocked requests (hostnames only).":
  "No recent blocked request records for this tab.";
 render("dashboardRecent",requests,"No recent blocked requests.",row=>{
  const result=DKAccessInspector.describe(row.host,row.type,d.site);
  return line(time(row.when)+" · "+row.host+" · "+result.observed+
   " · "+result.purpose+" ("+result.certainty+" inference)");
 });
 render("dashboardPopupHistory",Model.popupRows(d),
  d.requestLog?"No recent popup closures.":"Popup history is unavailable while private request logging is off.",
  row=>line(time(row.when)+" · "+row.host+" · "+row.reason));
 render("dashboardCustomAllowances",Model.customHosts(d),
  "No custom host allowances for this site.",host=>
   line(host+" · all matching request types", "Revoke",()=>revokeHost(host)));
 render("dashboardRequestAllowances",Model.allowances(d),
  "No narrow request allowances for this site.",row=>
   line(row.host+" · "+row.type+" · "+row.scope+
    (row.scope==="temporary"?" (expires "+time(row.expires)+")":""),
    "Revoke",()=>revokeRequest(row)));
 $("dashboardFilterDetails").textContent=d.filterBackend+" · "+
  Model.number(d.networkRules).toLocaleString()+" network filters · "+
  Model.number(d.cosmeticRules).toLocaleString()+" element-hiding filters · "+
  Model.number(d.unsupportedRules).toLocaleString()+" unsupported filters";
}
async function refresh(){
 const token=++requestToken,id=selected();
 if(id===null){clearDisplay("Choose a normal website tab to inspect.");return;}
 loading=true;notice("Refreshing local site status…");
 try{
  const data=await browser.runtime.sendMessage({action:"getSiteDashboard",tabId:id});
  if(token!==requestToken)return;
  if(!data?.ok)throw Error(data?.error||"Site dashboard unavailable.");
  const live=await browser.tabs.get(id);
  if(token!==requestToken)return;
  if(!/^https?:\/\//i.test(live?.url||"")||
    Model.hostname(new URL(live.url).hostname.toLowerCase())!==data.site)
   throw Error("The tab navigated during inspection. Refresh to see its new site.");
  display(data);notice("Showing local status for "+data.site);
 }catch(error){if(token===requestToken)clearDisplay(error?.message||"Could not load site.");}
 finally{if(token===requestToken)loading=false;}
}
$("dashboardTab").addEventListener("change",refresh);
$("dashboardRefresh").addEventListener("click",refresh);
$("dashboardRefreshTabs").addEventListener("click",()=>selectTabs());
$("dashboardAllowlist").addEventListener("click",()=>perform("setSiteAllowed",
 current?.sitePaused?null:"Allowlist "+current?.site+" and its subdomains? This turns OFF ALL blocking there.",true));
$("dashboardPause").addEventListener("click",()=>perform("toggleTabPause",null,true));
$("dashboardCookie").addEventListener("click",()=>toggleFeature("cookieReject"));
$("dashboardDistraction").addEventListener("click",()=>toggleFeature("distractionControl"));
$("dashboardClearLog").addEventListener("click",async()=>{
 if(!current?.ok||!window.confirm("Clear recent blocked-request history for this tab? The blocked counter is unchanged."))return;
 try{
  const data=current;await verifyCurrentTab();
  const response=await browser.runtime.sendMessage({action:"clearLog",tabId:data.tabId});
  if(!response?.ok)throw Error(response?.error||"Could not clear log.");
  await refresh();
 }catch(error){notice(error?.message);}
});
$("dashboardMonitor").addEventListener("click",()=>{
 const id=selected();
 if(id!==null)openLocal("network-monitor.html?tab="+id);
});
$("dashboardReport").addEventListener("click",()=>openLocal("report.html"));
$("dashboardOptions").addEventListener("click",()=>browser.runtime.openOptionsPage());
const preferred=Number(new URLSearchParams(location.search).get("tab"));
selectTabs(Number.isSafeInteger(preferred)&&preferred>=0?preferred:null)
 .catch(error=>clearDisplay(error?.message||"Could not open dashboard."));
