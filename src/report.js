"use strict";
/* No automatic reports or network requests. Email drafts only after user review. */
const $=id=>document.getElementById(id);
const address=DKSupport.SUPPORT_EMAIL;
$("supportEmail").textContent=address;
$("supportEmail").href="mailto:"+address;
let draft=null;
function invalidate(){
 draft=null;$("reportDraftSection").hidden=true;
 $("reportStatus").textContent="Details changed. Review your updated report before sending.";
}
for(const id of ["reportKind","reportWebsite","reportDescription","reportSteps"])
 $(id).addEventListener("input",invalidate);
$("bugReportForm").addEventListener("submit",event=>{
 event.preventDefault();
 const version=browser.runtime.getManifest().version;
 const prepared=DKSupport.buildReport({
  kind:$("reportKind").value,website:$("reportWebsite").value,
  description:$("reportDescription").value,steps:$("reportSteps").value,version
 });
 if(!prepared){
  $("reportStatus").textContent="Please enter at least 10 characters describing the problem and a valid website, if supplied.";
  return;
 }
 draft=prepared;
 $("reportSubject").value=draft.subject;
 $("reportPreview").value=draft.body;
 $("reportDraftSection").hidden=false;
 $("reportStatus").textContent="Draft prepared locally. Nothing has been sent.";
});
$("copyReport").addEventListener("click",async()=>{
 if(!draft)return;
 const report=draft.subject+"\n\n"+draft.body;
 try{
  if(!navigator.clipboard?.writeText)throw Error("Clipboard API unavailable");
  await navigator.clipboard.writeText(report);
  $("reportStatus").textContent="Report copied locally. You choose where to send it.";
 }catch(_){
  $("reportPreview").focus();$("reportPreview").select();
  $("reportStatus").textContent="Copy was unavailable. Report text selected for manual copying.";
 }
});
$("openEmailDraft").addEventListener("click",()=>{
 if(!draft)return;
 const href=DKSupport.bugMailto(draft);
 if(!href)return $("reportStatus").textContent="Unable to prepare email. Copy the report instead.";
 $("reportStatus").textContent="Opening your email application. Review and send the message yourself.";
 window.location.href=href;
});
