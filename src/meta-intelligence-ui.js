"use strict";
(function(){
 const $=id=>document.getElementById(id);
 const params=new URLSearchParams(location.search);
 const idText=params.get("tab");
 const tabId=idText!==null&&/^\d+$/.test(idText)?Number(idText):null;
 let ready=false;
 let facebookReport=null;
 // Human-readable triage follows the saved English/Russian preference.
 // Keep the underlying JSON source report unchanged and safe for export.
 const local=s=>DKUILanguage.translate(String(s),document.documentElement?.lang||"en");
 function renderFacebook(){
  if(!facebookReport)return;
  const state=facebookReport.triage;
  $("facebookDiagnostics").textContent=local("Facebook diagnostic: ")+
   local(state.code)+"\n"+local(state.next)+"\n\n"+
   JSON.stringify(facebookReport,null,2);
 }

 // Explicit read-only inspection: no page text, cookies or individual URLs.
 async function checkFacebook(){
  const panel=$("facebookDiagnostics");
  facebookReport=null;$("facebookExport").disabled=true;
  if(!Number.isSafeInteger(tabId)||tabId<0){
   panel.textContent="Select a Facebook tab through the Site Dashboard.";return;
  }
  try{
   const tab=await browser.tabs.get(tabId);
   if(!/^https:\/\/(?:[^/]+\.)?facebook\.com(?:\/|$)/i.test(tab?.url||"")){
    panel.textContent="This diagnostic works on a Facebook tab only.";return;
   }
   const reply=await browser.tabs.sendMessage(tabId,
    {action:"getFacebookDetectorStatus"},{frameId:0});
   if(!reply?.ok)throw Error(reply?.error||"Detector unavailable");
   // Two independently authorized, read-only sources. A missing GraphQL
   // reply is explicitly unavailable, never assumed disabled or successful.
   let graphqlReply=null;
   try{graphqlReply=await browser.runtime.sendMessage({action:"getMetaGraphqlStats",tabId});}
   catch(_){/* Scanner evidence is still useful when GraphQL is unavailable. */}
   const after=await browser.tabs.get(tabId);
   if(after?.url!==tab.url)throw Error("Facebook tab changed during diagnostic. Retry.");
   facebookReport=DKFacebookDiagnosticReport.build(reply,graphqlReply);
   if(!facebookReport)throw Error("Diagnostic report unavailable");
   renderFacebook();
   $("facebookExport").disabled=false;
  }catch(e){
   panel.textContent=local("Could not read the Facebook detector. Reload the Facebook tab and DK Live Block. ")+String(e?.message||"");
  }
 }
 $("graphqlCheck").addEventListener("click",async()=>{
  const box=$("graphqlDiagnostics");
  if(!Number.isSafeInteger(tabId)||tabId<0){
   box.textContent="Choose a Facebook tab from the Site Dashboard.";return;
  }
  try{
   const result=await browser.runtime.sendMessage({action:"getMetaGraphqlStats",tabId});
   if(!result?.ok)throw Error(result?.error||"Unavailable");
   // Share the same fixed-key sanitization with the user-exported report.
   const clean=DKFacebookDiagnosticReport.graphql(result);
   box.textContent=JSON.stringify({
    enabled:clean.enabled,siteActive:clean.siteActive,
    supported:clean.supported,stats:clean.counters
   },null,2);
  }catch(error){box.textContent=String(error?.message||"Unavailable");}
 });
 $("facebookCheck").addEventListener("click",()=>checkFacebook());
 browser.storage.onChanged?.addListener((changes,area)=>{
  if(area==="local"&&changes.dkUiLanguage&&facebookReport)
   queueMicrotask(()=>{if(facebookReport)renderFacebook();});
 });

 $("facebookExport").addEventListener("click",()=>{
  if(!facebookReport)return;
  const blob=new Blob([JSON.stringify(facebookReport,null,2)+"\n"],{type:"application/json"});
  const url=URL.createObjectURL(blob),a=document.createElement("a");
  a.href=url;a.download="dk-live-block-facebook-detector.json";
  document.body.appendChild(a);a.click();a.remove();
  setTimeout(()=>URL.revokeObjectURL(url),1000);
 });

 // Render a read-only inventory. Each row is a potential mechanism, not a
 // claim that a request is an ad or an instruction to block anything.
 const catalog=globalThis.DKMetaDeliveryCatalog?.entries||[];
 const list=$("deliveryMethods");
 if(list)for(const method of catalog){
  const item=document.createElement("li");
  item.textContent=method.description+" ["+method.layer+"] · "+method.mode+
   " only · evidence: "+method.signal+" + "+method.context;
  list.appendChild(item);
 }
 function status(s){$("status").textContent=s;}
 function empty(s){$("rows").replaceChildren();const row=document.createElement("tr"),cell=document.createElement("td");cell.colSpan=5;cell.textContent=s;row.appendChild(cell);$("rows").appendChild(row);}
 function display(data){
  const items=Array.isArray(data.observations)?data.observations:[];
  ready=!!data.ok&&!!data.logged;
  $("clear").disabled=!ready||!items.length;
  if(!data.logged){empty("Private request logging is disabled.");return;}
  if(!items.length){empty("No third-party destinations observed in the current session.");return;}
  const fragment=document.createDocumentFragment();
  for(const item of items.slice(0,100)){
   if(!item||typeof item.host!=="string")continue;
   const tr=document.createElement("tr");
   for(const value of [item.host,item.type||"unknown",item.allowed||0,item.blocked||0,
      Array.isArray(item.evidence)?item.evidence.join(", "):""]){
    const td=document.createElement("td");td.textContent=String(value);tr.appendChild(td);
   }fragment.appendChild(tr);
  }
  $("rows").replaceChildren(fragment);
 }
 async function request(action){
  if(!Number.isSafeInteger(tabId)||tabId<0){status("Open this page from the Site Dashboard while a Meta tab is selected.");return null;}
  try{const r=await browser.runtime.sendMessage({action,tabId});
   if(!r?.ok)throw Error(r?.error||"Request failed");return r;
  }catch(e){status(e?.message||"Request failed");return null;}
 }
 async function refresh(){
  status("Reading local evidence…");
  const r=await request("getMetaProviderIntel");
  if(r){display(r);status("Observed third-party destinations for "+r.site+".");}
 }
 $("refresh").addEventListener("click",refresh);
 $("clear").addEventListener("click",async()=>{
  if(!ready||!window.confirm("Clear all local Meta provider observations?"))return;
  const r=await request("clearMetaProviderIntel");if(r)await refresh();
 });
 refresh();
})();