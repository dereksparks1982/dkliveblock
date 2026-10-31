"use strict";
/* DK Live Block: local-only settings, list cache and blocking; no telemetry. */
const SOURCES={
 easylist:{name:"EasyList",url:"https://easylist.to/easylist/easylist.txt"},
 easyprivacy:{name:"EasyPrivacy",url:"https://easylist.to/easylist/easyprivacy.txt"},
 cookies:{name:"EasyList Cookie",url:"https://secure.fanboy.co.nz/fanboy-cookiemonster.txt"},
 annoyances:{name:"Fanboy Annoyances",url:"https://secure.fanboy.co.nz/fanboy-annoyance.txt"},
 social:{name:"Fanboy Social",url:"https://easylist.to/easylist/fanboy-social.txt"},
 ...Object.fromEntries(DKLanguageLists.catalog.map(item=>[item.key,{name:item.name,url:item.url}]))
};
const SEED=["! Local fallback rules","||doubleclick.net^","||googlesyndication.com^","||googleadservices.com^","||adsrvr.org^","||adnxs.com^","||criteo.com^","||taboola.com^","||outbrain.com^","||scorecardresearch.com^","##.adsbygoogle","##ins.adsbygoogle","youtube.com##ytd-ad-slot-renderer","youtube.com##ytd-promoted-video-renderer","youtube.com###player-ads"].join("\n");
const DEFAULT={enabled:true,paused:[],popupProtectionPaused:[],cookieRejectPaused:[],distractionPaused:[],mediaRecovery:[],listEnabled:{easylist:true,easyprivacy:true,cookies:true,annoyances:true,social:true,
 ...Object.fromEntries(DKLanguageLists.catalog.map(item=>[item.key,false]))},autoUpdate:true,autoYouTubeRules:true,youtubeResponseFilter:true,youtubeSkip:true,adRecognition:true,cookieReject:true,distractionControl:true,antiAdblock:true,paywallPopups:true,stripTracking:true,requestLog:true,rememberVideos:false,strictPopupSites:true,showContextMenu:true,showBadge:true,showDevtoolsPanel:false,blockNotificationPrompts:true,network:{...DKNetwork.DEFAULT},customRules:"",customSubscriptions:[],blockedTotal:0,lastUpdate:0};
let lastCompiledRules=SEED,filterRevision=1;
let videoLibraryQueue=Promise.resolve();
const autoVideoTimes=new Map();
let videoJob={id:"",state:"idle",progress:0,quality:"compatible",phase:"",error:""};
let videoPort=null,videoPersistQueue=Promise.resolve();
function rememberVideoJob(){
 const state={id:videoJob.id,state:videoJob.state,progress:videoJob.progress,
  quality:videoJob.quality,phase:videoJob.phase,error:videoJob.error,
  updatedAt:Date.now()};
 videoPersistQueue=videoPersistQueue.catch(()=>{}).then(()=>
  browser.storage.local.set({lastVideoDownload:state})).catch(()=>{});
}
function restoreVideoJob(entry){
 if(!entry||typeof entry!=="object"||!DKVideoLibrary.parseVideo("https://www.youtube.com/watch?v="+entry.id))return null;
 const states=new Set(["running","cancelling","complete","cancelled","failed","interrupted"]);
 const qualities=new Set(["compatible","best","audio"]);
 if(!states.has(entry.state)||!qualities.has(entry.quality))return null;
 const progress=Number.isFinite(entry.progress)?Math.min(100,Math.max(0,entry.progress)):0;
 return {id:entry.id,state:["running","cancelling"].includes(entry.state)?"interrupted":entry.state,
  progress,quality:entry.quality,phase:"",error:typeof entry.error==="string"?entry.error.slice(0,180):""};
}
function libraryUpdate(operation){
 const run=videoLibraryQueue.catch(()=>{}).then(async()=>{
  const stored=await browser.storage.local.get("savedVideos");
  const current=DKVideoLibrary.list(stored.savedVideos);
  const next=operation(current);
  if(!next)return {error:"Invalid video entry."};
  await browser.storage.local.set({savedVideos:next});
  return {ok:true,count:next.length};
 });
 videoLibraryQueue=run;return run;
}
async function verifiedActiveVideo(msg){
 if(!Number.isInteger(msg.tabId)||msg.tabId<0)return null;
 try{
  const tab=await browser.tabs.get(msg.tabId);
  const video=DKVideoLibrary.parseVideo(tab?.url);
  if(!video||video.id!==msg.videoId)return null;
  return {video,tab};
 }catch(_){return null;}
}
function jobStatus(){return {...videoJob};}
const VIDEO_QUALITIES=new Set(["compatible","best","audio"]);
async function startVideoDownload(msg){
 const active=await verifiedActiveVideo(msg);
 if(!active)return {error:"Select an open YouTube video first."};
 const quality=msg.quality||"compatible";
 if(!VIDEO_QUALITIES.has(quality))return {error:"Unsupported video quality."};
 if(videoJob.state==="running"||videoJob.state==="cancelling")
  return {error:"Another DK video download is already running."};
 if(!browser.runtime.connectNative||!browser.permissions?.contains||
   !await browser.permissions.contains({permissions:["nativeMessaging"]}))
  return {error:"Install the optional DK Linux companion and allow native messaging first."};
 if(videoJob.state==="running"||videoJob.state==="cancelling")
  return {error:"Another DK video download is already running."};
 let port;
 try{port=browser.runtime.connectNative("dk_live_block_companion");}
 catch(error){return {error:"Could not connect to the optional Linux companion: "+String(error.message||error).slice(0,100)};}
 videoPort=port;
 videoJob={id:active.video.id,state:"running",progress:0,quality,phase:"downloading",error:""};
 rememberVideoJob();
 port.onMessage.addListener(message=>{
  if(videoPort!==port||!message||message.protocol!==1||message.videoId!==active.video.id)return;
  if(message.type==="progress"&&videoJob.state==="running"){
   if(Number.isFinite(message.percent)&&message.percent>=0&&message.percent<=100)
    videoJob.progress=Math.max(videoJob.progress,Math.round(message.percent));
  }else if(message.type==="phase"&&["merging","processing"].includes(message.phase)){
   videoJob.phase=message.phase;rememberVideoJob();
  }else if(message.type==="cancelling"){
   videoJob.state="cancelling";rememberVideoJob();
  }else if(message.type==="finished"&&["complete","cancelled","failed"].includes(message.state)){
   videoJob.state=message.state;
   videoJob.progress=message.state==="complete"?100:videoJob.progress;
   videoJob.error=message.state==="failed"?String(message.error||"yt-dlp download failed").slice(0,180):"";
   videoJob.phase="";rememberVideoJob();
   videoPort=null;
   try{port.disconnect();}catch(_){}
  }
 });
 port.onDisconnect.addListener(()=>{
  if(videoPort!==port)return;
  videoPort=null;
  if(videoJob.state==="running"||videoJob.state==="cancelling"){
   videoJob.state="failed";
   videoJob.error="Native companion disconnected before the download finished.";
   rememberVideoJob();
  }
 });
 try{
  port.postMessage({protocol:1,action:"startVideoDownload",
   videoId:active.video.id,quality,confirmation:"explicit-user-action"});
 }catch(error){
  videoPort=null;videoJob.state="failed";videoJob.error=String(error.message||error).slice(0,180);
  rememberVideoJob();
  try{port.disconnect();}catch(_){}
  return {error:videoJob.error};
 }
 return {ok:true,id:active.video.id,state:"running",quality};
}
function cancelVideoDownload(msg){
 if(!videoPort||videoJob.state!=="running"||msg.videoId!==videoJob.id)
  return {error:"No matching active download to cancel."};
 try{videoPort.postMessage({protocol:1,action:"cancelVideoDownload",videoId:videoJob.id});}
 catch(error){return {error:"Cancellation request could not be delivered."};}
 videoJob.state="cancelling";rememberVideoJob();
 return {ok:true,state:"cancelling"};
}
const data={settings:{...DEFAULT},lists:{},customLists:{},listErrors:{},youtubeRules:null,youtubePrevious:null,youtubeHeldVersion:0,youtubeJob:null,engine:typeof DKHybridEngine!=='undefined'?DKHybridEngine.create(SEED):new DKFilter.FilterEngine(SEED),tempPaused:new Set(),hosts:new Map(),counts:new Map(),logs:new Map(),networkIssues:new Map(),streamingIssues:new Map(),playbackHealth:new Map(),streamingAllowances:new Map(),networkMonitors:new Map(),allowedActivity:new Map(),manualBlocks:[],ruleSources:DKRuleProvenance.create([{name:"Built-in fallback",text:SEED}]),requestControls:DKRequestControls.make(),popupCounts:new Map(),popupTrapClaims:new Map(),popupTrapAllowed:new Map(),popupTrapPermits:new Map(),popupTrapCounts:new Map(),popupHistory:new Map(),ownBlocked:new Set(),proxyErrors:[],networkProbe:null,notificationControl:null,ready:false,updateJob:null,saveTimer:null};
function host(url){return DKRules.host(url);}
function enabled(h){return data.settings.enabled&&!data.settings.paused.some(x=>DKRules.sub(h,x));}
function activeTab(id,h){return enabled(h)&&!data.tempPaused.has(id);}
function sourceSections(){
 const entries=[{name:"Built-in fallback",text:SEED}];
 for(const k of Object.keys(SOURCES))
  if(data.settings.listEnabled[k]&&data.lists[k]?.text)
   entries.push({name:SOURCES[k].name,text:data.lists[k].text});
 let customNumber=0;
 for(const url of data.settings.customSubscriptions||[])
  if(data.customLists[url]?.text)
   entries.push({name:"Custom subscription "+(++customNumber),text:data.customLists[url].text});
 if(data.youtubeRules?.text)entries.push({name:"YouTube cosmetic pack",text:data.youtubeRules.text});
 if(data.settings.customRules)entries.push({name:"User custom filters",text:data.settings.customRules});
 return entries;
}
function assemble(){const all=[SEED];for(const k of Object.keys(SOURCES)){if(data.settings.listEnabled[k]&&data.lists[k]?.text)all.push(data.lists[k].text);}for(const u of data.settings.customSubscriptions||[])if(data.customLists[u]?.text)all.push(data.customLists[u].text);if(data.youtubeRules?.text)all.push(data.youtubeRules.text);if(data.settings.customRules)all.push(data.settings.customRules);return all.join("\n");}
async function persist(){await browser.storage.local.set({settings:data.settings,lists:data.lists,customLists:data.customLists,listErrors:data.listErrors,youtubeRules:data.youtubeRules,youtubePrevious:data.youtubePrevious,youtubeHeldVersion:data.youtubeHeldVersion});}
async function persistSettings(){await browser.storage.local.set({settings:data.settings});}
function refreshTabs(){browser.tabs.query({}).then(t=>Promise.all(t.map(tab=>browser.tabs.sendMessage(tab.id,{action:"refresh"}).catch(()=>{})))).catch(()=>{});}
function rebuild(){
 const next=assemble();
 // Settings such as ad recognition, logs, video skipping and site pauses do
 // not change the filter text. Skip re-parsing huge subscriptions for them.
 if(next!==lastCompiledRules){
  data.engine=typeof DKHybridEngine!=="undefined"?DKHybridEngine.create(next):new DKFilter.FilterEngine(next);
  lastCompiledRules=next;
  data.ruleSources=DKRuleProvenance.create(sourceSections());
  filterRevision++;
 }
 for(const id of new Set([...data.hosts.keys(),...data.counts.keys()]))badge(id);
 refreshTabs();
}
const toolbarIcons=typeof DKIconState!=="undefined"?DKIconState.create(browser):null;
function badge(id){
 const n=data.counts.get(id)||0,h=data.hosts.get(id)||"";
 if(toolbarIcons){
  const siteAllowed=!!h&&data.settings.paused.some(x=>DKRules.sub(h,x));
  toolbarIcons.apply(id,DKIconState.state(data.settings.enabled,siteAllowed,data.tempPaused.has(id)));
 }
 // Persistent per-tab badge, independent of optional traffic capture.
 browser.browserAction.setBadgeText({tabId:id,text:data.settings.showBadge&&activeTab(id,h)&&n?(n>9999?"9999+":String(n)):""}).catch(()=>{});
 browser.browserAction.setBadgeBackgroundColor?.({tabId:id,color:"#c13f3f"})?.catch?.(()=>{});
 browser.browserAction.setBadgeTextColor?.({tabId:id,color:"#ffffff"})?.catch?.(()=>{});
}
function scheduleSave(){if(data.saveTimer)return;data.saveTimer=setTimeout(()=>{data.saveTimer=null;persistSettings().catch(console.warn);},60000);}
function status(id,url){const h=data.hosts.get(id)||host(url);return {ready:data.ready,host:h,
 allowedRequests:data.settings.requestLog?DKAllowedActivity.snapshot(data.allowedActivity,id,h).total:0,
 selectiveBlocks:DKAllowedActivity.list(data.manualBlocks,h).length,enabled:data.settings.enabled,siteActive:activeTab(id,h),sitePaused:data.settings.paused.some(x=>DKRules.sub(h,x)),allowlistMatch:DKSiteAllowlist.match(data.settings.paused,h),temporarilyPaused:data.tempPaused.has(id),
 popupProtectionAvailable:!!h&&(data.settings.antiAdblock||data.settings.paywallPopups),
 popupProtectionPaused:data.settings.popupProtectionPaused.some(x=>DKRules.sub(h,x)),
 cookieRejectPaused:data.settings.cookieRejectPaused.some(x=>DKRules.sub(h,x)),
 distractionPaused:data.settings.distractionPaused.some(x=>DKRules.sub(h,x)),
 mediaRecoveryAvailable:DKVideoAssist.isStreamingHost(h),mediaRecoveryEnabled:data.settings.mediaRecovery.includes(h),networkIssueCount:data.settings.requestLog?(data.networkIssues.get(id)||[]).length:0,streamingIssueCount:data.settings.requestLog?DKStreamingDiagnostics.recent(data.streamingIssues,id).length:0,
 streamingAllowancesCount:DKStreamingRepair.list(data.streamingAllowances,id).length,youtubeRules:DKYouTubeMaintenance.status(data.youtubeRules,data.youtubePrevious,data.youtubeHeldVersion,data.listErrors.youtube,data.settings.autoYouTubeRules),popupHiddenCount:data.popupCounts.get(id)||0,
 strictPopupAvailable:DKPopupTrap.protectedHost(h),
 strictPopupEnabled:DKPopupTrap.shouldBlock(h,data.settings.strictPopupSites,activeTab(id,h)),
 strictPopupBlocked:data.popupTrapCounts.get(id)||0,
 popupPermitActive:(data.popupTrapPermits.get(id)||0)>Date.now(),
 tabBlocked:data.counts.get(id)||0,totalBlocked:data.settings.blockedTotal,lastUpdate:data.settings.lastUpdate,filterBackend:data.engine.backend,filterDiagnostic:data.engine.diagnostic,filterRevision,networkRules:data.engine.networkCount,cosmeticRules:data.engine.cosmetic.length,unsupportedRules:data.engine.unsupportedCount,settings:data.settings,listState:{...Object.fromEntries(Object.entries(SOURCES).map(([k,s])=>[k,{name:s.name,updated:data.lists[k]?.updated||0,error:data.listErrors[k]||""}])),...Object.fromEntries((data.settings.customSubscriptions||[]).map((u,i)=>["custom"+i,{name:"Custom: "+host(u),updated:data.customLists[u]?.updated||0,error:data.listErrors[u]||""}]))}};}
async function downloadList(url,followRedirects=true,previous=null){
 const stop=new AbortController(),timer=setTimeout(()=>stop.abort(),20000);
 try{
  const res=await fetch(url,{signal:stop.signal,cache:"no-cache",credentials:"omit",
   redirect:followRedirects?"follow":"error",headers:DKSubscriptionCache.headers(previous)});
  if(typeof res.url==="string"&&res.url){
   let destination;
   try{destination=new URL(res.url);}catch(_){throw Error("Invalid filter list redirect");}
   if(destination.protocol!=="https:"||!DKSubscriptions.publicHost(destination.hostname))
    throw Error("Insecure filter list redirect");
  }
  const unchanged=res.status===304;
  if(unchanged&&!previous?.text)throw Error("304 received without a cached filter list");
  if(!unchanged&&!res.ok)throw Error("HTTP "+res.status);
  const metadata=DKSubscriptionCache.metadata(res,previous,unchanged);
  return unchanged?{unchanged,metadata}:{unchanged:false,text:await DKListIO.read(res),metadata};
 }finally{clearTimeout(timer);}
}
async function updateYouTubePack(){
 if(data.youtubeJob)return data.youtubeJob;
 data.youtubeJob=(async()=>{
  const previous=data.youtubeRules;
  const response=await downloadList(DKYouTubeMaintenance.SOURCE,false,previous);
  if(response.unchanged){
   if(!previous)throw Error("No cached YouTube pack for 304 response");
   data.youtubeRules=DKSubscriptionCache.store(previous,response,Date.now());
   await persist();
   return {checked:true,changed:false,version:data.youtubeRules.version};
  }
  const decision=DKYouTubeMaintenance.transition(previous,response.text,data.youtubeHeldVersion);
  if(decision.changed){
   data.youtubePrevious=previous;
   data.youtubeRules={...DKSubscriptionCache.store(null,{unchanged:false,text:decision.next.text,metadata:response.metadata},Date.now()),version:decision.next.version};
   rebuild();
  }else{
   data.youtubeRules=DKSubscriptionCache.store(previous,{unchanged:true,metadata:response.metadata},Date.now());
  }
  delete data.listErrors.youtube;
  await persist();
  return {checked:true,changed:decision.changed,version:data.youtubeRules.version};
 })().catch(async error=>{
  data.listErrors.youtube=String(error.message||error).slice(0,150);
  try{await persist();}catch(_){}
  return {checked:false,changed:false,error:data.listErrors.youtube};
 }).finally(()=>{data.youtubeJob=null;});
 return data.youtubeJob;
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
  if(data.settings.autoYouTubeRules){
   const result=await updateYouTubePack();
   if(result.checked)checked++;if(result.changed)updated++;
   if(result.error)errors.push("YouTube compatibility: "+result.error);
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
 DKNetworkMonitor.transition(data.networkMonitors,d.tabId,d.requestId,"failed",{error:d.error});
 if(d.type!=="image"&&d.type!=="imageset"&&d.type!=="main_frame")return;
 const id=String(d.requestId??"");
 if(id&&data.ownBlocked.delete(id))return;
 if(data.tempPaused.has(d.tabId))return;
 addNetworkIssue(d.tabId,d.url,d.type,d.error);
},{urls:["<all_urls>"]});
browser.webRequest.onCompleted?.addListener(d=>{
 DKNetworkMonitor.transition(data.networkMonitors,d.tabId,d.requestId,"allowed",{statusCode:d.statusCode});
 if(data.ready&&data.settings.requestLog&&Number.isInteger(d.tabId)&&d.tabId>=0){
  const site=data.hosts.get(d.tabId)||"";
  if(site)DKAllowedActivity.observe(data.allowedActivity,d.tabId,site,d.url,d.type);
 }
},{urls:["<all_urls>"]});
browser.webRequest.onBeforeRedirect?.addListener(d=>{
 DKNetworkMonitor.transition(data.networkMonitors,d.tabId,d.requestId,"redirected");
},{urls:["<all_urls>"]});
/* Domain registration is fetched ONLY after an explicit inspector click.
   Registrar != registered organization != actual operator of a request. */
function rdapEntityCompany(entity,allowName=false){
 const properties=Array.isArray(entity?.vcardArray?.[1])?entity.vcardArray[1]:[];
 for(const field of ["org",...(allowName?["fn"]:[])]){
  const match=properties.find(row=>Array.isArray(row)&&row[0]===field&&typeof row[3]==="string");
  if(match&&match[3].length<=140&&match[3].trim())return match[3].trim();
 }
 return "";
}
function rdapRole(data,role,allowName=false){
 const queue=Array.isArray(data?.entities)?data.entities.slice(0,30):[];
 let visited=0;
 while(queue.length&&visited++<60){
  const entity=queue.shift();
  if(Array.isArray(entity.roles)&&entity.roles.includes(role)){
   const org=rdapEntityCompany(entity,allowName);
   if(org)return org;
  }
  if(Array.isArray(entity.entities))queue.push(...entity.entities.slice(0,15));
 }
 return "";
}
async function lookupBlockedDomain(id,target,expectedSite){
 if(!Number.isInteger(id)||id<0||typeof expectedSite!=="string"||
  !DKManualRules.validHost(target)||!DKManualRules.validHost(expectedSite)||
  data.settings.requestLog!==true)return {error:"No recorded blocked hostname is available for lookup."};
 let site="";
 try{const tab=await browser.tabs.get(id);site=DKSiteAllowlist.host(tab?.url||"");}
 catch(_){return {error:"Website tab no longer exists."};}
 if(site!==expectedSite||data.hosts.get(id)!==site||
  !(data.logs.get(id)||[]).some(row=>row.host===target))
  return {error:"This hostname is not in the selected tab's current blocked-request history."};
 const domain=DKPublicSuffix.registrable(target);
 if(!DKSubscriptions.publicHost(domain)||!domain.includes("."))
  return {error:"This is not a public registrable domain."};
 const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),9000);
 try{
  // No background polling and no browser, cookie, page URL, or request details are sent.
  const response=await fetch("https://rdap.org/domain/"+encodeURIComponent(domain),{
   method:"GET",credentials:"omit",cache:"no-store",redirect:"follow",
   signal:controller.signal,headers:{"Accept":"application/rdap+json, application/json"}
  });
  if(!response.ok||response.url&&!(new URL(response.url).protocol==="https:"))
   return {error:"Public registration lookup is unavailable (HTTP "+response.status+")."};
  const length=Number(response.headers?.get?.("content-length")||0);
  if(length>200000)return {error:"Registration response exceeds privacy-safe limit."};
  const body=await response.text();
  if(body.length>200000)return {error:"Registration response exceeds privacy-safe limit."};
  const registration=JSON.parse(body);
  if(!registration||typeof registration!=="object")
   return {error:"Registration service returned invalid data."};
  const events=Array.isArray(registration.events)?registration.events:[];
  const eventDate=action=>events.find(event=>event.eventAction===action&&typeof event.eventDate==="string")?.eventDate?.slice(0,10)||"";
  const nameservers=(Array.isArray(registration.nameservers)?registration.nameservers:[])
   .slice(0,8).map(item=>String(item?.ldhName||"").toLowerCase()).filter(DKManualRules.validHost);
  const statuses=(Array.isArray(registration.status)?registration.status:[])
   .slice(0,8).filter(value=>typeof value==="string"&&value.length<=70);
  return {ok:true,domain,
   organization:rdapRole(registration,"registrant"),
   registrar:rdapRole(registration,"registrar",true),
   registered:eventDate("registration"),updated:eventDate("last changed"),
   expires:eventDate("expiration"),nameservers,statuses};
 }catch(_){return {error:"Registration lookup could not be completed. Use the links below for a manual search."};}
 finally{clearTimeout(timer);}
}
function recordBlock(tabId,url,type,rule){
 if(tabId<0)return;
 if(type==="popup")DKNetworkMonitor.syntheticBlock(data.networkMonitors,tabId,data.hosts.get(tabId)||"",url,type);
 data.counts.set(tabId,(data.counts.get(tabId)||0)+1);
 data.settings.blockedTotal++;scheduleSave();badge(tabId);
 if(data.settings.requestLog)DKStreamingDiagnostics.record(data.streamingIssues,tabId,
  data.hosts.get(tabId)||"",host(url),type);
 if(!data.settings.requestLog)return;
 const rows=data.logs.get(tabId)||[];
 rows.push({host:host(url),type,rule:(rule?.p||"").slice(0,140),
  ruleSource:DKRuleProvenance.identify(rule,data.ruleSources),
  when:Date.now(),sequence:data.counts.get(tabId)});
 if(rows.length>250)rows.shift();data.logs.set(tabId,rows);
}
// Firefox MV2 response filtering: modify only known player JSON ad fields.
browser.webRequest.onHeadersReceived?.addListener(d=>{
 if(!data.ready||!data.settings.enabled||!data.settings.youtubeResponseFilter||
    data.tempPaused.has(d.tabId))return;
 const site=data.hosts.get(d.tabId)||"";
 if(!activeTab(d.tabId,site)||!DKYouTubeResponse.eligible(d,site))return;
 DKYouTubeResponse.attach(d,browser.webRequest);
},{urls:["https://*.youtube.com/youtubei/v1/player*",
         "https://*.youtube.com/youtubei/v1/get_watch*"],
   types:["xmlhttprequest"]},["responseHeaders"]);
browser.webRequest.onBeforeRequest.addListener(d=>{
 if(!/^https?:/i.test(d.url))return {};
 // A newly created popunder tab may attempt a navigation before it can close.
 if(d.type==="main_frame"&&popupTrapClaimActive(d.tabId))return {cancel:true};
 // Only user-started tab captures are recorded; never store raw URLs, headers or payloads.
 DKNetworkMonitor.record(data.networkMonitors,d.tabId,data.hosts.get(d.tabId)||host(d.documentUrl||d.originUrl||d.url),d);
 if(!data.ready||!data.settings.enabled)return {};
 if(d.type==="main_frame"){
  if(!data.settings.stripTracking||!activeTab(d.tabId,host(d.url))||
     d.method&&String(d.method).toUpperCase()!=="GET")return {};
  // Protect the original URL BEFORE calling the filter engine's separate
  // $removeparam handler: any query rewrite can invalidate an HMAC/SSO link.
  if(DKPrivacy.preserveNavigation(d.url))return {};
  const ruleCleaned=data.engine.cleanNavigation(d.url)||d.url;
  const cleaned=DKPrivacy.stripTrackingParameters(ruleCleaned)||(ruleCleaned!==d.url?ruleCleaned:null);
  if(cleaned)DKNetworkMonitor.transition(data.networkMonitors,d.tabId,d.requestId,"redirected");
  return cleaned?{redirectUrl:cleaned}:{};
 }
 const top=data.hosts.get(d.tabId)||host(d.documentUrl||d.originUrl||d.url);
 // Explicit, user-selected host+type blocks remain effective on allowlisted
 // sites; never block main navigation, auth-critical assets, or global-off tabs.
 if(data.settings.enabled&&!data.tempPaused.has(d.tabId)&&
   DKAllowedActivity.matches(data.manualBlocks,top,host(d.url),d.type)&&
   !DKAuthProtection.isCriticalRequest(d.url,d.type,d.documentUrl||d.originUrl||"")){
  DKNetworkMonitor.transition(data.networkMonitors,d.tabId,d.requestId,"blocked");
  rememberOwnBlock(d.requestId);
  recordBlock(d.tabId,d.url,d.type,{p:"[User-selected block]"});
  return {cancel:true};
 }
 if(!activeTab(d.tabId,top))return {};
 // Opt-in rescue: only media requests on the specifically selected streaming site.
 // No script, XHR, tracking, or navigation requests are exempted.
 if(DKVideoAssist.mediaRecoveryAllowed(top,d.type,data.settings.mediaRecovery))return {};
 // Explicit temporary repair: one tab, one hostname and one request type, expires in 10 min.
 if(DKStreamingRepair.matches(data.streamingAllowances,d.tabId,top,host(d.url),d.type))return {};
 // Allow narrowly identified sign-in assets, never unrelated Google trackers.
 if(DKAuthProtection.isCriticalRequest(d.url,d.type,d.documentUrl||d.originUrl||""))return {};
 const doc=d.documentUrl||d.originUrl||"",contextHost=host(doc)||top;
 const result=data.engine.checkRequest(d.url,d.type,contextHost,data.engine.getPagePolicy(doc));
 if(!result.block)return {};
 // A manual allowance never overrides popup protection or page navigation.
 // It matches one exact site, destination hostname and Firefox resource type.
 if(DKRequestControls.matches(data.requestControls,d.tabId,top,host(d.url),d.type)){
  DKNetworkMonitor.note(data.networkMonitors,d.tabId,d.requestId,"User-approved hostname/type exception");
  return {};
 }
 DKNetworkMonitor.transition(data.networkMonitors,d.tabId,d.requestId,"blocked");
 rememberOwnBlock(d.requestId);
 recordBlock(d.tabId,d.url,d.type,result.rule);
 return {cancel:true};
},{urls:["<all_urls>"]},["blocking"]);
function popupTrapClaimActive(tabId){
 const claim=data.popupTrapClaims.get(tabId);
 if(!claim)return false;
 if(Date.now()-claim.when<=DKPopupTrap.CLAIM_MS)return true;
 data.popupTrapClaims.delete(tabId);return false;
}
// Strict mode closes unwanted new tabs from selected aggressive popunder sites
// even when they first open about:blank or lead to an ever-changing ad domain.
// The one-time exception is granted by an explicit extension toolbar click.
async function interceptStrictPopup(newTabId,sourceTabId,targetUrl=""){
 if(!data.ready||!Number.isInteger(sourceTabId)||sourceTabId<0||
   !Number.isInteger(newTabId)||newTabId<0||newTabId===sourceTabId)return "not-applicable";
 const now=Date.now();
 const approvedUntil=data.popupTrapAllowed.get(newTabId);
 if(approvedUntil&&approvedUntil>now)return "allowed";
 if(popupTrapClaimActive(newTabId))return "blocked";
 // Cached source identity is useful for early detection, but only Firefox's
 // current source-tab URL may authorize destructive tab removal.
 const cachedHost=data.hosts.get(sourceTabId)||"";
 let sourceHost=cachedHost;
 if(!DKPopupTrap.protectedHost(sourceHost)){
  try{sourceHost=host((await browser.tabs.get(sourceTabId))?.url||"");}
  catch(_){return "not-applicable";}
 }
 if(!DKPopupTrap.shouldBlock(sourceHost,data.settings.strictPopupSites,activeTab(sourceTabId,sourceHost)))
  return "not-applicable";
 // Re-check after possible asynchronous source-tab lookup.
 if(popupTrapClaimActive(newTabId))return "blocked";
 if((data.popupTrapAllowed.get(newTabId)||0)>Date.now())return "allowed";
 if(DKPopupTrap.consumeOnce(data.popupTrapPermits,sourceTabId)){
  data.popupTrapAllowed.set(newTabId,Date.now()+DKPopupTrap.CLAIM_MS);
  if(data.popupTrapAllowed.size>DKPopupTrap.MAX_CLAIMS)
   data.popupTrapAllowed.delete(data.popupTrapAllowed.keys().next().value);
  return "allowed";
 }
 if(!DKPopupTrap.claim(data.popupTrapClaims,newTabId,sourceTabId))return "blocked";
 // A cached source tab can navigate before the removal is attempted.
 // Verify the live hostname before closing a possibly legitimate new tab.
 try{
  const liveHost=host((await browser.tabs.get(sourceTabId))?.url||"");
  if(!DKPopupTrap.shouldBlock(liveHost,data.settings.strictPopupSites,
    activeTab(sourceTabId,liveHost))){
   data.popupTrapClaims.delete(newTabId);
   return "not-applicable";
  }
  sourceHost=liveHost;
 }catch(_){
  data.popupTrapClaims.delete(newTabId);
  return "not-applicable";
 }
 try{
  await browser.tabs.remove(newTabId);
  data.popupTrapCounts.set(sourceTabId,(data.popupTrapCounts.get(sourceTabId)||0)+1);
  if(data.settings.requestLog)
   DKPopupHistory.add(data.popupHistory,sourceTabId,sourceHost,newTabId,targetUrl,"strict");
  recordBlock(sourceTabId,typeof targetUrl==="string"?targetUrl:"","popup",{p:"Strict new-tab protection"});
 }catch(error){
  // Tab may have already closed; retain the short-lived claim to prevent
  // a second event from counting the same attempt twice.
  console.warn("DK Live Block new-tab removal:",String(error?.message||error).slice(0,100));
 }
 return "blocked";
}
browser.tabs.onCreated?.addListener(tab=>{
 if(Number.isInteger(tab?.openerTabId)&&tab.openerTabId>=0)
  interceptStrictPopup(tab.id,tab.openerTabId,tab.url||"").catch(()=>{});
});
// Rule-based popup filters still cover ordinary sites.
browser.webNavigation?.onCreatedNavigationTarget?.addListener(async event=>{
 if(!data.ready||!data.settings.enabled||event.tabId<0||event.sourceTabId<0)return;
 if(data.settings.requestLog)
  DKPopupHistory.enrich(data.popupHistory,event.sourceTabId,event.tabId,event.url||"");
 const strict=await interceptStrictPopup(event.tabId,event.sourceTabId,event.url||"");
 if(strict!=="not-applicable")return;
 if(!/^https?:/i.test(event.url)||DKAuthProtection.isAuthPopup(event.url))return;
 try{
  const origin=await browser.tabs.get(event.sourceTabId);
  const originUrl=origin?.url||"",originHost=host(originUrl);
  if(!originHost||!activeTab(event.sourceTabId,originHost))return;
  const verdict=data.engine.checkRequest(event.url,"popup",originHost,data.engine.getPagePolicy(originUrl));
  if(!verdict.block)return;
  await browser.tabs.remove(event.tabId);
  if(data.settings.requestLog)
   DKPopupHistory.add(data.popupHistory,event.sourceTabId,originHost,
    event.tabId,event.url,"filter");
  recordBlock(event.sourceTabId,event.url,"popup",verdict.rule);
 }catch(error){console.warn("DK Live Block popup check:",error);}
});
browser.tabs.onUpdated.addListener((id,info,tab)=>{
 if(info.url||info.status==="loading"){
  if(info.url&&host(info.url)!==(data.hosts.get(id)||"")){
   DKRequestControls.dropTab(data.requestControls,id);
   DKPopupHistory.clear(data.popupHistory,id);
   DKPopupTrap.revoke(data.popupTrapPermits,id);
   data.popupTrapCounts.delete(id);
  }
  // A capture belongs to one site only. Retain it across reloads, remove on new-site navigation.
  const session=data.networkMonitors.get(id);
  if(info.url&&session&&host(info.url)!==session.siteHost)DKNetworkMonitor.remove(data.networkMonitors,id);
  if(info.url&&host(info.url)!==(data.hosts.get(id)||""))DKStreamingRepair.clear(data.streamingAllowances,id);
  // Keep the per-site popup count across reloads; host changes clear it above.
  DKPlaybackHealth.clear(data.playbackHealth,id);DKYouTubeResponse.clear(id);
  autoVideoTimes.delete(id);DKAllowedActivity.clear(data.allowedActivity,id);toolbarIcons?.reset(id);data.hosts.set(id,host(info.url||tab.url));data.counts.set(id,0);data.logs.delete(id);data.networkIssues.delete(id);data.streamingIssues.delete(id);data.popupCounts.delete(id);badge(id);}
});
browser.tabs.onRemoved.addListener(id=>{
 DKPopupHistory.clear(data.popupHistory,id);
 DKRequestControls.dropTab(data.requestControls,id);
 DKPopupTrap.revoke(data.popupTrapPermits,id);data.popupTrapCounts.delete(id);
 DKNetworkMonitor.remove(data.networkMonitors,id);DKAllowedActivity.clear(data.allowedActivity,id);DKPlaybackHealth.clear(data.playbackHealth,id);DKYouTubeResponse.clear(id);autoVideoTimes.delete(id);data.hosts.delete(id);data.counts.delete(id);data.logs.delete(id);data.networkIssues.delete(id);data.streamingIssues.delete(id);DKStreamingRepair.clear(data.streamingAllowances,id);data.popupCounts.delete(id);data.tempPaused.delete(id);toolbarIcons?.reset(id);});
browser.alarms.onAlarm.addListener(a=>{if(a.name==="refresh-rules"&&data.settings.autoUpdate)updateLists().catch(console.warn);});
browser.runtime.onMessage.addListener(async(msg,sender={})=>{
 if(!msg||typeof msg.action!=="string")return {};
 // Firefox provides sender.tab for extension pages opened in ordinary tabs.
 // Treat only the browser-supplied sender.url in OUR extension origin as trusted.
 // Do not infer caller privileges from sender.tab.url or msg.url.
 const extensionRoot=typeof browser.runtime.getURL==="function"?
  browser.runtime.getURL(""):"";
 const ownExtensionPage=!!(extensionRoot&&typeof sender.url==="string"&&
  sender.url.startsWith(extensionRoot));
 const fromContent=!!sender.tab&&!ownExtensionPage;
 if(fromContent&&msg.action!=="getStyle"&&msg.action!=="addElementRule"&&msg.action!=="reportPopupCleanup"&&msg.action!=="rememberVideoProgress"&&msg.action!=="reportPlaybackHealth")
  return {error:"This action is only available in the extension interface."};
 const id=fromContent?sender.tab.id:(Number.isInteger(msg.tabId)?msg.tabId:-1);
 const url=fromContent?(sender.url||sender.tab.url||""):(msg.url||sender.url||"");
 const h=host(url);
 if(msg.action==="status")return status(id,url);
 if(msg.action==="permitNextPopupTab"){
  if(fromContent||id<0)return {error:"Extension toolbar only."};
  try{
   const selected=await browser.tabs.get(id);
   const source=host(selected?.url||"");
   if(!DKPopupTrap.shouldBlock(source,data.settings.strictPopupSites,activeTab(id,source)))
    return {error:"Strict new-tab protection is not active for this site."};
   DKPopupTrap.grantOnce(data.popupTrapPermits,id);
   return {ok:true,expiresInSeconds:15};
  }catch(_){return {error:"The original website tab is no longer available."};}
 }
 if(msg.action==="startNetworkMonitor"){
  if(fromContent)return {error:"Extension interface only."};
  try{
   const tab=await browser.tabs.get(id),site=host(tab?.url||"");
   if(!site||!/^https?:\/\//i.test(tab.url||""))return {error:"Choose a regular website tab."};
   if(!DKNetworkMonitor.start(data.networkMonitors,id,site))return {error:"Unable to start capture."};
   return {ok:true};
  }catch(_){return {error:"Website tab no longer available."};}
 }
 if(msg.action==="getNetworkMonitor"){
  if(fromContent)return {error:"Extension interface only."};
  return DKNetworkMonitor.snapshot(data.networkMonitors,id);
 }
 if(msg.action==="getPopupHistory"||msg.action==="clearPopupHistory"){
  if(fromContent||!Number.isInteger(id)||id<0)return {error:"Extension interface only."};
  let sourceHost;
  try{sourceHost=host((await browser.tabs.get(id))?.url||"");}
  catch(_){return {error:"Website tab no longer available."};}
  if(!sourceHost)return {error:"Choose a website tab."};
  if(msg.action==="clearPopupHistory"){DKPopupHistory.clear(data.popupHistory,id);return {ok:true};}
  if(!data.settings.requestLog)return [];
  return DKPopupHistory.getRecent(data.popupHistory,id,sourceHost);
 }
 if(msg.action==="getRequestAllowances"||msg.action==="allowMonitoredRequest"||
    msg.action==="revokeMonitoredRequest"){
  if(fromContent||!Number.isInteger(id)||id<0)
   return {error:"Only the extension interface can change request allowances."};
  let sourceHost;
  try{const selected=await browser.tabs.get(id);sourceHost=host(selected?.url||"");}
  catch(_){return {error:"Selected tab is no longer available."};}
  if(!sourceHost||!DKManualRules.validHost(sourceHost))
   return {error:"Choose a normal website tab."};
  if(typeof msg.expectedSite==="string"&&msg.expectedSite!==sourceHost)
   return {error:"The selected tab changed websites. Refresh the dashboard."};
  if(msg.action==="getRequestAllowances")
   return DKRequestControls.list(data.requestControls,id,sourceHost);
  if(msg.action==="allowMonitoredRequest"){
   if(msg.confirm!==true||!data.ready||!activeTab(id,sourceHost))
    return {error:"An explicit confirmation and active website protection are required."};
   const session=data.networkMonitors.get(id);
   if(!session?.active||session.siteHost!==sourceHost)
    return {error:"Start network capture on the selected tab first."};
   if(!session.rows.some(row=>row.status==="blocked"&&
      row.host===msg.host&&row.type===msg.type))
    return {error:"That exact hostname and request type were not recorded as blocked."};
   const result=DKRequestControls.grant(data.requestControls,id,
    sourceHost,msg.host,msg.type,msg.scope);
   if(result.ok&&msg.scope==="remember")
    await browser.storage.local.set({requestAllowances:data.requestControls.remember});
   return result;
  }
  const removed=DKRequestControls.revoke(data.requestControls,id,
   sourceHost,msg.host,msg.type,msg.scope);
  if(!removed)return {error:"No matching exception for this website."};
  if(msg.scope==="remember")
   await browser.storage.local.set({requestAllowances:data.requestControls.remember});
  return {ok:true};
 }
 if(msg.action==="stopNetworkMonitor"||msg.action==="clearNetworkMonitor"){
  if(fromContent)return {error:"Extension interface only."};
  const changed=msg.action==="stopNetworkMonitor"?
    DKNetworkMonitor.stop(data.networkMonitors,id):
    DKNetworkMonitor.clear(data.networkMonitors,id);
  return changed?{ok:true}:{error:"Start a capture for the selected tab first."};
 }
 if(msg.action==="getSavedVideos"){
  return DKVideoLibrary.list((await browser.storage.local.get("savedVideos")).savedVideos);
 }
 if(msg.action==="rememberVideoProgress"){
  // Only the top-level extension content script may report a real, visible
  // YouTube player. Validate both sender and current tab to defeat stale SPA reports.
  if(!fromContent||sender.frameId!==0||!data.settings.rememberVideos)
   return {error:"Automatic remembering is not enabled for this page."};
  const presented=DKVideoLibrary.parseVideo(sender.url||"");
  const actual=DKVideoLibrary.parseVideo(sender.tab?.url||"");
  const position=msg.position,duration=msg.duration;
  if(!presented||!actual||presented.id!==actual.id||actual.id!==msg.videoId||
     !Number.isFinite(position)||!Number.isFinite(duration)||
     duration<90||duration>86400||position<60||position>86400||position>=duration-15)
   return {error:"Not an eligible unfinished YouTube video."};
  const now=Date.now(),prior=autoVideoTimes.get(id);
  if(prior&&prior.videoId===actual.id&&now-prior.when<30000)return {ok:true,skipped:true};
  autoVideoTimes.set(id,{videoId:actual.id,when:now});
  return libraryUpdate(items=>DKVideoLibrary.save(items,{
   id:actual.id,url:actual.url,title:msg.title,position
  }));
 }
 if(msg.action==="saveVideo"){
  const active=await verifiedActiveVideo(msg);
  if(!active)return {error:"Video no longer matches the open browser tab."};
  return libraryUpdate(items=>DKVideoLibrary.save(items,{
   id:active.video.id,url:active.video.url,title:msg.title,position:msg.position
  }));
 }
 if(msg.action==="removeSavedVideo"){
  return libraryUpdate(items=>DKVideoLibrary.remove(items,msg.videoId));
 }
 if(msg.action==="updateSavedVideoMetadata"){
  return libraryUpdate(items=>DKVideoLibrary.updateMetadata(items,msg.videoId,msg.changes));
 }
 if(msg.action==="clearSavedVideos")return {error:"Use the explicit Erase saved-video history control."};
 if(msg.action==="videoPrivacyStatus")
  return {autoRemembering:!!data.settings.rememberVideos};
 if(msg.action==="eraseVideoHistory"){
  if(videoJob.state==="running"||videoJob.state==="cancelling")
   return {error:"Finish or cancel the active download before erasing viewing history."};
  const task=videoLibraryQueue.catch(()=>{}).then(async()=>{
   if(videoJob.state==="running"||videoJob.state==="cancelling")
    return {error:"A download started. Cancel it before erasing history."};
   data.settings.rememberVideos=false;autoVideoTimes.clear();
   await videoPersistQueue.catch(()=>{});
   await browser.storage.local.set({settings:data.settings,savedVideos:[],lastVideoDownload:null});
   videoJob={id:"",state:"idle",progress:0,quality:"compatible",phase:"",error:""};
   refreshTabs();
   return {ok:true};
  });
  videoLibraryQueue=task;return task;
 }
 if(msg.action==="importSavedVideos"){
  const imported=DKVideoLibrary.importBackup(msg.backup);
  if(!imported)return {error:"Invalid or oversized local video library backup."};
  return libraryUpdate(items=>DKVideoLibrary.merge(items,imported));
 }
 if(msg.action==="videoDownloadStatus")return jobStatus();
 if(msg.action==="startVideoDownload")return startVideoDownload(msg);
 if(msg.action==="cancelVideoDownload")return cancelVideoDownload(msg);
 if(msg.action==="lookupBlockedDomain"){
  if(fromContent||!Number.isInteger(id)||id<0)return {error:"Extension interface only."};
  return lookupBlockedDomain(id,String(msg.host||"").toLowerCase(),msg.expectedSite);
 }
 if(msg.action==="setSelectiveBlock"){
  if(fromContent||!Number.isInteger(id)||id<0||typeof msg.expectedSite!=="string")
   return {error:"Extension interface and live website tab required."};
  let liveSite="";
  try{
   const tab=await browser.tabs.get(id);
   if(!/^https?:\/\//i.test(tab?.url||""))return {error:"Choose a normal website tab."};
   liveSite=host(tab.url);
  }catch(_){return {error:"Website tab unavailable."};}
  if(!liveSite||liveSite!==msg.expectedSite||data.hosts.get(id)!==liveSite)
   return {error:"The selected tab changed websites. Refresh before changing controls."};
  if(typeof msg.block!=="boolean"||!DKAllowedActivity.hostname(msg.host)||
     !DKAllowedActivity.TYPES.has(msg.type))return {error:"Invalid request-control choice."};
  if(msg.block){
   if(!data.settings.enabled||data.tempPaused.has(id)||msg.confirm!==true)
    return {error:"Enable protection and explicitly confirm the selective block."};
   const rows=DKAllowedActivity.snapshot(data.allowedActivity,id,liveSite).groups;
   if(!rows.some(r=>r.host===msg.host&&r.type===msg.type))
    return {error:"That destination and type were not observed on the selected tab."};
  }
  const outcome=DKAllowedActivity.toggle(data.manualBlocks,liveSite,msg.host,msg.type,msg.block);
  if(outcome.error)return outcome;
  if(outcome.changed){
   data.manualBlocks=outcome.rows;
   await browser.storage.local.set({manualBlocks:data.manualBlocks});
  }
  return {ok:true,blocked:outcome.blocked,changed:outcome.changed,
   count:DKAllowedActivity.list(data.manualBlocks,liveSite).length};
 }
 if(msg.action==="getSiteDashboard"){
  // Only extension pages may inspect private, tab-specific history.
  if(fromContent||!Number.isInteger(id)||id<0)return {error:"Extension interface only."};
  let liveURL="",site="";
  try{
   liveURL=(await browser.tabs.get(id))?.url||"";
   site=DKSiteAllowlist.host(liveURL);
  }catch(_){return {error:"Website tab is unavailable."};}
  if(!/^https?:\/\//i.test(liveURL)||!DKManualRules.validHost(site))
   return {error:"Choose a normal HTTP(S) website tab."};
  const sameTab=data.hosts.get(id)===site;
  const requestLog=data.settings.requestLog===true;
  const logs=sameTab&&requestLog?(data.logs.get(id)||[]).slice(-250).reverse().map(row=>({
   host:DKManualRules.validHost(row.host)?row.host:"",
   type:String(row.type||"").slice(0,30),
   when:Number.isFinite(row.when)?row.when:0,
   sequence:Number.isSafeInteger(row.sequence)&&row.sequence>=1?row.sequence:0,
   ruleType:row.type==="popup"?"popup":row.rule?"filter":"engine",
   registeredDomain:DKPublicSuffix.registrable(row.host),
   ruleEvidence:{...DKRuleEvidence.explain(row.rule),subscription:DKRuleProvenance.clean(row.ruleSource)}
  })):[];
  const popupEvents=sameTab&&requestLog?
   DKPopupHistory.getRecent(data.popupHistory,id,site).slice(0,8):[];
  const allowance=DKRequestControls.list(data.requestControls,id,site).slice(0,150).map(row=>({
   host:row.host,type:row.type,scope:row.scope,
   expires:Number.isFinite(row.expires)?row.expires:0
  }));
  const pausedOn=DKSiteAllowlist.match(data.settings.paused,site);
  const permitted=sameTab&&requestLog?DKAllowedActivity.snapshot(data.allowedActivity,id,site):{total:0,groups:[]};
  return {
   ok:true,tabId:id,site,
   globalEnabled:data.settings.enabled===true,
   sitePaused:!!pausedOn,allowlistMatch:pausedOn||"",
   temporarilyPaused:data.tempPaused.has(id),
   siteActive:activeTab(id,site),
   blocked:sameTab?(data.counts.get(id)||0):0,
   popupHidden:sameTab?(data.popupCounts.get(id)||0):0,
   scamTabsBlocked:sameTab?(data.popupTrapCounts.get(id)||0):0,
   strictPopupAvailable:DKPopupTrap.protectedHost(site),
   strictPopupEnabled:DKPopupTrap.shouldBlock(site,data.settings.strictPopupSites,activeTab(id,site)),
   cookieRejectEnabled:data.settings.cookieReject===true,
   cookieRejectPaused:data.settings.cookieRejectPaused.some(h=>DKRules.sub(site,h)),
   distractionEnabled:data.settings.distractionControl===true,
   distractionPaused:data.settings.distractionPaused.some(h=>DKRules.sub(site,h)),
   popupCleanupEnabled:data.settings.antiAdblock||data.settings.paywallPopups,
   popupCleanupPaused:data.settings.popupProtectionPaused.some(h=>DKRules.sub(site,h)),
   requestLog,allowedRequests:permitted.total,allowedGroups:permitted.groups,
   selectiveBlocks:DKAllowedActivity.list(data.manualBlocks,site),
   youtubeResponse:DKYouTubeResponse.validPage(site)?{enabled:data.settings.youtubeResponseFilter===true,supported:typeof browser.webRequest.filterResponseData==="function",...DKYouTubeResponse.stats(id)}:null,
   filterBackend:String(data.engine.backend||"Local").slice(0,64),
   networkRules:data.engine.networkCount||0,cosmeticRules:data.engine.cosmetic.length,
   unsupportedRules:data.engine.unsupportedCount||0,
   recentBlocks:logs,popupHistory:popupEvents,
   playbackDiagnostics:sameTab&&requestLog&&DKPlaybackHealth.supportsHost(site)?
    DKPlaybackHealth.recent(data.playbackHealth,id,site).slice(0,30):[],
   customAllowances:DKManualRules.listSiteExceptions(data.settings.customRules,site).slice(0,150),
   requestAllowances:allowance
  };
 }
 if(msg.action==="getSettings")return {settings:data.settings,listState:status(-1,"").listState,youtubeRules:status(-1,"").youtubeRules};
 if(msg.action==="getNotificationControl"){
  if(fromContent)return {error:"Extension interface only."};
  return DKNotificationProtection.status(browser);
 }
 if(msg.action==="reportPopupCleanup"){
  if(!fromContent||id<0||!Number.isInteger(msg.count)||msg.count<1||msg.count>6||
     !["antiAdblock","paywall","distraction"].includes(msg.kind))return {error:"Invalid popup report."};
  const site=data.hosts.get(id)||host(sender.tab?.url)||h;
  if(msg.kind==="distraction"&&!data.settings.distractionControl)
    return {error:"Distraction protection is disabled."};
  if(!data.ready||!activeTab(id,site)||
    data.settings.popupProtectionPaused.some(x=>DKRules.sub(site,x)))return {error:"Popup protection is not active."};
  const total=Math.min(1000,(data.popupCounts.get(id)||0)+msg.count);
  data.popupCounts.set(id,total);
  return {ok:true};
 }
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
 if(msg.action==="reportPlaybackHealth"){
  if(!fromContent||!data.ready||!data.settings.requestLog||!data.settings.enabled||
     sender.frameId!==0||!Number.isInteger(id)||id<0)return {ok:false};
  const pageHost=host(sender.url||"");
  if(!DKPlaybackHealth.supportsHost(pageHost)||
     pageHost!==host(sender.tab?.url||"")||
     data.hosts.get(id)!==pageHost||!activeTab(id,pageHost))return {ok:false};
  try{if(host((await browser.tabs.get(id))?.url||"")!==pageHost)return {ok:false};}
  catch(_){return {ok:false};}
  if(msg.kind!=="buffering"&&msg.kind!=="media-error"&&msg.kind!=="enforcement")return {ok:false};
  const now=Date.now(),nearby=DKStreamingDiagnostics.recent(data.streamingIssues,id,now)
   .some(row=>row.pageHost===pageHost&&row.type==="media"&&
     now-row.when>=0&&now-row.when<=120000);
  return {ok:DKPlaybackHealth.record(data.playbackHealth,id,pageHost,msg.kind,nearby,now)};
 }
 if(msg.action==="getPlaybackHealth"||msg.action==="clearPlaybackHealth"){
  if(fromContent||!Number.isInteger(id)||id<0)return {error:"Extension settings only."};
  let pageHost;
  try{pageHost=host((await browser.tabs.get(id))?.url||"");}
  catch(_){return {error:"Choose an open website tab."};}
  if(!DKPlaybackHealth.supportsHost(pageHost))return [];
  if(msg.action==="clearPlaybackHealth"){DKPlaybackHealth.clear(data.playbackHealth,id);return {ok:true};}
  if(!data.settings.requestLog)return [];
  return DKPlaybackHealth.recent(data.playbackHealth,id,pageHost);
 }
 if(msg.action==="getStreamingIssues"){
  if(fromContent||!Number.isInteger(id)||id<0)return {error:"Extension settings only."};
  let currentHost;
  try{currentHost=host((await browser.tabs.get(id))?.url||"");}
  catch(_){return [];}
  if(!data.settings.requestLog||!DKStreamingDiagnostics.streaming(currentHost)||
    data.hosts.get(id)!==currentHost)return [];
  return DKStreamingDiagnostics.recent(data.streamingIssues,id)
   .filter(row=>row.pageHost===currentHost).reverse();
 }
 if(msg.action==="clearStreamingIssues"){
  if(sender?.tab)return {error:"Extension settings only."};
  DKStreamingDiagnostics.clear(data.streamingIssues,id);return {ok:true};
 }
 if(msg.action==="getStreamingAllowances"){
  if(sender?.tab)return {error:"Extension settings only."};
  return DKStreamingRepair.list(data.streamingAllowances,id);
 }
 if(msg.action==="temporarilyAllowStreamingHost"){
  if(sender?.tab||msg.confirm!==true||!data.settings.requestLog||!data.ready||id<0)
   return {error:"Explicit permission and active diagnostics are required."};
  const pageHost=data.hosts.get(id)||"";
  let currentHost;
  try{currentHost=host((await browser.tabs.get(id))?.url||"");}
  catch(_){return {error:"The streaming tab is no longer available."};}
  const evidence=DKStreamingDiagnostics.recent(data.streamingIssues,id);
  if(!DKStreamingRepair.isStreamingHost(pageHost)||currentHost!==pageHost||
     !activeTab(id,pageHost)||
     !evidence.some(row=>row.pageHost===pageHost&&
       row.host===msg.host&&row.type===msg.type))
   return {error:"This exact host and request type were not observed as blocked on this tab."};
  if(!DKStreamingRepair.allow(data.streamingAllowances,id,pageHost,msg.host,msg.type))
   return {error:"Invalid host/type or the temporary allowance limit was reached."};
  return {ok:true,expiresInMinutes:10};
 }
 if(msg.action==="revokeStreamingHost"){
  if(fromContent||!Number.isInteger(id)||id<0)return {error:"Extension settings only."};
  let pageHost;
  try{pageHost=host((await browser.tabs.get(id))?.url||"");}
  catch(_){return {error:"Streaming tab is no longer available."};}
  if(!DKStreamingRepair.isStreamingHost(pageHost))return {error:"Select a streaming tab."};
  return DKStreamingRepair.revoke(data.streamingAllowances,id,
   pageHost,msg.host,msg.type)?{ok:true}:{error:"No matching temporary repair."};
 }
 if(msg.action==="clearTemporaryStreamingAllowances"){
  if(sender?.tab)return {error:"Extension settings only."};
  DKStreamingRepair.clear(data.streamingAllowances,id);return {ok:true};
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
 if(msg.action==="clearLog"){data.logs.delete(id);data.streamingIssues.delete(id);return {ok:true};}
 if(msg.action==="resetStatistics"){
  data.settings.blockedTotal=0;data.counts.clear();data.logs.clear();data.streamingIssues.clear();data.playbackHealth.clear();data.streamingAllowances.clear();data.popupHistory.clear();
  await persistSettings();refreshTabs();return {ok:true};
 }
 if(msg.action==="updateLists")return updateLists();
 if(msg.action==="setBuiltInListEnabled"){
  if(fromContent||!Object.prototype.hasOwnProperty.call(SOURCES,msg.key)||
      typeof msg.enabled!=="boolean")return {error:"Invalid built-in filter list change."};
  if(data.updateJob)return {error:"Filter updates are running. Try again after they finish."};
  data.settings.listEnabled[msg.key]=msg.enabled;
  await persistSettings();rebuild();
  return {ok:true,enabled:msg.enabled,needsDownload:msg.enabled&&!data.lists[msg.key]?.text};
 }
 if(msg.action==="updateFilterList"){
  if(fromContent||data.updateJob)return {error:"An update is already running or access is denied."};
  const builtIn=typeof msg.key==="string"&&Object.prototype.hasOwnProperty.call(SOURCES,msg.key);
  const custom=typeof msg.url==="string"&&data.settings.customSubscriptions.includes(msg.url);
  if((builtIn?1:0)+(custom?1:0)!==1)return {error:"Choose a subscribed filter list."};
  const source=builtIn?SOURCES[msg.key].url:msg.url,prev=builtIn?data.lists[msg.key]:data.customLists[msg.url];
  data.updateJob=(async()=>{
   try{
    const result=await downloadList(source,builtIn,prev);
    const cache=DKSubscriptionCache.store(prev,result,Date.now());
    if(builtIn){data.lists[msg.key]=cache;delete data.listErrors[msg.key];}
    else{data.customLists[msg.url]=cache;delete data.listErrors[msg.url];}
    data.settings.lastUpdate=Date.now();
    await persist();if(!result.unchanged)rebuild();
    return {ok:true,updated:!result.unchanged,checked:cache.checked,wasCached:!!cache.text};
   }catch(error){
    const problem=String(error?.message||error).slice(0,150);
    data.listErrors[builtIn?msg.key:msg.url]=problem;
    await persist();
    return {error:problem,retainedLastGood:!!prev?.text};
   }
  })().finally(()=>{data.updateJob=null;});
  return data.updateJob;
 }
 if(msg.action==="removeCustomFilterList"){
  if(fromContent||data.updateJob||typeof msg.url!=="string"||
    !data.settings.customSubscriptions.includes(msg.url))
    return {error:"Unknown custom list or an update is running."};
  data.settings.customSubscriptions=data.settings.customSubscriptions.filter(x=>x!==msg.url);
  delete data.customLists[msg.url];delete data.listErrors[msg.url];
  await persist();rebuild();
  return {ok:true,urls:data.settings.customSubscriptions.slice()};
 }
 if(msg.action==="updateYouTubePack"){
  if(fromContent)return {error:"Extension settings only."};
  return updateYouTubePack();
 }
 if(msg.action==="rollbackYouTubePack"){
  if(fromContent)return {error:"Extension settings only."};
  if(data.youtubeJob||data.updateJob)return {error:"A rule update is running. Please try again."};
  if(!data.youtubeRules)return {error:"No downloaded YouTube pack to roll back."};
  data.youtubeHeldVersion=Math.max(data.youtubeHeldVersion,data.youtubeRules.version);
  data.youtubeRules=data.youtubePrevious;
  data.youtubePrevious=null;
  delete data.listErrors.youtube;
  await persist();rebuild();
  return {ok:true,version:data.youtubeRules?.version||0,heldVersion:data.youtubeHeldVersion};
 }
 if(msg.action==="getCosmeticSiteExceptions"||msg.action==="setCosmeticSiteException"){
  if(fromContent||!Number.isInteger(id)||id<0)return {error:"Extension inspector only."};
  let page="",site="";
  try{page=(await browser.tabs.get(id))?.url||"";site=DKSiteAllowlist.host(page);}
  catch(_){return {error:"Original website tab is unavailable."};}
  if(!site||!activeTab(id,site)||data.hosts.get(id)&&data.hosts.get(id)!==site)
   return {error:"Choose an active, protected website tab."};
  if(msg.action==="getCosmeticSiteExceptions")
   return {ok:true,siteHost:site,selectors:DKCosmeticExceptions.list(data.settings.customRules,site)};
  if(typeof msg.allowed!=="boolean"||
     !DKCosmeticExceptions.valid(site,msg.selector))
   return {error:"Invalid cosmetic exception or selector."};
  const result=DKCosmeticExceptions.change(data.settings.customRules,site,msg.selector,msg.allowed);
  if(!result.ok)return result;
  if(result.changed){
   data.settings.customRules=result.text;
   await persistSettings();rebuild();
  }
  return {ok:true,changed:result.changed,siteHost:site,
   selectors:DKCosmeticExceptions.list(data.settings.customRules,site)};
 }
 if(msg.action==="getCosmeticDebugSelectors"){
  if(fromContent||!Number.isInteger(id)||id<0)return {error:"Extension interface only."};
  let page,site;
  try{page=(await browser.tabs.get(id))?.url||"";site=host(page);}
  catch(_){return {error:"Original tab no longer available."};}
  if(!/^https?:\/\//i.test(page)||!site||!activeTab(id,site))
   return {error:"Choose a protected website tab."};
  if(data.hosts.get(id)&&data.hosts.get(id)!==site)
   return {error:"Website is navigating; reload before inspecting."};
  const policy=data.engine.getPagePolicy(page);
  if(policy.document)return {error:"Cosmetic filters are disabled for this website."};
  const selectors=DKAuthProtection.safeCosmetics(
    DKVideoAssist.safeCosmetics(data.engine.getSelectors(site,policy),site))
    .filter(s=>typeof s==="string"&&s.length>0&&s.length<=240)
    .slice(0,80);
  return {ok:true,siteHost:site,selectors};
 }
 if(msg.action==="getStyle"){const policy=data.engine.getPagePolicy(url),top=data.hosts.get(sender.tab?.id)||h,active=activeTab(sender.tab?.id??-1,h)&&activeTab(sender.tab?.id??-1,top)&&!policy.document;const popupAllowed=!data.settings.popupProtectionPaused.some(x=>DKRules.sub(top,x));
  const cookieAllowed=!data.settings.cookieRejectPaused.some(x=>DKRules.sub(top,x));
  const distractionAllowed=!data.settings.distractionPaused.some(x=>DKRules.sub(top,x));
  return {active,youtubeSkip:data.settings.youtubeSkip,rememberVideos:data.settings.rememberVideos,cookieReject:data.settings.cookieReject&&cookieAllowed,distractionControl:data.settings.distractionControl&&distractionAllowed,adRecognition:data.settings.adRecognition,
   playbackHealthEnabled:active&&data.settings.requestLog&&DKPlaybackHealth.supportsHost(h)&&sender.frameId===0,
   youtubePageAssistEnabled:active&&data.settings.youtubeResponseFilter===true&&DKYouTubeResponse.validPage(h)&&sender.frameId===0,
   antiAdblock:data.settings.antiAdblock&&popupAllowed,
   paywallPopups:data.settings.paywallPopups&&popupAllowed,css:active?DKAuthProtection.safeCosmetics(DKVideoAssist.safeCosmetics(data.engine.getSelectors(h,policy),h)).slice(0,15000).map(s=>s+" {display:none!important;}").join("\n")+
    "\n"+DKGhosteryCosmetics.styles(data.engine.vendor,h,{
      streaming:DKVideoAssist.isStreamingHost(h),
      safeSelector:list=>DKAuthProtection.safeCosmetics(list),
      protectSelector:selector=>DKVideoAssist.protectSelector(selector)
    }):"",procedural:active?data.engine.getProcedural(h,policy).slice(0,300):[]};}
 if(msg.action==="setGlobal"){
  const previous=data.settings.enabled;
  data.settings.enabled=!!msg.enabled;
  try{syncProxyListener();}catch(error){data.settings.enabled=previous;return {error:"Could not update proxy routing: "+String(error.message||error).slice(0,100)};}
  data.notificationControl=await DKNotificationProtection.sync(browser,
   data.settings.enabled&&data.settings.blockNotificationPrompts);
  await persist();rebuild();return status(id,url);
 }
 const siteFeatureConfigs={
  cookieReject:"cookieRejectPaused",
  distractionControl:"distractionPaused"
 };
 if(msg.action==="getSiteFeatureExceptions"){
  if(fromContent)return {error:"Extension settings only."};
  return {cookieReject:data.settings.cookieRejectPaused.slice(),
   distractionControl:data.settings.distractionPaused.slice()};
 }
 if(msg.action==="removeSiteFeatureException"){
  if(fromContent||!Object.prototype.hasOwnProperty.call(siteFeatureConfigs,msg.feature)||
    typeof msg.site!=="string"||!DKManualRules.validHost(msg.site))
   return {error:"Invalid site protection exception."};
  const key=siteFeatureConfigs[msg.feature];
  const next=data.settings[key].filter(x=>x!==msg.site);
  if(next.length===data.settings[key].length)return {error:"Site exception not found."};
  data.settings[key]=next;
  await persistSettings();refreshTabs();
  return {ok:true,sites:next.slice()};
 }
 if(msg.action==="setSiteFeaturePaused"){
  if(fromContent||!Number.isInteger(id)||id<0||
   !Object.prototype.hasOwnProperty.call(siteFeatureConfigs,msg.feature)||
   typeof msg.paused!=="boolean")
   return {error:"Invalid site protection setting."};
  let liveUrl="",site="";
  try{liveUrl=(await browser.tabs.get(id))?.url||"";site=DKSiteAllowlist.host(liveUrl);}
  catch(_){return {error:"Website tab is no longer available."};}
  if(!site||!/^https?:\/\//i.test(liveUrl)||!DKManualRules.validHost(site))
   return {error:"Only regular websites can have site protection exceptions."};
  const key=siteFeatureConfigs[msg.feature],previous=data.settings[key]||[];
  let next;
  if(msg.paused){
   if(previous.some(x=>DKRules.sub(site,x)))next=previous.slice();
   else if(previous.length>=500)return {error:"Site exception limit reached (500)."};
   else next=[...previous,site];
  }else next=previous.filter(x=>!DKRules.sub(site,x));
  data.settings[key]=next;
  await persistSettings();refreshTabs();
  return {ok:true,site,paused:next.some(x=>DKRules.sub(site,x)),sites:next.slice()};
 }
 if(msg.action==="toggleSitePopupProtection"){
  if(!h||!DKManualRules.validHost(h))return {error:"No valid website selected."};
  data.settings.popupProtectionPaused=data.settings.popupProtectionPaused.filter(x=>x!==h);
  if(msg.pause)data.settings.popupProtectionPaused.push(h);
  data.settings.popupProtectionPaused=data.settings.popupProtectionPaused.slice(-500);
  await persistSettings();refreshTabs();
  return status(id,url);
 }
 if(msg.action==="toggleMediaRecovery"){
  if(!DKVideoAssist.isStreamingHost(h))return {error:"Playback Rescue is only available on supported streaming websites."};
  data.settings.mediaRecovery=data.settings.mediaRecovery.filter(x=>x!==h);
  if(msg.enabled)data.settings.mediaRecovery.push(h);
  data.settings.mediaRecovery=data.settings.mediaRecovery.slice(-12);
  await persistSettings();return status(id,url);
 }
 if(msg.action==="toggleTabPause"){
  if(id<0)return {error:"No browser tab."};
  if(msg.paused)data.tempPaused.add(id);else data.tempPaused.delete(id);
  badge(id);refreshTabs();return status(id,url);
 }
 if(msg.action==="getAllowedSites")return DKSiteAllowlist.normalize(data.settings.paused);
 if(msg.action==="addAllowedSite"||msg.action==="removeAllowedSite"){
  const result=msg.action==="addAllowedSite"?
   DKSiteAllowlist.add(data.settings.paused,msg.site):
   DKSiteAllowlist.remove(data.settings.paused,msg.site);
  if(result.error)return result;
  data.settings.paused=result.entries;
  await persistSettings();rebuild();
  return {ok:true,sites:result.entries,unchanged:!!result.unchanged};
 }
 if(msg.action==="setSiteAllowed"||msg.action==="toggleSite"){
  if(!Number.isInteger(id)||id<0)return {error:"Choose a website tab."};
  let liveUrl,site;
  try{liveUrl=(await browser.tabs.get(id))?.url||"";site=DKSiteAllowlist.host(liveUrl);}
  catch(_){return {error:"This website tab is no longer available."};}
  if(!site||!DKManualRules.validHost(site))return {error:"Only HTTP(S) website tabs can be allowlisted."};
  const wantAllowed=msg.action==="toggleSite"?msg.disable===true:msg.allowed===true;
  const result=wantAllowed?
   DKSiteAllowlist.add(data.settings.paused,site):
   DKSiteAllowlist.resume(data.settings.paused,site);
  if(result.error)return result;
  data.settings.paused=result.entries;
  await persistSettings();rebuild();
  return {...status(id,liveUrl),ok:true,allowlistMatch:DKSiteAllowlist.match(result.entries,site)};
 }
 if(msg.action==="allowHost"){
  const rule=DKManualRules.allowHostOnSite(h,msg.host);
  if(!rule)return {error:"Invalid site or blocked-request hostname."};
  const existing=data.settings.customRules.split("\n");
  if(!existing.includes(rule))data.settings.customRules+="\n"+rule;
  await persist();rebuild();return {ok:true,rule};
 }
 if(msg.action==="revokeSiteDashboardHost"||msg.action==="clearSiteDashboardLog"){
  if(fromContent||!Number.isInteger(id)||id<0||
   !DKManualRules.validHost(msg.expectedSite))
   return {error:"Invalid site dashboard request."};
  let site="",liveURL="";
  try{
   liveURL=(await browser.tabs.get(id))?.url||"";
   site=DKSiteAllowlist.host(liveURL);
  }catch(_){return {error:"Selected website tab unavailable."};}
  if(!/^https?:\/\//i.test(liveURL)||site!==msg.expectedSite)
   return {error:"The selected tab changed websites. Refresh the dashboard."};
  if(msg.action==="clearSiteDashboardLog"){
   data.logs.delete(id);data.streamingIssues.delete(id);DKPlaybackHealth.clear(data.playbackHealth,id);return {ok:true};
  }
  if(!DKManualRules.validHost(msg.host))return {error:"Invalid request hostname."};
  const result=DKManualRules.removeSiteException(data.settings.customRules,site,msg.host);
  if(result.error)return result;
  data.settings.customRules=result.text;
  await persistSettings();rebuild();
  return {ok:true,removed:result.removed};
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
  if(typeof s.blockNotificationPrompts==="boolean")data.settings.blockNotificationPrompts=s.blockNotificationPrompts;
  if(typeof s.showDevtoolsPanel==="boolean")data.settings.showDevtoolsPanel=s.showDevtoolsPanel;
  if(typeof s.showBadge==="boolean"){
   data.settings.showBadge=s.showBadge;
   for(const tabId of data.counts.keys())badge(tabId);
  }
  if(typeof s.showContextMenu==="boolean"){
   data.settings.showContextMenu=s.showContextMenu;
   await DKContextMenu.sync(browser,data.settings.showContextMenu);
  }
  if(typeof s.autoUpdate==="boolean")data.settings.autoUpdate=s.autoUpdate;
  if(typeof s.autoYouTubeRules==="boolean")data.settings.autoYouTubeRules=s.autoYouTubeRules;
  if(typeof s.youtubeSkip==="boolean")data.settings.youtubeSkip=s.youtubeSkip;
  if(typeof s.rememberVideos==="boolean")data.settings.rememberVideos=s.rememberVideos;
  if(typeof s.strictPopupSites==="boolean"){
   data.settings.strictPopupSites=s.strictPopupSites;
   if(!s.strictPopupSites)data.popupTrapPermits.clear();
  }
  if(typeof s.adRecognition==="boolean")data.settings.adRecognition=s.adRecognition;
  if(Array.isArray(s.mediaRecovery))
   data.settings.mediaRecovery=[...new Set(s.mediaRecovery.filter(h=>typeof h==="string"&&
    DKVideoAssist.isStreamingHost(h)&&DKManualRules.validHost(h)))].slice(0,12);
  if(typeof s.cookieReject==="boolean")data.settings.cookieReject=s.cookieReject;
  if(typeof s.distractionControl==="boolean")data.settings.distractionControl=s.distractionControl;
  for(const featureKey of ["cookieRejectPaused","distractionPaused"]){
   if(Array.isArray(s[featureKey])){
    if(s[featureKey].length>500||s[featureKey].some(h=>!DKManualRules.validHost(h)))
     return {error:"Site protection exceptions require valid hostnames (up to 500)."};
    data.settings[featureKey]=[...new Set(s[featureKey])];
   }
  }
  if(typeof s.antiAdblock==="boolean")data.settings.antiAdblock=s.antiAdblock;
  if(typeof s.paywallPopups==="boolean")data.settings.paywallPopups=s.paywallPopups;
  if(Array.isArray(s.popupProtectionPaused))
   data.settings.popupProtectionPaused=[...new Set(s.popupProtectionPaused.filter(x=>DKManualRules.validHost(x)))].slice(0,500);
  if(typeof s.stripTracking==="boolean")data.settings.stripTracking=s.stripTracking;
  if(typeof s.requestLog==="boolean"){data.settings.requestLog=s.requestLog;if(!s.requestLog){data.allowedActivity.clear();data.logs.clear();data.networkIssues.clear();data.streamingIssues.clear();data.playbackHealth.clear();data.streamingAllowances.clear();data.popupHistory.clear();}}
  if(typeof s.customRules==="string"&&s.customRules.length<=1000000)data.settings.customRules=s.customRules;
  if(Array.isArray(s.paused)){
   if(s.paused.length>DKSiteAllowlist.LIMIT||
      s.paused.some(x=>!DKManualRules.validHost(x)))
    return {error:"Allowed websites require valid hostnames (maximum 500)."};
   data.settings.paused=DKSiteAllowlist.normalize(s.paused);
  }
  for(const k of Object.keys(SOURCES))if(typeof s.listEnabled?.[k]==="boolean")data.settings.listEnabled[k]=s.listEnabled[k];
  data.notificationControl=await DKNotificationProtection.sync(browser,
   data.settings.enabled&&data.settings.blockNotificationPrompts);
  await persist();rebuild();
  // Newly enabled subscriptions work immediately without waiting for tomorrow's alarm.
  const needsDownload=(data.settings.autoYouTubeRules&&!data.youtubeRules?.text)||Object.keys(SOURCES).some(k=>data.settings.listEnabled[k]&&!data.lists[k]?.text)||(data.settings.customSubscriptions||[]).some(u=>!data.customLists[u]?.text);
  if(needsDownload)updateLists().catch(console.warn);
  return {ok:true};
 }
 return {error:"Unknown action"};
});
async function boot(){
 try{
  const stored=await browser.storage.local.get(["settings","lists","customLists","listErrors","youtubeRules","youtubePrevious","youtubeHeldVersion","lastVideoDownload","requestAllowances","manualBlocks"]);
  if(videoJob.state==="idle"){
   const previous=restoreVideoJob(stored.lastVideoDownload);
   if(previous){videoJob=previous;if(previous.state==="interrupted")rememberVideoJob();}
  }
  data.settings=DKSettings.restoreSettings(stored.settings,DEFAULT,Object.keys(SOURCES));
  data.notificationControl=await DKNotificationProtection.sync(browser,
   data.settings.enabled&&data.settings.blockNotificationPrompts);
  await DKContextMenu.sync(browser,data.settings.showContextMenu);
  data.requestControls.remember=DKRequestControls.restore(stored.requestAllowances);
  data.manualBlocks=DKAllowedActivity.restore(stored.manualBlocks);
  const built=DKSettings.restoreLists(stored.lists,Object.keys(SOURCES));
  const custom=DKSettings.restoreLists(stored.customLists,data.settings.customSubscriptions,50000000);
  data.lists=built.lists;data.customLists=custom.lists;
  const errors=DKSettings.restoreErrors(stored.listErrors,[...Object.keys(SOURCES),...data.settings.customSubscriptions,"youtube"]);
  data.listErrors={...errors,...built.errors,...custom.errors};
  data.youtubeRules=DKYouTubeMaintenance.restore(stored.youtubeRules);
  data.youtubePrevious=DKYouTubeMaintenance.restore(stored.youtubePrevious);
  data.youtubeHeldVersion=Number.isSafeInteger(stored.youtubeHeldVersion)&&stored.youtubeHeldVersion>=0?stored.youtubeHeldVersion:0;
  if(!data.youtubeRules&&stored.youtubeRules)data.listErrors.youtube="Invalid cached YouTube compatibility pack ignored.";
  if(data.youtubeRules&&data.youtubeRules.version===data.youtubeHeldVersion){
   data.youtubeRules=null;data.listErrors.youtube="Rolled-back pack disabled until a newer version arrives.";
  }
  rebuild();
  const tabs=await browser.tabs.query({});
  for(const t of tabs)if(t.url){data.hosts.set(t.id,host(t.url));badge(t.id);}
  data.ready=true;
  try{syncProxyListener();}catch(error){
   console.warn("DK Live Block proxy activation failed:",error);
   data.settings.network.enabled=false;
  }
  await browser.alarms.create("refresh-rules",{periodInMinutes:1440});
  const needsDownload=(data.settings.autoYouTubeRules&&!data.youtubeRules?.text)||Object.keys(SOURCES).some(key=>data.settings.listEnabled[key]&&!data.lists[key]?.text)||
   data.settings.customSubscriptions.some(url=>!data.customLists[url]?.text);
  if(data.settings.autoUpdate&&(needsDownload||Date.now()-data.settings.lastUpdate>86400000))
   updateLists().catch(console.warn);
 }catch(e){console.error("DK Live Block startup:",e);data.ready=true;}
}
DKContextMenu.install(browser,()=>data.ready&&data.settings.showContextMenu===true,
 tab=>activeTab(tab.id,host(tab.url)));
boot();
