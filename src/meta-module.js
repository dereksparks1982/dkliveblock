/* DK Live Block: Meta module, shared adapters with platform-specific behavior.
   Facebook reuses the proven site-scoped scanner. Other Meta surfaces remain
   observation-only until independently verified with DOM fixtures. */
(function(root){"use strict";
// Facebook React can send hundreds of mutations in one callback. Sampling
// only the beginning delays recognition of a sponsored badge added near the
// end. Inspect the head, a deterministic spread through the middle, and the
// tail under the SAME forty-record budget. Preserve chronological order.
function sampleMutations(records,max=40){
 if(!Array.isArray(records)||!Number.isInteger(max)||max<8||max>64)return [];
 if(records.length<=max)return records.slice();
 const head=Math.floor(max*2/5),tail=head,middle=max-head-tail;
 const result=records.slice(0,head),span=records.length-head-tail;
 for(let i=0;i<middle;i++)
  result.push(records[head+Math.floor((i+.5)*span/middle)]);
 return result.concat(records.slice(records.length-tail));
}

function create(doc,win){
 const profile=root.DKCompanyModules?.profileFor?.(win?.location?.hostname||"");
 if(profile?.company!=="meta"||win?.top&&win.top!==win)return null;
 const platform=profile.platform;
 const intelligence=root.DKNestyIntelligence?.create?.()||null;
 // A missing full engine must be visible as a failure, never silently
 // replaced by the old partial scanner. That regressed Facebook parity.
 const facebook=platform==="facebook"?(root.DKFacebookFullCore?.create?.(doc,win)||null):null;
 // An older, independently vetted Facebook scanner stays dormant until the
 // Nesty supervisor sees repeated full-engine misses. A missing full engine
 // remains an explicit failure, never silent replacement.
 const supervisor=facebook?root.DKMetaStrategyNesty?.create?.()||null:null;
 let legacy=null,exceptions=[],fallbackTimer=null;
 function stopFallback(){
  if(fallbackTimer!==null){
   (win?.clearTimeout||clearTimeout)(fallbackTimer);fallbackTimer=null;
  }
  legacy?.restore?.();
 }
 function updateSupervisor(signal=false){
  if(!supervisor)return false;
  const was=supervisor.snapshot().active;
  const next=supervisor.update(facebook?.diagnostics?.(),signal);
  if(was&&!next.active)stopFallback();
  if(next.changed&&next.active){
   // Keep the old implementation available for site reversions without
   // burdening ordinary Facebook mutations with two parallel scanners.
   if(!legacy)legacy=root.DKFacebookAds?.create?.(doc,win,60)||null;
   legacy?.setExceptions?.(exceptions);
   if(!legacy){supervisor.reset();return false;}
   if(fallbackTimer!==null)(win?.clearTimeout||clearTimeout)(fallbackTimer);
   fallbackTimer=(win?.setTimeout||setTimeout)(()=>{
    fallbackTimer=null;updateSupervisor(false);
   },root.DKMetaStrategyNesty.ACTIVE_MS+100);
  }
  return supervisor.snapshot().active&&!!legacy;
 }
 const observer=root.DKAdaptiveDispatcher?.create?.()||null;
 if(observer){
  observer.register("meta-explicit-sponsored",ctx=>{
   const el=ctx?.element;
   const label=String(el?.getAttribute?.("aria-label")||"").trim().toLowerCase();
   return {matched:label==="sponsored"||label==="sponsored content"||
     label==="реклама"||label==="спонсировано",
    evidence:["sponsor_label","aria_label"]};
  });
 }
 function review(element){return observer?.inspect({element,platform})||[];}
 function scan(){
  const found=facebook?.scan?.()||0;
  return found+(updateSupervisor()?legacy?.scan?.()||0:0);
 }
 function setEnabled(enabled){
  facebook?.setEnabled?.(enabled);
  if(enabled!==true){supervisor?.reset();stopFallback();}
 }
 function setExceptions(r){
  exceptions=Array.isArray(r)?r.slice(0,120):[];
  facebook?.setExceptions?.(exceptions);legacy?.setExceptions?.(exceptions);
 }
 function restore(){supervisor?.reset();stopFallback();facebook?.restore?.();}
 function observeMutation(r){
  const full=facebook?.observeMutation?.(r)===true;
  const exact=root.DKMetaStrategyNesty?.explicitLabelMutation?.(r)===true;
  updateSupervisor(exact);
  return full||exact;
 }
 return Object.freeze({company:"meta",platform,scan,setEnabled,
  scanInserted:records=>{
   const count=facebook?.scanInserted?.(records)||0;
   return count+(updateSupervisor()?legacy?.scanInserted?.(records)||0:0);
  },
  scanVisible:()=>facebook?.scanVisible?.()|| (updateSupervisor()?legacy?.scanVisible?.()||0:0),
  restore,setExceptions,observeMutation,review,
  investigateDelivery:signals=>root.DKMetaDeliveryCatalog?.inspect?.(signals)||[],
  inspectSignals:signals=>intelligence?.inspect?.(win.location.hostname,signals)||null,
  intelligenceProfile:()=>intelligence?.snapshot?.(win.location.hostname,false)||null,
  deliveryMethods:()=>root.DKMetaDeliveryCatalog?.entries||[],
  diagnostics:()=>facebook?Object.freeze({...facebook.diagnostics(),
   nestyFallback:supervisor?.snapshot?.()||null,
   legacyHidden:legacy?.hiddenCount||0}):Object.freeze({
   platform,hidden:0,coreFull:0,coreMissing:platform==="facebook"?1:0,
   mode:platform==="facebook"?"full-facebook-engine-unavailable":"observation-only"}),
  get hiddenCount(){return (facebook?.hiddenCount||0)+(legacy?.hiddenCount||0);}});
}
const API=Object.freeze({create,sampleMutations});
root.DKMetaModule=API;
if(typeof module!=="undefined")module.exports=API;
})(typeof globalThis!=="undefined"?globalThis:this);
