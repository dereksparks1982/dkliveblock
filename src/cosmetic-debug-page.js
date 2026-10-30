"use strict";
const $=id=>document.getElementById(id);
const target=Number(new URLSearchParams(location.search).get("tab"));
let siteHost="";
async function send(action,payload={}){
 if(!Number.isInteger(target)||target<0)throw Error("No original website tab selected.");
 const result=await browser.tabs.sendMessage(target,{action,siteHost,...payload});
 if(result?.error)throw Error(result.error);
 return result;
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
   line.append(description,highlight);list.appendChild(line);
  }
 }catch(e){$("debugStatus").textContent=String(e?.message||e).slice(0,200);}
}
$("debugScan").addEventListener("click",scan);
$("debugClear").addEventListener("click",async()=>{
 try{await send("clearCosmeticDebug");$("debugStatus").textContent="Temporary outlines cleared.";}
 catch(e){$("debugStatus").textContent=String(e?.message||e);}
});
window.addEventListener("pagehide",()=>{send("clearCosmeticDebug").catch(()=>{});});
