/* DK Live Block: bounded, non-executable procedural element predicates. */
(function(root){"use strict";
function matches(element,rule){
 if(!element||!rule||typeof rule.selector!=="string")return false;
 if(rule.mode==="text")return typeof rule.text==="string"&&typeof element.textContent==="string"&&element.textContent.includes(rule.text);
 if(rule.mode==="has"&&typeof rule.target==="string"){
  try{return typeof element.querySelector==="function"&&Boolean(element.querySelector(rule.target));}
  catch(_){return false;}
 }
 return false;
}
root.DKProcedural={matches};
if(typeof module!=="undefined")module.exports=root.DKProcedural;
})(typeof globalThis!=="undefined"?globalThis:this);
