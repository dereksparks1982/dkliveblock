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
 if(rule.mode==="has"&&typeof rule.target==="string"){
  try{return typeof element.querySelector==="function"&&Boolean(element.querySelector(rule.target));}
  catch(_){return false;}
 }
 return false;
}
root.DKProcedural={matches,MAX_TEXT_CHARS};
if(typeof module!=="undefined")module.exports=root.DKProcedural;
})(typeof globalThis!=="undefined"?globalThis:this);
