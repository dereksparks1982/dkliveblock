"use strict";
/* Build 405: OFFLINE evidence gate. Uses existing DK/Ghostery differential
 * harness and existing third-party license verifier; no network or browser. */
const fs=require("node:fs"),path=require("node:path");
const Catalog=require("./open-source-integration-catalog.js");
const Provenance=require("./third-party-license-gate.js");
const Differential=require("./engine-verdict-audit.js");
const ROOT=path.resolve(__dirname,"..");
const BUNDLED=["ghostery","psl","facebook-mit"];
function inspect({manifest,pkg,exists,provenance}){
 const problems=Catalog.validateCatalog(),ids=new Set(Catalog.ITEMS.map(x=>x.id));
 if(!manifest||!pkg||manifest.version!==pkg.version)
  problems.push("Manifest/package version mismatch");
 const scripts=manifest?.background?.scripts||[];
 const content=manifest?.content_scripts||[];
 const has=(path)=>typeof exists==="function"&&exists(path);
 for(const item of Catalog.ITEMS){
  if(["bundled-runtime","vendored-development"].includes(item.status))
   for(const p of item.evidence)if(!has(p))
    problems.push("Missing "+item.id+" evidence: "+p);
 }
 if(!BUNDLED.every(id=>ids.has(id)))problems.push("Missing reviewed bundled inventory");
 if(scripts.indexOf("ghostery-vendor.js")<0||
  scripts.indexOf("hybrid-engine.js")<scripts.indexOf("ghostery-vendor.js"))
  problems.push("Ghostery not loaded before hybrid engine");
 if(!scripts.includes("public-suffix.js"))
  problems.push("PSL runtime omitted");
 if(!content.some(x=>x.js?.includes("facebook-full-core.js")&&x.all_frames===false))
  problems.push("MIT Facebook DOM integration missing");
 if(pkg?.dependencies?.["@ghostery/adblocker"]!=="2.20.3")
  problems.push("Ghostery pin changed without provenance review");
 if(typeof provenance?.ok!=="boolean"||!provenance.ok)
  problems.push(...(provenance?.issues||["Provenance check unavailable"]));
 return Object.freeze({ok:problems.length===0,problems,
  statusCounts:Catalog.summarize(),bundled:BUNDLED.slice(),
  nextCandidateCount:Catalog.ITEMS.filter(x=>x.status==="planned-evaluation").length});
}
function run(root=ROOT){
 const read=path=>fs.readFileSync(require("node:path").join(root,path),"utf8");
 const manifest=JSON.parse(read("src/manifest.json")),pkg=JSON.parse(read("package.json"));
 const report=Provenance.check(Provenance.current(root));
 const verified=inspect({manifest,pkg,exists:p=>fs.existsSync(path.join(root,p)),provenance:report});
 // Reuse the established real bundled engine differential harness. Its
 // cases are deterministic synthetic *.example traffic, never user browsing.
 const diff=Differential.audit(Differential.loadEnvironment());
 const summary=Differential.summarize(diff);
 return Object.freeze({...verified,engine:{
  syntheticCases:summary.caseCount,
  categories:summary.categories,
  vendorPresent:diff.some(x=>x.vendorMatch||x.vendorException||x.vendorRedirect),
  sampledAliases:["imageset","beacon"].every(type=>
   Differential.SAMPLES.some(x=>x.type===type))
 }});
}
if(require.main===module){
 try{
  const report=run();
  console.log("DK Live Block Build 405: offline reuse-first integration audit");
  console.log(JSON.stringify(report,null,2));
  console.log("No new dependency, live engine, web request, browser run or release implied.");
  if(!report.ok)process.exitCode=1;
 }catch(error){console.error("Integration audit failed:",error.message);process.exitCode=1;}
}
module.exports={BUNDLED,inspect,run};
