/* Conservative bridge for bundled Ghostery COSMETIC CSS only.
   Does NOT execute the engine's scriptlets, intercept responses, or fetch code. */
(function(root){"use strict";
// Bound aggregate vendor work, not just 200 individually large CSS fragments.
const LIMIT=300,MAX_CSS=500000,MAX_TOTAL_CSS=2000000,MAX_BLOCKS=4000;
const BAD=/\b(?:html|body|main|video|audio|iframe|object|embed|form|input|button|textarea|select|dialog|player|movie_player|ytp-)\b/i;
function valid(h){return typeof h==="string"&&h.length<254&&h.includes(".")&&
 /^[a-z0-9.-]+$/.test(h)&&!h.includes("..")&&!h.startsWith(".")&&!h.endsWith(".");}
// Split only top-level commas. Ghostery emits compound selector groups whose
// attribute values can contain a comma: splitting them naively loses a rule.
// Reject malformed quoting, escapes, nested brackets and unquoted attribute
// commas rather than guessing whether the CSS would target a safe element.
function selectorList(group){
 if(typeof group!=="string"||group.length>12000)return [];
 const out=[];let current="",quote="",brackets=0,parens=0;
 for(let i=0;i<group.length;i++){
  const ch=group[i];
  if(ch==="\\")return [];
  if(quote){
   current+=ch;
   if(ch===quote)quote="";
   continue;
  }
  if(ch==='"'||ch==="'"){quote=ch;current+=ch;continue;}
  if(ch==="["){if(++brackets>1)return [];current+=ch;continue;}
  if(ch==="]"){if(--brackets<0)return [];current+=ch;continue;}
  if(ch==="("){if(++parens>1)return [];current+=ch;continue;}
  if(ch===")"){if(--parens<0)return [];current+=ch;continue;}
  if(ch===","){
   if(brackets&&parens===0)return [];
   if(!brackets&&!parens){
    if(!current.trim())return [];
    out.push(current.trim());current="";
    if(out.length>LIMIT)return [];
    continue;
   }
  }
  current+=ch;
 }
 if(quote||brackets||parens||!current.trim())return [];
 out.push(current.trim());
 return out;
}
function sanitize(styles,safeSelector=items=>items,protectSelector=()=>false){
 const fragments=typeof styles==="string"?[styles]:Array.isArray(styles)?styles:[];
 if(!fragments.length)return "";
 const out=[],seen=new Set();
 let totalChars=0,blocks=0;
 for(const fragment of fragments.slice(0,200)){
  if(typeof fragment!=="string"||fragment.length>MAX_CSS)continue;
  if(totalChars+fragment.length>MAX_TOTAL_CSS)break;
  totalChars+=fragment.length;
  for(const part of fragment.split("}")){
   if(++blocks>MAX_BLOCKS)return out.join("\n");
   const bracket=part.indexOf("{");
   if(bracket<1)continue;
   const selectorGroup=part.slice(0,bracket).trim(),body=part.slice(bracket+1).trim();
   if(!/^display\s*:\s*none\s*!important\s*;?$/i.test(body))continue;
   for(const raw of selectorList(selectorGroup)){
   const selector=raw.trim();
   if(!selector||selector.length>320||BAD.test(selector)||
     /[;{}@\\]/.test(selector)||/:(?:has|is|where|not)\(/i.test(selector)||
     !/^[.#a-zA-Z0-9_\- \t>+~:[\]="',.*^$()|]+$/.test(selector)||
     !/^display\s*:\s*none\s*!important\s*;?$/i.test(body)||
     seen.has(selector)||protectSelector(selector)||!safeSelector([selector]).includes(selector))
    continue;
   seen.add(selector);out.push(selector+" {display:none!important;}");
   if(out.length>=LIMIT)return out.join("\n");
   }
  }
 }
 return out.join("\n");
}
function pageURL(host,raw){
 try{
  if(typeof raw!=="string"||raw.length>8192)return "https://"+host+"/";
  const u=new URL(raw);
  if(!/^https?:$/.test(u.protocol)||u.username||u.password||u.hostname!==host)
   return "https://"+host+"/";
  return raw;
 }catch(_){return "https://"+host+"/";}
}
function styles(vendor,host,{streaming=false,policy={},page="",safeSelector=x=>x,protectSelector=()=>false}={}){
 // Native $document/$elemhide exceptions must also govern the supplementary
 // Ghostery layer. Otherwise a user's allowed site can remain hidden.
 if(streaming||policy?.document||policy?.elemhide||
    !valid(host)||typeof vendor?.getCosmeticsFilters!=="function")return "";
 const domain=typeof DKPublicSuffix!=="undefined"?DKPublicSuffix.registrable(host):
  host.split(".").slice(-2).join(".");
 if(!valid(domain))return "";
 try{
  const value=vendor.getCosmeticsFilters({
   hostname:host,domain,url:pageURL(host,page),
   getBaseRules:policy?.generichide!==true,getInjectionRules:true,getExtendedRules:false,
   getRulesFromHostname:true,getRulesFromDOM:false
  });
  if(value?.active===false)return "";
  // Ignore value.scripts completely, regardless of source.
  return sanitize(value?.styles,safeSelector,protectSelector);
 }catch(_){return "";}
}
const API=Object.freeze({sanitize,styles,pageURL,selectorList});
root.DKGhosteryCosmetics=API;
if(typeof module!=="undefined")module.exports=API;
})(typeof globalThis!=="undefined"?globalThis:this);
