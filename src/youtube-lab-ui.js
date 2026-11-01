"use strict";
/* Only a user clicking Compare reads local File objects. Nothing is stored,
   fetched, posted or uploaded. Display only whitelisted fixed-label evidence. */
const $=id=>document.getElementById(id);
let comparison=null,projected=null,labBusy=false;
function show(message){$("labStatus").textContent=String(message||"").slice(0,250);}
function choice(id,allowed){
 const s=$(id).value;
 return allowed.includes(s)?s:allowed[0];
}
function observations(){
 return {videoType:choice("videoType",["ordinary","ad-funded-film","shorts","other"]),
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
 p.textContent=message;
 $("comparisonWarnings").appendChild(p);
}
function render(result){
 $("comparisonRows").replaceChildren();
 $("comparisonWarnings").replaceChildren();
 $("comparisonSummary").textContent="Baseline: "+result.baselineMode+
  " | Candidate: "+result.candidateMode+". "+result.interpretation;
 for(const warning of result.warnings)addWarning(warning);
 if(!result.warnings.length)addWarning("No mismatch was detected in the exported protection flags. This does NOT prove the test runs were equivalent.");
 for(const row of result.rows){
  const tr=document.createElement("tr");
  for(const value of [row.label,row.baseline,row.candidate,row.delta>0?"+"+row.delta:String(row.delta)]){
   const td=document.createElement("td");td.textContent=String(value);
   tr.appendChild(td);
  }
  $("comparisonRows").appendChild(tr);
 }
 const observed=observations();
 const playback={unknown:"not recorded",works:"played normally",refused:"refused / black screen",stalled:"stalled / buffered"};
 const ads={unknown:"not recorded",seen:"an ad visibly played","none-seen":"no ad observed during test"};
 $("manualSummary").textContent="Manual observation ("+observed.videoType+"): baseline "+
  playback[observed.baselinePlayback]+", "+ads[observed.baselineAds]+
  "; candidate "+playback[observed.candidatePlayback]+", "+ads[observed.candidateAds]+
  ". These are user-entered observations, not verified measurements.";
 $("comparisonCaveat").textContent=result.caveat+
  " Treat 'no ad observed' as inconclusive when the video did not successfully play.";
 $("comparisonResult").hidden=false;
}
async function doCompare(){
 if(labBusy)return;
 labBusy=true;$("compareReports").disabled=true;$("exportComparison").disabled=true;
 $("comparisonResult").hidden=true;comparison=null;projected=null;
 show("Reading two local diagnostic reports…");
 try{
  // Sequential parsing deliberately limits memory peak and avoids long-lived
  // raw copies of both exports in the same application state.
  const baseline=await selectReport("baselineFile");
  const candidate=await selectReport("candidateFile");
  const result=DKYouTubeLab.compare(baseline,candidate);
  comparison=result;projected={baseline,candidate};
  render(result);
  $("exportComparison").disabled=false;
  show("Comparison complete. This is evidence only, not a claim of ad-free playback.");
 }catch(error){show(error?.message||"Could not compare the reports.");}
 finally{labBusy=false;$("compareReports").disabled=false;}
}
function exportComparison(){
 if(!comparison||!projected)return;
 // No report hostnames, tab IDs, player URLs, cookies or account data.
 const safe={format:"DK Live Block offline YouTube A/B comparison",schemaVersion:1,
  comparedAt:new Date().toISOString(),
  baselineMode:comparison.baselineMode,candidateMode:comparison.candidateMode,
  observations:observations(),comparison:{
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
 for(const id of ["baselineFile","candidateFile"])$(id).value="";
 comparison=null;projected=null;
 $("comparisonResult").hidden=true;
 $("comparisonRows").replaceChildren();$("comparisonWarnings").replaceChildren();
 $("exportComparison").disabled=true;show("Reports cleared from the comparison lab.");
}
$("compareReports").addEventListener("click",doCompare);
$("exportComparison").addEventListener("click",exportComparison);
$("clearComparison").addEventListener("click",reset);
for(const id of ["baselineFile","candidateFile"])
 $(id).addEventListener("change",()=>{comparison=null;projected=null;
  $("comparisonResult").hidden=true;$("exportComparison").disabled=true;
  show("Selection changed. Click Compare reports to load local files.");});
