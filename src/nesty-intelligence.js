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

// Read-only evidence-to-strategy handoff. Reviewed strategies are NOT filters.
// Require independent browser verification before any existing engine is touched.
const MAX_PLANS=6;
// Fixed metadata from an existing vetted Facebook hide, never site-supplied text.
const DOM_EVIDENCE=Object.freeze({
 feed:Object.freeze({strategy:"facebook-sponsored-post",signals:Object.freeze(["sponsor_label","post_boundary"])}),
 menu:Object.freeze({strategy:"facebook-sponsored-post",signals:Object.freeze(["sponsor_label","post_boundary"])}),
 rail:Object.freeze({strategy:"facebook-sponsored-rail",signals:Object.freeze(["sponsor_label","rail_section"])}),
 marketplace:Object.freeze({strategy:"facebook-promoted-product",signals:Object.freeze(["promoted_badge","product_card"])})
});
const MAX_DOM_COUNT=10000;
function planReviews(target,matches,reviews){
 const proposals=[];
 function add(id,owner,evidence,stage){
  if(proposals.length>=MAX_PLANS)return;
  proposals.push(Object.freeze({id,owner,platform:target.platform,
   evidence:Object.freeze([...evidence]),stage:stage||"browser-verification-required",
   enabled:false,executable:false}));
 }
 const hasReview=id=>reviews.some(row=>row.id===id);
 const hasCatalog=id=>matches.some(row=>row.id===id);
 // Shared corporate ownership never transfers a Facebook strategy
 // into Instagram, Threads, WhatsApp or another company.
 if(target.platform==="facebook"){
  if(hasReview("explicit-sponsored"))
   add("facebook-sponsored-post","nesty_meta_ad_scout",
    ["sponsor_label","post_boundary"]);
  if(hasCatalog("right-rail"))
   add("facebook-sponsored-rail","nesty_meta_ad_scout",
    ["sponsor_label","rail_section"]);
  // Response editing is experimental and remains disabled by default.
  if(hasCatalog("graphql-sponsored"))
   add("facebook-graphql-response","nesty_meta_ad_scout",
    ["sponsored_data","response_schema"],"disabled-experimental");
 }
 if(target.platform==="youtube"&&hasReview("bounded-video-break"))
  add("youtube-ad-break","existing-youtube-engines",
   ["ad_break_metadata","player_ad_slot"]);
 if(hasReview("unwanted-ad-navigation")&&target.specialists.includes("nesty_popup_guard"))
  add("popup-source-navigation","nesty_popup_guard",
   ["unwanted_navigation","ad_destination"]);
 return Object.freeze(proposals);
}
function create(deps){
 const env=deps||root,companies=env.DKCompanyModules,team=env.DKNestyTeam,
  catalog=env.DKMetaDeliveryCatalog,dispatcher=env.DKAdaptiveDispatcher,
  providers=env.DKProviderIntelligence,model=env.DKAdaptiveModel;
 const providerMaps=new Map(),domEvents=new Map(),acceptedSignals=vocabulary(catalog);
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
   strategies:Object.freeze([]),ranking:null});
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
  const strategies=protectedContext?Object.freeze([]):planReviews(target,matches,reviews);
  return Object.freeze({recognized:true,company:target.company,platform:target.platform,
   specialistIds:target.specialists,mode:target.mode,action:"review-only",
   signals,matches:Object.freeze(matches),reviews:Object.freeze(reviews),strategies,ranking});
 }
 // Only the trusted in-extension Facebook scanner should invoke this function.
 function observeDecision(site,kind){
  const target=route(site);
  if(target?.platform!=="facebook"||!Object.prototype.hasOwnProperty.call(DOM_EVIDENCE,kind))return null;
  let counts=domEvents.get(target.platform);
  if(!counts){counts=new Map();domEvents.set(target.platform,counts);}
  const count=Math.min(MAX_DOM_COUNT,(counts.get(kind)||0)+1);
  counts.set(kind,count);return Object.freeze({kind,count});
 }
 function localEvidence(site){
  const target=route(site);
  const counts=target?.platform==="facebook"?domEvents.get(target.platform):null;
  return Object.freeze([...counts||[]].map(([kind,count])=>Object.freeze({
   kind,count,strategy:DOM_EVIDENCE[kind].strategy,owner:"nesty_meta_ad_scout",
   signals:DOM_EVIDENCE[kind].signals,source:"confirmed-dom-hide",action:"review-only"
  })));
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
  const dom=localEvidence(site);
  return Object.freeze({...target,networkMode:"unknown-until-capability-checked",
   integration:Object.freeze({status:"review-only",selfLearning:false,
    automaticRules:false,browserVerificationRequired:true}),
   providers:Object.freeze(observed),localEvidence:dom});
 }
 function clear(site){
  const target=route(site);
  if(!target)return false;
  providerMaps.get(target.platform)?.clear();
  domEvents.get(target.platform)?.clear();
  return true;
 }
 return Object.freeze({route,inspect,observeDecision,observeProvider,snapshot,clear});
}
const API=Object.freeze({create,signalsOf});
root.DKNestyIntelligence=API;
if(typeof module!=="undefined")module.exports=API;
})(typeof globalThis!=="undefined"?globalThis:this);
