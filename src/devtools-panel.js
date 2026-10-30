"use strict";
const $=id=>document.getElementById(id);
const tabId=browser.devtools?.inspectedWindow?.tabId;
async function request(action){
 if(!Number.isInteger(tabId)||tabId<0)throw Error("No inspected Firefox tab.");
 const result=await browser.runtime.sendMessage({action,tabId});
 if(result?.error)throw Error(result.error);
 return result;
}
async function refresh(){
 try{
  const snapshot=await request("getNetworkMonitor");
  $("rows").replaceChildren();
  if(!snapshot||!Array.isArray(snapshot.rows))throw Error("Monitor response unavailable.");
  $("summary").textContent=(snapshot.active?"Capturing":"Stopped")+" · "+
   (snapshot.seen||0)+" requests observed · "+(snapshot.counts?.blocked||0)+" blocked";
  for(const item of snapshot.rows.slice(-200).reverse()){
   const row=document.createElement("tr");
   for(const value of [item.host||"",item.type||"",item.status||"",item.reason||""]){
    const cell=document.createElement("td");cell.textContent=String(value).slice(0,140);row.appendChild(cell);
   }
   $("rows").appendChild(row);
  }
 }catch(error){$("summary").textContent=String(error?.message||error).slice(0,160);}
}
for(const [id,action] of [["start","startNetworkMonitor"],["stop","stopNetworkMonitor"],["clear","clearNetworkMonitor"]])
 $(id).addEventListener("click",async()=>{
  try{await request(action);await refresh();}
  catch(error){$("summary").textContent=String(error?.message||error).slice(0,160);}
 });
$("refresh").addEventListener("click",refresh);
refresh();
