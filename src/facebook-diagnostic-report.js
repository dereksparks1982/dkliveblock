/* DK Live Block Build 305: fixed, local-only Facebook scanner + GraphQL diagnostics.
   This is observation only; browser network and page blocking decisions are unchanged. */
(function(root){"use strict";
const DETECTOR=Object.freeze(["hidden","cachedLabels","limit","menuCursor","exceptions","scans","lastScanAt","lastHidden","lastFeedCards","lastRailSignals","lastRailUnresolved","lastMenuSignals","lastMenuUnresolved","lastBylineSignals","lastBylineUnresolved","recycledRestored","rechecks","fastScans","fastHidden"]);
const GRAPHQL=Object.freeze(["attached","modified","removed","unchanged","errors","oversized","timeout","skipped"]);
function bounded(value,max=1000000){return Number.isSafeInteger(value)&&value>=0&&value<=max?value:null;}
function counts(input,allowed){
 const out={};if(!input||typeof input!=="object"||Array.isArray(input))return out;
 for(const key of allowed){const value=bounded(input[key],key==="lastScanAt"?1000000000000000:1000000);if(value!==null)out[key]=value;}
 return Object.freeze(out);
}
function graphql(reply){
 if(!reply||reply.ok!==true)return Object.freeze({available:false});
 return Object.freeze({available:true,enabled:reply.enabled===true,siteActive:reply.siteActive===true,
  supported:reply.supported===true,counters:counts(reply.stats,GRAPHQL)});
}
function build(detector,graphqlReply){
 if(!detector||detector.ok!==true)return null;
 const d=detector.detector&&typeof detector.detector==="object"?
  Object.freeze({platform:"facebook",...counts(detector.detector,DETECTOR)}):null;
 return Object.freeze({
  schema:2,kind:"dk-facebook-aggregate-diagnostics",
  active:detector.active===true,adRecognition:detector.adRecognition===true,
  picking:detector.picking===true,adapterLoaded:detector.adapterLoaded===true,
  lastScanAt:bounded(detector.lastScanAt,1000000000000000)||0,
  detector:d,graphql:graphql(graphqlReply),
  interpretation:"Permitted Facebook requests and zero network blocks cannot establish whether sponsored content was hidden or GraphQL advertising records were removed."
 });
}
const API=Object.freeze({DETECTOR,GRAPHQL,bounded,counts,graphql,build});
root.DKFacebookDiagnosticReport=API;
if(typeof module!=="undefined")module.exports=API;
})(typeof globalThis!=="undefined"?globalThis:this);
