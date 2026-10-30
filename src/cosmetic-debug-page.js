"use strict";
const $=id=>document.getElementById(id);
const rawTab=new URLSearchParams(location.search).get("tab");
const target=rawTab!==null&&/^\d{1,10}$/.test(rawTab)?Number(rawTab):NaN;
let siteHost="";
async function send(action,payload={}){
 if(!Number.isInteger(target)||target<0)throw Error("No original website tab selected.");
 const result=await browser.tabs.sendMessage(target,{action,siteHost,...payload});
 if(result?.error)throw Error(result.error);
 return result;
}
async function allowed(){
 const list=$("debugAllowed");list.replaceChildren();
 const result=await browser.runtime.sendMessage({action:"getCosmeticSiteExceptions",tabId:target});
 if(!result?.ok)throw Error(result?.error||"Unable to read site exceptions.");
 siteHost=result.siteHost;
 const selectors=Array.isArray(result.selectors)?result.selectors:[];
 if(!selectors.length){list.textContent="No site-specific cosmetic exceptions.";return;}
 for(const selector of selectors){
  const row=document.createElement("div");row.className="log-row";
  const text=document.createElement("span");text.textContent=selector;
  const remove=document.createElement("button");
  remove.type="button";remove.textContent="Restore hiding";
  remove.addEventListener("click",async()=>{
   if(!window.confirm("Restore normal cosmetic hiding for this selector on "+siteHost+"?"))return;
   remove.disabled=true;
   try{
    const reply=await browser.runtime.sendMessage({action:"setCosmeticSiteException",
     tabId:target,selector,allowed:false});
    if(!reply?.ok)throw Error(reply?.error||"Unable to restore hiding.");
    await send("clearCosmeticDebug");await allowed();
    $("debugStatus").textContent="Cosmetic exception removed. Reload the website to apply.";
   }catch(error){$("debugStatus").textContent=String(error.message||error);remove.disabled=false;}
  });
  row.append(text,remove);list.appendChild(row);
 }
}
async function scan(){
 const list=$("debugRows");list.replaceChildren();
 $("debugStatus").textContent="Inspecting matching rules…";
 try{
  const source=await browser.runtime.sendMessage({action:"getCosmeticDebugSelectors",tabId:target});
  if(!source?.ok)throw Error(source?.error||"Could not inspect rules.");
  siteHost=source.siteHost;
  const reply=await send("inspectCosmeticDebug",{selectors:source.selectors});
  const rows=Array.isArray(reply?.rows)?reply.rows:[];
  $("debugStatus").textContent=rows.length+" eligible cosmetic selector(s) inspected for "+siteHost+
   ". Only matches and selectors are shown; no page content is read.";
  await allowed();
  for(const record of rows){
   const line=document.createElement("div");line.className="log-row";
   const description=document.createElement("span");
   description.textContent=record.selector+" · "+(record.unsupported?"Unsupported selector":
    record.matches+(record.capped?"+":"")+" matching element(s)");
   const highlight=document.createElement("button");
   highlight.type="button";highlight.textContent="Outline matching elements";
   highlight.disabled=record.unsupported||!record.matches;
   highlight.addEventListener("click",async()=>{
    highlight.disabled=true;
    try{
     const result=await send("highlightCosmeticDebug",{selector:record.selector});
     $("debugStatus").textContent=result.note||result.error||"Outline preview applied.";
    }catch(e){$("debugStatus").textContent=String(e?.message||e);}
    finally{highlight.disabled=false;}
   });
   const allow=document.createElement("button");
   allow.type="button";allow.textContent="Stop hiding on this site";
   allow.disabled=record.unsupported||!record.matches;
   allow.addEventListener("click",async()=>{
    if(!window.confirm("Stop hiding elements matching "+record.selector+" on "+siteHost+"? This only changes cosmetic hiding, not network blocking."))return;
    allow.disabled=true;
    try{
     const reply=await browser.runtime.sendMessage({action:"setCosmeticSiteException",
      tabId:target,selector:record.selector,allowed:true});
     if(!reply?.ok)throw Error(reply?.error||"Unable to allow selector.");
     await send("clearCosmeticDebug");await allowed();
     $("debugStatus").textContent="Cosmetic exception saved. Reload the website to see matching elements again.";
    }catch(error){$("debugStatus").textContent=String(error.message||error);allow.disabled=false;}
   });
   line.append(description,highlight,allow);list.appendChild(line);
  }
 }catch(e){$("debugStatus").textContent=String(e?.message||e).slice(0,200);}
}
$("debugScan").addEventListener("click",scan);
$("debugClear").addEventListener("click",async()=>{
 try{await send("clearCosmeticDebug");$("debugStatus").textContent="Temporary outlines cleared.";}
 catch(e){$("debugStatus").textContent=String(e?.message||e);}
});
window.addEventListener("pagehide",()=>{send("clearCosmeticDebug").catch(()=>{});});
