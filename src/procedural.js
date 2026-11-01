/* DK Live Block: bounded, non-executable procedural element predicates. */
(function(root){"use strict";
const MAX_TEXT_CHARS=32000;
function matches(element,rule){
 if(!element||!rule||typeof rule.selector!=="string")return false;
 if(rule.mode==="text"){
  if(typeof rule.text!=="string"||!rule.text||rule.text.length>120)return false;
  // Avoid scanning an entire document's expanded text to match an ad card.
  try{
   const value=element.textContent;
   return typeof value==="string"&&value.length<=MAX_TEXT_CHARS&&value.includes(rule.text);
  }catch(_){return false;}
 }
 if(rule.mode==="attr"){
  if(typeof rule.attribute!=="string"||!rule.attribute.match(/^[a-zA-Z_][a-zA-Z0-9_:-]{0,63}$/)||
     typeof rule.value!=="string"||!rule.value||
     rule.value.length>90||!(/^[a-zA-Z0-9 _.:/@+-]+$/.test(rule.value)))return false;
  try{
   const value=typeof element.getAttribute==="function"?
    element.getAttribute(rule.attribute):null;
   return typeof value==="string"&&value.length<=90&&value===rule.value;
  }catch(_){return false;}
 }
 if(rule.mode==="css"){
  const allowed={
   position:/^(fixed|absolute|sticky|relative|static)$/,
   display:/^(none|block|flex|grid|inline|inline-block)$/,
   visibility:/^(visible|hidden|collapse)$/,
   opacity:/^(0(?:\.\d{1,3})?|1(?:\.0{1,3})?)$/,
   "z-index":/^(auto|-?\d{1,6})$/
  };
  if(typeof rule.property!=="string"||typeof rule.value!=="string"||
     !Object.prototype.hasOwnProperty.call(allowed,rule.property)||
     !allowed[rule.property].test(rule.value))return false;
  try{
   const view=element.ownerDocument?.defaultView;
   if(typeof view?.getComputedStyle!=="function")return false;
   const style=view.getComputedStyle(element);
   const value=style?.getPropertyValue?.(rule.property);
   return typeof value==="string"&&value.trim().toLowerCase()===rule.value;
  }catch(_){return false;}
 }
 if(rule.mode==="has"&&typeof rule.target==="string"){
  try{return typeof element.querySelector==="function"&&Boolean(element.querySelector(rule.target));}
  catch(_){return false;}
 }
 return false;
}
root.DKProcedural={matches,MAX_TEXT_CHARS};
if(typeof module!=="undefined")module.exports=root.DKProcedural;
})(typeof globalThis!=="undefined"?globalThis:this);
