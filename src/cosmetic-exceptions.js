/* Build 52: validated exact-site cosmetic allow exceptions.
   These operate solely on custom filter text and never allow network ads. */
(function(root){"use strict";
const LIMIT=1000000,MAX_SELECTOR=240,MAX_RULES=500;
function valid(host,selector){
 if(!DKManualRules.validHost(host)||typeof selector!=="string"||
   !selector||selector.length>MAX_SELECTOR||selector!==selector.trim())return false;
 const parsed=DKRules.cosmetic(host+"#@#"+selector);
 return !!parsed&&parsed.exception===true&&parsed.scope===host&&parsed.selector===selector;
}
function list(text,host){
 if(!DKManualRules.validHost(host)||typeof text!=="string")return [];
 const selectors=new Set();
 for(const line of text.split(/\r?\n/)){
  if(!line.startsWith(host+"#@#"))continue;
  const parsed=DKRules.cosmetic(line);
  if(parsed?.exception&&parsed.scope===host&&valid(host,parsed.selector)){
   selectors.add(parsed.selector);if(selectors.size>=MAX_RULES)break;
  }
 }
 return [...selectors];
}
function change(text,host,selector,allow){
 if(!valid(host,selector)||typeof text!=="string"||typeof allow!=="boolean")
  return {error:"Invalid site or cosmetic selector."};
 const rule=host+"#@#"+selector,all=text.split(/\r?\n/),
  present=all.some(x=>x===rule);
 if(allow){
  if(present)return {ok:true,text,changed:false};
  if(list(text,host).length>=MAX_RULES)return {error:"Site cosmetic exception limit reached."};
  const result=text+(text&&!text.endsWith("\n")?"\n":"")+rule;
  if(result.length>LIMIT)return {error:"Custom filter rules exceed the 1 MB limit."};
  return {ok:true,text:result,changed:true};
 }
 if(!present)return {error:"There is no matching site exception."};
 return {ok:true,text:all.filter(x=>x!==rule).join("\n"),changed:true};
}
const API=Object.freeze({valid,list,change,LIMIT,MAX_RULES});
root.DKCosmeticExceptions=API;
if(typeof module!=="undefined")module.exports=API;
})(typeof globalThis!=="undefined"?globalThis:this);
