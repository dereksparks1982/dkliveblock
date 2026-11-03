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
    typeof raw.supportedPage!=="boolean")return null;
 const result={supportedPage:raw.supportedPage,
  inspectionUnavailable:raw.inspectionUnavailable===true};
 for(const [key,limit] of Object.entries(BOUNDS)){
  if(!Number.isSafeInteger(raw[key])||raw[key]<0||raw[key]>limit)return null;
  result[key]=raw[key];
 }
 if(result.eligibleLists+result.mixedLists+result.shortLists+
    result.oversizedLists>result.scannedLists)return null;
 if(result.videoTiles+result.emptyAdSlots>result.eligibleLists*120)
  return null;
 return Object.freeze(result);
}
function kindOf(m,c){
 if(!c.active)return "protection-paused";
 if(c.picking)return "picker-active";
 if(m.inspectionUnavailable)return "inspection-unavailable";
 if(!m.supportedPage)return "unsupported-page";
 if(m.eligibleLists===0)
  return m.mixedLists||m.oversizedLists?"review-unsupported-markup":"no-eligible-grids";
 if(c.enabled&&m.appliedLists>0)return "verify-visible-spacing";
 if(c.enabled)return "review-application";
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
 function review(raw,opts){
  const m=normalize(raw);
  if(!m)return null;
  const context={active:opts?.active===true,
   enabled:opts?.enabled===true,picking:opts?.picking===true};
  const finding=kindOf(m,context);
  // Signature contains only approved categories and bounded counters.
  // Repetition indicates identical diagnostics, NOT verified visual gaps.
  const signature=[finding,context.enabled,m.supportedPage,
   ...Object.keys(BOUNDS).map(k=>k==="scans"?0:m[k])].join(":");
  repeat=signature===last?Math.min(MAX_REPEAT,repeat+1):1;
  last=signature;checks=Math.min(1000000,checks+1);
  return Object.freeze({specialist:specialist.id,title:specialist.title,
   finding,mode:"review-only",source:"on-demand-local-counts",
   checks,repeatCount:repeat,
   nextStep:finding==="manual-opt-in-candidate"?"consider-existing-setting":
    finding==="review-unsupported-markup"?"inspect-markup-locally":
    ["review-grid-spacing","verify-visible-spacing","review-application"]
     .includes(finding)?"compare-visual-layout":"no-action",
   visualVerificationRequired:true,trainedModel:false,
   automaticRules:false,executable:false});
 }
 return Object.freeze({review,reset});
}
const API=Object.freeze({supports,normalize,create});
root.DKNestyLayoutScout=API;
if(typeof module!=="undefined")module.exports=API;
})(typeof globalThis!=="undefined"?globalThis:this);
