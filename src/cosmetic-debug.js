/* DK Live Block Build 49: read-only cosmetic filter inspection and
   reversible outline preview. No display, visibility or input changes. */
(function(root){"use strict";
const MAX_SELECTORS=80,MAX_HIGHLIGHT=12,MAX_COUNT=200;
function goodSelector(s){return typeof s==="string"&&s.length>0&&s.length<=240&&
 !/[\u0000-\u001f\u007f]/.test(s);}
function inspect(doc,selectors){
 if(!doc?.querySelectorAll||!Array.isArray(selectors))return [];
 const out=[];
 for(const selector of selectors.slice(0,MAX_SELECTORS)){
  if(!goodSelector(selector))continue;
  try{
   const elements=doc.querySelectorAll(selector);
   out.push({selector,matches:Math.min(MAX_COUNT,elements.length||0),
    capped:(elements.length||0)>MAX_COUNT});
  }catch(_){out.push({selector,matches:0,unsupported:true});}
 }
 return out;
}
function create(doc){
 const originals=new Map();
 function restore(){
  for(const [node,s] of originals){
   try{
    if(s.outline)node.style.setProperty("outline",s.outline.value,s.outline.priority);
    else node.style.removeProperty("outline");
    if(s.offset)node.style.setProperty("outline-offset",s.offset.value,s.offset.priority);
    else node.style.removeProperty("outline-offset");
   }catch(_){}
  }
  originals.clear();
 }
 function highlight(selector){
  restore();
  if(!goodSelector(selector)||!doc?.querySelectorAll)return {error:"Invalid selector."};
  let matches;
  try{matches=doc.querySelectorAll(selector);}catch(_){return {error:"Unsupported cosmetic selector."};}
  let count=0;
  for(const node of matches){
   if(count>=MAX_HIGHLIGHT)break;
   if(!node?.style||node===doc.documentElement||node===doc.body||
      !node.isConnected||!node.getClientRects?.().length||
      /^(?:html|body|video|audio|iframe|form)$/i.test(node.localName||""))continue;
   const style=doc.defaultView?.getComputedStyle?.(node);
   if(style&&(style.display==="none"||style.visibility==="hidden"||style.visibility==="collapse"))continue;
   const property=k=>{const value=node.style.getPropertyValue(k),priority=node.style.getPropertyPriority(k);return value?{value,priority}:null;};
   originals.set(node,{outline:property("outline"),offset:property("outline-offset")});
   node.style.setProperty("outline","2px dashed #f59e0b","important");
   node.style.setProperty("outline-offset","2px","important");
   count++;
  }
  return {ok:true,highlighted:count,matched:Math.min(matches.length||0,MAX_COUNT),
   note:count?"Outlined visible matches. Use Clear highlights to restore them.":"No visible matches; hidden elements remain hidden."};
 }
 return {restore,highlight};
}
const api=Object.freeze({inspect,create,MAX_SELECTORS,MAX_HIGHLIGHT,goodSelector});
root.DKCosmeticDebug=api;
if(typeof module!=="undefined")module.exports=api;
})(typeof globalThis!=="undefined"?globalThis:this);
