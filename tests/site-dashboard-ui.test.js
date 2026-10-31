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
