"use strict";
(function(){
 const $=id=>document.getElementById(id);
 const params=new URLSearchParams(location.search);
 const idText=params.get("tab");
 const tabId=idText!==null&&/^\d+$/.test(idText)?Number(idText):null;
 let ready=false;
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