"use strict";
/* Build 405: explicit reuse-first component inventory.
 * Status is about DK's actual installation, not upstream popularity.
 * Metadata review: 2026-11-13. Recheck per-file licenses before copying. */
const ITEMS=Object.freeze([
 {id:"ghostery",repo:"ghostery/adblocker",license:"MPL-2.0",
  status:"bundled-runtime",priority:"P0",capability:"Network and cosmetic filter engine",
  evidence:["src/ghostery-vendor.js","src/ghostery-cosmetics.js","src/LICENSE-GHOSTERY.txt"],
  next:"Extend supported upstream rule semantics and test Firefox adapter boundaries."},
 {id:"psl",repo:"publicsuffix/list",license:"MPL-2.0",
  status:"bundled-runtime",priority:"P0",capability:"Public suffix / domain scoping",
  evidence:["src/public-suffix.js","src/LICENSE-PSL.txt","vendor/public_suffix_list.dat"],
  next:"Pin canonical-data provenance and add freshness/reproducibility checks."},
 {id:"facebook-mit",repo:"",license:"MIT",
  status:"bundled-runtime",priority:"P0",capability:"Facebook complete Sponsored DOM detection",
  evidence:["src/facebook-full-core.js","src/vendor/facebook-sponsored-upstream.js",
   "src/vendor/LICENSE-FACEBOOK-SPONSORED-MIT.txt"],
  next:"Preserve MIT notice, run organic-post and scroll acceptance before altering."},
 {id:"micrograd",repo:"karpathy/micrograd",license:"MIT",
  status:"vendored-development",priority:"P2",capability:"Offline tiny-gradient model prototyping",
  evidence:["scripts/vendor/micrograd/micrograd/engine.py",
   "scripts/vendor/micrograd/LICENSE"],
  next:"Only use as offline experimental code; keep synthetic scores review-only."},
 {id:"brave",repo:"brave/adblock-rust",license:"MPL-2.0",
  status:"planned-evaluation",priority:"P1",capability:"Offline engine differential benchmark and Safari format conversion feasibility",
  evidence:[],next:"Compare in a separate developer-only tool; do not ship a second live Firefox engine."},
 {id:"mljs",repo:"mljs/ml",license:"MIT",
  status:"planned-evaluation",priority:"P1",capability:"Offline supervised Nesty evaluation",
  evidence:[],next:"Require real labeled privacy-safe corpus, holdouts, false-positive benchmark and rollback."},
 {id:"onnx",repo:"microsoft/onnxruntime",license:"MIT",
  status:"deferred",priority:"P3",capability:"Optional local WASM inference",
  evidence:[],next:"Use only if a measured compact trained model beats current deterministic scoring."},
 {id:"transformers",repo:"huggingface/transformers.js",license:"Apache-2.0 (code); model weights vary",
  status:"deferred",priority:"P3",capability:"Optional local model runtime",
  evidence:[],next:"Review model licenses, package size, CSP, memory and performance first."},
 {id:"adguard-scriptlets",repo:"AdguardTeam/Scriptlets",license:"GPL-3.0",
  status:"reference-only",priority:"P1",capability:"Anti-circumvention/scriptlet syntax examples",
  evidence:[],next:"Do not copy into DK custom-licensed distribution absent a license decision."},
 {id:"adguard-extra",repo:"AdguardTeam/AdGuardExtra",license:"Repository license unclear; per-file review",
  status:"reference-only",priority:"P2",capability:"Site-specific anti-circumvention patterns",
  evidence:[],next:"Review exact files and notices before proposing any reuse."},
 {id:"adguard-tsurlfilter",repo:"AdguardTeam/tsurlfilter",license:"GPL-3.0",
  status:"reference-only",priority:"P2",capability:"Filter AST / DNR comparison",
  evidence:[],next:"Research-only; GPL compatibility decision required for code integration."},
 {id:"ublock-assets",repo:"uBlockOrigin/uAssets",license:"GPL-3.0",
  status:"reference-only",priority:"P1",capability:"Ad filtering cases and compatibility regressions",
  evidence:[],next:"Do not copy GPL filters or scriptlets into DK without compatible licensing."},
 {id:"privacy-badger",repo:"EFForg/privacybadger",license:"Per-file GPL family review required",
  status:"reference-only",priority:"P2",capability:"Tracker observation and breakage-recovery design",
  evidence:[],next:"Research reference only; do not ship copied code or make speculative owner blocks."},
 {id:"tracker-radar",repo:"duckduckgo/tracker-radar",license:"Data license requires separate review",
  status:"reference-only",priority:"P2",capability:"Ownership and tracker evidence",
  evidence:[],next:"Research company data only; validate CC BY-NC-SA/data terms and freshness."},
 {id:"privacy-config",repo:"duckduckgo/privacy-configuration",license:"Data license requires separate review",
  status:"reference-only",priority:"P2",capability:"Breakage exceptions and browser capability patterns",
  evidence:[],next:"Research-only until dataset and redistribution rights are established."},
 {id:"abp-anti-cv",repo:"abp-filters/abp-filters-anti-cv",license:"GPL-3.0",
  status:"archived-reference",priority:"P3",capability:"Historical anti-circumvention test ideas",
  evidence:[],next:"Archived as of 2026-11-13; do not add as active production dependency."}
]);
const STATUSES=Object.freeze(["bundled-runtime","vendored-development","planned-evaluation",
 "reference-only","deferred","archived-reference"]);
const PRIORITIES=Object.freeze(["P0","P1","P2","P3"]);
function validateCatalog(items=ITEMS){
 if(!Array.isArray(items)||items.length<3||items.length>40)return ["Invalid catalog length"];
 const errors=[],seen=new Set();
 for(const row of items){
  if(!row||typeof row.id!=="string"||!/^[a-z0-9-]+$/.test(row.id)||seen.has(row.id))
   errors.push("Duplicate/malformed component id");
  else seen.add(row.id);
  if(!STATUSES.includes(row.status))errors.push("Unknown status: "+row.id);
  if(!PRIORITIES.includes(row.priority))errors.push("Unknown priority: "+row.id);
  if(typeof row.license!=="string"||!row.license||typeof row.next!=="string"||!row.next)
   errors.push("Incomplete decision: "+row.id);
  if(!Array.isArray(row.evidence)||row.evidence.length>8)
   errors.push("Invalid evidence: "+row.id);
  if(row.status==="bundled-runtime"&&!row.evidence?.length)
   errors.push("Bundled component missing local evidence: "+row.id);
  if(row.status!=="bundled-runtime"&&row.status!=="vendored-development"&&
     row.evidence?.length)errors.push("Uninstalled component falsely claims files: "+row.id);
  if(row.repo&& !/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(row.repo))
   errors.push("Malformed upstream path: "+row.id);
 }
 return errors;
}
function summarize(items=ITEMS){
 const out=Object.fromEntries(STATUSES.map(k=>[k,0]));
 for(const row of items){if(row.status in out)out[row.status]++;}
 return Object.freeze(out);
}
const API=Object.freeze({ITEMS,STATUSES,PRIORITIES,validateCatalog,summarize});
module.exports=API;
