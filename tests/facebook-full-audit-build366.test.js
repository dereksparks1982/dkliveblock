"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path");
const Audit=require("../scripts/checkpoint-audit.js"),root=path.join(__dirname,"..");
function files(){return Object.fromEntries(Audit.FILES.map(p=>[p,fs.readFileSync(path.join(root,p),"utf8")]))}
test("Build 366: full upstream runtime and ten subsystems source audit",()=>{
 const a=Audit.inspect(root);
 assert.equal(a.sourceIntegrity,true,a.failures.join(", "));
 assert.ok(a.checked>=30);
 assert.equal(a.liveFirefoxVerified,false);
});
test("Build 366: removing full Facebook runtime fails the audit",()=>{
 const f=files(),m=JSON.parse(f["src/manifest.json"]);
 m.content_scripts=m.content_scripts.filter(x=>!x.js.includes("facebook-full-core.js"));
 f["src/manifest.json"]=JSON.stringify(m);
 assert.ok(Audit.fromFiles(f).failures.includes("full-facebook-runtime-injected-first"));
});
test("Build 366: deleting complete unlabeled-ad sweep fails the audit",()=>{
 const f=files();
 f["src/facebook-full-core.js"]=f["src/facebook-full-core.js"].replace("function sweepUnlabeledAds(","function sweepDisabledAds(");
 assert.ok(Audit.fromFiles(f).failures.includes("full-facebook-ten-mechanisms"));
});
test("Build 366: losing site-pause guard and missing user controls fail",()=>{
 const f=files();
 f["src/facebook-full-core.js"]=f["src/facebook-full-core.js"].replace("observer.disconnect(); dkObserverActive = false","dkObserverActive = false");
 f["src/facebook-full-settings.html"]=f["src/facebook-full-settings.html"].replace('id="keepPages"','id="lostKeepPages"');
 const issues=Audit.fromFiles(f).failures;
 assert.ok(issues.includes("full-facebook-preferences-pause-and-observer"));
 assert.ok(issues.includes("full-facebook-user-control-surface"));
});
test("Build 366: registration removal is detected and versions synced",()=>{
 const f=files(),m=require("../src/manifest.json");
 f["scripts/test-local.sh"]=f["scripts/test-local.sh"].replace("tests/facebook-hide-reasons-build365.test.js","");
 assert.ok(Audit.fromFiles(f).failures.includes("full-facebook-all-regressions-registered"));
 assert.equal(m.version,require("../package.json").version);
});
