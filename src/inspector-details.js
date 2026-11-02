/* DK Live Block Build 239: local, bounded DOM and cosmetic diagnostics.
   Never collect post text, element IDs/classes, URL paths or form content. */
(function(root){"use strict";
const ROLES=new Set(["article","heading","button","link","img","complementary","navigation","main","dialog","list","listitem","group","presentation","none"]);
const MAX_PARENTS=8,MAX_RULES=80,MAX_RULE_LENGTH=240;
function safeTag(node){
 const v=String(node?.localName||node?.tagName||"").toLowerCase();
 return /^[a-z][a-z0-9-]{0,32}$/.test(v)?v:"element";
}
function rectOf(node){
 try{
  const r=node?.getBoundingClientRect?.();
  if(!r)return null;
  const width=Math.round(Number(r.width)),height=Math.round(Number(r.height));
  if(!Number.isFinite(width)||!Number.isFinite(height))return null;
  return {width:Math.max(0,Math.min(5000,width)),height:Math.max(0,Math.min(5000,height))};
 }catch(_){return null;}
}
function label(node){
 const tag=safeTag(node);
 let role="";
 try{const raw=String(node?.getAttribute?.("role")||"").toLowerCase();if(ROLES.has(raw))role=raw;}catch(_){}
 return tag+(role?" [role="+role+"]":"");
}
function hierarchy(node,doc){
 if(!node||!doc?.body)return [];
 const out=[];let cur=node;
 for(let i=0;i<MAX_PARENTS&&cur&&cur!==doc?.documentElement;i++,cur=cur.parentElement){
  if(cur.nodeType!==1)break;
  out.push({depth:i,element:label(cur),size:rectOf(cur),pageRoot:cur===doc.body});
  if(cur===doc.body)break;
 }
 return out;
}
function selectorOK(s){
 return typeof s==="string"&&s.length>0&&s.length<=MAX_RULE_LENGTH&&
  !/[\u0000-\u001f\u007f]/.test(s)&&
  !/:(?:has-text|contains|matches-css|matches-attr|xpath|remove|style)\s*\(/i.test(s);
}
function matchedCosmetics(node,selectors){
 const matches=[];let checked=0,unsupported=0,errors=0;
 if(!node||!Array.isArray(selectors))return {checked,matches,unsupported,errors};
 for(const s of selectors.slice(0,MAX_RULES)){
  if(!selectorOK(s)){unsupported++;continue;}
  checked++;
  try{
   const direct=!!node.matches?.(s);
   let match=direct,where=direct?"selected item":"";
   if(!match){
    const child=node.querySelector?.(s);
    if(child&&child!==node){match=true;where="inside selected item";}
   }
   if(match&&matches.length<16)matches.push({selector:s,where});
  }catch(_){errors++;}
 }
 return {checked,matches,unsupported,errors,cap:MAX_RULES,
  disclaimer:"A matching selector is not proof a hide was applied. The network log separately records request decisions."};
}
const API=Object.freeze({safeTag,label,hierarchy,selectorOK,matchedCosmetics,MAX_RULES});
root.DKInspectorDetails=API;
if(typeof module!=="undefined")module.exports=API;
})(typeof globalThis!=="undefined"?globalThis:this);
