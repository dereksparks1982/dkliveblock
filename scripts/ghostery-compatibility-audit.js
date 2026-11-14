"use strict";
/* DK Build 406: actual bundled upstream-vs-DK compatibility audit.
 * Offline, bounded, no browsing, no copies of third-party source. */
const fs=require("node:fs"),path=require("node:path");
const Verdict=require("./engine-verdict-audit.js");
const REQUIRED=["response-filter","cosmetic-css","scriptlets","extended","csp",
 "html-filter","redirect","serialization"];
function capabilities(){
 return Object.freeze([
  {name:"network-request",upstream:"FiltersEngine.match",
   dk:"integrated",reason:"Bundled Ghostery hybrid network matcher"},
  {name:"cosmetic-css",upstream:"FiltersEngine.getCosmeticsFilters",
   dk:"integrated-conservative",reason:"Styles only; site exceptions and selector safety"},
  {name:"dom-css",upstream:"getCosmeticsFilters({getRulesFromDOM:true})",
   dk:"integrated-conservative",reason:"Local class/id sampling; no href/text; generic-hide guard"},
  {name:"scriptlets",upstream:"getCosmeticsFilters({getInjectionRules:true})",
   dk:"disabled-by-design",reason:"List-supplied executable code requires safety and licensing review"},
  {name:"extended",upstream:"getCosmeticsFilters({getExtendedRules:true})",
   dk:"disabled-by-design",reason:"Requires separate audited procedural runtime"},
  {name:"csp",upstream:"getCSPDirectives",dk:"not-wired",
   reason:"Changing response security headers risks breakage; explicit site acceptance required"},
  {name:"html-filter",upstream:"HTML filtering / response filter",
   dk:"not-wired",reason:"Do not rewrite arbitrary HTML or media/login responses"},
  {name:"redirect",upstream:"match().redirect",
   dk:"restricted-local",reason:"Only allow noop.js for script and empty.css for stylesheet"},
  {name:"serialization",upstream:"FiltersEngine.serialize/deserialize",
   dk:"not-wired",reason:"Optional startup cache subject to freshness/version/integrity checks"},
  {name:"webextension-adapter",upstream:"@ghostery/adblocker-webextension",
   dk:"evaluated-not-installed",reason:"Would register its own browser listeners and bypass DK's current exception owner"},
  {name:"response-filter",upstream:"WebExtension HTML filtering",
   dk:"not-wired",reason:"Retain scoped DK Facebook/YouTube response filters, do not add generic rewrite"}
 ]);
}
function audit({source,hybrid,manifest,dependencies,rows}){
 const errors=[];
 if(typeof source!=="string"||!source.includes("getInjectionRules:false")||
   !source.includes("policy?.generichide!==true&&(signals.classes.length||signals.ids.length)"))
  errors.push("CSS-only or generic-hide safeguards missing");
 if(typeof hybrid!=="string"||!hybrid.includes("ghosteryType(type||")||
   !hybrid.includes("this.vendor.match(request)"))
  errors.push("Current hybrid vendor adapter missing");
 if(dependencies?.["@ghostery/adblocker"]!=="2.20.3")
  errors.push("Reviewed Ghostery pin changed");
 const scripts=manifest?.background?.scripts||[];
 if(scripts.indexOf("ghostery-vendor.js")<0||
    scripts.indexOf("ghostery-vendor.js")>=scripts.indexOf("hybrid-engine.js"))
  errors.push("Bundled upstream load order missing");
 if(!Array.isArray(rows)||rows.length<20||
    rows.some(r=>typeof r.id!=="string"||
      "url" in r||"origin" in r||"rules" in r))
  errors.push("Missing or unsafe synthetic comparison output");
 const statuses=Object.create(null);
 for(const row of capabilities())statuses[row.dk]=(statuses[row.dk]||0)+1;
 return {ok:errors.length===0,errors,checkedCases:rows?.length||0,
  statusCounts:statuses,capabilities:capabilities()};
}
function run(){
 const here=path.resolve(__dirname,".."),read=p=>fs.readFileSync(path.join(here,p),"utf8");
 const eng=Verdict.loadEnvironment(),results=Verdict.audit(eng);
 return audit({source:read("src/ghostery-cosmetics.js"),
  hybrid:read("src/hybrid-engine.js"),
  manifest:JSON.parse(read("src/manifest.json")),
  dependencies:JSON.parse(read("package.json")).dependencies,
  rows:results});
}
if(require.main===module){
 try{
  const result=run();
  console.log("DK Live Block Build 406: bundled Ghostery compatibility audit (OFFLINE)");
  console.log(JSON.stringify(result,null,2));
  if(!result.ok)process.exitCode=1;
 }catch(error){console.error("Ghostery audit failed:",error.message);process.exitCode=1;}
}
module.exports={REQUIRED,capabilities,audit,run};
