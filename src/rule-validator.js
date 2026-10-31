/* Build 53: local, read-only custom filter diagnostics.
 * Never uploads custom rules or changes the filter engine.
 * No eval, scriptlets, remote subscriptions or page access. */
(function(root){"use strict";
const MAX_INPUT=1000000,MAX_LINES=20000,MAX_EXAMPLES=30;
function validate(source){
 if(typeof source!=="string")return {error:"Custom filter text must be a string."};
 if(source.length>MAX_INPUT)return {error:"Custom filter text exceeds the 1 MB limit."};
 const lines=source.split(/\r?\n/);
 if(lines.length>MAX_LINES)return {error:"Too many filter lines; maximum 20,000."};
 const seen=new Set(),counts={network:0,cosmetic:0,procedural:0,comments:0,empty:0,unsupported:0,duplicates:0};
 const examples=[];
 for(let i=0;i<lines.length;i++){
  const text=lines[i].trim();
  if(!text){counts.empty++;continue;}
  if(text[0]==="!"||/^\[Adblock Plus(?: \d+(?:\.\d+)*)?\]$/i.test(text)){counts.comments++;continue;}
  if(text.length>2500){counts.unsupported++;if(examples.length<MAX_EXAMPLES)examples.push({line:i+1,kind:"too-long"});continue;}
  if(seen.has(text)){counts.duplicates++;if(examples.length<MAX_EXAMPLES)examples.push({line:i+1,kind:"duplicate"});continue;}
  seen.add(text);
  let parsed=null,type="";
  try{
   if(text.includes("#?#")||text.includes("#@?#")){
    parsed=DKRules.procedural(text);type="procedural";
   }else if(text.includes("##")||text.includes("#@#")){
    parsed=DKRules.procedural(text);
    if(parsed)type="procedural";
    else{parsed=DKRules.cosmetic(text);type="cosmetic";}
   }else{
    parsed=DKRules.network(text);type="network";
   }
  }catch(_){parsed=null;}
  if(parsed)counts[type]++;
  else{counts.unsupported++;if(examples.length<MAX_EXAMPLES)examples.push({line:i+1,kind:"unsupported"});}
 }
 return {ok:true,counts,lines:lines.length,examples,tooManyExamples:counts.unsupported+counts.duplicates>examples.length};
}
const API=Object.freeze({validate,MAX_INPUT,MAX_LINES,MAX_EXAMPLES});
root.DKRuleValidator=API;
if(typeof module!=="undefined")module.exports=API;
})(typeof globalThis!=="undefined"?globalThis:this);
