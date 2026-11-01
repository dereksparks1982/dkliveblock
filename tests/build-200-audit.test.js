"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path");
const Build=require("../scripts/build-200-audit.js");
test("Build 200 local source audit never claims unverified real-world success",()=>{
 const report=Build.audit();
 const manifest=JSON.parse(fs.readFileSync(path.join(__dirname,"../src/manifest.json"),"utf8"));
 assert.equal(report.build,200);
 assert.equal(report.version,manifest.version);
 assert.ok(report.syntheticVerdictCases>=13);
 assert.ok(report.bundledFilterFiles>=1);
 assert.ok(report.bundledRulesConsidered>=report.bundledRulesNativeSupported);
 for(const key of ["fullUbuntuSuiteVerified","liveFirefoxVerified","adFreeYouTubeVerified",
  "competitorParityVerified","publicReleaseApproved"])assert.equal(report[key],false);
 const output=JSON.stringify(report);
 assert.equal(output.includes("https://"),false);
 assert.equal(output.includes("watch?v="),false);
});
test("Build 200 audit belongs to the local seven-phase runner, not GitHub Actions",()=>{
 const source=fs.readFileSync(path.join(__dirname,"../scripts/test-local.sh"),"utf8");
 assert.ok(source.includes("tests/build-200-audit.test.js"));
 assert.ok(source.includes("node scripts/build-200-audit.js"));
 assert.equal(source.includes("set -e"),false);
});
