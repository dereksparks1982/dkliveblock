/* DK Live Block hybrid engine with locally embedded Ghostery MPL-2.0. */
(function(root){"use strict";
// Firefox calls responsive images "imageset" and navigator.sendBeacon()
 // "beacon"; the upstream Ghostery matcher uses image/ping filter families.
 // Normalize only these confirmed aliases. DK's native engine still sees
 // the original type and remains the source of truth for scoped exceptions.
function ghosteryType(type){
 return type==="imageset"?"image":type==="beacon"?"ping":type;
}
function create(text,vendorApi=root.DKGhosteryVendor,manualText=""){
 const native=new DKFilter.FilterEngine(text);
 // User-authored rules are evaluated separately, so their explicit decisions
 // cannot accidentally be downgraded by subscription-list exceptions.
 const manual=typeof manualText==="string"&&manualText.trim()?
  new DKFilter.FilterEngine(manualText):null;
 const result={
  native,manual,backend:"native",diagnostic:"",vendor:null,
  get networkCount(){return native.networkCount;},
  get cosmetic(){return native.cosmetic;},
  get unsupportedCount(){return native.unsupportedCount;},
  getPagePolicy:url=>native.getPagePolicy(url),
  getSelectors:(host,policy)=>native.getSelectors(host,policy),
  getProcedural:(host,policy)=>native.getProcedural(host,policy),
  cleanNavigation:url=>native.cleanNavigation(url),
  shouldBlock(url,type,origin,policy,method){return this.checkRequest(url,type,origin,policy,method).block;},
  checkRequest(url,type,origin,policy={},method=""){
   const own=native.checkRequest(url,type,origin,policy,method);
   // A page-level $document exception is a deliberate site-policy allowance.
   // DK's native popup rules must remain the only list-based popup closer.
   if(policy?.document||policy?.genericblock||
      type==="popup"||type==="main_frame"||type==="document")return own;
   // Manual choices outrank subscriptions, whether block or exception.
   // Other explicit site/tab controls are applied in background.js.
   if(manual){
    const selected=manual.checkRequest(url,type,origin,policy,method);
    if(selected.rule)return selected;
   }
   // Keep important native blocks and explicit page policy. A native
   // subscription exception is not final: Ghostery may understand a more
   // specific $important rule (e.g. entity domains) that native dropped.
   if(own.rule?.important||!this.vendor)return own;
   if(typeof url!=="string"||url.length>16384||!/^https?:\/\//i.test(url))return own;
   try{
    const sourceUrl=/^https?:\/\//i.test(origin||"")?origin:
      DKRules.validDomains(origin||"")&&!(origin||"").includes("|")?"https://"+origin+"/":"";
    const request=vendorApi.Request.fromRawDetails({url,type:ghosteryType(type||"other"),sourceUrl,method});
    const verdict=this.vendor.match(request);
    // CRITICAL: a subscribed exception recognized by Ghostery must rescue
    // a plain native block that DK's partial parser cannot correctly exempt.
    if(verdict?.exception)
     return {block:false,rule:{p:"[Ghostery network exception]",exception:true}};
    if(own.rule?.exception){
     // Only a real Ghostery $important block outranks a less-specific
     // native exception. Ordinary vendor blocks still respect the exception.
     if(verdict?.match===true&&!verdict.redirect&&!verdict.rewrite&&
        verdict.filter?.isImportant?.()===true)
      return {block:true,rule:{p:"[Ghostery important network filter]",
       important:true,source:"ghostery-important"}};
     return own;
    }
    // Permit only two audited extension-owned inert replacements.
    // Ghostery's returned dataUrl/body must NEVER become a redirect target,
    // nor may an arbitrary subscribed URL or executable resource be loaded.
    if(verdict?.match===true&&verdict.redirect){
     const filter=verdict.filter;
     const resource=typeof filter?.getRedirect==="function"&&
      filter.isRedirect?.()===true?filter.getRedirect():"";
     const allowed=(resource==="noop.js"&&type==="script")||
      (resource==="empty.css"&&type==="stylesheet");
     if(allowed&&!verdict.rewrite){
      return {block:true,rule:{
       p:"[Ghostery vetted local redirect]",redirect:resource,
       special:"",exception:false,source:"ghostery-safe-redirect"
      }};
     }
     // Unknown redirection must not be silently converted into a block,
     // remote load, or executable script.
     return own;
    }
    if(verdict?.match===true&&!verdict.redirect&&!verdict.rewrite)
     return own.block?own:{block:true,rule:{p:"[Ghostery network filter]"}};
   }catch(_){
    this.diagnostic="Ghostery matching error; native engine used.";
   }
   return own;
  }
 };
 try{
  if(vendorApi?.FiltersEngine?.parse&&vendorApi?.Request?.fromRawDetails){
   result.vendor=vendorApi.FiltersEngine.parse(text);
   if(result.vendor?.match)result.backend="hybrid";
   else result.vendor=null;
  }
 }catch(_){result.vendor=null;result.diagnostic="Ghostery parse error; native engine used.";}
 return result;
}
root.DKHybridEngine={create,ghosteryType,get available(){return !!(root.DKGhosteryVendor?.FiltersEngine?.parse);}};
if(typeof module!=="undefined")module.exports=root.DKHybridEngine;
})(typeof globalThis!=="undefined"?globalThis:this);
