"use strict";
/* DK Live Block: local-only settings, list cache and blocking; no telemetry. */
const SOURCES={
 easylist:{name:"EasyList",url:"https://easylist.to/easylist/easylist.txt"},
 easyprivacy:{name:"EasyPrivacy",url:"https://easylist.to/easylist/easyprivacy.txt"},
 cookies:{name:"EasyList Cookie",url:"https://secure.fanboy.co.nz/fanboy-cookiemonster.txt"},
 annoyances:{name:"Fanboy Annoyances",url:"https://secure.fanboy.co.nz/fanboy-annoyance.txt"},
 social:{name:"Fanboy Social",url:"https://easylist.to/easylist/fanboy-social.txt"}
};
const SEED=["! Local fallback rules","||doubleclick.net^","||googlesyndication.com^","||googleadservices.com^","||adsrvr.org^","||adnxs.com^","||criteo.com^","||taboola.com^","||outbrain.com^","||scorecardresearch.com^","##.adsbygoogle","##ins.adsbygoogle","youtube.com##ytd-ad-slot-renderer","youtube.com##ytd-promoted-video-renderer","youtube.com###player-ads"].join("\n");
const DEFAULT={enabled:true,paused:[],listEnabled:{easylist:true,easyprivacy:true,cookies:false,annoyances:false,social:false},autoUpdate:true,youtubeSkip:true,cookieReject:false,antiAdblock:true,paywallPopups:true,stripTracking:true,requestLog:true,network:{...DKNetwork.DEFAULT},customRules:"",customSubscriptions:[],blockedTotal:0,lastUpdate:0};
const data={settings:{...DEFAULT},lists:{},customLists:{},listErrors:{},engine:new DKFilter.FilterEngine(SEED),tempPaused:new Set(),hosts:new Map(),counts:new Map(),logs:new Map(),networkIssues:new Map(),ownBlocked:new Set(),proxyErrors:[],networkProbe:null,ready:false,updateJob:null,saveTimer:null};
function host(url){return DKRules.host(url);}
function enabled(h){return data.settings.enabled&&!data.settings.paused.some(x=>DKRules.sub(h,x));}
function activeTab(id,h){return enabled(h)&&!data.tempPaused.has(id);}
function assemble(){const all=[SEED];for(const k of Object.keys(SOURCES)){if(data.settings.listEnabled[k]&&data.lists[k]?.text)all.push(data.lists[k].text);}for(const u of data.settings.customSubscriptions||[])if(data.customLists[u]?.text)all.push(data.customLists[u].text);if(data.settings.customRules)all.push(data.settings.customRules);return all.join("\n");}
async function persist(){await browser.storage.local.set({settings:data.settings,lists:data.lists,customLists:data.customLists,listErrors:data.listErrors});}
async function persistSettings(){await browser.storage.local.set({settings:data.settings});}
function refreshTabs(){browser.tabs.query({}).then(t=>Promise.all(t.map(tab=>browser.tabs.sendMessage(tab.id,{action:"refresh"}).catch(()=>{})))).catch(()=>{});}
function rebuild(){data.engine=new DKFilter.FilterEngine(assemble());for(const id of data.counts.keys())badge(id);refreshTabs();}
function badge(id){const n=data.counts.get(id)||0,h=data.hosts.get(id)||"";browser.browserAction.setBadgeText({tabId:id,text:activeTab(id,h)&&n?String(Math.min(n,9999)):""}).catch(()=>{});}
function scheduleSave(){if(data.saveTimer)return;data.saveTimer=setTimeout(()=>{data.saveTimer=null;persistSettings().catch(console.warn);},60000);}
function status(id,url){const h=data.hosts.get(id)||host(url);return {ready:data.ready,host:h,enabled:data.settings.enabled,siteActive:activeTab(id,h),sitePaused:data.settings.paused.some(x=>DKRules.sub(h,x)),temporarilyPaused:data.tempPaused.has(id),tabBlocked:data.counts.get(id)||0,totalBlocked:data.settings.blockedTotal,lastUpdate:data.settings.lastUpdate,networkRules:data.engine.networkCount,cosmeticRules:data.engine.cosmetic.length,unsupportedRules:data.engine.unsupportedCount,settings:data.settings,listState:{...Object.fromEntries(Object.entries(SOURCES).map(([k,s])=>[k,{name:s.name,updated:data.lists[k]?.updated||0,error:data.listErrors[k]||""}])),...Object.fromEntries((data.settings.customSubscriptions||[]).map((u,i)=>["custom"+i,{name:"Custom: "+host(u),updated:data.customLists[u]?.updated||0,error:data.listErrors[u]||""}]))}};}
async function downloadList(url,followRedirects=true,previous=null){
 const stop=new AbortController(),timer=setTimeout(()=>stop.abort(),20000);
 try{
  const res=await fetch(url,{signal:stop.signal,cache:"no-cache",credentials:"omit",
   redirect:followRedirects?"follow":"error",headers:DKSubscriptionCache.headers(previous)});
  const unchanged=res.status===304;
  if(unchanged&&!previous?.text)throw Error("304 received without a cached filter list");
  if(!unchanged&&!res.ok)throw Error("HTTP "+res.status);
  const metadata=DKSubscriptionCache.metadata(res,previous,unchanged);
  return unchanged?{unchanged,metadata}:{unchanged:false,text:await DKListIO.read(res),metadata};
 }finally{clearTimeout(timer);}
}
function updateLists(){if(data.updateJob)return data.updateJob;
 data.updateJob=(async()=>{let updated=0,checked=0,errors=[];
  for(const [key,entry] of Object.entries(SOURCES)){if(!data.settings.listEnabled[key])continue;
   try{
    const result=await downloadList(entry.url,true,data.lists[key]);
    data.lists[key]=DKSubscriptionCache.store(data.lists[key],result,Date.now());
    delete data.listErrors[key];checked++;if(!result.unchanged)updated++;
   }catch(e){data.listErrors[key]=String(e.message||e).slice(0,150);errors.push(entry.name+": "+data.listErrors[key]);}
  }
  for(const u of data.settings.customSubscriptions||[]){
   try{
    const result=await downloadList(u,false,data.customLists[u]);
    data.customLists[u]=DKSubscriptionCache.store(data.customLists[u],result,Date.now());
    delete data.listErrors[u];checked++;if(!result.unchanged)updated++;
   }catch(e){data.listErrors[u]=String(e.message||e).slice(0,150);errors.push("Custom "+host(u)+": "+data.listErrors[u]);}
  }
  if(checked)data.settings.lastUpdate=Date.now();
  if(updated)rebuild();
  await persist();
  return {updated,checked,errors};
 })().finally(()=>{data.updateJob=null;});return data.updateJob;
}
function addNetworkIssue(tabId,url,type,error){
 if(tabId<0||!data.settings.requestLog)return;
 const target=host(url);if(!target)return;
 const category=DKNetwork.classifyFailure(error);
 const rows=data.networkIssues.get(tabId)||[];
 rows.push({host:target,type,category,when:Date.now()});
 if(rows.length>60)rows.shift();data.networkIssues.set(tabId,rows);
}
function rememberOwnBlock(requestId){
 if(requestId===undefined||requestId===null)return;
 data.ownBlocked.add(String(requestId));
 if(data.ownBlocked.size>800)data.ownBlocked.clear();
}
let proxyRegistered=false;
function networkStatus(){
 return {config:data.settings.network,proxyErrors:data.proxyErrors.slice(-5),
  supported:!!(browser.proxy?.onRequest?.addListener&&browser.proxy?.onRequest?.removeListener),
  active:proxyRegistered,hasDNS:!!browser.dns?.resolve};
}
function routeProxyRequest(d){
 if(!data.ready||!data.settings.enabled||data.tempPaused.has(d.tabId))return null;
 const origin=data.hosts.get(d.tabId)||"";
 if(origin&&data.settings.paused.some(h=>DKRules.sub(origin,h)))return null;
 const routing=DKNetwork.route(d,data.settings.network,origin?("https://"+origin+"/"):"");
 if(data.networkProbe&&data.networkProbe.url===d.url&&routing)data.networkProbe.routed=true;
 return routing;
}
// Only install interception when explicitly enabled. For domain mode, Firefox
// receives a hostname-limited filter so unrelated traffic never hits this handler.
function syncProxyListener(){
 const api=browser.proxy?.onRequest;
 if(!api?.addListener||!api?.removeListener){
  if(data.settings.network?.enabled)return false;
  return false;
 }
 if(proxyRegistered){api.removeListener(routeProxyRequest);proxyRegistered=false;}
 if(!data.ready||!data.settings.enabled||!data.settings.network?.enabled)return false;
 const urls=data.settings.network.mode==="domains"
  ?data.settings.network.domains.map(domain=>"*://*."+domain+"/*")
  :["<all_urls>"];
 api.addListener(routeProxyRequest,{urls});
 proxyRegistered=true;
 return true;
}
browser.proxy?.onError?.addListener(e=>{
 if(!proxyRegistered)return;
 const error=String(e?.message||e?.error||"Proxy configuration error").slice(0,120);
 data.proxyErrors.push({error,when:Date.now()});if(data.proxyErrors.length>8)data.proxyErrors.shift();
});
browser.webRequest.onErrorOccurred?.addListener(d=>{
 if(d.type!=="image"&&d.type!=="imageset"&&d.type!=="main_frame")return;
 const id=String(d.requestId??"");
 if(id&&data.ownBlocked.delete(id))return;
 if(data.tempPaused.has(d.tabId))return;
 addNetworkIssue(d.tabId,d.url,d.type,d.error);
},{urls:["<all_urls>"]});
function recordBlock(tabId,url,type,rule){
 if(tabId<0)return;
 data.counts.set(tabId,(data.counts.get(tabId)||0)+1);
 data.settings.blockedTotal++;scheduleSave();badge(tabId);
 if(!data.settings.requestLog)return;
 const rows=data.logs.get(tabId)||[];
 rows.push({host:host(url),type,rule:(rule?.p||"").slice(0,140),when:Date.now()});
 if(rows.length>250)rows.shift();data.logs.set(tabId,rows);
}
browser.webRequest.onBeforeRequest.addListener(d=>{
 if(!data.ready||!data.settings.enabled||!/^https?:/i.test(d.url))return {};
 if(d.type==="main_frame"){
  if(!data.settings.stripTracking||!activeTab(d.tabId,host(d.url)))return {};
  const ruleCleaned=data.engine.cleanNavigation(d.url)||d.url;
  const cleaned=DKPrivacy.stripTrackingParameters(ruleCleaned)||(ruleCleaned!==d.url?ruleCleaned:null);
  return cleaned?{redirectUrl:cleaned}:{};
 }
 const top=data.hosts.get(d.tabId)||host(d.documentUrl||d.originUrl||d.url);
 if(!activeTab(d.tabId,top))return {};
 const doc=d.documentUrl||d.originUrl||"",contextHost=host(doc)||top;
 const result=data.engine.checkRequest(d.url,d.type,contextHost,data.engine.getPagePolicy(doc));
 if(!result.block)return {};
 rememberOwnBlock(d.requestId);
 recordBlock(d.tabId,d.url,d.type,result.rule);
 return {cancel:true};
},{urls:["<all_urls>"]},["blocking"]);
// Only explicit $popup filters can close a newly opened advertising tab.
browser.webNavigation?.onCreatedNavigationTarget?.addListener(async event=>{
 if(!data.ready||!data.settings.enabled||event.tabId<0||event.sourceTabId<0||!/^https?:/i.test(event.url))return;
 try{
  const origin=await browser.tabs.get(event.sourceTabId);
  const originUrl=origin?.url||"",originHost=host(originUrl);
  if(!originHost||!activeTab(event.sourceTabId,originHost))return;
  const verdict=data.engine.checkRequest(event.url,"popup",originHost,data.engine.getPagePolicy(originUrl));
  if(!verdict.block)return;
  await browser.tabs.remove(event.tabId);
  recordBlock(event.sourceTabId,event.url,"popup",verdict.rule);
 }catch(error){console.warn("DK Live Block popup check:",error);}
});
browser.tabs.onUpdated.addListener((id,info,tab)=>{
 if(info.url||info.status==="loading"){data.hosts.set(id,host(info.url||tab.url));data.counts.set(id,0);data.logs.delete(id);data.networkIssues.delete(id);badge(id);}
});
browser.tabs.onRemoved.addListener(id=>{data.hosts.delete(id);data.counts.delete(id);data.logs.delete(id);data.networkIssues.delete(id);data.tempPaused.delete(id);});
browser.alarms.onAlarm.addListener(a=>{if(a.name==="refresh-rules"&&data.settings.autoUpdate)updateLists().catch(console.warn);});
browser.runtime.onMessage.addListener(async(msg,sender={})=>{
 if(!msg||typeof msg.action!=="string")return {};
 // Page/content scripts have only the minimum permissions needed to style a page
 // and submit a user-initiated element-picker rule for their own frame.
 // Never trust tabId or URL supplied by page-originated messages.
 const fromContent=!!sender.tab;
 if(fromContent&&msg.action!=="getStyle"&&msg.action!=="addElementRule")
  return {error:"This action is only available in the extension interface."};
 const id=fromContent?sender.tab.id:(Number.isInteger(msg.tabId)?msg.tabId:-1);
 const url=fromContent?(sender.url||sender.tab.url||""):(msg.url||sender.url||"");
 const h=host(url);
 if(msg.action==="status")return status(id,url);
 if(msg.action==="getSettings")return {settings:data.settings,listState:status(-1,"").listState};
 if(msg.action==="networkStatus"){
  if(sender?.tab)return {error:"Extension settings only."};
  return networkStatus();
 }
 if(msg.action==="getNetworkIssues"){
  if(sender?.tab)return {error:"Extension settings only."};
  return (data.networkIssues.get(id)||[]).slice().reverse();
 }
 if(msg.action==="clearNetworkIssues"){
  if(sender?.tab)return {error:"Extension settings only."};
  data.networkIssues.delete(id);return {ok:true};
 }
 if(msg.action==="saveNetwork"){
  if(sender?.tab)return {error:"Extension settings only."};
  const validation=DKNetwork.validate(msg.config);
  if(validation.error)return {error:validation.error};
  if(validation.value.enabled&&!browser.proxy?.onRequest?.removeListener)
   return {error:"Firefox proxy routing API is unavailable."};
  const previous=data.settings.network;
  data.settings.network=validation.value;
  try{syncProxyListener();}
  catch(error){
   data.settings.network=previous;
   try{syncProxyListener();}catch(_){}
   return {error:"Could not apply proxy routing: "+String(error.message||error).slice(0,100)};
  }
  data.proxyErrors=[];
  await persistSettings();return {ok:true,config:data.settings.network};
 }
 if(msg.action==="testNetworkProxy"){
  if(sender?.tab)return {error:"Extension settings only."};
  const config=data.settings.network;
  if(!config?.enabled||!proxyRegistered)return {error:"Enable DK Live Block and save your proxy configuration before testing."};
  if(config.mode!=="domains")return {error:"A live proxy test requires domain-routing mode. Image-only mode must be checked with a real page image."};
  if(!browser.proxy?.onRequest)return {error:"Firefox proxy routing API is not available."};
  const target=String(msg.host||"").toLowerCase().trim();
  if(!DKNetwork.validHost(target)||DKNetwork.privateDestination(target)||target.endsWith(".onion")||
     !config.domains.some(domain=>DKNetwork.domainMatch(target,domain)))
   return {error:"Select a saved public website hostname. Onion destinations cannot be probed here."};
  if(data.networkProbe)return {error:"Another proxy test is already running."};
  const url="https://"+target+"/",probe={url,routed:false};
  const stop=new AbortController(),timer=setTimeout(()=>stop.abort(),10000);
  data.networkProbe=probe;
  try{
   const reply=await fetch(url,{method:"HEAD",credentials:"omit",cache:"no-store",redirect:"manual",signal:stop.signal});
   return {ok:true,host:target,status:reply.status,routePolicyObserved:probe.routed,
    note:"An HTTP response is not proof of anonymity or that Firefox cannot fall back to direct connections."};
  }catch(e){
   return {error:"Connectivity test failed: "+String(e.message||e).slice(0,110),routePolicyObserved:probe.routed};
  }finally{clearTimeout(timer);if(data.networkProbe===probe)data.networkProbe=null;}
 }
 if(msg.action==="dnsLookup"){
  if(sender?.tab)return {error:"Extension settings only."};
  const h=String(msg.host||"").toLowerCase().trim();
  if(!DKNetwork.validHost(h)||DKNetwork.privateDestination(h)||h.endsWith(".onion"))return {error:"Enter a valid public website hostname."};
  if(!browser.dns?.resolve)return {error:"Firefox DNS diagnostic API is unavailable."};
  try{const answer=await browser.dns.resolve(h);return {host:h,addresses:(answer?.addresses||[]).slice(0,8)};}
  catch(e){return {host:h,error:"DNS lookup failed: "+String(e.message||e).slice(0,120)};}
 }
 if(msg.action==="getLog")return (data.logs.get(id)||[]).slice().reverse();
 if(msg.action==="clearLog"){data.logs.delete(id);return {ok:true};}
 if(msg.action==="resetStatistics"){
  data.settings.blockedTotal=0;data.counts.clear();data.logs.clear();
  await persistSettings();refreshTabs();return {ok:true};
 }
 if(msg.action==="updateLists")return updateLists();
 if(msg.action==="getStyle"){const policy=data.engine.getPagePolicy(url),top=data.hosts.get(sender.tab?.id)||h,active=activeTab(sender.tab?.id??-1,h)&&activeTab(sender.tab?.id??-1,top)&&!policy.document;return {active,youtubeSkip:data.settings.youtubeSkip,cookieReject:data.settings.cookieReject,antiAdblock:data.settings.antiAdblock,paywallPopups:data.settings.paywallPopups,css:active?data.engine.getSelectors(h,policy).slice(0,15000).map(s=>s+" {display:none!important;}").join("\n"):"",procedural:active?data.engine.getProcedural(h,policy).slice(0,300):[]};}
 if(msg.action==="setGlobal"){
  const previous=data.settings.enabled;
  data.settings.enabled=!!msg.enabled;
  try{syncProxyListener();}catch(error){data.settings.enabled=previous;return {error:"Could not update proxy routing: "+String(error.message||error).slice(0,100)};}
  await persist();rebuild();return status(id,url);
 }
 if(msg.action==="toggleTabPause"){
  if(id<0)return {error:"No browser tab."};
  if(msg.paused)data.tempPaused.add(id);else data.tempPaused.delete(id);
  badge(id);refreshTabs();return status(id,url);
 }
 if(msg.action==="toggleSite"){if(!h)return {error:"No website"};data.settings.paused=data.settings.paused.filter(x=>x!==h);if(msg.disable)data.settings.paused.push(h);await persist();rebuild();badge(id);return status(id,url);}
 if(msg.action==="allowHost"){
  const rule=DKManualRules.allowHostOnSite(h,msg.host);
  if(!rule)return {error:"Invalid site or blocked-request hostname."};
  const existing=data.settings.customRules.split("\n");
  if(!existing.includes(rule))data.settings.customRules+="\n"+rule;
  await persist();rebuild();return {ok:true,rule};
 }
 if(msg.action==="getSiteExceptions")return DKManualRules.listSiteExceptions(data.settings.customRules,h);
 if(msg.action==="removeSiteException"){
  if(!h)return {error:"No website selected."};
  const changed=DKManualRules.removeSiteException(data.settings.customRules,h,msg.host);
  if(changed.error)return changed;
  data.settings.customRules=changed.text;await persistSettings();rebuild();
  return {ok:true,removed:changed.removed};
 }
 if(msg.action==="undoElementRule"){
  const lines=data.settings.customRules.split("\n"),prefix=h+"##";
  const index=lines.findLastIndex(line=>line.startsWith(prefix));
  if(index<0)return {error:"No element rule to undo on this site"};
  lines.splice(index,1);data.settings.customRules=lines.join("\n");await persist();rebuild();return {ok:true};
 }
 if(msg.action==="addElementRule"){
  const selector=String(msg.selector||"");if(!h||!DKRules.cosmetic(h+"##"+selector))return {error:"Invalid selector"};
  data.settings.customRules+="\n"+h+"##"+selector;await persist();rebuild();return {ok:true};
 }
 if(msg.action==="saveSettings"){
  const s=msg.settings||{};
  if("customSubscriptions" in s){
   const validated=DKSubscriptions.validate(s.customSubscriptions);
   if(validated.error)return {error:validated.error};
   data.settings.customSubscriptions=validated.urls;
   for(const u of Object.keys(data.customLists))if(!validated.urls.includes(u)){delete data.customLists[u];delete data.listErrors[u];}
  }
  if(typeof s.autoUpdate==="boolean")data.settings.autoUpdate=s.autoUpdate;
  if(typeof s.youtubeSkip==="boolean")data.settings.youtubeSkip=s.youtubeSkip;
  if(typeof s.cookieReject==="boolean")data.settings.cookieReject=s.cookieReject;
  if(typeof s.antiAdblock==="boolean")data.settings.antiAdblock=s.antiAdblock;
  if(typeof s.paywallPopups==="boolean")data.settings.paywallPopups=s.paywallPopups;
  if(typeof s.stripTracking==="boolean")data.settings.stripTracking=s.stripTracking;
  if(typeof s.requestLog==="boolean"){data.settings.requestLog=s.requestLog;if(!s.requestLog){data.logs.clear();data.networkIssues.clear();}}
  if(typeof s.customRules==="string"&&s.customRules.length<=1000000)data.settings.customRules=s.customRules;
  if(Array.isArray(s.paused))data.settings.paused=s.paused.filter(x=>typeof x==="string"&&/^[a-z0-9.-]{1,253}$/.test(x)).slice(0,500);
  for(const k of Object.keys(SOURCES))if(typeof s.listEnabled?.[k]==="boolean")data.settings.listEnabled[k]=s.listEnabled[k];
  await persist();rebuild();
  // Newly enabled subscriptions work immediately without waiting for tomorrow's alarm.
  const needsDownload=Object.keys(SOURCES).some(k=>data.settings.listEnabled[k]&&!data.lists[k]?.text)||(data.settings.customSubscriptions||[]).some(u=>!data.customLists[u]?.text);
  if(needsDownload)updateLists().catch(console.warn);
  return {ok:true};
 }
 return {error:"Unknown action"};
});
async function boot(){
 try{
  const stored=await browser.storage.local.get(["settings","lists","customLists","listErrors"]);
  data.settings=DKSettings.restoreSettings(stored.settings,DEFAULT,Object.keys(SOURCES));
  const built=DKSettings.restoreLists(stored.lists,Object.keys(SOURCES));
  const custom=DKSettings.restoreLists(stored.customLists,data.settings.customSubscriptions,50000000);
  data.lists=built.lists;data.customLists=custom.lists;
  const errors=DKSettings.restoreErrors(stored.listErrors,[...Object.keys(SOURCES),...data.settings.customSubscriptions]);
  data.listErrors={...errors,...built.errors,...custom.errors};
  rebuild();
  const tabs=await browser.tabs.query({});for(const t of tabs)if(t.url)data.hosts.set(t.id,host(t.url));
  data.ready=true;
  try{syncProxyListener();}catch(error){
   console.warn("DK Live Block proxy activation failed:",error);
   data.settings.network.enabled=false;
  }
  await browser.alarms.create("refresh-rules",{periodInMinutes:1440});
  const needsDownload=Object.keys(SOURCES).some(key=>data.settings.listEnabled[key]&&!data.lists[key]?.text)||
   data.settings.customSubscriptions.some(url=>!data.customLists[url]?.text);
  if(data.settings.autoUpdate&&(needsDownload||Date.now()-data.settings.lastUpdate>86400000))
   updateLists().catch(console.warn);
 }catch(e){console.error("DK Live Block startup:",e);data.ready=true;}
}
boot();
