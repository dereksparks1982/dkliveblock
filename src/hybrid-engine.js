/* DK Live Block hybrid engine with locally embedded Ghostery MPL-2.0. */
(function(root){"use strict";
function create(text,vendorApi=root.DKGhosteryVendor){
 const native=new DKFilter.FilterEngine(text);
 const result={
  native,backend:"native",diagnostic:"",vendor:null,
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
   // Preserve all existing user/site exception behavior.
   // Preserve native blocks, site/page allows and generic-block exclusions.
   // Avoid expensive duplicate vendor matching on already decided requests.
   if(own.block||own.rule?.exception||policy?.document||policy?.genericblock||!this.vendor)return own;
   // Only DK's explicit $popup filters are allowed to close newly opened tabs.
   // Ordinary network matches from Ghostery do not establish popup intent.
   if(type==="popup"||type==="main_frame"||type==="document")return own;
   if(typeof url!=="string"||url.length>16384||!/^https?:\/\//i.test(url))return own;
   try{
    const sourceUrl=/^https?:\/\//i.test(origin||"")?origin:
      DKRules.validDomains(origin||"")&&!(origin||"").includes("|")?"https://"+origin+"/":"";
    const request=vendorApi.Request.fromRawDetails({url,type:type||"other",sourceUrl,method});
    const verdict=this.vendor.match(request);
    if(verdict?.exception)return own; // Never override DK rules with third-party allows.
    // Do not apply remote scriptlets, replacements or URL rewrites.
    if(verdict?.match===true&&!verdict.redirect&&!verdict.rewrite)
     return {block:true,rule:{p:"[Ghostery network filter]"}};
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
root.DKHybridEngine={create,get available(){return !!(root.DKGhosteryVendor?.FiltersEngine?.parse);}};
if(typeof module!=="undefined")module.exports=root.DKHybridEngine;
})(typeof globalThis!=="undefined"?globalThis:this);
