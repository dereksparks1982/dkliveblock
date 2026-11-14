"use strict";
/* Build 411: offline-only Ghostery scriptlet capability comparison. Never
 * execute, print, store, forward or install returned third-party script code. */
const fs=require("node:fs"),path=require("node:path");
const S=require("../src/safe-scriptlet-rules.js");
const Diff=require("./engine-verdict-audit.js");
const ORIGIN="audit.example";
const SCENARIOS=Object.freeze([
 ["scoped-basic","audit.example##+js(set-constant, adblockDetected, false)","audit.example",["adblockDetected"]],
 ["scoped-child","audit.example##+js(set-constant, adblockDetected, false)","child.audit.example",["adblockDetected"]],
 ["foreign-host","audit.example##+js(set-constant, adblockDetected, false)","audit.example.attacker.test",[]],
 ["all-exception","audit.example##+js(set-constant, adblockDetected, false)\naudit.example#@#+js()","audit.example",[]],
 ["exact-exception","audit.example##+js(set-constant, adblockDetected, false)\naudit.example#@#+js(set-constant, adblockDetected, false)","audit.example",[]],
 ["unrelated-exception","audit.example##+js(set-constant, adblockDetected, false)\nother.example#@#+js()","audit.example",["adblockDetected"]],
 ["sibling-properties","audit.example##+js(set-constant, app.one, false)\naudit.example##+js(set-constant, app.two, true)","audit.example",["app.one","app.two"]],
 ["parent-first","audit.example##+js(set-constant, app, false)\naudit.example##+js(set-constant, app.one, true)","audit.example",["app"]],
 ["child-first","audit.example##+js(set-constant, app.one, true)\naudit.example##+js(set-constant, app, false)","audit.example",["app.one"]],
 ["deep-ancestor","audit.example##+js(set-constant, app.one.two, true)\naudit.example##+js(set-constant, app.one, false)","audit.example",["app.one.two"]],
 ["exception-frees-ancestor","audit.example##+js(set-constant, app, true)\naudit.example##+js(set-constant, app.one, false)\naudit.example#@#+js(set-constant, app, true)","audit.example",["app.one"]],
 ["avoid-prefix-matching","audit.example##+js(set-constant, app.one, true)\naudit.example##+js(set-constant, apple, false)","audit.example",["app.one","apple"]],
 ["prototype-method","audit.example##+js(set-constant, app.toString, false)","audit.example",[]],
 ["prototype-internal","audit.example##+js(abort-on-property-read, app.__defineGetter__)","audit.example",[]],
 ["arbitrary-script","audit.example##+js(prevent-fetch, tracking, false)","audit.example",[]],
 ["user-authored-only","audit.example##+js(set-constant, app.enabled, false)\naudit.example##+js(abort-on-property-read, app.detect)","audit.example",["app.enabled","app.detect"]]
]);
const FIXTURE_LIST=Object.freeze([
 "audit.example##.promotion",
 "audit.example##+js(set-constant, adblockDetected, false)",
 "audit.example##+js(abort-on-property-read, trackingProbe)"
]);
function manualAudit(scenarios=SCENARIOS){
 if(!Array.isArray(scenarios)||scenarios.length>32)throw Error("Bounded synthetic fixtures required");
 const results=[];
 for(const [id,rules,host,expected] of scenarios){
  if(typeof id!=="string"||!/^[a-z0-9-]{1,48}$/.test(id)||
    typeof rules!=="string"||rules.length>2000||
    typeof host!=="string"||!Array.isArray(expected)||
    expected.length>24||expected.some(p=>typeof p!=="string"||p.length>120))
   throw Error("Invalid offline fixture");
  const actual=S.select(rules,host).map(x=>x.path);
  results.push(Object.freeze({id,passed:actual.length===expected.length&&
   actual.every((x,i)=>x===expected[i]),selected:actual.length}));
 }
 return Object.freeze({checked:results.length,failed:results.filter(x=>!x.passed).length,
  results:Object.freeze(results)});
}
function probe(vendor){
 if(typeof vendor?.FiltersEngine?.parse!=="function")
  throw Error("Bundled Ghostery parser unavailable");
 const engine=vendor.FiltersEngine.parse(FIXTURE_LIST.join("\n"));
 if(typeof engine?.getCosmeticsFilters!=="function")
  throw Error("Bundled Ghostery cosmetic API unavailable");
 // This optional API request is ONLY in this standalone offline audit, never
 // in the Firefox cosmetics adapter or MAIN-world runtime.
 const out=engine.getCosmeticsFilters({
  hostname:ORIGIN,domain:ORIGIN,url:"https://"+ORIGIN+"/",
  getBaseRules:false,getInjectionRules:true,getExtendedRules:false,
  getRulesFromDOM:false,getRulesFromHostname:true
 });
 if(!out||!Array.isArray(out.scripts)||!Array.isArray(out.extended)||
  typeof out.styles!=="string"||out.scripts.length>50||out.extended.length>50)
  throw Error("Unexpected upstream response shape");
 // Do not return any executable text or scriptlet name.
 return Object.freeze({apiReachable:true,scriptletItems:out.scripts.length,
  unsupportedExtendedItems:out.extended.length,
  returnedScriptsDiscarded:true,executed:false});
}
function inspect({manifest,pkg,cosmeticSource,runtimeSource,parserSource,attributions,
 manual=manualAudit(),ghostery={apiReachable:false,returnedScriptsDiscarded:true,executed:false}}){
 const problems=[],scripts=manifest?.background?.scripts||[],
  mainWorld=(manifest?.content_scripts||[]).filter(x=>x.world==="MAIN"&&
    x.js?.includes("safe-scriptlet-runtime.js"));
 if(manifest?.version!==pkg?.version)problems.push("Manifest/package versions differ");
 if(pkg?.dependencies?.["@ghostery/adblocker"]!=="2.20.3")
  problems.push("Ghostery dependency pin changed");
 if(scripts.indexOf("ghostery-vendor.js")<0||
   scripts.indexOf("hybrid-engine.js")<=scripts.indexOf("ghostery-vendor.js"))
  problems.push("Bundled vendor startup order missing");
 if(scripts.indexOf("safe-scriptlet-rules.js")<0||mainWorld.length!==1||
   mainWorld[0].run_at!=="document_start")
  problems.push("Reviewed site-scoped user runtime missing");
 if(typeof cosmeticSource!=="string"||
   !cosmeticSource.includes("getInjectionRules:false")||
   cosmeticSource.includes("getInjectionRules:true")||
   !cosmeticSource.includes("getExtendedRules:false"))
  problems.push("Production Ghostery executable injection must remain disabled");
 if(typeof runtimeSource!=="string"||
   !runtimeSource.includes("abort-on-property-read")||
   !runtimeSource.includes("set-constant")||
   !runtimeSource.includes("Object.defineProperty")||
   !runtimeSource.includes("function restore(")||
   /(?:\beval\s*\(|new Function\s*\(|\bfetch\s*\()/.test(runtimeSource))
  problems.push("Bounded reversible MAIN-world user runtime changed");
 if(typeof parserSource!=="string"||
   !parserSource.includes("pathConflict(rule.path,paths)")||
   !parserSource.includes('"__defineGetter__"'))
  problems.push("Manual path conflicts or prototype exclusions missing");
 if(typeof attributions!=="string"||!attributions.includes("MPL")||
   !attributions.includes("GPL"))
  problems.push("Third-party license and provenance distinction missing");
 if(!manual||manual.checked!==SCENARIOS.length||manual.failed!==0||
   !Array.isArray(manual.results)||manual.results.some(x=>!x.passed))
  problems.push("Manual scriptlet compatibility fixtures failed");
 if(ghostery?.returnedScriptsDiscarded!==true||ghostery?.executed!==false)
  problems.push("Upstream executable scripts must never be retained or run");
 return Object.freeze({ok:!problems.length,problems,
  manualCases:manual?.checked||0,manualFailures:manual?.failed??null,
  ghosteryProbe:Object.freeze({
   apiReachable:ghostery?.apiReachable===true,
   scriptletItems:Number.isInteger(ghostery?.scriptletItems)?ghostery.scriptletItems:null,
   returnedScriptsDiscarded:ghostery?.returnedScriptsDiscarded===true
  }),
  approvedManualOperations:Object.freeze(["set-constant","abort-on-property-read"]),
  automaticSubscriptionScriptlets:false,arbitraryScriptEvaluation:false,
  upstreamGPLCodeImported:false,newBrowserPermissions:false,
  verifiedInFirefox:false,releaseGate:"not-approved"});
}
function run(){
 const root=path.resolve(__dirname,".."),read=p=>fs.readFileSync(path.join(root,p),"utf8");
 const env=Diff.loadEnvironment();
 return inspect({manifest:JSON.parse(read("src/manifest.json")),
  pkg:JSON.parse(read("package.json")),
  cosmeticSource:read("src/ghostery-cosmetics.js"),
  parserSource:read("src/safe-scriptlet-rules.js"),
  runtimeSource:read("src/safe-scriptlet-runtime.js"),
  attributions:read("docs/ATTRIBUTIONS.md"),
  manual:manualAudit(),ghostery:probe(env.DKGhosteryVendor)});
}
function main(argv=process.argv.slice(2)){
 if(argv.length)throw Error("Offline capability audit takes no file or URL arguments");
 const report=run();console.log(JSON.stringify(report,null,2));
 if(!report.ok)process.exitCode=1;
}
if(require.main===module){
 try{main();}catch(e){console.error("Build 411 scriptlet audit:",e.message);process.exitCode=1;}
}
module.exports={SCENARIOS,FIXTURE_LIST,manualAudit,probe,inspect,run,main};
