"use strict";
const $=id=>document.getElementById(id);
const listKeys=["easylist","easyprivacy","cookies","annoyances","social"];
const flagKeys=["autoUpdate","youtubeSkip","cookieReject","stripTracking"];
let lastSettings=null;
function collect(){
 const s={listEnabled:{},paused:$("paused").value.split(/\r?\n/).map(x=>x.trim().toLowerCase()).filter(Boolean),customRules:$("customRules").value};
 for(const key of listKeys)s.listEnabled[key]=$(key).checked;
 for(const key of flagKeys)s[key]=$(key).checked;
 return s;
}
async function load(){
 const data=await browser.runtime.sendMessage({action:"getSettings"});
 const s=data.settings;lastSettings=s;
 for(const key of listKeys)$(key).checked=!!s.listEnabled[key];
 for(const key of flagKeys)$(key).checked=!!s[key];
 $("customRules").value=s.customRules||"";
 $("paused").value=(s.paused||[]).join("\n");
 $("updated").textContent=Object.values(data.listState).map(x=>x.name+": "+(x.updated?new Date(x.updated).toLocaleString():"not downloaded")).join(" · ");
}
$("save").addEventListener("click",async()=>{
 const s=collect();
 if(s.paused.some(h=>!/^[a-z0-9.-]{1,253}$/.test(h))){$("message").textContent="Invalid hostname in paused list.";return;}
 const r=await browser.runtime.sendMessage({action:"saveSettings",settings:s});
 $("message").textContent=r.ok?"Saved. Refresh open pages to apply.":r.error;
 await load();
});
$("update").addEventListener("click",async()=>{
 $("update").disabled=true;$("message").textContent="Updating lists…";
 try{const r=await browser.runtime.sendMessage({action:"updateLists"});
 $("message").textContent=r.updated+" lists updated"+(r.errors.length?" · "+r.errors.join("; "):"");
 }catch(e){$("message").textContent=e.message;}finally{$("update").disabled=false;await load();}
});
$("logRefresh").addEventListener("click",async()=>{
 const [tab]=await browser.tabs.query({active:true,currentWindow:true});
 if(!tab){$("log").textContent="No active tab.";return;}
 const rows=await browser.runtime.sendMessage({action:"getLog",tabId:tab.id});
 $("log").textContent=rows.length?rows.map(x=>new Date(x.when).toLocaleTimeString()+" "+x.type+" "+x.host+" · "+x.rule).join("\n"):"No blocked requests recorded on this tab.";
});
$("export").addEventListener("click",()=>{
 const data={format:"DK-Live-Block-settings",version:1,settings:collect()};
 const blob=new Blob([JSON.stringify(data,null,2)],{type:"application/json"});
 const url=URL.createObjectURL(blob),a=document.createElement("a");
 a.href=url;a.download="dk-live-block-settings.json";a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
});
$("import").addEventListener("change",async(event)=>{
 const file=event.target.files?.[0];if(!file)return;
 if(file.size>1200000){$("message").textContent="Backup exceeds size limit.";return;}
 try{const value=JSON.parse(await file.text());
  if(value.format!=="DK-Live-Block-settings"||value.version!==1||!value.settings||typeof value.settings!=="object")throw Error("Not a DK Live Block settings backup");
  const r=await browser.runtime.sendMessage({action:"saveSettings",settings:value.settings});
  if(!r.ok)throw Error(r.error||"Import rejected");await load();$("message").textContent="Settings imported.";
 }catch(e){$("message").textContent=e.message;}
});
load().catch(e=>$("message").textContent=e.message);
