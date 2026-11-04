/* DK Live Block Build 305: fixed, local-only Facebook scanner + GraphQL diagnostics.
   This is observation only; browser network and page blocking decisions are unchanged. */
(function(root){"use strict";
const DETECTOR=Object.freeze(["hidden","cachedLabels","limit","menuCursor","articleCursor","bylineCursor","referenceCursor","railHeadingCursor","railLabelCursor","railLinkCursor","marketplaceCursor","mobileCursor","hardCursor","exceptions","scans","lastScanAt","lastHidden","lastFeedCards","lastRailSignals","lastRailUnresolved","lastMenuSignals","lastMenuUnresolved","lastBylineSignals","lastBylineUnresolved","recycledRestored","rechecks","fastScans","fastHidden","coreFull","coreEnabled","settingsReady","settingsError","observerActive","scanCostMs","observerCostMs","retryCostMs","scanElements","labelsUnanchored","hideByLabel","hideByShape","hideByMarked","hideBySuggested","hideByUnfollowed","hideBySection","hideByOther","restoreOperations","observerCalls","retryTicks","pending","labelsClassified","labelsAnchored","labelsDeferred","rescuedLabels","lateTextLabels","lateLabelRefs","unlabeledAdsHidden","tooWideRefused","openedPostsSpared","hiddenPostsPruned"]);
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
// Read-only diagnosis of the current counter snapshot. None of these
// categories asserts that a specific Facebook post was or was not blocked.
function triage(r){
 if(!r||r.kind!=="dk-facebook-aggregate-diagnostics"||r.schema!==2)
  return Object.freeze({code:"invalid-evidence",next:"Collect a fresh Facebook diagnostic report."});
 if(!r.active)return Object.freeze({code:"protection-inactive",next:"Enable DK Live Block on this tab, then repeat the check."});
 if(!r.adRecognition)return Object.freeze({code:"recognition-disabled",next:"Review the saved ad recognition setting."});
 if(!r.adapterLoaded)return Object.freeze({code:"scanner-unavailable",next:"Reload the Facebook tab and inspect whether the content script initialized."});
 if(r.picking)return Object.freeze({code:"picker-active",next:"Exit the element picker before comparing scans."});
 const d=r.detector||{},g=r.graphql||{};
 if(d.coreFull&&d.settingsError)
  return Object.freeze({code:"facebook-settings-unavailable",next:"Facebook's saved preferences could not be read; the complete engine is off. Reload the extension and repeat."});
 if(d.coreFull&&!d.settingsReady)
  return Object.freeze({code:"facebook-core-waiting",next:"The full Facebook engine is waiting for saved preferences. Retry after the tab finishes loading."});
 if(d.coreFull&&!d.coreEnabled)
  return Object.freeze({code:"facebook-core-disabled",next:"The Facebook engine was not authorized by the DK site policy. Check pause, allowlist and ad-recognition controls."});
 if(d.coreFull&&!d.observerActive)
  return Object.freeze({code:"facebook-observer-inactive",next:"The full Facebook engine is authorized but its page observer is not attached. Reload the Facebook tab and inspect startup."});
 const scans=(d.scans||0)+(d.fastScans||0)+(d.observerCalls||0);
 if(!scans)return Object.freeze({code:"no-scans-recorded",next:"Scroll a Facebook feed once and check the scanner again."});
 if((d.hidden||0)>0||((d.fastHidden||0)>0))
  return Object.freeze({code:"dom-hide-observed",next:"Verify the specific Sponsored card disappeared while nearby ordinary posts stayed visible."});
 if(d.coreFull&&d.labelsClassified>0&&d.labelsAnchored===0)
  return Object.freeze({code:"ad-label-not-anchored",next:"Facebook ad labels were detected but none attached to a safe post. Check whole-post resolution before adding more scanning."});
 if(d.coreFull&&d.labelsClassified===0&&(d.observerCalls||0)>0)
  return Object.freeze({code:"no-ad-label-matched",next:"Facebook's observer ran but saw no recognized ad labels. Inspect actual ad markup, unlabeled-ad evidence and language."});
 if(g.available&&g.enabled&&g.supported&&(g.counters?.modified||g.counters?.removed))
  return Object.freeze({code:"graphql-modification-observed",next:"Response modifications alone do not prove a sponsored post disappeared. Compare with the actual feed."});
 return Object.freeze({code:"no-hides-recorded",next:"If a marked Ad remains visible, save this report and a screenshot. Do not infer that permitted requests were ads."});
}

function build(detector,graphqlReply){
 if(!detector||detector.ok!==true)return null;
 const d=detector.detector&&typeof detector.detector==="object"?
  Object.freeze({platform:"facebook",...counts(detector.detector,DETECTOR)}):null;
 const snapshot=Object.freeze({
  schema:2,kind:"dk-facebook-aggregate-diagnostics",
  active:detector.active===true,adRecognition:detector.adRecognition===true,
  picking:detector.picking===true,adapterLoaded:detector.adapterLoaded===true,
  lastScanAt:bounded(detector.lastScanAt,1000000000000000)||0,
  detector:d,graphql:graphql(graphqlReply),
  interpretation:"Permitted Facebook requests and zero network blocks cannot establish whether sponsored content was hidden or GraphQL advertising records were removed."
 });
 return Object.freeze({...snapshot,triage:triage(snapshot)});
}
const API=Object.freeze({DETECTOR,GRAPHQL,bounded,counts,graphql,build,triage});
root.DKFacebookDiagnosticReport=API;
if(typeof module!=="undefined")module.exports=API;
})(typeof globalThis!=="undefined"?globalThis:this);
