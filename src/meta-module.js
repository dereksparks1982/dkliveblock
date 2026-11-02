/* DK Live Block: Meta module, shared adapters with platform-specific behavior.
   Facebook reuses the proven site-scoped scanner. Other Meta surfaces remain
   observation-only until independently verified with DOM fixtures. */
(function(root){"use strict";
function create(doc,win){
 const profile=root.DKCompanyModules?.profileFor?.(win?.location?.hostname||"");
 if(profile?.company!=="meta"||win?.top&&win.top!==win)return null;
 const platform=profile.platform;
 const facebook=platform==="facebook"?root.DKFacebookAds?.create?.(doc,win):null;
 const observer=root.DKAdaptiveDispatcher?.create?.()||null;
 const intelligence=root.DKNestyIntelligence?.create?.()||null;
 if(observer){
  observer.register("meta-explicit-sponsored",ctx=>{
   const el=ctx?.element;
   const label=String(el?.getAttribute?.("aria-label")||"").trim().toLowerCase();
   return {matched:label==="sponsored"||label==="sponsored content",
    evidence:["sponsor_label","aria_label"]};
  });
 }
 function review(element){return observer?.inspect({element,platform})||[];}
 return Object.freeze({company:"meta",platform,scan:()=>facebook?.scan()||0,
  scanInserted:records=>facebook?.scanInserted?.(records)||0,
  restore:()=>facebook?.restore(),setExceptions:r=>facebook?.setExceptions(r),
  observeMutation:r=>facebook?.observeMutation(r)||false,review,
  investigateDelivery:signals=>root.DKMetaDeliveryCatalog?.inspect?.(signals)||[],
  inspectSignals:signals=>intelligence?.inspect?.(win.location.hostname,signals)||null,
  intelligenceProfile:()=>intelligence?.snapshot?.(win.location.hostname,false)||null,
  deliveryMethods:()=>root.DKMetaDeliveryCatalog?.entries||[],
  diagnostics:()=>facebook?.diagnostics?.()||Object.freeze({platform,hidden:0,mode:"observation-only"}),
  get hiddenCount(){return facebook?.hiddenCount||0;}});
}
const API=Object.freeze({create});
root.DKMetaModule=API;
if(typeof module!=="undefined")module.exports=API;
})(typeof globalThis!=="undefined"?globalThis:this);
