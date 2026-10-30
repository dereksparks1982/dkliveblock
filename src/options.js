"use strict";
const $=id=>document.getElementById(id);
const primaryKeys=["easylist","easyprivacy","cookies","annoyances","social"];
const regionKeys=DKLanguageLists.catalog.map(item=>item.key);
const listKeys=[...primaryKeys,...regionKeys];
const listNames={...Object.fromEntries(DKLanguageLists.catalog.map(item=>[item.key,item.name])),easylist:"EasyList: advertisements",easyprivacy:"EasyPrivacy: tracking",
 cookies:"EasyList Cookie: cookie notices",annoyances:"Fanboy Annoyances: distractions",
 social:"Fanboy Social: social widgets"};
const flagKeys=["autoUpdate","autoYouTubeRules","youtubeSkip","adRecognition","cookieReject","distractionControl","antiAdblock","paywallPopups","stripTracking","requestLog","rememberVideos","strictPopupSites","showContextMenu","showBadge","showDevtoolsPanel"];
let lastSettings=null;
function collect(){
 const s={listEnabled:{},paused:$("paused").value.split(/\r?\n/).map(x=>x.trim().toLowerCase()).filter(Boolean),customRules:$("customRules").value,customSubscriptions:$("customSubscriptions").value.split(/\r?\n/).map(x=>x.trim()).filter(Boolean)};
 for(const key of listKeys)s.listEnabled[key]=$(key).checked;
 for(const key of flagKeys)s[key]=$(key).checked;
 return s;
}
async function load(){
 const data=await browser.runtime.sendMessage({action:"getSettings"});
 const s=data.settings;lastSettings=s;
 drawFilterLists(s,data.listState||{});
 drawFilterLists(s,data.listState||{},true);
 drawCustomLists(s,data.listState||{});
 for(const key of listKeys)$(key).checked=!!s.listEnabled[key];
 for(const key of flagKeys)$(key).checked=!!s[key];
 $("customRules").value=s.customRules||"";
 $("customSubscriptions").value=(s.customSubscriptions||[]).join("\n");
 $("paused").value=(s.paused||[]).join("\n");
 renderAllowedSites(s.paused||[]);
 const pack=data.youtubeRules||{};
 $("youtubeRulesStatus").textContent=pack.version?
  "YouTube pack v"+pack.version+(pack.previousVersion?" · previous v"+pack.previousVersion:"")+
  (pack.heldVersion?" · rejected version v"+pack.heldVersion:"")+(pack.error?" · error: "+pack.error:""):
  "Built-in YouTube fallback active."+(pack.heldVersion?" Rolled-back version v"+pack.heldVersion+" is blocked.":"")+
  (pack.error?" Last update failed: "+pack.error:"");
 $("youtubeRollback").disabled=!pack.version;
 $("updated").textContent=Object.values(data.listState).map(x=>x.name+": "+(x.updated?new Date(x.updated).toLocaleString():"not downloaded")+(x.error?" [last update failed: "+x.error+"]":"")).join(" · ");
}
function makeLine(){const row=document.createElement("div");row.className="log-row";return row;}
function listStatus(record){
 if(!record?.updated)return "Not downloaded yet"+(record?.error?" · Last error: "+record.error:"");
 return "Updated "+new Date(record.updated).toLocaleString()+
  (record.error?" · Latest update failed: "+record.error:"");
}
function drawFilterLists(settings,states,regional=false){
 const panel=$(regional?"languageListRows":"filterListRows");panel.replaceChildren();
 for(const key of (regional?regionKeys:primaryKeys)){
  const line=makeLine(),box=document.createElement("input");box.id=key;box.type="checkbox";
  box.checked=settings.listEnabled?.[key]===true;
  const label=document.createElement("label");label.append(box,document.createTextNode(" "+listNames[key]));
  const status=document.createElement("small");status.textContent=listStatus(states[key]);
  const update=document.createElement("button");update.type="button";update.textContent="Update list";
  box.addEventListener("change",async()=>{
   box.disabled=true;
   try{
    const reply=await browser.runtime.sendMessage({action:"setBuiltInListEnabled",key,enabled:box.checked});
    if(!reply?.ok)throw Error(reply?.error||"Could not update list");
    if(lastSettings)lastSettings.listEnabled[key]=box.checked;
    $(regional?"languageNotice":"filterListNotice").textContent=reply.needsDownload?
     listNames[key]+" enabled but not downloaded yet. Select Update list to fetch its rules.":
     listNames[key]+(box.checked?" enabled.":" disabled.")+" Other filter lists are unchanged.";
   }catch(error){box.checked=!box.checked;$(regional?"languageNotice":"filterListNotice").textContent=String(error.message||error);}
   finally{box.disabled=false;}
  });
  update.addEventListener("click",async()=>{
   update.disabled=true;status.textContent="Checking…";
   try{
    const reply=await browser.runtime.sendMessage({action:"updateFilterList",key});
    if(!reply?.ok)throw Error(reply?.error||"Could not update list");
    status.textContent=reply.updated?"Downloaded a new version.":"List checked; cached version unchanged.";
   }catch(error){status.textContent="Update failed: "+String(error.message||error)+". Last-good version is retained when available.";}
   finally{update.disabled=false;}
  });
  const info=document.createElement("div");info.append(label,status);
  line.append(info,update);panel.appendChild(line);
 }
 if(!regional)$("filterListNotice").textContent="Five built-in lists. Individual changes save immediately; other Settings controls still use Save Settings.";
}
$("languageRecommend").addEventListener("click",async()=>{
 const button=$("languageRecommend"),recommended=DKLanguageLists.recommendations(navigator.languages||[]);
 if(!recommended.length){
  $("languageNotice").textContent="No matching curated regional list found for your Firefox languages. You can still choose manually.";return;
 }
 button.disabled=true;
 let enabled=0,downloaded=0,errors=[];
 try{
  for(const key of recommended){
   const state=await browser.runtime.sendMessage({action:"setBuiltInListEnabled",key,enabled:true});
   if(!state?.ok){errors.push(key+": "+(state?.error||"enable failed"));continue;}
   enabled++;
   const checked=await browser.runtime.sendMessage({action:"updateFilterList",key});
   if(checked?.ok)downloaded++;
   else errors.push(key+": "+(checked?.error||"download failed"));
  }
  await load();
  $("languageNotice").textContent=enabled+" suggested list(s) enabled; "+downloaded+
   " downloaded or checked."+(errors.length?" Issues: "+errors.join("; "):"");
 }catch(error){$("languageNotice").textContent=String(error.message||error);}
 finally{button.disabled=false;}
});
function drawCustomLists(settings,states){
 const panel=$("customListRows");panel.replaceChildren();
 const urls=settings.customSubscriptions||[];
 $("customListNotice").textContent=urls.length?urls.length+" of five custom subscriptions saved.":
  "No custom filter subscriptions saved.";
 for(let i=0;i<urls.length;i++){
  const url=urls[i],line=makeLine(),details=document.createElement("div");
  const label=document.createElement("strong");label.textContent=url;
  const state=document.createElement("small");state.textContent=listStatus(states["custom"+i]);
  details.append(label,state);
  const update=document.createElement("button");update.type="button";update.textContent="Refresh";
  update.addEventListener("click",async()=>{
   update.disabled=true;
   try{
    const r=await browser.runtime.sendMessage({action:"updateFilterList",url});
    if(!r?.ok)throw Error(r?.error||"Update failed");
    state.textContent=r.updated?"New version downloaded.":"List checked; version unchanged.";
   }catch(e){state.textContent="Update failed: "+String(e.message||e)+". Existing rules retained if cached.";}
   finally{update.disabled=false;}
  });
  const remove=document.createElement("button");remove.type="button";remove.textContent="Remove";
  remove.addEventListener("click",async()=>{
   remove.disabled=true;
   try{
    const r=await browser.runtime.sendMessage({action:"removeCustomFilterList",url});
    if(!r?.ok)throw Error(r?.error||"Remove failed");
    $("customSubscriptions").value=r.urls.join("\n");
    await load();
    $("message").textContent="Custom filter list removed; other lists remain unchanged.";
   }catch(e){$("customListNotice").textContent=String(e.message||e);remove.disabled=false;}
  });
  const controls=document.createElement("div");controls.append(update,remove);
  line.append(details,controls);panel.appendChild(line);
 }
}
function renderAllowedSites(sites){
 const rows=$("allowedSitesRows");rows.replaceChildren();
 $("allowedSitesStatus").textContent=sites.length?
  sites.length+" website(s) allowlisted. Blocking remains active elsewhere.":
  "No allowed websites. DK Live Block protects every website by default.";
 for(const site of sites){
  const line=document.createElement("div");line.className="log-row";
  const label=document.createElement("span");label.textContent=site+" (and its subdomains)";
  const revoke=document.createElement("button");
  revoke.type="button";revoke.textContent="Remove";
  revoke.addEventListener("click",async()=>{
   revoke.disabled=true;
   try{
    const result=await browser.runtime.sendMessage({action:"removeAllowedSite",site});
    if(!result?.ok)throw Error(result?.error||"Unable to remove website.");
    $("paused").value=result.sites.join("\n");
    renderAllowedSites(result.sites);
    $("message").textContent="Removed "+site+" from Allowed Websites. Reload open pages to apply.";
   }catch(error){$("message").textContent=String(error.message||error);revoke.disabled=false;}
  });
  line.append(label,revoke);rows.appendChild(line);
 }
}
$("allowedSiteAdd").addEventListener("click",async()=>{
 const input=$("allowedSiteInput"),button=$("allowedSiteAdd");
 button.disabled=true;
 try{
  const result=await browser.runtime.sendMessage({action:"addAllowedSite",site:input.value});
  if(!result?.ok)throw Error(result?.error||"Unable to allowlist this website.");
  $("paused").value=result.sites.join("\n");
  renderAllowedSites(result.sites);
  input.value="";
  $("message").textContent=result.unchanged?"This website is already covered by an allowed hostname.":
   "Website added. Reload it to apply the allowlist.";
 }catch(error){$("message").textContent=String(error.message||error).slice(0,160);}
 finally{button.disabled=false;}
});
$("showDevtoolsPanel").addEventListener("change",async()=>{
 const box=$("showDevtoolsPanel");
 if(box.checked){
  try{
   const permission=await browser.permissions?.request?.({permissions:["devtools"]});
   if(permission!==true){box.checked=false;$("message").textContent="Developer Tools permission was not granted.";return;}
   $("message").textContent="Permission granted. Save Settings, then reopen Developer Tools.";
  }catch(error){box.checked=false;$("message").textContent="Unable to enable the developer panel: "+String(error?.message||error).slice(0,90);}
 }else{
  try{await browser.permissions?.remove?.({permissions:["devtools"]});}
  catch(_){}
  $("message").textContent="Developer Tools panel disabled. Save Settings to remember this preference.";
 }
});
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
 $("message").textContent=r.updated+" lists changed; "+r.checked+" checked"+(r.errors.length?" · "+r.errors.join("; "):"");
 }catch(e){$("message").textContent=e.message;}finally{$("update").disabled=false;await load();}
});
$("logRefresh").addEventListener("click",async()=>{
 const tabs=await browser.tabs.query({currentWindow:true});
 const [tab]=tabs.filter(t=>/^https?:\/\//i.test(t.url||"")).sort((a,b)=>(b.lastAccessed||0)-(a.lastAccessed||0));
 const log=$("log");log.replaceChildren();
 if(!tab){log.textContent="No website tab available.";return;}
 const rows=await browser.runtime.sendMessage({action:"getLog",tabId:tab.id});
 if(!rows.length){log.textContent="No blocked requests logged for "+new URL(tab.url).hostname+".";return;}
 for(const row of rows.slice(0,50)){
  const record=document.createElement("div");record.className="log-row";
  const description=document.createElement("span");
  description.textContent=new Date(row.when).toLocaleTimeString()+" · "+row.type+" · "+row.host+" · "+row.rule;
  const allow=document.createElement("button");allow.textContent="Allow on this site";
  allow.addEventListener("click",async()=>{
   const result=await browser.runtime.sendMessage({action:"allowHost",url:tab.url,host:row.host});
   if(result.ok){allow.textContent="Allowed. Reload site.";allow.disabled=true;}
   else $("message").textContent=result.error||"Unable to add exception.";
  });
  record.append(description,allow);log.appendChild(record);
 }
});
$("clearLog").addEventListener("click",async()=>{
 const tabs=await browser.tabs.query({currentWindow:true});
 const [tab]=tabs.filter(t=>/^https?:\/\//i.test(t.url||"")).sort((a,b)=>(b.lastAccessed||0)-(a.lastAccessed||0));
 if(!tab){$("message").textContent="No website tab available.";return;}
 await browser.runtime.sendMessage({action:"clearLog",tabId:tab.id});
 $("log").replaceChildren();$("message").textContent="Site log cleared.";
});
$("resetStats").addEventListener("click",async()=>{
 await browser.runtime.sendMessage({action:"resetStatistics"});
 $("log").replaceChildren();$("message").textContent="All local counts and logs cleared.";
});
$("export").addEventListener("click",()=>{
 const data={format:"DK-Live-Block-settings",version:1,settings:{...collect(),mediaRecovery:lastSettings?.mediaRecovery||[],popupProtectionPaused:lastSettings?.popupProtectionPaused||[]}};
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


/* Network Recovery settings are saved independently to avoid accidental proxy activation. */
function getNetworkForm(){
 return {
  enabled:$("netEnabled").checked,type:$("netType").value,
  host:$("netHost").value.trim(),port:Number($("netPort").value),
  proxyDNS:$("netProxyDNS").checked,mode:$("netMode").value,
  domains:$("netDomains").value.split(/\r?\n/).map(x=>x.trim().toLowerCase()).filter(Boolean)
 };
}
async function loadNetwork(){
 const data=await browser.runtime.sendMessage({action:"networkStatus"});
 if(data.error){$("netMessage").textContent=data.error;return;}
 const s=data.config||{};
 $("netEnabled").checked=!!s.enabled;
 $("netType").value=s.type||"socks";
 $("netHost").value=s.host||"127.0.0.1";
 $("netPort").value=s.port||9050;
 $("netProxyDNS").checked=s.proxyDNS!==false;
 $("netMode").value=s.mode||"domains";
 $("netDomains").value=(s.domains||[]).join("\n");
 $("netMessage").textContent=data.supported?"Proxy API available. Routing "+(data.active?"active for selected sites.":s.enabled?"configured but inactive (global protection may be paused).":"disabled."):"Firefox proxy API unavailable.";
 if(data.proxyErrors?.length)$("netMessage").textContent+=" Most recent proxy error: "+data.proxyErrors.at(-1).error;
}
$("netSave").addEventListener("click",async()=>{
 $("netSave").disabled=true;
 try{
  const result=await browser.runtime.sendMessage({action:"saveNetwork",config:getNetworkForm()});
  $("netMessage").textContent=result.ok?"Network settings saved. Selected website routing "+(result.config.enabled?"enabled.":"disabled."):(result.error||"Invalid settings.");
  if(result.ok)await loadNetwork();
 }catch(e){$("netMessage").textContent=e.message;}finally{$("netSave").disabled=false;}
});
$("netOff").addEventListener("click",async()=>{
 $("netEnabled").checked=false;
 const result=await browser.runtime.sendMessage({action:"saveNetwork",config:getNetworkForm()});
 $("netMessage").textContent=result.ok?"Proxy routing disabled.":"Unable to disable routing: "+result.error;
 if(result.ok)await loadNetwork();
});
$("netTorPreset").addEventListener("click",()=>{
 $("netType").value="socks";$("netHost").value="127.0.0.1";$("netPort").value="9050";
 $("netProxyDNS").checked=true;
 $("netMessage").textContent="Tor SOCKS5 values filled. Install/start Tor separately, add a destination hostname, then explicitly save and enable routing.";
});
$("dnsCheck").addEventListener("click",async()=>{
 $("dnsCheck").disabled=true;$("dnsResult").textContent="Checking Firefox DNS…";
 try{
  const result=await browser.runtime.sendMessage({action:"dnsLookup",host:$("dnsHost").value.trim().toLowerCase()});
  $("dnsResult").textContent=result.error||((result.addresses||[]).length?(result.host+": "+result.addresses.join(", ")):"No addresses returned.");
 }catch(e){$("dnsResult").textContent=e.message;}finally{$("dnsCheck").disabled=false;}
});
async function networkTab(){
 const tabs=await browser.tabs.query({currentWindow:true});
 return tabs.filter(t=>/^https?:\/\//i.test(t.url||"")).sort((a,b)=>(b.lastAccessed||0)-(a.lastAccessed||0))[0];
}
$("issueRefresh").addEventListener("click",async()=>{
 const box=$("networkIssues");box.replaceChildren();
 const tab=await networkTab();
 if(!tab){box.textContent="No website tab available.";return;}
 const rows=await browser.runtime.sendMessage({action:"getNetworkIssues",tabId:tab.id});
 if(!Array.isArray(rows)){box.textContent=rows.error||"Unable to read network diagnostics.";return;}
 if(!rows.length){box.textContent="No failed image or page requests recorded for "+new URL(tab.url).hostname+".";return;}
 for(const row of rows.slice(0,45)){
  const div=document.createElement("div");div.className="log-row";
  const line=document.createElement("span");
  line.textContent=new Date(row.when).toLocaleTimeString()+" · "+row.type+" · "+row.host+" · "+row.category;
  const button=document.createElement("button");button.textContent="Add host to routing list";
  button.addEventListener("click",()=>{
   const values=$("netDomains").value.split(/\r?\n/).map(x=>x.trim().toLowerCase()).filter(Boolean);
   if(!values.includes(row.host))values.push(row.host);
   $("netDomains").value=values.join("\n");
   $("netMode").value="domains";
   $("netMessage").textContent="Added "+row.host+" to the form only. Review and save network settings to apply. No traffic has been routed.";
  });
  div.append(line,button);box.appendChild(div);
 }
});
$("netReload").addEventListener("click",async()=>{
 const tab=await networkTab();
 if(!tab){$("netMessage").textContent="No website tab available to reload.";return;}
 $("netMessage").textContent="Reloading website with current saved proxy settings.";
 await browser.tabs.reload(tab.id);
});
$("issueClear").addEventListener("click",async()=>{
 const tab=await networkTab();if(!tab)return;
 await browser.runtime.sendMessage({action:"clearNetworkIssues",tabId:tab.id});
 $("networkIssues").replaceChildren();
 $("networkIssues").textContent="Local network diagnostics cleared.";
});
loadNetwork().catch(e=>$("netMessage").textContent=e.message);


async function showSiteExceptions(){
 const panel=$("siteExceptionRows");panel.replaceChildren();
 const tab=await networkTab();
 if(!tab){panel.textContent="No website tab available.";return;}
 const hosts=await browser.runtime.sendMessage({action:"getSiteExceptions",url:tab.url});
 if(!Array.isArray(hosts)){panel.textContent=hosts.error||"Could not read allowances.";return;}
 if(!hosts.length){panel.textContent="No saved request allowances for "+new URL(tab.url).hostname+".";return;}
 for(const host of hosts){
  const row=document.createElement("div");row.className="log-row";
  const title=document.createElement("span");title.textContent=host;
  const button=document.createElement("button");button.textContent="Revoke allowance";
  button.addEventListener("click",async()=>{
   button.disabled=true;
   const result=await browser.runtime.sendMessage({action:"removeSiteException",url:tab.url,host});
   if(result.ok){row.remove();$("message").textContent="Allowance revoked. Reload the website to check it.";}
   else{button.disabled=false;$("message").textContent=result.error||"Unable to revoke.";}
  });
  row.append(title,button);panel.appendChild(row);
 }
}
$("siteExceptions").addEventListener("click",()=>showSiteExceptions().catch(e=>$("message").textContent=e.message));


$("netTest").addEventListener("click",async()=>{
 const domain=$("netDomains").value.split(/\r?\n/).map(x=>x.trim().toLowerCase()).filter(Boolean)[0]||"";
 $("netTest").disabled=true;$("netMessage").textContent="Checking proxy configuration against the first selected website…";
 try{
  const outcome=await browser.runtime.sendMessage({action:"testNetworkProxy",host:domain});
  if(outcome.error)$("netMessage").textContent=outcome.error;
  else $("netMessage").textContent="Site responded with HTTP "+outcome.status+
   ". Routing policy observed: "+(outcome.routePolicyObserved?"yes":"not confirmed")+
   ". This is not proof of a network kill switch or privacy.";
 }catch(e){$("netMessage").textContent=e.message;}finally{$("netTest").disabled=false;}
});


$("youtubeUpdate").addEventListener("click",async()=>{
 const button=$("youtubeUpdate");button.disabled=true;
 $("youtubeRulesStatus").textContent="Checking official DK YouTube rules…";
 try{
  const result=await browser.runtime.sendMessage({action:"updateYouTubePack"});
  $("message").textContent=result.error||("YouTube rules checked: "+(result.changed?"new version installed":"no changes")+".");
  await load();
 }catch(error){$("message").textContent=error.message;}
 finally{button.disabled=false;}
});
$("youtubeRollback").addEventListener("click",async()=>{
 const button=$("youtubeRollback");button.disabled=true;
 try{
  const result=await browser.runtime.sendMessage({action:"rollbackYouTubePack"});
  $("message").textContent=result.error||("Rolled back YouTube pack. Version "+result.heldVersion+" won't be reinstalled.");
  await load();
 }catch(error){$("message").textContent=error.message;}
 finally{button.disabled=false;}
});

DKSupport.installButton($("patreonSupport"));

/* Build 31: manually requested private streaming playback diagnostics. */
function streamingHostname(url){
 try{
  const parsed=new URL(url);
  return ["http:","https:"].includes(parsed.protocol)&&
   /^(?:[a-z0-9-]+\.)*(?:youtube(?:-nocookie)?\.com|disneyplus\.com)$/.test(parsed.hostname.toLowerCase())?
   parsed.hostname.toLowerCase():"";
 }catch(_){return "";}
}
async function streamingTab(){
 const tabs=await browser.tabs.query({currentWindow:true});
 return tabs.filter(tab=>streamingHostname(tab.url||""))
  .sort((a,b)=>Number(!!b.active)-Number(!!a.active)||
    (b.lastAccessed||0)-(a.lastAccessed||0))[0]||null;
}
async function renderPlaybackHealth(){
 const tab=await streamingTab(),panel=$("playbackHealthRows");panel.replaceChildren();
 if(!tab){
  $("playbackHealthStatus").textContent="Open a YouTube or Disney+ tab first.";return;
 }
 const rows=await browser.runtime.sendMessage({action:"getPlaybackHealth",tabId:tab.id});
 if(!Array.isArray(rows)){ $("playbackHealthStatus").textContent=rows?.error||"Unable to read health signals.";return; }
 $("playbackHealthStatus").textContent=rows.length?
  rows.length+" recent local player signal(s). A blocked request and player buffering are correlation, not proof of cause.":
  "No sustained buffering or media errors recorded, or private request logging is off.";
 for(const item of rows.slice(0,30)){
  const line=document.createElement("div");line.className="log-row";
  const label=document.createElement("span");
  label.textContent=new Date(item.when).toLocaleTimeString()+" · "+
    (item.kind==="buffering"?"Sustained player buffering":"Player media error")+
    " · "+(item.blockedMediaNearby?"Blocked media request observed nearby":"No nearby blocked media request recorded");
  line.appendChild(label);panel.appendChild(line);
 }
}
$("playbackHealthShow").addEventListener("click",()=>
 renderPlaybackHealth().catch(e=>$("playbackHealthStatus").textContent=e.message));
$("playbackHealthClear").addEventListener("click",async()=>{
 const tab=await streamingTab();if(!tab)return;
 try{
  const result=await browser.runtime.sendMessage({action:"clearPlaybackHealth",tabId:tab.id});
  if(!result?.ok)throw Error(result?.error||"Select a YouTube tab.");
  $("playbackHealthRows").replaceChildren();
  $("playbackHealthStatus").textContent="Local YouTube playback signals cleared.";
 }catch(e){$("playbackHealthStatus").textContent=e.message;}
});
async function renderStreamingIssues(){
 const panel=$("streamIssuesRows");panel.replaceChildren();
 const tab=await streamingTab();
 if(!tab){$("streamIssuesStatus").textContent="Open YouTube or Disney+ in another tab first.";return;}
 const rows=await browser.runtime.sendMessage({action:"getStreamingIssues",tabId:tab.id});
 if(!Array.isArray(rows)){
  $("streamIssuesStatus").textContent=rows?.error||"Unable to read local streaming diagnostics.";return;
 }
 $("streamIssuesStatus").textContent=rows.length?rows.length+" recent blocked request group(s) for "+new URL(tab.url).hostname+
  ". This is not proof of playback failure.":"No recent blocked streaming requests for this tab, or request logging is off.";
 for(const row of rows.slice(0,60)){
  const line=document.createElement("div");line.className="log-row";
  const summary=document.createElement("span");
  summary.textContent=new Date(row.when).toLocaleTimeString()+" · "+row.type+" · "+row.host+
   " · "+row.count+" blocked request(s)";
  const allow=document.createElement("button");
  allow.textContent="Try allow host/type (10 min)";
  allow.addEventListener("click",async()=>{
   if(!window.confirm("Temporarily allow "+row.type+" requests to "+row.host+
    " on this streaming tab for ten minutes? This can let video ads through."))return;
   allow.disabled=true;
   try{
    const result=await browser.runtime.sendMessage({action:"temporarilyAllowStreamingHost",
     tabId:tab.id,host:row.host,type:row.type,confirm:true});
    if(!result.ok)throw Error(result.error||"Temporary allowance rejected");
    $("streamIssuesStatus").textContent="Temporary allowance set for "+row.host+
     " ("+row.type+") in this tab for ten minutes. Reloading video to test…";
    await renderStreamingAllowances(tab.id);
    await browser.tabs.reload(tab.id);
   }catch(error){$("streamIssuesStatus").textContent=error.message;allow.disabled=false;}
  });
  line.append(summary,allow);panel.appendChild(line);
 }
 await renderStreamingAllowances(tab.id);
}
$("streamIssuesShow").addEventListener("click",()=>renderStreamingIssues().catch(e=>$("streamIssuesStatus").textContent=e.message));
$("streamIssuesClear").addEventListener("click",async()=>{
 const tab=await streamingTab();if(!tab)return;
 const result=await browser.runtime.sendMessage({action:"clearStreamingIssues",tabId:tab.id});
 $("streamIssuesRows").replaceChildren();
 $("streamIssuesStatus").textContent=result?.ok?"Local streaming diagnostics cleared.":result?.error||"Unable to clear.";
});

async function renderStreamingAllowances(tabId){
 const result=await browser.runtime.sendMessage({action:"getStreamingAllowances",tabId});
 const panel=$("streamRepairRows");panel.replaceChildren();
 if(!Array.isArray(result)){$("streamRepairStatus").textContent=result.error||"Unavailable.";return;}
 $("streamRepairStatus").textContent=result.length?
  result.length+" temporary allowances for this tab. They expire automatically within ten minutes.":
  "No temporary playback allowances for this tab.";
 for(const item of result){
  const row=document.createElement("div");row.className="log-row";
  const text=document.createElement("span");text.textContent=item.type+" · "+item.host+
   " · Expires "+new Date(item.expires).toLocaleTimeString();
  const remove=document.createElement("button");remove.type="button";
  remove.textContent="Revoke this allowance";
  remove.addEventListener("click",async()=>{
   remove.disabled=true;
   try{
    const reply=await browser.runtime.sendMessage({action:"revokeStreamingHost",
     tabId,host:item.host,type:item.type});
    if(!reply?.ok)throw Error(reply?.error||"Could not revoke allowance.");
    await renderStreamingAllowances(tabId);
    $("streamRepairStatus").textContent="Removed the selected "+item.type+
      " exception for "+item.host+". Reload the player to retest default blocking.";
   }catch(error){$("streamRepairStatus").textContent=error.message;
    remove.disabled=false;}
  });
  row.append(text,remove);panel.appendChild(row);
 }
}
$("streamRepairRevoke").addEventListener("click",async()=>{
 const tab=await streamingTab();
 if(!tab){$("streamRepairStatus").textContent="No streaming tab selected.";return;}
 const result=await browser.runtime.sendMessage({action:"clearTemporaryStreamingAllowances",tabId:tab.id});
 if(result?.ok){
  await renderStreamingAllowances(tab.id);
  $("streamRepairStatus").textContent="Temporary repair revoked. Reload the video to restore normal blocking.";
 }else $("streamRepairStatus").textContent=result?.error||"Could not revoke.";
});

$("openNetworkMonitor").addEventListener("click",()=>browser.tabs.create({
 url:browser.runtime.getURL("network-monitor.html")
}));

$("openBugReport").addEventListener("click",()=>browser.tabs.create({
 url:browser.runtime.getURL("report.html")
}));
