"use strict";
/* DK Live Block source-only checkpoint; no browser, GitHub Actions, telemetry,
 * network, file mutation, release or ad-block effectiveness claim. */
const fs=require("node:fs"),path=require("node:path");
const TESTS=Object.freeze(["facebook-added-nodes-build309","facebook-triage-build310","facebook-label-priority-build311","nesty-signal-limits-build312","youtube-site-family-build313","youtube-manual-outcome-build314","layout-stale-cleanup-build315","layout-route-integrity-build316","layout-cleanup-scout-build317","layout-compare-pending-build318","youtube-selection-integrity-build319","youtube-compat-advice-build320","facebook-organic-boundaries-build321","ui-language-build322","facebook-locale-triage-build323","checkpoint-audit-build324"]);
const POST_324_TESTS=Object.freeze(["facebook-scan-fairness-build325","facebook-portal-tail-build326","facebook-russian-ads-build327","facebook-russian-segments-build328","checkpoint-audit-build329","facebook-english-segments-build330","facebook-cursor-report-build331","facebook-diagnostic-race-build332","meta-readonly-locale-build333","facebook-marketplace-fast-guard-build334","facebook-editor-descendant-build335","facebook-fast-label-tail-build336","facebook-rail-rotation-build337","facebook-marketplace-rotation-build338","facebook-priority-tail-build339","regression-fixture-contract-build340","checkpoint-extended-build341","facebook-extra-editor-guard-build342","facebook-last-insert-build343","facebook-rail-editor-build344"]);
const FILES=Object.freeze(["package.json","src/manifest.json","scripts/test-local.sh","README.md","src/style.css","src/site-dashboard.html","src/youtube-lab.html","src/meta-intelligence.html","src/facebook-diagnostic-report.js","src/youtube-compatibility-advice.js","src/youtube-manual-outcome.js","src/youtube-selection-gate.js","src/layout-reflow.js","src/nesty-layout-scout.js","src/nesty-intelligence.js","src/youtube-lab-ui.js","src/meta-intelligence-ui.js","src/facebook-ads.js","src/meta-agent-nesty.js"]);
const PERMISSIONS=Object.freeze(["webRequest","webRequestBlocking","tabs","storage","browserSettings","alarms","<all_urls>","webNavigation","contextMenus","proxy","dns"]);
const DIAGNOSTICS=Object.freeze(["youtube-compatibility-advice.js","youtube-manual-outcome.js","youtube-selection-gate.js","facebook-diagnostic-report.js","ui-language-tools.js"]);
function ordered(html,names){let prev=-1;for(const name of names){const at=html.indexOf('src="'+name+'"');if(at<=prev)return false;prev=at;}return true;}
function fromFiles(files){
 const checks=[],get=name=>typeof files?.[name]==="string"?files[name]:"";
 const test=(id,yes)=>checks.push(Object.freeze({id,pass:yes===true}));
 let pkg=null,manifest=null;
 try{pkg=JSON.parse(get("package.json"));manifest=JSON.parse(get("src/manifest.json"));}catch(_){}
 test("json-parses",!!pkg&&!!manifest);
 const version=typeof pkg?.version==="string"?pkg.version:null;
 test("consistent-semver",!!version&&/^0\.3\.\d+$/.test(version)&&manifest?.version===version);
 const perms=manifest?.permissions;
 test("original-permissions-unchanged",Array.isArray(perms)&&JSON.stringify([...perms].sort())===JSON.stringify([...PERMISSIONS].sort()));
 test("optional-privileges-unchanged",JSON.stringify([...(manifest?.optional_permissions||[])].sort())===JSON.stringify(["nativeMessaging","devtools"].sort()));
 test("no-required-data-collection",JSON.stringify(manifest?.browser_specific_settings?.gecko?.data_collection_permissions?.required)==='["none"]');
 const content=(manifest?.content_scripts||[]).flatMap(row=>Array.isArray(row.js)?row.js:[]);
 const background=manifest?.background?.scripts||[];
 test("diagnostics-are-extension-ui-only",DIAGNOSTICS.every(name=>!content.includes(name)&&!background.includes(name)));
 test("ad-content-script-order",ordered(content.map(name=>'src="'+name+'"').join("\n"),["facebook-ads.js","meta-module.js","content.js"]));
 test("youtube-dashboard-script-order",ordered(get("src/site-dashboard.html"),["youtube-triage.js","youtube-outcome.js","youtube-compatibility-advice.js","youtube-report.js","site-dashboard.js"]));
 test("youtube-lab-script-order",ordered(get("src/youtube-lab.html"),["ui-language.js","youtube-lab.js","youtube-manual-outcome.js","youtube-selection-gate.js","youtube-lab-ui.js"]));
 test("facebook-diagnostic-script-order",ordered(get("src/meta-intelligence.html"),["ui-language-tools.js","ui-language.js","facebook-diagnostic-report.js","meta-intelligence-ui.js"]));
 test("all-sixteen-build-regressions-registered",TESTS.every(name=>get("scripts/test-local.sh").includes("tests/"+name+".test.js")));
 test("post-324-regressions-registered",POST_324_TESTS.every(name=>get("scripts/test-local.sh").includes("tests/"+name+".test.js")));
 const facebook=get("src/facebook-ads.js"),agent=get("src/meta-agent-nesty.js");
 test("facebook-rotation-caps-preserved",["Math.min(240,cards.length)","Math.min(2400,bylines.length)","Math.min(1200,refs.length)"].every(x=>facebook.includes(x)));
 test("facebook-portal-budget-preserved",facebook.includes("for(let i=0;i<6;i++)out.push(nodes[i])")&&facebook.includes("max!==12"));
 test("guarded-russian-ad-label-scope",facebook.includes('s==="реклама"')&&facebook.includes('s==="спонсировано"')&&agent.includes("russianSignatures"));

 test("approved-popup-width",get("src/style.css").includes(".popup{width:340px}"));
 test("opt-in-grid-css-unchanged",get("src/layout-reflow.js").includes("grid-template-columns:repeat(auto-fill,minmax(min(100%,210px),1fr))"));
 test("nesty-remains-review-only",get("src/nesty-intelligence.js").includes('automaticRules:false')&&get("src/nesty-layout-scout.js").includes('automaticRules:false'));
 const risky=/\b(?:fetch|XMLHttpRequest|sendBeacon)\s*\(|\binnerHTML\s*=/;
 test("new-reports-have-no-network-or-html-sinks",["src/facebook-diagnostic-report.js","src/youtube-compatibility-advice.js","src/youtube-manual-outcome.js","src/youtube-selection-gate.js"].every(name=>get(name).length>100&&!risky.test(get(name))));
 test("no-checkpoint-build-diary-in-public-readme",!get("README.md").includes("**Build 299 localization candidate")&&!get("README.md").includes("**Build 324 verification candidate"));
 test("checkpoint-command-available",pkg?.scripts?.["audit:checkpoint"]==="node scripts/checkpoint-audit.js");
 const failures=checks.filter(c=>!c.pass).map(c=>c.id);
 return Object.freeze({version:version||"unknown",checked:checks.length,passed:checks.length-failures.length,failures:Object.freeze(failures),sourceIntegrity:failures.length===0,liveFirefoxVerified:false,fullUbuntuSuiteVerified:false,publicReleaseApproved:false});
}
function inspect(root){
 const files={};
 for(const name of FILES){try{files[name]=fs.readFileSync(path.join(root,name),"utf8");}catch(_){files[name]="";}}
 return fromFiles(files);
}
if(require.main===module){
 const result=inspect(path.resolve(__dirname,".."));
 process.stdout.write(JSON.stringify(result,null,2)+"\n");
 process.exitCode=result.sourceIntegrity?0:1;
}
module.exports=Object.freeze({FILES,TESTS,POST_324_TESTS,PERMISSIONS,fromFiles,inspect});
