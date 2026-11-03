"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path");
const Audit=require("../scripts/checkpoint-audit.js"),root=path.resolve(__dirname,"..");
const files=()=>Object.fromEntries(Audit.FILES.map(p=>[p,fs.readFileSync(path.join(root,p),"utf8")]));
test("Build 324: source-only audit passes without browser/release claims",()=>{
 const r=Audit.inspect(root);assert.equal(r.sourceIntegrity,true,r.failures.join(", "));
 assert.equal(r.passed,r.checked);assert.equal(r.liveFirefoxVerified,false);
 assert.equal(r.fullUbuntuSuiteVerified,false);assert.equal(r.publicReleaseApproved,false);
});
test("Build 324: added browser privileges fail audit",()=>{
 const f=files(),m=JSON.parse(f["src/manifest.json"]);m.permissions.push("downloads");f["src/manifest.json"]=JSON.stringify(m);
 assert.ok(Audit.fromFiles(f).failures.includes("original-permissions-unchanged"));
});
test("Build 324: missing regression registration fails audit",()=>{
 const f=files();f["scripts/test-local.sh"]=f["scripts/test-local.sh"].replace("tests/checkpoint-audit-build324.test.js","");
 assert.ok(Audit.fromFiles(f).failures.includes("all-sixteen-build-regressions-registered"));
});
test("Build 324: broken dependency script ordering fails audit",()=>{
 const f=files();f["src/youtube-lab.html"]=f["src/youtube-lab.html"].replace('src="youtube-selection-gate.js"','src="unknown-gate.js"');
 assert.ok(Audit.fromFiles(f).failures.includes("youtube-lab-script-order"));
});
test("Build 324: remote diagnostic call and unsafe HTML sink fail audit",()=>{
 const f=files();f["src/youtube-compatibility-advice.js"]+="\nfetch('https://external.example')\n";
 assert.ok(Audit.fromFiles(f).failures.includes("new-reports-have-no-network-or-html-sinks"));
});
test("Build 324: drift between manifest and package versions fails audit",()=>{
 const f=files(),m=JSON.parse(f["src/manifest.json"]);m.version="0.0.1";f["src/manifest.json"]=JSON.stringify(m);
 assert.ok(Audit.fromFiles(f).failures.includes("consistent-semver"));
});
test("Build 324: offline audit does not run GitHub, browser or executable install tasks",()=>{
 const c=fs.readFileSync(path.join(root,"scripts/checkpoint-audit.js"),"utf8");
 assert.doesNotMatch(c,/execSync|spawnSync|browser\.tabs|https:\/\/api\.github|git\s+push/);
 assert.equal(require("../package.json").version,require("../src/manifest.json").version);
});