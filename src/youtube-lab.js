/* DK Live Block: offline, strictly projected YouTube A/B report comparison.
   Untrusted user-selected report files never reach a network endpoint.
   Paths, video IDs, host lists, comments and arbitrary report fields discarded. */
(function(root){"use strict";
const MAX_BYTES=750000,MAX_EVENTS=30,MAX_COUNTER=1000000000;
const FORMAT="DK Live Block YouTube compatibility report";
const MODES=new Set(["combined","response-only","bridge-only","observe","player-pass-through"]);
const HOSTS=new Set(["youtube.com","youtube-nocookie.com","youtu.be"]);
const KINDS=new Set(["enforcement","media-error","buffering","ad-skip","ad-showing"]);
const STAGES=["attach","data","stop","stream"];
const PRUNES=["bootstrap","json-parse","fetch-json","fetch-text","xhr-json","xhr-text"];
const METRICS=Object.freeze([
 ["blockedRequests","Blocked requests"],
 ["modifiedResponses","Modified player JSON responses"],
 ["attachmentAttempts","Response-filter attachment attempts"],
 ["attachedFilters","Response filters attached"],
 ["responseErrors","Response-filter errors"],
 ["bridgeSamples","Page-bridge prune samples (untrusted)"],
 ["adState","Player ad-state observations (untrusted)"],
 ["enforcement","Anti-adblock refusals observed"],
 ["mediaErrors","HTML5 media errors"],
 ["buffering","Buffering observations"],
 ["skips","Skip-button actions"]
]);
function isYouTube(value){
 if(typeof value!=="string"||value.length>100||value!==value.toLowerCase()||
    /[^a-z0-9.-]/.test(value))return false;
 if(value.split(".").some(label=>!label||label.length>63||
     !/^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/.test(label)))return false;
 return [...HOSTS].some(h=>value===h||value.endsWith("."+h));
}
// A fixed site-family enum, never a page hostname, path, video ID or URL.
function siteFamily(host){
 if(!isYouTube(host))return "unknown";
 if(host==="youtu.be"||host.endsWith(".youtu.be"))return "short-link";
 if(host==="youtube-nocookie.com"||host.endsWith(".youtube-nocookie.com"))return "embedded";
 return "youtube";
}
function integer(value,label){
 if(value===undefined)return 0;
 if(!Number.isSafeInteger(value)||value<0||value>MAX_COUNTER)
  throw Error("Invalid "+label+" in report.");
 return value;
}
function object(value){return !!value&&typeof value==="object"&&!Array.isArray(value);}
function parse(text){
 if(typeof text!=="string"||!text||text.length>MAX_BYTES||text.includes("\u0000"))
  throw Error("Report must be a local JSON file under 750 KB.");
 let report;
 try{report=JSON.parse(text);}catch(_){throw Error("Report is not valid JSON.");}
 if(!object(report)||report.format!==FORMAT||report.schemaVersion!==1)
  throw Error("This is not a supported DK Live Block YouTube compatibility report.");
 if(!isYouTube(report.website))throw Error("Report is not for a YouTube website.");
 if(!MODES.has(report.experimentMode))throw Error("Report has an unknown test mode.");
 for(const key of ["protectionEnabled","siteAllowlisted","temporaryPause","requestLogEnabled"])
  if(typeof report[key]!=="boolean")throw Error("Report is missing a required protection-state field.");
 const response=report.responseFiltering;
 if(!object(response))throw Error("Report is missing player-response diagnostic counters.");
 if(!Array.isArray(report.playback)||report.playback.length>MAX_EVENTS)
  throw Error("Report contains invalid or excessive playback observations.");
 if(typeof response.enabled!=="boolean"||typeof response.supported!=="boolean")
  throw Error("Report is missing Firefox response-filter capability flags.");
 const events={"enforcement":0,"media-error":0,"buffering":0,"ad-skip":0,"ad-showing":0};
 for(const row of report.playback){
  if(!object(row)||!KINDS.has(row.kind)||
     (row.blockedMediaNearby!==undefined&&typeof row.blockedMediaNearby!=="boolean"))
   throw Error("Report includes an invalid player-health event.");
  events[row.kind]++;
 }
 let responseErrors=0,bridgeSamples=0;
 for(const key of STAGES)responseErrors+=integer(response.errorStages?.[key],"response error counter");
 for(const key of PRUNES)bridgeSamples+=integer(response.pagePrunes?.[key],"page bridge counter");
 // Never include website, tab ID, URL, or any arbitrary report fields in the
 // result. The sole remaining sample is fixed enum/bool/counter evidence.
 const sample={
  format:"DK Live Block local diagnostic projection",
  siteFamily:siteFamily(report.website),
  mode:report.experimentMode,backend:["native","hybrid"].includes(report.filterBackend)?report.filterBackend:"unknown",
  flags:{enabled:report.protectionEnabled,siteAllowlisted:report.siteAllowlisted,
   tabPaused:report.temporaryPause,requestLog:report.requestLogEnabled,
   responseEnabled:response.enabled,responseSupported:response.supported},
  metrics:{
   blockedRequests:integer(report.blockedCount,"blocked requests"),
   modifiedResponses:integer(response.modified,"modified responses"),
   attachmentAttempts:integer(response.attachAttempts,"attachment attempts"),
   attachedFilters:integer(response.attached,"attached filters"),
   responseErrors:Math.min(MAX_COUNTER,responseErrors),
   bridgeSamples:Math.min(MAX_COUNTER,bridgeSamples),
   adState:events["ad-showing"],enforcement:events.enforcement,
   mediaErrors:events["media-error"],buffering:events.buffering,skips:events["ad-skip"]
  },
  observedEvents:report.playback.length
 };
 Object.freeze(sample.metrics);Object.freeze(sample.flags);
 return Object.freeze(sample);
}
function compare(before,after){
 if(!before||!after||before.format!=="DK Live Block local diagnostic projection"||
    after.format!=="DK Live Block local diagnostic projection")
  throw Error("Choose two valid DK Live Block YouTube diagnostic reports.");
 const warnings=[];
 if(before.siteFamily!==after.siteFamily)
  warnings.push("YouTube site families differ. Embedded and watch-page behavior may not be comparable.");
 if(before.flags.enabled!==after.flags.enabled)
  warnings.push("Global protection differs between reports.");
 if(before.flags.siteAllowlisted!==after.flags.siteAllowlisted||
    before.flags.tabPaused!==after.flags.tabPaused)
  warnings.push("Website allowlist or tab pause differs between reports.");
 if(before.flags.responseEnabled!==after.flags.responseEnabled||
    before.flags.responseSupported!==after.flags.responseSupported)
  warnings.push("Response-filter configuration or Firefox support differs between reports.");
 if(before.flags.requestLog!==after.flags.requestLog)
  warnings.push("Request logging differs, so blocked-request histories may not be comparable.");
 if(before.backend!==after.backend)
  warnings.push("Filtering backend differs between reports.");
 if(before.mode===after.mode)
  warnings.push("Both reports use the same temporary test mode. There is no mode change to isolate.");
 if(before.observedEvents===MAX_EVENTS||after.observedEvents===MAX_EVENTS)
  warnings.push("At least one report reached the 30-event playback-history cap.");
 if(before.metrics.enforcement||after.metrics.enforcement)
  warnings.push("Anti-adblock enforcement was observed. Treat this as a playback regression until tested.");
 if(before.metrics.mediaErrors||after.metrics.mediaErrors)
  warnings.push("A player media error occurred. Modified ad metadata does not prove healthy playback.");
 if(!before.flags.requestLog||!after.flags.requestLog)
  warnings.push("Private request logging was off in at least one report. Missing entries are not proof of clean playback.");
 if(before.observedEvents===0||after.observedEvents===0)
  warnings.push("At least one report has no player-health events. This is missing evidence, not proof of success.");
 const rows=METRICS.map(([key,label])=>({
  key,label,baseline:before.metrics[key],candidate:after.metrics[key],
  delta:after.metrics[key]-before.metrics[key]
 }));
 const comparable=warnings.length===0;
 return Object.freeze({
  baselineMode:before.mode,candidateMode:after.mode,
  rows,warnings,
  comparable,verifiedAdFree:false,
  interpretation:comparable?
   "Only the local counters differ. Replay the same video under matching Firefox conditions to evaluate real ad display and content playback.":
   "The reports have missing or mismatched evidence. Do not infer that one mode removed ads, repaired playback or outperformed the other.",
  caveat:"Counters are truncated event snapshots, not normalized by video duration. Page-world events can be forged. No local report can independently verify ad-free playback or causality."
 });
}
const API=Object.freeze({MAX_BYTES,MAX_EVENTS,MAX_COUNTER,FORMAT,METRICS,isYouTube,siteFamily,parse,compare});
root.DKYouTubeLab=API;
if(typeof module!=="undefined")module.exports=API;
})(typeof globalThis!=="undefined"?globalThis:this);
