"use strict";
const $=id=>document.getElementById(id),Model=DKSiteDashboardModel,Details=DKBlockDetails;
let current=null,requestToken=0,loading=false,busy=false;
let focusBlockedRequests=location.hash==="#blocked-requests";
let selectedBlock=null,blockLookupToken=0;
function tabHost(url){
 try{return /^https?:\/\//i.test(url||"")?Model.hostname(new URL(url).hostname.toLowerCase()):"";}
 catch(_){return "";}
}
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
  if(!Number.isInteger(tab.id))continue;
  const host=tabHost(tab.url);
  if(!host)continue;
  const option=document.createElement("option");option.value=String(tab.id);
  option.textContent=host+" · Tab "+tab.id+" · "+String(tab.title||"").slice(0,65);
  picker.appendChild(option);
 }
 const choices=[preferred,previous].filter(id=>Number.isInteger(id)&&id>=0);
 const active=list.find(tab=>tab.active&&tabHost(tab.url));
 if(active)choices.push(active.id);
 for(const id of choices){
  if([...picker.options].some(option=>option.value===String(id))){
   picker.value=String(id);break;
  }
 }
 await refresh();
}
function addDetail(label,value){
 const term=document.createElement("dt");term.textContent=label;
 const desc=document.createElement("dd");desc.textContent=String(value??"Not available");
 $("blockDetailFields").append(term,desc);
}
function closeBlock(){
 selectedBlock=null;blockLookupToken++;
 $("dashboardBlockDetails").hidden=true;$("blockRdapResult").textContent="";
}
function showBlock(row){
 if(!current?.ok||!row?.host)return;
 const info=Details.summary(row.host,row.type,current.site,row.ruleType);
 const currentTab=current.tabId,token=++blockLookupToken;
 selectedBlock={host:row.host,site:current.site,tabId:currentTab,token};
 const section=$("dashboardBlockDetails");section.hidden=false;
 $("blockDetailFields").replaceChildren();
 addDetail("Event",row.sequence?"Blocked request #"+row.sequence:"Recorded blocked request");
 addDetail("Destination hostname",info.host);
 addDetail("Website tab",current.site);
 addDetail("When",time(row.when));
 addDetail("Request type",info.resource+" ("+row.type+")");
 addDetail("Third-party relation",info.thirdParty===null?"Not established":info.thirdParty?"Different hostname from website":"Same website or subdomain");
 addDetail("Why DK Live Block stopped it",info.why);
 addDetail("Service operator (local reference)",info.operator);
 addDetail("Operator evidence",info.operatorEvidence);
 addDetail("Common service purpose (not observed behavior)",info.purpose);
 addDetail("Essential or optional?",info.importance);
 addDetail("Scope of evidence",info.access);
 $("blockRdapResult").textContent="Registration details are not fetched unless you click the lookup button.";
 const links=$("blockDetailLinks");links.replaceChildren();
 const items=[...Details.researchLinks(row.host)];
 if(info.operatorUrl)items.unshift({label:"Service operator website",url:info.operatorUrl});
 for(const item of items){
  const link=document.createElement("a");link.href=item.url;link.target="_blank";
  link.rel="noopener noreferrer";link.textContent=item.label;
  links.appendChild(link);
 }
 section.scrollIntoView?.({block:"nearest"});section.focus?.();
}
async function lookupBlockRegistration(){
 const target=selectedBlock;if(!target||!current?.ok||
  current.tabId!==target.tabId||current.site!==target.site)return;
 const result=$("blockRdapResult"),button=$("blockRdapLookup");
 button.disabled=true;result.textContent="Looking up public domain registration…";
 const token=++blockLookupToken;selectedBlock={...target,token};
 try{
  const response=await browser.runtime.sendMessage({
   action:"lookupBlockedDomain",tabId:target.tabId,expectedSite:target.site,host:target.host
  });
  if(!selectedBlock||selectedBlock.token!==token)return;
  result.textContent=response?.error?response.error:
   "Registered domain: "+response.domain+" · Registered organization: "+
   (response.organization||"Not publicly disclosed")+" · Registrar: "+
   (response.registrar||"Not disclosed")+
   " · Expires: "+(response.expires||"Not disclosed")+
   ". Registration is not proof of who operated this request.";
 }catch(error){if(selectedBlock?.token===token)
  result.textContent="Could not retrieve RDAP: "+String(error.message||error).slice(0,140);
 }finally{button.disabled=false;}
}
$("blockDetailClose").addEventListener("click",closeBlock);
$("blockRdapLookup").addEventListener("click",lookupBlockRegistration);
function setButtons(d){
 for(const id of ["dashboardTab","dashboardRefresh","dashboardRefreshTabs"])
  $(id).disabled=busy;
 $("dashboardAllowlist").disabled=busy||!d?.ok||!d.globalEnabled;
 $("dashboardPause").disabled=busy||!d?.ok||!d.globalEnabled||d.sitePaused;
 $("dashboardCookie").disabled=busy||!d?.ok||!d.siteActive||!d.cookieRejectEnabled;
 $("dashboardDistraction").disabled=busy||!d?.ok||!d.siteActive||!d.distractionEnabled;
 $("dashboardClearLog").disabled=busy||!d?.ok||!d.requestLog;
 $("dashboardMonitor").disabled=busy||!d?.ok;
 $("dashboardAllowlist").textContent=d?.sitePaused?"Remove from allowlist":"Allowlist website";
 $("dashboardPause").textContent=d?.temporarilyPaused?"Resume this tab":"Pause this tab";
 $("dashboardCookie").textContent=d?.cookieRejectPaused?"Resume cookie rejection here":"Pause cookie rejection here";
 $("dashboardDistraction").textContent=d?.distractionPaused?"Resume distraction cleanup here":"Pause distraction cleanup here";
}
function clearDisplay(message){
 closeBlock();current=null;setButtons(null);
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
async function verifyCurrentTab(expected=current){
 if(!expected?.ok||current!==expected||selected()!==expected.tabId)
  throw Error("Selected tab changed. Refresh this dashboard.");
 const tab=await browser.tabs.get(expected.tabId);
 if(current!==expected||selected()!==expected.tabId||tabHost(tab?.url)!==expected.site)
  throw Error("The selected tab navigated. Refresh before changing settings.");
 return tab;
}
async function withAction(handler){
 if(loading||busy||!current?.ok)return;
 busy=true;setButtons(current);
 try{await handler();}
 catch(error){notice(error?.message||"Website setting failed.");}
 finally{busy=false;setButtons(current);}
}
async function perform(action,confirmText=null,reload=false){
 await withAction(async()=>{
  const data=current;
  if(confirmText&&!window.confirm(confirmText))return;
  const tab=await verifyCurrentTab(data);
  const response=await browser.runtime.sendMessage({action,tabId:data.tabId,
   url:tab.url,allowed:action==="setSiteAllowed"?!data.sitePaused:undefined,
   paused:action==="toggleTabPause"?!data.temporarilyPaused:undefined});
  if(response?.error)throw Error(response.error);
  if(reload)await browser.tabs.reload(data.tabId);
  await refresh();
 });
}
async function toggleFeature(feature){
 await withAction(async()=>{
  const data=current;
  await verifyCurrentTab(data);
  const paused=feature==="cookieReject"?!data.cookieRejectPaused:!data.distractionPaused;
  const response=await browser.runtime.sendMessage({action:"setSiteFeaturePaused",
   tabId:data.tabId,feature,paused});
  if(!response?.ok)throw Error(response?.error||"Site cleanup could not be changed.");
  await browser.tabs.reload(data.tabId);await refresh();
 });
}
async function revokeHost(host){
 await withAction(async()=>{
  const data=current;
  if(!window.confirm("Revoke the hostname allowance for "+host+" on "+data.site+"?"))return;
  await verifyCurrentTab(data);
  const r=await browser.runtime.sendMessage({action:"revokeSiteDashboardHost",
   tabId:data.tabId,expectedSite:data.site,host});
  if(!r?.ok)throw Error(r?.error||"Unable to revoke hostname.");
  await refresh();
 });
}
async function revokeRequest(row){
 await withAction(async()=>{
  const data=current;
  if(!window.confirm("Revoke "+row.scope+" permission for "+row.host+" ("+row.type+") on "+data.site+"?"))return;
  await verifyCurrentTab(data);
  const r=await browser.runtime.sendMessage({action:"revokeMonitoredRequest",
   tabId:data.tabId,expectedSite:data.site,host:row.host,type:row.type,scope:row.scope});
  if(!r?.ok)throw Error(r?.error||"Unable to revoke request permission.");
  await refresh();
 });
}
function display(d){
 closeBlock();current=d;setButtons(d);
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
 render("dashboardRecent",requests,"No recent blocked requests.",row=>
  line((row.sequence?"#"+row.sequence+" · ":"")+time(row.when)+" · "+row.host+" · "+row.type,
   "Details",()=>showBlock(row)));
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
 if(focusBlockedRequests){
  focusBlockedRequests=false;
  const section=$("blockedRequestsSection");
  section.scrollIntoView?.({block:"start"});
  section.focus?.({preventScroll:true});
 }
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
  if(tabHost(live?.url)!==data.site)
   throw Error("The tab navigated during inspection. Refresh to see its new site.");
  display(data);notice("Showing local status for "+data.site);
 }catch(error){if(token===requestToken)clearDisplay(error?.message||"Could not load site.");}
 finally{if(token===requestToken)loading=false;}
}
$("dashboardTab").addEventListener("change",()=>{if(!busy)refresh();});
$("dashboardRefresh").addEventListener("click",()=>{if(!busy)refresh();});
$("dashboardRefreshTabs").addEventListener("click",()=>{if(!busy)selectTabs();});
$("dashboardAllowlist").addEventListener("click",()=>perform("setSiteAllowed",
 current?.sitePaused?null:"Allowlist "+current?.site+" and its subdomains? This turns OFF ALL blocking there.",true));
$("dashboardPause").addEventListener("click",()=>perform("toggleTabPause",null,true));
$("dashboardCookie").addEventListener("click",()=>toggleFeature("cookieReject"));
$("dashboardDistraction").addEventListener("click",()=>toggleFeature("distractionControl"));
$("dashboardClearLog").addEventListener("click",()=>withAction(async()=>{
 const data=current;
 if(!window.confirm("Clear blocked-request history and streaming diagnostics on this tab? Counters remain unchanged."))return;
 await verifyCurrentTab(data);
 const result=await browser.runtime.sendMessage({action:"clearSiteDashboardLog",
  tabId:data.tabId,expectedSite:data.site});
 if(!result?.ok)throw Error(result?.error||"Unable to clear log.");
 await refresh();
}));
$("dashboardMonitor").addEventListener("click",()=>{
 const id=selected();
 if(id!==null)openLocal("network-monitor.html?tab="+id);
});
$("dashboardReport").addEventListener("click",()=>openLocal("report.html"));
$("dashboardOptions").addEventListener("click",()=>browser.runtime.openOptionsPage());
const tabParameter=new URLSearchParams(location.search).get("tab");
const preferred=tabParameter!==null&&/^\d+$/.test(tabParameter)?Number(tabParameter):null;
selectTabs(Number.isSafeInteger(preferred)&&preferred>=0?preferred:null)
 .catch(error=>clearDisplay(error?.message||"Could not open dashboard."));
