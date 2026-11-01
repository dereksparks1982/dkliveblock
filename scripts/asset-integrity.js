"use strict";
/* Offline, read-only Build 171 extension asset audit. No network I/O. */
const fs=require("node:fs"),path=require("node:path");
const MAX_FILES=300,MAX_HTML=60;
function validRelative(value){
 return typeof value==="string"&&value.length>0&&value.length<=240&&
  !/^(?:[a-z]+:|\/|\\|#|\/\/)/i.test(value)&&
  !/[\x00-\x1f?#\\]/.test(value)&&
  value.split("/").every(p=>!!p&&p!=="."&&p!==".."&&
   /^[a-zA-Z0-9_.-]+$/.test(p));
}
function htmlAssets(markup){
 const out=[];
 if(typeof markup!=="string")return out;
 const scripts=/<script\b[^>]*\bsrc\s*=\s*["']([^"'<>]+)["'][^>]*>/gi;
 const styles=/<link\b(?=[^>]*\brel\s*=\s*["']stylesheet["'])[^>]*\bhref\s*=\s*["']([^"'<>]+)["'][^>]*>/gi;
 for(const re of [scripts,styles])for(const m of markup.matchAll(re))out.push(m[1]);
 return out;
}
function audit(src,options={}){
 const issues=[],seen=new Set(),limit=options.maxFiles||MAX_FILES;
 let manifest;
 try{manifest=JSON.parse(fs.readFileSync(path.join(src,"manifest.json"),"utf8"));}
 catch(_){return {ok:false,issues:["Manifest missing or malformed"],files:0,pages:0};}
 function check(ref,label){
  if(seen.size>=limit){issues.push("Asset inventory limit exceeded");return;}
  if(!validRelative(ref)){issues.push("Unsafe or external asset in "+label+": "+String(ref).slice(0,80));return;}
  if(seen.has(ref))return;
  seen.add(ref);
  const resolved=path.resolve(src,ref);
  if(!resolved.startsWith(path.resolve(src)+path.sep)){
   issues.push("Escaping asset in "+label);return;
  }
  try{if(!fs.statSync(resolved).isFile())issues.push("Not a regular file: "+ref);}
  catch(_){issues.push("Missing local asset: "+ref);}
 }
 for(const file of manifest.background?.scripts||[])check(file,"background");
 for(const entry of manifest.content_scripts||[])
  for(const file of entry?.js||[])check(file,"content scripts");
 for(const file of Object.values(manifest.icons||{}))check(file,"icons");
 if(manifest.browser_action?.default_icon)
  for(const file of typeof manifest.browser_action.default_icon==="string"?
   [manifest.browser_action.default_icon]:Object.values(manifest.browser_action.default_icon))
   check(file,"browser action icon");
 for(const file of [manifest.browser_action?.default_popup,manifest.options_ui?.page,
  manifest.devtools_page].filter(Boolean))check(file,"extension page");
 for(const file of manifest.web_accessible_resources||[])
  if(typeof file==="string")check(file,"web accessible");
 let html=[];
 try{html=fs.readdirSync(src).filter(f=>f.endsWith(".html"));}
 catch(_){issues.push("Extension source directory missing");}
 if(html.length>MAX_HTML)issues.push("Too many extension HTML pages");
 for(const file of html.slice(0,MAX_HTML)){
  check(file,"page");
  const full=path.join(src,file);
  if(!fs.existsSync(full)||!fs.statSync(full).isFile())continue;
  const markup=fs.readFileSync(full,"utf8");
  for(const asset of htmlAssets(markup))check(asset,"page "+file);
 }
 return {ok:issues.length===0,issues,files:seen.size,pages:Math.min(html.length,MAX_HTML)};
}
if(require.main===module){
 const result=audit(path.resolve(__dirname,"../src"));
 if(!result.ok){for(const issue of result.issues)console.error("ASSET FAIL:",issue);process.exitCode=1;}
 else console.log("ASSET PASS:",result.files,"references across",result.pages,"HTML pages.");
}
module.exports={audit,validRelative,htmlAssets,MAX_FILES,MAX_HTML};
