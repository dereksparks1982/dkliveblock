"use strict";
(function(){
 const $=id=>document.getElementById(id);
 const value=new URLSearchParams(location.search).get("tab");
 const tabId=value!==null&&/^\d+$/.test(value)?Number(value):null;
 let ready=false;
 function status(text){$("status").textContent=text;}
 function empty(message){const row=document.createElement("tr"),cell=document.createElement("td");
  cell.colSpan=6;cell.textContent=message;row.appendChild(cell);$("rows").replaceChildren(row);}
 async function request(action){
  if(!Number.isSafeInteger(tabId)||tabId<0){status("Open from the Site Dashboard after selecting a website.");return null;}
  try{
   const r=await browser.runtime.sendMessage({action,tabId});
   if(!r?.ok)throw Error(r?.error||"Unavailable");return r;
  }catch(e){status(String(e?.message||"Unavailable"));return null;}
 }
 function render(d){
  const entries=Array.isArray(d.observations)?d.observations:[];
  ready=d.recording===true;
  $("clear").disabled=!ready||!entries.length;
  const agents=Array.isArray(d.agents)?d.agents:[];
  const specialist=d.specialist?.title||"Nesty Cookie Watch";
  $("agents").textContent=specialist+" · "+agents.map(x=>
   (x.title?.split(" · ").pop()||x.type||x.id||"Unknown method")+": "+
   (x.armed?"armed, waiting for event":"standby, not armed")).join(" · ");
  if(!ready){empty("Local request history is disabled in DK Live Block settings.");return;}
  if(!entries.length){empty("No HTTP Set-Cookie attempts recorded for this website in this session.");return;}
  const frag=document.createDocumentFragment();
  for(const e of entries.slice(0,150)){
   if(!e||typeof e.name!=="string"||typeof e.domain!=="string")continue;
   const attrs=[e.secure?"Secure":"",e.httpOnly?"HttpOnly":"",
    e.partitioned?"Partitioned":"",e.sameSite?"SameSite "+e.sameSite:"",e.path?"Path "+e.path:""].filter(Boolean).join(" · ");
   const tr=document.createElement("tr");
   const values=[e.name,e.domain,attrs,e.attempts||1,
    Number.isFinite(e.observedAt)?new Date(e.observedAt).toLocaleString():"unknown",
    (e.purpose||"unknown")+" / "+(e.owner||"unverified")];
   for(const x of values){const td=document.createElement("td");td.textContent=String(x);tr.appendChild(td);}
   frag.appendChild(tr);
  }
  $("rows").replaceChildren(frag);
 }
 async function refresh(){
  status("Checking local Agent Nesty…");
  const r=await request("getAgentNestyCookieIntel");
  if(r){render(r);status("Local observations for "+r.site+". HTTP response evidence only.");}
 }
 $("refresh").addEventListener("click",refresh);
 $("clear").addEventListener("click",async()=>{
  if(!ready||!window.confirm("Clear all local cookie attempt observations?"))return;
  const r=await request("clearAgentNestyCookieIntel");if(r)await refresh();
 });
 refresh();
})();