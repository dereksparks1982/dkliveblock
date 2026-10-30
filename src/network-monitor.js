"use strict";
const $=id=>document.getElementById(id);
let tabId=null,lastSnapshot=null,displayLimit=250,polling=false;
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
async function update(){
 if(tabId===null||polling)return;
 polling=true;
 try{
  const response=await browser.runtime.sendMessage({action:"getNetworkMonitor",tabId});
  if(!response||!Array.isArray(response.rows))throw Error(response?.error||"Monitor unavailable");
  if(response.rows.length>1500)throw Error("Invalid monitor response");
  lastSnapshot=response;render();
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
$("monitorTab").addEventListener("change",()=>{tabId=safeTabId($("monitorTab").value);lastSnapshot=null;displayLimit=250;update();});
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
