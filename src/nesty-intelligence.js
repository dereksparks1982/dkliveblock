/* Shared Nesty evidence coordinator. This module NEVER hides content,
   cancels requests, installs rules, calls the network, or sends telemetry.
   Platform modules keep all blocking decisions in existing tested engines. */
(function(root){"use strict";
const TOKEN=/^[a-z][a-z0-9_]{2,47}$/,MAX_SIGNALS=40,MAX_PROVIDERS=60;
// Only known detector vocabulary enters the shared coordinator. A plausible
// token such as "private_message_123" is NOT technical evidence.
const BASE_SIGNALS=Object.freeze(["sponsor_label","post_boundary",
 "ad_break_metadata","player_ad_slot","unwanted_navigation","ad_destination",
 "ad_slot","sponsor_menu","ad_explainer","rail_ad_link",
 "author_ad_byline","protected_context","normal_post","author_name"]);
function vocabulary(catalog){
 const allowed=new Set(BASE_SIGNALS);
 for(const row of Array.isArray(catalog?.entries)?catalog.entries:[]){
  if(TOKEN.test(row?.signal||""))allowed.add(row.signal);
  if(TOKEN.test(row?.context||""))allowed.add(row.context);
 }
 return allowed;
}
function filterSignals(value,known){
 if(!Array.isArray(value))return Object.freeze([]);
 return Object.freeze([...new Set(value.filter(v=>typeof v==="string"&&
  TOKEN.test(v)&&known.has(v)).slice(0,MAX_SIGNALS))]);
}
function signalsOf(value,catalog){
 return filterSignals(value,vocabulary(catalog||root.DKMetaDeliveryCatalog));
}
function create(deps){
 const env=deps||root,companies=env.DKCompanyModules,team=env.DKNestyTeam,
  catalog=env.DKMetaDeliveryCatalog,dispatcher=env.DKAdaptiveDispatcher,
  providers=env.DKProviderIntelligence,model=env.DKAdaptiveModel;
 const providerMaps=new Map(),acceptedSignals=vocabulary(catalog);
 const reviewDispatcher=dispatcher?.create?.()||null;
 if(reviewDispatcher){
  reviewDispatcher.register("explicit-sponsored",ctx=>({
   matched:ctx.signals.includes("sponsor_label")&&ctx.signals.includes("post_boundary"),
   evidence:["sponsor_label","post_boundary"]}));
  reviewDispatcher.register("bounded-video-break",ctx=>({
   matched:ctx.platform==="youtube"&&ctx.signals.includes("ad_break_metadata")&&
    ctx.signals.includes("player_ad_slot"),
   evidence:["ad_break_metadata","player_ad_slot"]}));
  reviewDispatcher.register("unwanted-ad-navigation",ctx=>({
   matched:ctx.signals.includes("unwanted_navigation")&&ctx.signals.includes("ad_destination"),
   evidence:["unwanted_navigation","ad_destination"]}));
 }
 function route(hostname){
  const found=companies?.profileFor?.(hostname);
  if(!found)return null;
  const platform=found.platform,company=found.company;
  const roles=company==="meta"?["meta","popup","cookie"]:["popup","cookie"];
  const ids=roles.map(k=>team?.byKey?.(k)?.id).filter(Boolean);
  return Object.freeze({company,platform,mode:platform==="facebook"?"existing-facebook-dom":
   platform==="youtube"?"existing-youtube-engines":"observe-only",
   specialists:Object.freeze(ids)});
 }
 function inspect(hostname,input){
  const target=route(hostname),signals=filterSignals(input,acceptedSignals);
  if(!target)return Object.freeze({recognized:false,action:"none",
   signals:Object.freeze([]),matches:Object.freeze([]),reviews:Object.freeze([]),
   ranking:null});
  // The delivery catalog has Meta-specific evidence semantics; never
  // automatically carry a Facebook strategy into another platform.
  // Explicitly protected contexts cannot generate a candidate review, even
  // when an ad-looking token also happens to be present.
  const protectedContext=signals.includes("protected_context");
  const matches=!protectedContext&&target.company==="meta"&&catalog?.inspect?
   catalog.inspect(signals).map(m=>Object.freeze({...m,
    action:target.platform==="facebook"?m.action:"observe"})):[];
  const reviews=!protectedContext&&reviewDispatcher?
   reviewDispatcher.inspect({signals,platform:target.platform}).map(m=>Object.freeze({
    ...m,action:target.mode==="observe-only"?"observe":"review"})):[];
  // A synthetic score is a review priority, not probability, permission,
  // training on visitors, or authorization to alter ordinary content.
  const ranking=model?.inspectAdCandidate&&signals.length?model.inspectAdCandidate({
   knownSlot:signals.includes("ad_slot"),
   sponsoredMenu:signals.includes("sponsor_menu"),
   adExplainer:signals.includes("ad_explainer"),
   railAdLink:signals.includes("rail_ad_link"),
   authorAdByline:signals.includes("author_ad_byline"),
   protectedContext:signals.includes("protected_context")
  }):null;
  return Object.freeze({recognized:true,company:target.company,platform:target.platform,
   specialistIds:target.specialists,mode:target.mode,action:"review-only",
   signals,matches:Object.freeze(matches),reviews:Object.freeze(reviews),ranking});
 }
 function observeProvider(site,destination,status,loggingEnabled){
  const target=route(site),valid=providers?.validHost;
  if(!target||loggingEnabled!==true||!valid?.(destination)||
    !["allowed","blocked"].includes(status))return null;
  const normalized=destination.toLowerCase();
  if(companies?.companyFor?.(normalized)===target.company)return null;
  // One bounded aggregate per platform. Never store full URL, request IDs,
  // query strings, user posts, tokens, cookies or sensitive request bodies.
  let db=providerMaps.get(target.platform);
  if(!db){db=providers.create();providerMaps.set(target.platform,db);}
  return db.observe({host:normalized,type:"unknown",
   evidence:[status==="blocked"?"request_blocked":"request_allowed"]});
 }
 function snapshot(site,loggingEnabled){
  const target=route(site);
  if(!target)return null;
  const observed=loggingEnabled===true?
   (providerMaps.get(target.platform)?.list()||[]).slice(0,MAX_PROVIDERS):[];
  return Object.freeze({...target,networkMode:"unknown-until-capability-checked",
   providers:Object.freeze(observed)});
 }
 function clear(site){
  const target=route(site);
  if(!target)return false;
  providerMaps.get(target.platform)?.clear();
  return true;
 }
 return Object.freeze({route,inspect,observeProvider,snapshot,clear});
}
const API=Object.freeze({create,signalsOf});
root.DKNestyIntelligence=API;
if(typeof module!=="undefined")module.exports=API;
})(typeof globalThis!=="undefined"?globalThis:this);
