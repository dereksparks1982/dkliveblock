"use strict";
/* Offline integrity gate for previously reviewed upstream components.
 * Not legal advice or a complete transitive dependency license audit. */
const fs=require("node:fs"),path=require("node:path"),crypto=require("node:crypto");
const ROOT=path.resolve(__dirname,"..");
const SHA="ad116ca8d04d716bda3d02e19a35137428b71ae13c6c1f390600830cd8d7e0f9";
const PINNED=Object.freeze({
 dependencies:{"@ghostery/adblocker":"2.20.3"},
 devDependencies:{"esbuild":"0.25.12"}
});
const NOTICES=Object.freeze({
 "src/LICENSE-GHOSTERY.txt":"Mozilla Public License Version 2.0",
 "src/LICENSE-PSL.txt":"Mozilla Public License Version 2.0",
 "src/vendor/LICENSE-FACEBOOK-SPONSORED-MIT.txt":"MIT License",
 "src/facebook-full-core.js":"Copyright (c) 2026 Inky",
 "src/vendor/facebook-sponsored-upstream.js":"function wholePost(",
 "src/ghostery-vendor.js":"DKGhosteryVendor"
});
function check(input){
 const issues=[],fail=x=>issues.push(x);
 const pkg=input?.pkg,manifest=input?.manifest,sources=input?.sources||{};
 if(!pkg||!manifest)return {ok:false,issues:["Missing package or manifest"]};
 if(pkg.version!==manifest.version)fail("Package and manifest versions differ");
 for(const [group,approved] of Object.entries(PINNED)){
  const got=pkg[group]||{};
  if(Object.keys(got).sort().join("|")!==Object.keys(approved).sort().join("|"))
   fail(group+" requires upstream license review");
  for(const [name,version] of Object.entries(approved))
   if(got[name]!==version)fail(name+" reviewed version changed");
 }
 const bg=manifest.background?.scripts||[];
 const i=bg.indexOf("ghostery-vendor.js"),j=bg.indexOf("hybrid-engine.js");
 if(i<0||j<=i)fail("Ghostery manifest order invalid");
 if(!manifest.content_scripts?.some(c=>c.js?.includes("facebook-full-core.js")&&
    c.all_frames===false&&c.run_at==="document_start"))
  fail("Facebook MIT core manifest missing");
 for(const [name,needle] of Object.entries(NOTICES))
  if(typeof sources[name]!=="string"||!sources[name].includes(needle))
   fail(name+" license or origin verification failed");
 if(!String(input?.attributions||"").includes("Ghostery")||
    !String(input?.attributions||"").includes("MIT"))
  fail("Third-party attributions incomplete");
 if(input?.bundleSha256!==SHA)fail("Bundled Ghostery v2.20.3 digest changed");
 return {ok:issues.length===0,issues};
}
function current(root=ROOT){
 const read=p=>fs.readFileSync(path.join(root,p),"utf8");
 const sources={};
 for(const name of Object.keys(NOTICES))sources[name]=read(name);
 return {pkg:JSON.parse(read("package.json")),manifest:JSON.parse(read("src/manifest.json")),
  sources,attributions:read("docs/ATTRIBUTIONS.md"),
  bundleSha256:crypto.createHash("sha256").update(fs.readFileSync(path.join(root,"src/ghostery-vendor.js"))).digest("hex")};
}
if(require.main===module){
 try{
  const report=check(current());
  if(!report.ok){for(const issue of report.issues)console.error("FAIL:",issue);process.exitCode=1;}
  else console.log("PASS: bundled Ghostery MPL, PSL MPL and Facebook MIT provenance (offline).");
  console.log("Not a legal clearance, browser test or release authorization.");
 }catch(error){console.error("FAIL: provenance inputs unavailable:",error.message);process.exitCode=1;}
}
module.exports={check,current,PINNED,NOTICES,SHA};
