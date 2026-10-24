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
const DEFAULT={enabled:true,paused:[],listEnabled:{easylist:true,easyprivacy:true,cookies:false,annoyances:false,social:false},autoUpdate:true,youtubeSkip:true,cookieReject:false,stripTracking:true,customRules:"",customSubscriptions:[],blockedTotal:0,lastUpdate:0};
const data={settings:{...DEFAULT},lists:{},customLists:{},engine:new DKFilter.FilterEngine(SEED),hosts:new Map(),counts:new Map(),logs:new Map(),ready:false,updateJob:null,saveTimer:null};
function host(url){return DKRules.host(url);}
function enabled(h){return data.settings.enabled&&!data.settings.paused.some(x=>DKRules.sub(h,x));}
function assemble(){const all=[SEED];for(const k of Object.keys(SOURCES)){if(data.settings.listEnabled[k]&&data.lists[k]?.text)all.push(data.lists[k].text);}for(const u of data.settings.customSubscriptions||[])if(data.customLists[u]?.text)all.push(data.customLists[u].text);if(data.settings.customRules)all.push(data.settings.customRules);return all.join("\n");}
async function persist(){await browser.storage.local.set({settings:data.settings,lists:data.lists,customLists:data.customLists});}
function refreshTabs(){browser.tabs.query({}).then(t=>Promise.all(t.map(tab=>browser.tabs.sendMessage(tab.id,{action:"refresh"}).catch(()=>{})))).catch(()=>{});}
function rebuild(){data.engine=new DKFilter.FilterEngine(assemble());for(const id of data.counts.keys())badge(id);refreshTabs();}
function badge(id){const n=data.counts.get(id)||0,h=data.hosts.get(id)||"";browser.browserAction.setBadgeText({tabId:id,text:enabled(h)&&n?String(Math.min(n,9999)):""}).catch(()=>{});}
function scheduleSave(){if(data.saveTimer)return;data.saveTimer=setTimeout(()=>{data.saveTimer=null;persist().catch(console.warn);},60000);}
function status(id,url){const h=data.hosts.get(id)||host(url);return {ready:data.ready,host:h,enabled:data.settings.enabled,siteActive:enabled(h),tabBlocked:data.counts.get(id)||0,totalBlocked:data.settings.blockedTotal,lastUpdate:data.settings.lastUpdate,networkRules:data.engine.networkCount,cosmeticRules:data.engine.cosmetic.length,unsupportedRules:data.engine.unsupportedCount,settings:data.settings,listState:{...Object.fromEntries(Object.entries(SOURCES).map(([k,s])=>[k,{name:s.name,updated:data.lists[k]?.updated||0}])),...Object.fromEntries((data.settings.customSubscriptions||[]).map((u,i)=>["custom"+i,{name:"Custom: "+host(u),updated:data.customLists[u]?.updated||0}]))}};}
async function downloadList(url){
 const stop=new AbortController(),timer=setTimeout(()=>stop.abort(),20000);
 try{const res=await fetch(url,{signal:stop.signal,cache:"no-cache",credentials:"omit"});if(!res.ok)throw Error("HTTP "+res.status);
  const size=Number(res.headers.get("content-length")||0);if(size>20000000)throw Error("List too large");
  const text=await res.text();if(text.length<300||text.length>20000000||!/\[Adblock Plus|! Title:|! Homepage:/i.test(text.slice(0,4000)))throw Error("Invalid filter list");
  return text;
 }finally{clearTimeout(timer);}
}
function updateLists(){if(data.updateJob)return data.updateJob;
 data.updateJob=(async()=>{let updated=0,errors=[];
  for(const [key,entry] of Object.entries(SOURCES)){if(!data.settings.listEnabled[key])continue;
   try{const text=await downloadList(entry.url);data.lists[key]={text,updated:Date.now()};updated++;}catch(e){errors.push(entry.name+": "+e.message);}
  }
  for(const u of data.settings.customSubscriptions||[]){
   try{const text=await downloadList(u);data.customLists[u]={text,updated:Date.now()};updated++;}
   catch(e){errors.push("Custom "+host(u)+": "+e.message);}
  }
  if(updated){data.settings.lastUpdate=Date.now();rebuild();await persist();}
  return {updated,errors};
 })().finally(()=>{data.updateJob=null;});return data.updateJob;
}
function recordBlock(tabId,url,type,rule){
 if(tabId<0)return;
 data.counts.set(tabId,(data.counts.get(tabId)||0)+1);
 data.settings.blockedTotal++;scheduleSave();badge(tabId);
 const rows=data.logs.get(tabId)||[];
 rows.push({host:host(url),type,rule:(rule?.p||"").slice(0,140),when:Date.now()});
 if(rows.length>250)rows.shift();data.logs.set(tabId,rows);
}
browser.webRequest.onBeforeRequest.addListener(d=>{
 if(!data.ready||!data.settings.enabled||!/^https?:/i.test(d.url))return {};
 if(d.type==="main_frame"){
  if(!data.settings.stripTracking||!enabled(host(d.url)))return {};
  const cleaned=DKPrivacy.stripTrackingParameters(d.url);
  return cleaned?{redirectUrl:cleaned}:{};
 }
 const top=data.hosts.get(d.tabId)||host(d.documentUrl||d.originUrl||d.url);
 if(!enabled(top))return {};
 const doc=d.documentUrl||d.originUrl||"",contextHost=host(doc)||top;
 const result=data.engine.checkRequest(d.url,d.type,contextHost,data.engine.getPagePolicy(doc));
 if(!result.block)return {};
 recordBlock(d.tabId,d.url,d.type,result.rule);
 return {cancel:true};
},{urls:["<all_urls>"]},["blocking"]);
// Only explicit $popup filters can close a newly opened advertising tab.
browser.webNavigation?.onCreatedNavigationTarget?.addListener(async event=>{
 if(!data.ready||!data.settings.enabled||event.tabId<0||event.sourceTabId<0||!/^https?:/i.test(event.url))return;
 try{
  const origin=await browser.tabs.get(event.sourceTabId);
  const originUrl=origin?.url||"",originHost=host(originUrl);
  if(!originHost||!enabled(originHost))return;
  const verdict=data.engine.checkRequest(event.url,"popup",originHost,data.engine.getPagePolicy(originUrl));
  if(!verdict.block)return;
  await browser.tabs.remove(event.tabId);
  recordBlock(event.sourceTabId,event.url,"popup",verdict.rule);
 }catch(error){console.warn("DK Live Block popup check:",error);}
});
browser.tabs.onUpdated.addListener((id,info,tab)=>{
 if(info.url||info.status==="loading"){data.hosts.set(id,host(info.url||tab.url));data.counts.set(id,0);data.logs.delete(id);badge(id);}
});
browser.tabs.onRemoved.addListener(id=>{data.hosts.delete(id);data.counts.delete(id);data.logs.delete(id);});
browser.alarms.onAlarm.addListener(a=>{if(a.name==="refresh-rules"&&data.settings.autoUpdate)updateLists().catch(console.warn);});
browser.runtime.onMessage.addListener(async(msg,sender={})=>{
 if(!msg||typeof msg.action!=="string")return {};
 const id=Number.isInteger(msg.tabId)?msg.tabId:sender.tab?.id||-1,url=msg.url||sender.url||"",h=host(url);
 if(msg.action==="status")return status(id,url);
 if(msg.action==="getSettings")return {settings:data.settings,listState:status(-1,"").listState};
 if(msg.action==="getLog")return (data.logs.get(id)||[]).slice().reverse();
 if(msg.action==="updateLists")return updateLists();
 if(msg.action==="getStyle"){const policy=data.engine.getPagePolicy(url),top=data.hosts.get(sender.tab?.id)||h,active=enabled(h)&&enabled(top)&&!policy.document;return {active,youtubeSkip:data.settings.youtubeSkip,cookieReject:data.settings.cookieReject,css:active?data.engine.getSelectors(h,policy).slice(0,15000).map(s=>s+" {display:none!important;}").join("\n"):"",procedural:active?data.engine.getProcedural(h,policy).slice(0,300):[]};}
 if(msg.action==="setGlobal"){data.settings.enabled=!!msg.enabled;await persist();rebuild();return status(id,url);}
 if(msg.action==="toggleSite"){if(!h)return {error:"No website"};data.settings.paused=data.settings.paused.filter(x=>x!==h);if(msg.disable)data.settings.paused.push(h);await persist();rebuild();badge(id);return status(id,url);}
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
   for(const u of Object.keys(data.customLists))if(!validated.urls.includes(u))delete data.customLists[u];
  }
  if(typeof s.autoUpdate==="boolean")data.settings.autoUpdate=s.autoUpdate;
  if(typeof s.youtubeSkip==="boolean")data.settings.youtubeSkip=s.youtubeSkip;
  if(typeof s.cookieReject==="boolean")data.settings.cookieReject=s.cookieReject;
  if(typeof s.stripTracking==="boolean")data.settings.stripTracking=s.stripTracking;
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
 try{const stored=await browser.storage.local.get(["settings","lists","customLists"]);data.settings={...DEFAULT,...stored.settings,listEnabled:{...DEFAULT.listEnabled,...stored.settings?.listEnabled},paused:Array.isArray(stored.settings?.paused)?stored.settings.paused:[]};data.lists=stored.lists||{};data.customLists=stored.customLists||{};
  const validation=DKSubscriptions.validate(data.settings.customSubscriptions||[]);
  data.settings.customSubscriptions=validation.urls||[];
  for(const u of Object.keys(data.customLists))if(!data.settings.customSubscriptions.includes(u))delete data.customLists[u];
  rebuild();
  const tabs=await browser.tabs.query({});for(const t of tabs)if(t.url)data.hosts.set(t.id,host(t.url));
  data.ready=true;await browser.alarms.create("refresh-rules",{periodInMinutes:1440});
  if(data.settings.autoUpdate&&Date.now()-data.settings.lastUpdate>86400000)updateLists().catch(console.warn);
 }catch(e){console.error("DK Live Block startup:",e);data.ready=true;}
}
boot();
