"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path");
const from=p=>fs.readFileSync(path.join(__dirname,"..",p),"utf8"),core=from("src/facebook-full-core.js");
test("Build 359: entire MIT core retained, no competing Facebook DOM engine",()=>{
 assert.ok(core.length>130000);
 for(const fn of ["sweepUnlabeledAds","retryPendingLabels","ensureRetryLoopRunning","resolveViaReferrer",
 "noteLabelledByChange","wholePost","labelVariants","buildDiagnostics","addToPageList",
 "restorePost","sweepSections","hidePost","cacheLabelText"])
  assert.ok(core.includes("function "+fn+"("),fn);
 assert.match(from("src/meta-module.js"),/DKFacebookFullCore\?\.create/);
});
test("Build 359: complete bounded retry and site gates",()=>{
 for(const [name,n] of [["RETRY_INTERVAL_MS",50],["MAX_PENDING_LABELS",40],["RETRY_WINDOW_MS",8000]])
  assert.ok(core.includes("const "+name+" = "+n),name);
 assert.match(core,/function dkSetEnabled\(enabled\)/);
 assert.match(core,/dkExcluded\(container\) \|\| dkExcluded\(label\)/);
 const c=from("src/content.js");
 assert.match(c,/setEnabled\?\.\(active&&adRecognition&&!picking\)/);
});
test("Build 359: top-level Facebook only and permissions retained",()=>{
 const m=require("../src/manifest.json"),pkg=require("../package.json");
 assert.equal(pkg.version,m.version);assert.match(pkg.version,/^0\.3\.\d+$/);
 const s=m.content_scripts.find(s=>s.js.includes("facebook-full-core.js"));
 assert.ok(s&&!s.all_frames&&s.run_at==="document_start"&&s.css.includes("facebook-full-core.css"));
 assert.deepEqual(s.matches,["*://facebook.com/*","*://*.facebook.com/*"]);
});
test("Build 359: all ten UI switches, two Page lists and bilingual controls",()=>{
 const html=from("src/facebook-full-settings.html");
 for(const id of ["hideSponsored","hideUnlabeledAds","hideSuggested","hideUnfollowed","hideAppBanner",
 "showMarkers","placeholderMode","hideStories","hideReels","hidePeopleYouMayKnow","keepPages","adPages"])
  assert.ok(html.includes('id="'+id+'"'),id);
 assert.ok(html.includes("data-ru="));
 for(const p of ["src/options.html","src/site-dashboard.html"])
  assert.ok(from(p).includes('href="facebook-full-settings.html"'));
});
test("Build 359: original license, privacy and original popup remain",()=>{
 assert.match(from("docs/ATTRIBUTIONS.md"),/complete adapted MIT engine/);
 assert.ok(from("src/vendor/LICENSE-FACEBOOK-SPONSORED-MIT.txt").includes("MIT License"));
 assert.match(from("src/style.css"),/\.popup\{width:340px\}/);
 assert.ok(!core.includes("sendBeacon("));
});
