"use strict";
/* Build 165: bounded offline filter-language inventory, no network or browser data. */
const fs=require("node:fs"),path=require("node:path");
const Rules=require("../src/rules.js");
const MAX_BYTES=20*1024*1024,MAX_LINES=260000;
function category(raw){
 if(typeof raw!=="string")return "invalid";
 const line=raw.trim();
 if(!line||line[0]==="!"||line[0]==="[")return "ignored";
 try{
  if(Rules.procedural(line))return "native_procedural";
  if(Rules.cosmetic(line))return "native_cosmetic";
  if(Rules.network(line))return "native_network";
 }catch(_){return "invalid";}
 if(/##\+js\(|#@#\+js\(|#%#/.test(line))return "unsupported_scriptlet";
 if(/#\^#/.test(line))return "unsupported_html_filter";
 if(/#(?:@)?\?#|#(?:@)?\$#|##|#@#/.test(line)){
  if(/:(?:style|remove|upward|xpath|matches-css|matches-attr|watch-attr)\(/i.test(line))
   return "unsupported_extended_cosmetic";
  return "unsupported_cosmetic_other";
 }
 if(/\$(?:[^,\s]*,)*redirect-rule(?:=|,|$)/i.test(line))
  return "unsupported_redirect_rule";
 if(/\$(?:[^,\s]*,)*redirect(?:=|,|$)/i.test(line))
  return "unsupported_redirect";
 if(/\$(?:[^,\s]*,)*csp(?:=|,|$)/i.test(line))return "unsupported_csp";
 if(/\$(?:[^,\s]*,)*header(?:=|,|$)/i.test(line))return "unsupported_header";
 if(/\$(?:[^,\s]*,)*replace(?:=|,|$)/i.test(line))return "unsupported_replace";
 if(/\$(?:[^,\s]*,)*removeparam=\/|removeparam=\/[^/]+\/?/i.test(line))
  return "unsupported_regex_removeparam";
 if(/\$(?:[^,\s]*,)*(?:domain|from|to)=[^,\s]*\*/i.test(line))
  return "unsupported_entity_domain";
 if(/\$(?:[^,\s]*,)*(?:all|empty|inline-script|cname)(?:,|$)/i.test(line))
  return "unsupported_network_option";
 return "unsupported_other";
}
function analyze(text){
 if(typeof text!=="string"||Buffer.byteLength(text,"utf8")>MAX_BYTES)
  throw Error("Filter list exceeds offline audit size limit");
 const lines=text.split(/\r?\n/);
 if(lines.length>MAX_LINES)throw Error("Filter list exceeds offline audit line limit");
 const categories=Object.create(null);
 let counted=0,ignored=0;
 for(const line of lines){
  const group=category(line);
  categories[group]=(categories[group]||0)+1;
  if(group==="ignored")ignored++;else counted++;
 }
 const supported=(categories.native_network||0)+(categories.native_cosmetic||0)+
  (categories.native_procedural||0);
 return {lines:lines.length,considered:counted,ignored,supported,
  unsupported:counted-supported,categories};
}
function bundled(){
 const folder=path.join(__dirname,"../filters");
 if(!fs.existsSync(folder))return {files:0,report:analyze("")};
 let files=0;
 const fragments=[];
 for(const name of fs.readdirSync(folder).filter(x=>/^[a-zA-Z0-9_-]+\.txt$/.test(x)).sort()){
  if(files>=30)break;
  const full=path.join(folder,name),size=fs.statSync(full).size;
  if(size>MAX_BYTES)continue;
  const data=fs.readFileSync(full,"utf8");
  fragments.push(data);files++;
 }
 return {files,report:analyze(fragments.join("\n"))};
}
if(require.main===module){
 const result=bundled();
 console.log("DK Live Block, Build 165: OFFLINE bundled-filter syntax inventory");
 console.log("This is not a measurement of downloaded EasyList/EasyPrivacy; no Internet is accessed.");
 console.log(JSON.stringify(result,null,2));
}
module.exports={category,analyze,bundled,MAX_BYTES,MAX_LINES};
