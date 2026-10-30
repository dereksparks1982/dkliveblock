"use strict";
const $=id=>document.getElementById(id);
let tabId=null,lastSnapshot=null,displayLimit=250,polling=false,allowances=[];
const MONITOR_STATES=new Set(["blocked","allowed","failed","redirected","pending"]);
const safeTabId=value=>/^[0-9]{1,10}$/.test(String(value||""))?Number(value):null;
function csvField(value){const s=String(value??"");return '"'+s.replace(/"/g,'""')+'"';}
async function tabs(){
 const available=(await browser.tabs.query({currentWindow:true})).filter(tab=>
  Number.isInteger(tab.id)&&/^https?:\/\//i.test(tab.url||""));
 const selected=tabId;
 const selector=$("monitorTab");selector.replaceChildren();
 for(const tab of available){
  const option=document.createElement("option");option.value=String(tab.id);
  const host=new URL(tab.url).hostname;
  option.textContent=host+" · Tab "+tab.id+" · "+String(tab.title||"").slice(0,65);
  selector.appendChild(option);
 }
 const query=safeTabId(new URL(location.href).searchParams.get("tab"));
 const chosen=available.find(t=>t.id===selected)||available.find(t=>t.id===query)||
  available.find(t=>t.active)||available[0];
 tabId=chosen?.id??null;
 if(tabId!==null)selector.value=String(tabId);
 $("monitorState").textContent=chosen?"Selected: "+new URL(chosen.url).hostname+". Click Start capture to begin.":
  "Open a regular website tab first.";
}
function matches(entry){
 const status=$("monitorStatus").value,type=$("monitorType").value;
 const search=$("monitorSearch").value.trim().toLowerCase();
 return (status==="all"||entry.status===status)&&(type==="all"||entry.type===type)&&
  (!search||entry.host.includes(search));
}
function render(){
 const snapshot=lastSnapshot||{rows:[],counts:{},seen:0,dropped:0,active:false,siteHost:""};
 $("monitorSeen").textContent=String(snapshot.seen||0);
 for(const [key,id] of Object.entries({blocked:"monitorBlocked",allowed:"monitorAllowed",
  failed:"monitorFailed",redirected:"monitorRedirected",pending:"monitorPending"}))
  $(id).textContent=String(snapshot.counts?.[key]||0);
 const allTypes=[...new Set(snapshot.rows.map(x=>x.type))].sort();
 const selector=$("monitorType"),previous=selector.value||"all";
 selector.replaceChildren();
 for(const type of ["all",...allTypes]){
  const option=document.createElement("option");option.value=type;
  option.textContent=type==="all"?"All types":type;selector.appendChild(option);
 }
 selector.value=["all",...allTypes].includes(previous)?previous:"all";
 const filtered=snapshot.rows.filter(matches).reverse();
 const visible=filtered.slice(0,displayLimit);
 const body=$("monitorRows");body.replaceChildren();
 for(const entry of visible){
  const row=document.createElement("tr");
  for(const value of [new Date(entry.when).toLocaleTimeString(),entry.status,entry.host,
   entry.type,entry.method||"–",entry.httpStatus??"–",entry.reason||entry.error||"–"]){
   const cell=document.createElement("td");cell.textContent=String(value);row.appendChild(cell);
  }

  const info=DKAccessInspector.describe(entry.host,entry.type,snapshot.siteHost);
  const purpose=document.createElement("td");
  purpose.textContent=info.observed+" · "+(info.thirdParty?"Third-party":"Same-site")+
   " · "+(info.certainty==="likely"?"Likely: ":"Unknown purpose: ")+info.purpose;
  purpose.title=info.access;
  row.appendChild(purpose);
  const control=document.createElement("td");
  if(entry.status==="blocked"&&entry.host&&DKAccessInspector&&
      !["popup","main_frame","document"].includes(entry.type)){
   const toggle=document.createElement("input");
   toggle.type="checkbox";
   toggle.checked=allowances.some(x=>x.host===entry.host&&x.type===entry.type);
   toggle.title="Switch allowance for "+entry.host+" ("+entry.type+
    ") on this website. Different URL paths may also pass.";
   toggle.setAttribute("aria-label","Allow "+entry.type+" requests from "+entry.host);
   toggle.addEventListener("change",async()=>{
    const enabling=toggle.checked;toggle.disabled=true;
    const ok=enabling?await allowEntry(entry):await revokeEntry(entry);
    if(!ok)toggle.checked=!enabling;
    toggle.disabled=false;
   });
   const label=document.createElement("label");label.append(toggle,
    document.createTextNode(" Allow host + type"));
   control.appendChild(label);
  }else{
   control.textContent=entry.status==="blocked"?
    "No exception available":"No action";
  }
  row.appendChild(control);
  body.appendChild(row);
 }
 $("monitorMore").hidden=filtered.length<=displayLimit;
 $("monitorCount").textContent=filtered.length+" matching requests; showing "+visible.length+
  (snapshot.dropped?" · "+snapshot.dropped+" oldest requests discarded at the 1,500-row limit.":"");
 $("monitorState").textContent=snapshot.active?
  "Capturing network requests on "+snapshot.siteHost+" (this tab only).":
  snapshot.seen?"Capture stopped for "+snapshot.siteHost+". Results remain in memory.":
  "Capture not running. Click Start capture to see new network requests.";
}
function renderAllowances(){
 const panel=$("allowList");panel.replaceChildren();
 if(!allowances.length){panel.textContent="No currently active request allowances for this website.";return;}
 for(const item of allowances){
  const line=document.createElement("div");line.className="log-row";
  const description=document.createElement("span");
  description.textContent=item.host+" · "+item.type+" · "+(
   item.scope==="temporary"?"This tab (expires "+new Date(item.expires).toLocaleTimeString()+")":
   item.scope==="session"?"Current browser session":"Remembered for this website");
  const button=document.createElement("button");button.textContent="Revoke";
  button.addEventListener("click",async()=>{
   button.disabled=true;
   try{
    const response=await browser.runtime.sendMessage({action:"revokeMonitoredRequest",
     tabId,host:item.host,type:item.type,scope:item.scope});
    if(!response?.ok)throw Error(response?.error||"Unable to revoke");
    $("allowStatus").textContent="Exception revoked. Future matching requests follow normal blocking rules.";
    await update();
   }catch(error){$("allowStatus").textContent=error.message;}
   finally{button.disabled=false;}
  });
  line.append(description,button);panel.appendChild(line);
 }
}
async function revokeEntry(item){
 if(tabId===null)return false;
 const entries=allowances.filter(x=>x.host===item.host&&x.type===item.type);
 if(!entries.length)return false;
 try{
  for(const entry of entries){
   const result=await browser.runtime.sendMessage({action:"revokeMonitoredRequest",
    tabId,host:entry.host,type:entry.type,scope:entry.scope});
   if(!result?.ok)throw Error(result?.error||"Could not revoke request allowance");
  }
  $("allowStatus").textContent="Allowance switched off for "+item.host+" ("+item.type+
   "). Future matching requests follow the normal filters.";
  await update();return true;
 }catch(error){$("allowStatus").textContent=error.message;return false;}
}
async function allowEntry(item){
 if(tabId===null||!lastSnapshot?.active)return false;
 const scope=$("allowScope").value;
 const description=scope==="temporary"?"10 minutes in this tab":
  scope==="session"?"the current browser session":"future visits to this website";
 const warning="Allow "+item.type+" requests from "+item.host+" on "+lastSnapshot.siteHost+
  " for "+description+"?\n\n"+
  "IMPORTANT: This applies to ALL matching requests from this hostname and resource type, "+
  "not only this specific URL. Ads or trackers from the same pair could also load.";
 if(!window.confirm(warning))return false;
 const sourceTab=tabId; // Keep the click associated with its original tab.
 try{
  const response=await browser.runtime.sendMessage({action:"allowMonitoredRequest",
   tabId:sourceTab,host:item.host,type:item.type,scope,confirm:true});
  if(!response?.ok)throw Error(response?.error||"Unable to add allowance");
  $("allowStatus").textContent="Allowed "+item.host+" ("+item.type+") for "+description+
   ". Reload the website to retry previously blocked requests.";
  await update();return true;
 }catch(error){$("allowStatus").textContent=error.message;return false;}
}
async function update(){
 if(tabId===null||polling)return;
 polling=true;
 const queried=tabId;
 try{
  const [response,permitted]=await Promise.all([
   browser.runtime.sendMessage({action:"getNetworkMonitor",tabId:queried}),
   browser.runtime.sendMessage({action:"getRequestAllowances",tabId:queried})
  ]);
  if(queried!==tabId)return;
  if(!response||!Array.isArray(response.rows))throw Error(response?.error||"Monitor unavailable");
  if(response.rows.length>1500)throw Error("Invalid monitor response");
  lastSnapshot=response;
  allowances=Array.isArray(permitted)?permitted:[];
  render();renderAllowances();
 }catch(error){$("monitorState").textContent="Unable to inspect traffic: "+String(error.message||error).slice(0,160);}
 finally{polling=false;}
}
async function action(name){
 if(tabId===null)return;
 const result=await browser.runtime.sendMessage({action:name,tabId});
 if(!result?.ok)throw Error(result?.error||"Action rejected");
 await update();
}
$("monitorRefreshTabs").addEventListener("click",()=>tabs().then(update).catch(e=>$("monitorState").textContent=e.message));
$("monitorTab").addEventListener("change",()=>{
 tabId=safeTabId($("monitorTab").value);
 lastSnapshot=null;allowances=[];displayLimit=250;update();
});
$("monitorStart").addEventListener("click",()=>action("startNetworkMonitor").catch(e=>$("monitorState").textContent=e.message));
$("monitorStop").addEventListener("click",()=>action("stopNetworkMonitor").catch(e=>$("monitorState").textContent=e.message));
$("monitorClear").addEventListener("click",()=>action("clearNetworkMonitor").catch(e=>$("monitorState").textContent=e.message));
$("monitorMore").addEventListener("click",()=>{displayLimit+=250;render();});
for(const id of ["monitorStatus","monitorType","monitorSearch"])
 $(id).addEventListener(id==="monitorSearch"?"input":"change",()=>{displayLimit=250;render();});
$("monitorExport").addEventListener("click",()=>{
 if(!lastSnapshot?.rows?.length)return $("monitorState").textContent="No captured requests to export.";
 const header=["Time","Decision","Hostname","Resource type","Method","HTTP status","Detail"];
 const rows=lastSnapshot.rows.map(item=>[
  new Date(item.when).toISOString(),item.status,item.host,item.type,item.method,
  item.httpStatus??"",item.reason||item.error||""]);
 const csv=[header,...rows].map(row=>row.map(csvField).join(",")).join("\r\n");
 const url=URL.createObjectURL(new Blob([csv],{type:"text/csv"}));
 const link=document.createElement("a");link.href=url;link.download="dk-live-block-network-monitor.csv";
 link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
 $("monitorState").textContent="CSV exported locally. It contains only the fields shown in this monitor.";
});
tabs().then(update).catch(e=>$("monitorState").textContent=e.message);
setInterval(()=>{if(!document.hidden)update().catch(()=>{});},1600);
