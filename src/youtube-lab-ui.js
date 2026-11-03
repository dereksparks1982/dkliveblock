"use strict";
/* Only a user clicking Compare reads local File objects. Nothing is stored,
   fetched, posted or uploaded. Display only whitelisted fixed-label evidence. */
const $=id=>document.getElementById(id);
// Translate fixed UI phrases only; never translate selected files or export payloads.
const local=s=>DKUILanguage.translate(String(s),document.documentElement?.lang||"en");
let comparison=null,projected=null,labBusy=false;
const selectionGate=DKYouTubeSelectionGate.create();
function show(message){$("labStatus").textContent=local(message||"").slice(0,250);}
function choice(id,allowed){
 const s=$(id).value;
 return allowed.includes(s)?s:allowed[0];
}
function observations(){
 return {baselineVideoType:choice("baselineVideoType",["ordinary","ad-funded-film","shorts","other"]),
  candidateVideoType:choice("candidateVideoType",["ordinary","ad-funded-film","shorts","other"]),
  baselinePlayback:choice("baselinePlayback",["unknown","works","refused","stalled"]),
  candidatePlayback:choice("candidatePlayback",["unknown","works","refused","stalled"]),
  baselineAds:choice("baselineAds",["unknown","seen","none-seen"]),
  candidateAds:choice("candidateAds",["unknown","seen","none-seen"])};
}
async function selectReport(id){
 const input=$(id),file=input.files?.[0];
 if(!file)throw Error("Select both local JSON reports before comparing.");
 if(!Number.isSafeInteger(file.size)||file.size<=0||file.size>DKYouTubeLab.MAX_BYTES)
  throw Error("Each diagnostic report must be under 750 KB.");
 if(typeof file.text!=="function")throw Error("This Firefox version cannot read the selected file.");
 // Avoid retaining the untrusted full report after projection.
 const contents=await file.text();
 return DKYouTubeLab.parse(contents);
}
function addWarning(message){
 const p=document.createElement("p");
 p.textContent=local(message);
 $("comparisonWarnings").appendChild(p);
}
function render(result){
 $("comparisonRows").replaceChildren();
 $("comparisonWarnings").replaceChildren();
 $("comparisonSummary").textContent=local("Baseline: ")+result.baselineMode+
  local(" | Candidate: ")+result.candidateMode+". "+local(result.interpretation);
 for(const warning of result.warnings)addWarning(warning);
 if(!result.warnings.length)addWarning("No mismatch was detected in the exported protection flags. This does NOT prove the test runs were equivalent.");
 for(const row of result.rows){
  const tr=document.createElement("tr");
  for(const value of [row.label,row.baseline,row.candidate,row.delta>0?"+"+row.delta:String(row.delta)]){
   const td=document.createElement("td");td.textContent=local(value);
   tr.appendChild(td);
  }
  $("comparisonRows").appendChild(tr);
 }
 const observed=observations();
 const manual=DKYouTubeManualOutcome.assess(observed);
 for(const warning of manual.warnings)addWarning(warning);
 const playback={unknown:local("not recorded"),works:local("played normally"),refused:local("refused / black screen"),stalled:local("stalled / buffered")};
 const ads={unknown:local("not recorded"),seen:local("an ad visibly played"),"none-seen":local("no ad observed during test")};
 $("manualSummary").textContent=local("Manual observation: baseline ")+observed.baselineVideoType+" "+
  playback[observed.baselinePlayback]+", "+ads[observed.baselineAds]+
  local("; candidate ")+observed.candidateVideoType+" "+playback[observed.candidatePlayback]+", "+ads[observed.candidateAds]+
  local(". These are user-entered observations, not verified measurements. Results: ")+local(manual.baseline)+" / "+local(manual.candidate)+".";
 $("comparisonCaveat").textContent=local(result.caveat)+
  local(" Treat 'no ad observed' as inconclusive when the video did not successfully play.");
 $("comparisonResult").hidden=false;
}
async function doCompare(){
 if(labBusy)return;
 labBusy=true;const revision=selectionGate.start();
 $("compareReports").disabled=true;$("exportComparison").disabled=true;
 $("comparisonResult").hidden=true;comparison=null;projected=null;
 show("Reading two local diagnostic reports…");
 try{
  // Sequential parsing deliberately limits memory peak and avoids long-lived
  // raw copies of both exports in the same application state.
  const baseline=await selectReport("baselineFile");
  const candidate=await selectReport("candidateFile");
  if(!selectionGate.valid(revision))throw Error("Selected reports changed while reading. Compare again.");
  const result=DKYouTubeLab.compare(baseline,candidate);
  comparison=result;projected={baseline,candidate};
  render(result);
  $("exportComparison").disabled=false;
  show("Comparison complete. This is evidence only, not a claim of ad-free playback.");
 }catch(error){show(error?.message||"Could not compare the reports.");}
 finally{labBusy=false;$("compareReports").disabled=false;}
}
function exportComparison(){
 if(labBusy||!comparison||!projected)return;
 // No report hostnames, tab IDs, player URLs, cookies or account data.
 const safe={format:"DK Live Block offline YouTube A/B comparison",schemaVersion:1,
  comparedAt:new Date().toISOString(),
  baselineMode:comparison.baselineMode,candidateMode:comparison.candidateMode,
  observations:observations(),manualAssessment:DKYouTubeManualOutcome.assess(observations()),contentTypesMatched:
   observations().baselineVideoType===observations().candidateVideoType,comparison:{
   rows:comparison.rows,warnings:comparison.warnings,
   interpretation:comparison.interpretation,caveat:comparison.caveat,
   verifiedAdFree:false},
  limitation:"The user-entered observations and local diagnostic counters are unverified. No ad-removal or causal claim."};
 const blob=new Blob([JSON.stringify(safe,null,2)+"\n"],{type:"application/json"});
 const url=URL.createObjectURL(blob);
 const link=document.createElement("a");
 link.href=url;link.download="dk-live-block-youtube-ab-comparison.json";
 link.hidden=true;document.body.appendChild(link);
 try{link.click();show("Sanitized comparison saved locally; no reports uploaded.");}
 finally{link.remove();setTimeout(()=>URL.revokeObjectURL(url),60000);}
}
function reset(){
 selectionGate.invalidate();
 for(const id of ["baselineFile","candidateFile"])$(id).value="";
 comparison=null;projected=null;
 $("comparisonResult").hidden=true;
 $("comparisonRows").replaceChildren();$("comparisonWarnings").replaceChildren();
 $("exportComparison").disabled=true;show("Reports cleared from the comparison lab.");
}
$("compareReports").addEventListener("click",doCompare);
$("exportComparison").addEventListener("click",exportComparison);
$("clearComparison").addEventListener("click",reset);
// Manual observations can be corrected without reading the original files
// again or keeping their untrusted contents in memory.
for(const id of ["baselineVideoType","candidateVideoType",
 "baselinePlayback","candidatePlayback","baselineAds","candidateAds"])
 $(id).addEventListener("change",()=>{if(comparison)render(comparison);});
for(const id of ["baselineFile","candidateFile"])
 $(id).addEventListener("change",()=>{selectionGate.invalidate();comparison=null;projected=null;
  $("comparisonResult").hidden=true;$("exportComparison").disabled=true;
  show("Selection changed. Click Compare reports to load local files.");});

// The translation service repaints static DOM text, but composed summary
// sentences must be rendered again when the saved UI language changes.
if(typeof browser!=="undefined")browser.storage.onChanged?.addListener((changes,area)=>{
 if(area==="local"&&changes.dkUiLanguage&&comparison)
  queueMicrotask(()=>{if(comparison)render(comparison);});
});
