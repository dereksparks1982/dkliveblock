"use strict";
const test=require("node:test"),assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path");
const root=path.resolve(__dirname,"..","src");
test("popup exposes failed-resource count and recovery navigation",()=>{
 const html=fs.readFileSync(path.join(root,"popup.html"),"utf8");
 const js=fs.readFileSync(path.join(root,"popup.js"),"utf8");
 const bg=fs.readFileSync(path.join(root,"background.js"),"utf8");
 for(const id of ["issues","recovery"])assert.match(html,new RegExp('id="'+id+'"'));
 assert.match(js,/current\.networkIssueCount/);
 assert.match(js,/browser\.runtime\.openOptionsPage/);
 assert.match(bg,/networkIssueCount:/);
});
test("Firefox popup retains ordinary controls alongside recovery",()=>{
 const html=fs.readFileSync(path.join(root,"popup.html"),"utf8");
 for(const id of ["enabled","toggle","temporary","picker","undo","update","settings"])
  assert.match(html,new RegExp('id="'+id+'"'));
});

test("Playback Rescue is available only as an explicit toolbar action",()=>{
 const html=fs.readFileSync(path.join(root,"popup.html"),"utf8");
 const js=fs.readFileSync(path.join(root,"popup.js"),"utf8");
 const bg=fs.readFileSync(path.join(root,"background.js"),"utf8");
 assert.match(html,/id="mediaRecoveryRow" hidden/);
 assert.match(html,/id="mediaRecovery"/);
 assert.match(html,/Some video ads may play/);
 assert.match(js,/mediaRecoveryAvailable/);
 assert.match(js,/toggleMediaRecovery/);
 assert.match(bg,/mediaRecoveryAllowed/);
});

test("popup cleanup can be paused per site without disabling the blocker",()=>{
 const html=fs.readFileSync(path.join(root,"popup.html"),"utf8");
 const js=fs.readFileSync(path.join(root,"popup.js"),"utf8");
 const bg=fs.readFileSync(path.join(root,"background.js"),"utf8");
 const options=fs.readFileSync(path.join(root,"options.js"),"utf8");
 assert.match(html,/id="popupProtection"/);
 assert.match(html,/id="popupProtectionRow"/);
 assert.match(js,/toggleSitePopupProtection/);
 assert.match(js,/popupProtectionPaused/);
 assert.match(bg,/popupAllowed/);
 assert.match(options,/popupProtectionPaused/);
});

test("popup displays only a bounded per-tab popup-cleanup count",()=>{
 const html=fs.readFileSync(path.join(root,"popup.html"),"utf8");
 const js=fs.readFileSync(path.join(root,"popup.js"),"utf8");
 const bg=fs.readFileSync(path.join(root,"background.js"),"utf8");
 assert.match(html,/id="popups"/);
 assert.match(js,/current\.popupHiddenCount/);
 assert.match(bg,/popupCounts:new Map/);
 assert.match(bg,/reportPopupCleanup/);
 assert.match(bg,/Math\.min\(1000/);
});

test("Build 31 streaming diagnostics are local and do not turn off blocking automatically",()=>{
 const html=fs.readFileSync(path.join(root,"options.html"),"utf8");
 const js=fs.readFileSync(path.join(root,"options.js"),"utf8");
 const popup=fs.readFileSync(path.join(root,"popup.html"),"utf8");
 const bg=fs.readFileSync(path.join(root,"background.js"),"utf8");
 assert.match(html,/id="streaming-diagnostics"/);
 assert.match(html,/id="streamIssuesRows"/);
 assert.match(popup,/id="streamingDiagnosticsRow" hidden/);
 assert.match(js,/getStreamingIssues/);
 assert.match(js,/clearStreamingIssues/);
 assert.match(bg,/DKStreamingDiagnostics\.record/);
 assert.match(bg,/streamingIssues\.clear\(\)/);
});

test("Build 33 temporary repair always requires explicit consent and supports revocation",()=>{
 const bg=fs.readFileSync(path.join(root,"background.js"),"utf8");
 const options=fs.readFileSync(path.join(root,"options.js"),"utf8");
 const page=fs.readFileSync(path.join(root,"options.html"),"utf8");
 assert.match(bg,/temporarilyAllowStreamingHost/);
 assert.match(bg,/msg\.confirm!==true/);
 assert.match(bg,/evidence\.some/);
 assert.match(bg,/DKStreamingRepair\.matches/);
 assert.match(options,/window\.confirm/);
 assert.match(options,/clearTemporaryStreamingAllowances/);
 assert.match(page,/id="streamRepairRevoke"/);
});
