/* Build 290: Nesty Layout Scout. Reviews in-page counts, never changes a page.
   No browsing data, remote AI, executable rules, generated CSS or telemetry. */
(function(root){"use strict";
const HOSTS=Object.freeze(["pornhub.com","www.pornhub.com"]);
const BOUNDS=Object.freeze({scannedLists:12,eligibleLists:12,videoTiles:1440,
 emptyAdSlots:1440,mixedLists:12,shortLists:12,oversizedLists:12,
 appliedLists:12,appliedSlots:1440,scans:1000000});
const MAX_REPEAT=4;
function supports(host){return typeof host==="string"&&HOSTS.includes(host.toLowerCase());}
function normalize(raw){
 if(!raw||typeof raw!=="object"||Array.isArray(raw)||
    typeof raw.supportedPage!=="boolean"||
    raw.cleanupPending!==undefined&&typeof raw.cleanupPending!=="boolean")return null;
 const result={supportedPage:raw.supportedPage,
  inspectionUnavailable:raw.inspectionUnavailable===true,
  cleanupPending:raw.cleanupPending===true};
 for(const [key,limit] of Object.entries(BOUNDS)){
  if(!Number.isSafeInteger(raw[key])||raw[key]<0||raw[key]>limit)return null;
  result[key]=raw[key];
 }
 if(result.eligibleLists+result.mixedLists+result.shortLists+
    result.oversizedLists>result.scannedLists)return null;
 if(result.videoTiles+result.emptyAdSlots>result.eligibleLists*120)
  return null;
 // Older diagnostic fixtures omit geometry; in that case retain the
 // original count-only behavior and NEVER claim a measured wide gap.
 if(raw.geometry!==undefined){
  const g=raw.geometry,keys=["sampledTiles","sameRowPairs","widePairs","largestWideGapPx"];
  if(!g||typeof g!=="object"||Array.isArray(g)||
     Object.keys(g).some(key=>!keys.includes(key)))return null;
  for(const [key,max] of [["sampledTiles",1440],["sameRowPairs",1428],
    ["widePairs",1428],["largestWideGapPx",4096]]){
   if(!Number.isSafeInteger(g[key])||g[key]<0||g[key]>max)return null;
  }
  if(g.sampledTiles>result.videoTiles||g.sameRowPairs>g.sampledTiles||
     g.widePairs>g.sameRowPairs||
     (g.widePairs===0&&g.largestWideGapPx!==0)||
     (g.widePairs>0&&g.largestWideGapPx===0))return null;
  result.geometry=Object.freeze(Object.fromEntries(keys.map(key=>[key,g[key]])));
 }
 return Object.freeze(result);
}
function kindOf(m,c){
 if(m.cleanupPending)return "layout-cleanup-pending";
 if(!c.active)return "protection-paused";
 if(c.picking)return "picker-active";
 if(m.inspectionUnavailable)return "inspection-unavailable";
 if(!m.supportedPage)return "unsupported-page";
 if(m.eligibleLists===0)
  return m.mixedLists||m.oversizedLists?"review-unsupported-markup":"no-eligible-grids";
 if(c.enabled&&m.appliedLists>0)
  return m.geometry?.widePairs>0?"wide-gap-after-reflow":"verify-visible-spacing";
 if(c.enabled)return "review-application";
 if(m.geometry?.widePairs>0)return "wide-video-gap-measured";
 if(m.emptyAdSlots>0)return "manual-opt-in-candidate";
 return "review-grid-spacing";
}
function create(win,team){
 const host=String(win?.location?.hostname||"").toLowerCase();
 if(!supports(host)||win?.top&&win.top!==win)return null;
 const specialist=(team||root.DKNestyTeam)?.byKey?.("layout");
 if(specialist?.id!=="nesty_layout_scout")return null;
 let last="",repeat=0,checks=0;
 function reset(){last="";repeat=0;checks=0;}
 function compare(rawBefore,rawAfter){
  const before=normalize(rawBefore),after=normalize(rawAfter);
  if(!before||!after||before.cleanupPending||after.cleanupPending||
     !before.supportedPage||!after.supportedPage||
     before.inspectionUnavailable||after.inspectionUnavailable||
     !before.geometry||!after.geometry)return null;
  // Comparing a restructured or partially loaded page would be deceptive.
  const comparable=before.eligibleLists>0&&
   before.eligibleLists===after.eligibleLists&&
   before.videoTiles===after.videoTiles&&
   before.geometry.sampledTiles===after.geometry.sampledTiles&&
   before.geometry.sameRowPairs===after.geometry.sameRowPairs&&
   before.geometry.sameRowPairs>0;
  const outcome=!comparable?"inconclusive":after.geometry.widePairs<before.geometry.widePairs?
   "fewer-wide-gaps":after.geometry.widePairs>before.geometry.widePairs?
   "more-wide-gaps":after.geometry.largestWideGapPx<before.geometry.largestWideGapPx?
   "smaller-largest-gap":after.geometry.largestWideGapPx>before.geometry.largestWideGapPx?
   "larger-largest-gap":"no-measured-change";
  return Object.freeze({specialist:"nesty_layout_scout",mode:"review-only",
   outcome,comparable,widePairsBefore:before.geometry.widePairs,
   widePairsAfter:after.geometry.widePairs,
   largestGapBeforePx:before.geometry.largestWideGapPx,
   largestGapAfterPx:after.geometry.largestWideGapPx,
   visualVerificationRequired:true,executable:false,automaticRules:false});
 }
 function review(raw,opts){
  const m=normalize(raw);
  if(!m)return null;
  const context={active:opts?.active===true,
   enabled:opts?.enabled===true,picking:opts?.picking===true};
  const finding=kindOf(m,context);
  // Signature contains only approved categories and bounded counters.
  // Repetition indicates identical diagnostics, NOT verified visual gaps.
  const signature=[finding,context.enabled,m.supportedPage,
   ...Object.keys(BOUNDS).map(k=>k==="scans"?0:m[k]),
   m.geometry?.sameRowPairs??-1,m.geometry?.widePairs??-1,
   m.geometry?.largestWideGapPx??-1].join(":");
  repeat=signature===last?Math.min(MAX_REPEAT,repeat+1):1;
  last=signature;checks=Math.min(1000000,checks+1);
  return Object.freeze({specialist:specialist.id,title:specialist.title,
   finding,mode:"review-only",source:"on-demand-local-counts",
   checks,repeatCount:repeat,
   nextStep:finding==="layout-cleanup-pending"?"retry-existing-rollback":
    ["manual-opt-in-candidate","wide-video-gap-measured"]
    .includes(finding)?"consider-existing-setting":
    finding==="review-unsupported-markup"?"inspect-markup-locally":
    ["review-grid-spacing","verify-visible-spacing","review-application",
     "wide-gap-after-reflow"]
     .includes(finding)?"compare-visual-layout":"no-action",
   visualVerificationRequired:true,trainedModel:false,
   automaticRules:false,executable:false});
 }
 return Object.freeze({review,compare,reset});
}
const API=Object.freeze({supports,normalize,create});
root.DKNestyLayoutScout=API;
if(typeof module!=="undefined")module.exports=API;
})(typeof globalThis!=="undefined"?globalThis:this);
