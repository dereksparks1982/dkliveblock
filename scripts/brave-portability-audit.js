"use strict";
/* Build 409. Developer-only adapter around Brave's official adblock-rust.
 * Reuses scripts/engine-verdict-audit.js and NEVER imports a second browser
 * engine or outputs source requests in comparison reports. */
const fs=require("node:fs"),Diff=require("./engine-verdict-audit.js");
const MAX_BYTES=128*1024;
const ENGINE="brave-adblock-rust";
const SAFARI_RULES=[
 "||ads.example^$script",
 "||tracker.example^$image",
 "@@||ads.example^$script,domain=trusted.example",
 "news.example##.ad-banner"
].join("\n");
const CAPABILITIES=Object.freeze({
 firefoxMV2:"blocking-webrequest plus optional response-body filtering",
 braveRust:"offline network verdicts plus optional Apple content-blocker conversion",
 safariContentBlocker:"declarative trigger/action JSON, compiled by Safari",
 safariWebExtension:"declarativeNetRequest and permissions, not Firefox filterResponseData",
 orionIOS:"browser/extension API support not independently verified: requires device test"
});
function corpus(){
 return {schema:1,mode:"compare",cases:Diff.SAMPLES.map(x=>({
  id:x.id,rules:x.rules,url:x.url,type:x.type,origin:x.origin,
  method:x.method||"GET"
 }))};
}
function safariCorpus(){return {schema:1,mode:"safari",rules:SAFARI_RULES};}
function readJson(file){
 if(typeof file!=="string"||!file||file.startsWith("-"))throw Error("Local JSON file required");
 const size=fs.statSync(file).size;
 if(size>MAX_BYTES||size<2)throw Error("Brave result size outside bounds");
 return JSON.parse(fs.readFileSync(file,"utf8"));
}
function validateVerdicts(report,expected=Diff.SAMPLES){
 if(!report||typeof report!=="object"||Array.isArray(report)||
  report.schema!==1||report.engine!==ENGINE||
  report.crateVersion!=="0.13.5"||!Array.isArray(report.cases)||
  report.cases.length!==expected.length||report.cases.length>96)
  throw Error("Brave engine/schema/version/case count mismatch");
 if(Object.keys(report).some(k=>!["schema","engine","crateVersion","cases"].includes(k)))
  throw Error("Brave report contains unexpected fields");
 const allowed=new Set(expected.map(x=>x.id)),seen=new Set();
 for(const row of report.cases){
  if(!row||typeof row!=="object"||Array.isArray(row)||
   typeof row.id!=="string"||!allowed.has(row.id)||seen.has(row.id)||
   typeof row.blocked!=="boolean"||typeof row.exception!=="boolean"||
   typeof row.redirect!=="boolean"||
   Object.keys(row).some(k=>!["id","blocked","exception","redirect"].includes(k)))
   throw Error("Unexpected, duplicate or privacy-unsafe Brave verdict");
  seen.add(row.id);
 }
 return true;
}
function compare(report,reference){
 validateVerdicts(report);
 const original=reference||Diff.audit(Diff.loadEnvironment());
 if(!Array.isArray(original)||original.length!==Diff.SAMPLES.length)
  throw Error("DK comparison baseline unavailable");
 const brave=new Map(report.cases.map(x=>[x.id,x]));
 const byId=new Map(original.map(x=>[x.id,x]));
 const results=[],totals={agree:0,disagree:0,policyExcluded:0,redirectNeedsReview:0};
 for(const row of Diff.SAMPLES){
  const b=brave.get(row.id),dk=byId.get(row.id);
  if(!dk||typeof dk.productionBlock!=="boolean")
   throw Error("DK comparison baseline incomplete");
  const parity=!Diff.eligible(row)?"policy-excluded":
   b.redirect?"redirect-needs-review":
   b.blocked===dk.productionBlock?"agree":"disagree";
  if(parity==="agree")totals.agree++;
  else if(parity==="disagree")totals.disagree++;
  else if(parity==="policy-excluded")totals.policyExcluded++;
  else totals.redirectNeedsReview++;
  results.push(Object.freeze({id:row.id,parity,
   braveBlocked:b.blocked,dkProductionBlocked:dk.productionBlock,
   dkNativeBlocked:dk.nativeBlock,
   dkGhosteryBlocked:dk.vendorMatch&&!dk.vendorException,
   braveException:b.exception,braveRedirect:b.redirect}));
 }
 return Object.freeze({schema:1,scope:"synthetic-offline-only",
  braveCrateVersion:report.crateVersion,counts:totals,cases:results,
  verifiedBrowser:false,productionPolicyChanged:false});
}
function safariSummary(report){
 if(!report||report.schema!==1||report.engine!==ENGINE||
  report.crateVersion!=="0.13.5"||
  report.format!=="apple-content-blocker-v1"||
  !Number.isSafeInteger(report.inputRuleLines)||report.inputRuleLines!==4||
  !Number.isSafeInteger(report.convertedSourceRuleCount)||
  report.convertedSourceRuleCount<0||report.convertedSourceRuleCount>4||
  !Array.isArray(report.rules)||report.rules.length>1024)
  throw Error("Unexpected Brave Safari content-blocker export");
 if(Object.keys(report).some(k=>!["schema","engine","crateVersion","format",
  "inputRuleLines","convertedSourceRuleCount","rules"].includes(k)))
  throw Error("Unexpected Safari output fields");
 const actions=Object.create(null);
 for(const rule of report.rules){
  if(!rule||typeof rule!=="object"||Array.isArray(rule)||
   !rule.action||!rule.trigger||
   typeof rule.action.type!=="string"||
   !["block","block-cookies","css-display-none","ignore-previous-rules",
     "make-https","notify"].includes(rule.action.type)||
   typeof rule.trigger["url-filter"]!=="string"||
   rule.trigger["url-filter"].length>2048)
   throw Error("Invalid or unexpected Apple content-blocker rule shape");
  actions[rule.action.type]=(actions[rule.action.type]||0)+1;
 }
 return Object.freeze({schema:1,scope:"synthetic-uninstalled-export",
  inputRuleLines:4,convertedSourceRuleCount:report.convertedSourceRuleCount,
  outputRuleCount:report.rules.length,actionTypes:actions,
  safariInstalled:false,orionSupported:null,firefoxEngineModified:false});
}
function main(argv=process.argv.slice(2)){
 const mode=argv[0];
 if(mode==="--corpus"&&argv.length===1)console.log(JSON.stringify(corpus()));
 else if(mode==="--safari-corpus"&&argv.length===1)console.log(JSON.stringify(safariCorpus()));
 else if(mode==="--compare"&&argv.length===2)
  console.log(JSON.stringify(compare(readJson(argv[1])),null,2));
 else if(mode==="--safari-report"&&argv.length===2)
  console.log(JSON.stringify(safariSummary(readJson(argv[1])),null,2));
 else if(mode==="--capabilities"&&argv.length===1)
  console.log(JSON.stringify(CAPABILITIES,null,2));
 else throw Error("Usage: --corpus | --compare FILE | --safari-corpus | --safari-report FILE | --capabilities");
}
if(require.main===module){try{main();}catch(e){console.error("Build 409:",e.message);process.exitCode=1;}}
module.exports={ENGINE,SAFARI_RULES,CAPABILITIES,corpus,safariCorpus,validateVerdicts,
 compare,safariSummary,readJson,main};
