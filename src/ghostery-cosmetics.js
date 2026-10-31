/* Conservative bridge for bundled Ghostery COSMETIC CSS only.
   Does NOT execute the engine's scriptlets, intercept responses, or fetch code. */
(function(root){"use strict";
const LIMIT=300,MAX_CSS=120000;
const BAD=/\b(?:html|body|main|video|audio|iframe|object|embed|form|input|button|textarea|select|dialog|player|movie_player|ytp-)\b/i;
function valid(h){return typeof h==="string"&&h.length<254&&h.includes(".")&&
 /^[a-z0-9.-]+$/.test(h)&&!h.includes("..")&&!h.startsWith(".")&&!h.endsWith(".");}
function sanitize(styles,safeSelector=items=>items,protectSelector=()=>false){
 if(!Array.isArray(styles))return "";
 const out=[],seen=new Set();
 for(const fragment of styles.slice(0,200)){
  if(typeof fragment!=="string"||fragment.length>MAX_CSS)continue;
  for(const part of fragment.split("}")){
   const bracket=part.indexOf("{");
   if(bracket<1)continue;
   const selector=part.slice(0,bracket).trim(),body=part.slice(bracket+1).trim();
   if(!selector||selector.length>320||BAD.test(selector)||
     /[;{}@\\]/.test(selector)||/:(?:has|is|where|not)\(/i.test(selector)||
     !/^[.#a-zA-Z0-9_\- \t>+~:[\]="'.*^$()|]+$/.test(selector)||
     !/^display\s*:\s*none\s*!important\s*;?$/i.test(body)||
     seen.has(selector)||protectSelector(selector)||!safeSelector([selector]).includes(selector))
    continue;
   seen.add(selector);out.push(selector+" {display:none!important;}");
   if(out.length>=LIMIT)return out.join("\n");
  }
 }
 return out.join("\n");
}
function styles(vendor,host,{streaming=false,safeSelector=x=>x,protectSelector=()=>false}={}){
 if(streaming||!valid(host)||typeof vendor?.getCosmeticsFilters!=="function")return "";
 const domain=typeof DKPublicSuffix!=="undefined"?DKPublicSuffix.registrable(host):
  host.split(".").slice(-2).join(".");
 if(!valid(domain))return "";
 try{
  const value=vendor.getCosmeticsFilters({
   hostname:host,domain,url:"https://"+host+"/",
   getBaseRules:true,getInjectionRules:true,getExtendedRules:false,
   getRulesFromHostname:true,getRulesFromDOM:false
  });
  if(value?.active===false)return "";
  // Ignore value.scripts completely, regardless of source.
  return sanitize(value?.styles,safeSelector,protectSelector);
 }catch(_){return "";}
}
const API=Object.freeze({sanitize,styles});
root.DKGhosteryCosmetics=API;
if(typeof module!=="undefined")module.exports=API;
})(typeof globalThis!=="undefined"?globalThis:this);
