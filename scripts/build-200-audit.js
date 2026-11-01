"use strict";
/* Build 200: local, read-only source candidate audit. No browsing or network. */
const fs=require("node:fs"),path=require("node:path");
const Verdict=require("./engine-verdict-audit.js");
const Coverage=require("./filter-coverage-audit.js");
const ROOT=path.resolve(__dirname,"..");
function audit(){
 const manifest=JSON.parse(fs.readFileSync(path.join(ROOT,"src/manifest.json"),"utf8"));
 const pkg=JSON.parse(fs.readFileSync(path.join(ROOT,"package.json"),"utf8"));
 if(manifest.version!==pkg.version)throw Error("Version contract mismatch");
 const decisions=Verdict.audit(Verdict.loadEnvironment());
 const totals=Verdict.summarize(decisions);
 if(totals.caseCount<13)throw Error("Synthetic verdict coverage decreased");
 const coverage=Coverage.bundled();
 return Object.freeze({build:200,version:pkg.version,
  syntheticVerdictCases:totals.caseCount,
  vettedLocalRedirects:totals.categories.vendor_vetted_redirect_applied||0,
  unsupportedRedirects:totals.categories.vendor_redirect_unsupported||0,
  bundledFilterFiles:coverage.files,
  bundledRulesConsidered:coverage.report.considered,
  bundledRulesNativeSupported:coverage.report.supported,
  fullUbuntuSuiteVerified:false,liveFirefoxVerified:false,
  adFreeYouTubeVerified:false,competitorParityVerified:false,
  publicReleaseApproved:false,
  note:"Source audit only. No Firefox playback, actual ad removal or competitor parity verified."});
}
if(require.main===module){
 try{process.stdout.write(JSON.stringify(audit(),null,2)+String.fromCharCode(10));}
 catch(_){console.error("Local candidate source audit failed.");process.exitCode=1;}
}
module.exports={audit};
