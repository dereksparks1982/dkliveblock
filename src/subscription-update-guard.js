/* DK Live Block: fail-safe guard for automatic list refreshes.
   Accept normal changes; reject only catastrophic loss of actionable rules
   versus the already cached list. No URL, rule text, or telemetry retained. */
(function(root){"use strict";
const PRIOR_MIN=120,KEEP_RATIO=0.25,MAX_LINES=350000,MAX_CHARS=20*1024*1024;
function withinLineLimit(text){
 let lines=1;
 for(let i=0;i<text.length;i++)if(text.charCodeAt(i)===10&&++lines>MAX_LINES)return false;
 return true;
}
function count(text){
 if(typeof text!=="string")return 0;
 let n=0,start=0,lines=0;
 while(start<text.length&&lines++<MAX_LINES){
  const end=text.indexOf("\n",start);
  const raw=text.slice(start,end===-1?text.length:end).trim();
  if(raw&&raw[0]!=="!"&&raw[0]!=="["&&
     (raw[0]!=="#"||raw.startsWith("##")||raw.startsWith("#@#")||
       raw.startsWith("#?#")||raw.startsWith("#$#")||raw.startsWith("#%#")))n++;
  if(end===-1)break;
  start=end+1;
 }
 return n;
}
function documentError(value){
 const start=value.slice(0,2048).replace(/^\uFEFF/,"").trimStart();
 return /^(?:<!doctype\s+html\b|<html\b|<head\b|<body\b|<title\b|<\?xml\b|\{\s*"(?:error|message|status|detail|code)"\s*:)/i.test(start);
}
function check(previous,proposed){
 if(typeof proposed!=="string"||proposed.length>MAX_CHARS||proposed.includes("\u0000")||!withinLineLimit(proposed))
  return {accept:false,reason:"Invalid or oversized replacement filter list."};
 if(documentError(proposed))
  return {accept:false,reason:"Filter list source returned an error page, not rules."};
 const next=count(proposed),before=count(previous?.text);
 if(before>=3&&next===0)
  return {accept:false,previousCount:before,nextCount:0,
   reason:"Updated filter list is empty; keeping last working copy."};
 // New subscriptions and legitimately small custom lists cannot be judged
 // against a previously working, substantial snapshot.
 if(before<PRIOR_MIN||next>=Math.ceil(before*KEEP_RATIO))
  return {accept:true,previousCount:before,nextCount:next};
 return {accept:false,previousCount:before,nextCount:next,
  reason:"Filter list shrank unexpectedly; keeping last working copy."};
}
const API=Object.freeze({count,check,documentError,PRIOR_MIN,KEEP_RATIO,MAX_LINES,MAX_CHARS});
root.DKSubscriptionUpdateGuard=API;
if(typeof module!=="undefined")module.exports=API;
})(typeof globalThis!=="undefined"?globalThis:this);
