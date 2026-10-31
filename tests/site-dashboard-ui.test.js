"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path"),root=path.resolve(__dirname,"..");
test("Build 59 packaged dashboard uses only bundled local scripts and no third-party UI",()=>{
 const html=fs.readFileSync(path.join(root,"src/site-dashboard.html"),"utf8");
 const js=fs.readFileSync(path.join(root,"src/site-dashboard.js"),"utf8");
 const css=fs.readFileSync(path.join(root,"src/style.css"),"utf8");
 const popup=fs.readFileSync(path.join(root,"src/popup.html"),"utf8");
 const popupJS=fs.readFileSync(path.join(root,"src/popup.js"),"utf8");
 for(const id of ["dashboardTab","dashboardRefresh","dashboardShield","dashboardBlocked",
  "dashboardOverlays","dashboardTabsStopped","dashboardRecent","dashboardPopupHistory",
  "dashboardCustomAllowances","dashboardRequestAllowances","dashboardCookie",
  "dashboardDistraction","dashboardAllowlist","dashboardPause","dashboardMonitor",
  "dashboardClearLog","dashboardMessage"]){
  assert.ok(html.includes('id="'+id+'"'),id);
 }
 assert.ok(popup.includes('id="siteDashboard"'));
 assert.match(popupJS,/site-dashboard\.html/);
 assert.ok(html.indexOf('src="access-inspector.js"')<html.indexOf('src="site-dashboard-model.js"'));
 assert.ok(html.indexOf('src="site-dashboard-model.js"')<html.indexOf('src="site-dashboard.js"'));
 assert.match(js,/getSiteDashboard/);
 assert.match(js,/revokeSiteDashboardHost/);
 assert.match(js,/revokeMonitoredRequest/);
 assert.match(js,/setSiteFeaturePaused/);
 assert.match(js,/setSiteAllowed/);
 assert.match(js,/window\.confirm/);
 assert.doesNotMatch(js,/innerHTML\s*=|fetch\(|XMLHttpRequest|sendNativeMessage|eval\(/);
 assert.match(css,/\.site-dashboard \.dashboard-metrics/);
 const popupStyle=css.match(/\.popup\{width:(\d+)px\}/);
 assert.equal(popupStyle?.[1],"340");
});

test("Build 60 rejects stale site actions and protects dashboard interaction",()=>{
 const js=fs.readFileSync(path.join(root,"src/site-dashboard.js"),"utf8");
 const bg=fs.readFileSync(path.join(root,"src/background.js"),"utf8");
 assert.match(js,/function tabHost\(url\)/);
 assert.match(js,/busy=true;setButtons\(current\)/);
 assert.match(js,/current!==expected\|\|selected\(\)!==expected\.tabId/);
 assert.match(js,/revokeSiteDashboardHost/);
 assert.match(js,/clearSiteDashboardLog/);
 assert.match(bg,/site!==msg\.expectedSite/);
});

test("Build 62 view-blocked action sits beside popup count and focuses same-tab history",()=>{
 const popup=fs.readFileSync(path.join(root,"src/popup.html"),"utf8");
 const logic=fs.readFileSync(path.join(root,"src/popup.js"),"utf8");
 const page=fs.readFileSync(path.join(root,"src/site-dashboard.html"),"utf8");
 const script=fs.readFileSync(path.join(root,"src/site-dashboard.js"),"utf8");
 assert.match(popup,/<div class="metric">[^]*?id="count"[^]*?id="viewBlocked"/);
 assert.match(logic,/viewBlocked"\)\.addEventListener\("click"/);
 assert.match(logic,/#blocked-requests/);
 assert.match(page,/id="blockedRequestsSection"/);
 assert.match(script,/focusBlockedRequests/);
 assert.match(script,/scrollIntoView/);
});

test("individual-block view explains details, external research and explicit RDAP control",()=>{
 const page=fs.readFileSync(path.join(root,"src/site-dashboard.html"),"utf8");
 const js=fs.readFileSync(path.join(root,"src/site-dashboard.js"),"utf8");
 for(const id of ["blockDetailFields","dashboardBlockDetails","blockRdapLookup","blockRdapResult","blockDetailLinks","blockDetailClose"])assert.ok(page.includes(`id="${id}"`));
 assert.match(js,/showBlock\(row\)/);
 assert.match(js,/lookupBlockedDomain/);
 assert.match(js,/noopener noreferrer/);
 assert.doesNotMatch(js,/innerHTML\s*=/);
});

test("dashboard status and individual blocks display safe match evidence and site-scope context",()=>{
 const popup=fs.readFileSync(path.join(root,"src/popup.js"),"utf8");
 const html=fs.readFileSync(path.join(root,"src/popup.html"),"utf8");
 const dash=fs.readFileSync(path.join(root,"src/site-dashboard.js"),"utf8");
 const manifest=JSON.parse(fs.readFileSync(path.join(root,"src/manifest.json"),"utf8"));
 assert.match(popup,/async function resolveWebsiteTab/);
 assert.match(popup,/site-dashboard\.html/);
 assert.match(popup,/browser\.tabs\.get\(Number\(selected\)\)/);
 assert.match(html,/id="countScope"/);
 assert.match(dash,/addDetail\("Matched filter evidence"/);
 assert.match(dash,/addDetail\("Filter engine"/);
 assert.ok(manifest.background.scripts.indexOf("rule-evidence.js")<manifest.background.scripts.indexOf("background.js"));
});

test("one click export of all and individual blocked requests includes opt-in RDAP only",()=>{
 const page=fs.readFileSync(path.join(root,"src/site-dashboard.html"),"utf8");
 const js=fs.readFileSync(path.join(root,"src/site-dashboard.js"),"utf8");
 const exporter=fs.readFileSync(path.join(root,"src/blocked-export.js"),"utf8");
 for(const id of ["dashboardExportText","dashboardExportJSON","blockExportText","blockExportJSON"])
  assert.ok(page.includes('id="'+id+'"'),id);
 assert.ok(page.indexOf('src="site-dashboard-model.js"')<page.indexOf('src="blocked-export.js"'));
 assert.ok(page.indexOf('src="blocked-export.js"')<page.indexOf('src="site-dashboard.js"'));
 assert.match(js,/DKBlockedExport\.download\(report,format\)/);
 assert.match(js,/DKBlockedExport\.build\(current,row,registrationCache\)/);
 assert.match(js,/registrationCache\.set\(DKBlockedExport\.rowKey/);
 assert.match(exporter,/URLApi\.createObjectURL\(blob\)/);
 assert.match(exporter,/anchor\.download=name/);
 assert.doesNotMatch(exporter,/fetch\(|XMLHttpRequest|navigator\.sendBeacon/);
});

test("dashboard distinguishes visible platform enforcement from ordinary blocked resources",()=>{
 const html=fs.readFileSync(path.join(root,"src/site-dashboard.html"),"utf8");
 const js=fs.readFileSync(path.join(root,"src/site-dashboard.js"),"utf8");
 assert.match(html,/id="dashboardPlaybackState"/);
 assert.match(html,/id="dashboardPlaybackEvents"/);
 assert.match(js,/YouTube refused playback \(anti-adblock enforcement\)/);
 assert.match(js,/playbackDiagnostics/);
});

test("permitted site details show a safe inspect button and reversible checkbox",()=>{
 const html=fs.readFileSync(path.join(root,"src/site-dashboard.html"),"utf8");
 const js=fs.readFileSync(path.join(root,"src/site-dashboard.js"),"utf8");
 const popup=fs.readFileSync(path.join(root,"src/popup.html"),"utf8");
 for(const id of ["allowedDetailFields","allowedDetailLinks","allowedDetailClose","dashboardAllowedList",
  "dashboardAllowedCount"])assert.ok(html.includes('id="'+id+'"'),id);
 assert.match(js,/function showAllowed\(row\)/);
 assert.match(js,/inspect\.textContent="Inspect"/);
 assert.match(js,/browser\.runtime\.sendMessage\(\{action:"setSelectiveBlock"/);
 assert.match(js,/input\.checked=!checked/);
 assert.match(popup,/id="viewAllowed"/);
 assert.doesNotMatch(js,/innerHTML\s*=/);
});

test("permitted requests have TXT/JSON exports, both all-groups and single destination",()=>{
 const html=fs.readFileSync(path.join(root,"src/site-dashboard.html"),"utf8");
 const js=fs.readFileSync(path.join(root,"src/site-dashboard.js"),"utf8");
 const src=fs.readFileSync(path.join(root,"src/allowed-export.js"),"utf8");
 for(const id of ["dashboardExportAllowedText","dashboardExportAllowedJSON","allowedExportText","allowedExportJSON"])
  assert.ok(html.includes('id="'+id+'"'),id);
 assert.ok(html.indexOf('src="site-dashboard-model.js"')<html.indexOf('src="allowed-export.js"'));
 assert.ok(html.indexOf('src="allowed-export.js"')<html.indexOf('src="site-dashboard.js"'));
 assert.match(js,/DKAllowedExport\.build\(current,selection\?\.row\|\|null\)/);
 assert.match(js,/DKAllowedExport\.download\(report,format\)/);
 assert.match(src,/createObjectURL\(blob\)/);
 assert.doesNotMatch(src,/\bfetch\(|XMLHttpRequest|sendBeacon|innerHTML\s*=/);
});

test("multi-tab export requires user confirmation and never requests a full page URL",()=>{
 const html=fs.readFileSync(path.join(root,"src/site-dashboard.html"),"utf8");
 const js=fs.readFileSync(path.join(root,"src/site-dashboard.js"),"utf8");
 for(const id of ["dashboardSessionExportText","dashboardSessionExportJSON"])
  assert.ok(html.includes('id="'+id+'"'),id);
 assert.match(js,/window\.confirm\("Export the hostname/);
 assert.match(js,/DKSessionExport\.build\(snapshots\)/);
 assert.match(js,/DKSessionExport\.download\(report,format\)/);
 assert.ok(html.indexOf('src="session-export.js"')<html.indexOf('src="site-dashboard.js"'));
});
