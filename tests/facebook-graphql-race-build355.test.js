"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path");
const source=fs.readFileSync(path.join(__dirname,"../src/meta-intelligence-ui.js"),"utf8");
const block=source.slice(source.indexOf('$("graphqlCheck").addEventListener'),source.indexOf('$("facebookCheck").addEventListener'));
test("Build 355: each GraphQL check invalidates earlier in-flight request",()=>{
 assert.match(block,/generation=\+\+graphqlRequestGeneration/);
 assert.match(block,/generation===graphqlRequestGeneration/);
});
test("Build 355: original and final tabs must be same Facebook URL",()=>{
 assert.match(block,/const tab=await browser\.tabs\.get\(tabId\)/);
 assert.match(block,/facebook\\?\.com/);
 assert.match(block,/if\(after\?\.url!==tab\.url\)/);
});
test("Build 355: GraphQL request response and errors are generation guarded",()=>{
 assert.match(block,/const result=await browser\.runtime\.sendMessage/);
 assert.match(block,/if\(!latest\(\)\)return/);
 assert.match(block,/catch\(error\)\{if\(latest\(\)\)box\.textContent/);
});
test("Build 355: GraphQL output remains fixed-key numeric summary",()=>{
 assert.match(block,/DKFacebookDiagnosticReport\.graphql\(result\)/);
 assert.match(block,/stats:clean\.counters/);
 assert.doesNotMatch(block,/innerHTML\s*=|fetch\s*\(|sendBeacon\s*\(/);
});
test("Build 355: source versions and Firefox permissions unchanged",()=>{
 const p=require("../package.json"),m=require("../src/manifest.json");
 assert.equal(p.version,m.version);
 assert.ok(m.permissions.includes("tabs"));
});
