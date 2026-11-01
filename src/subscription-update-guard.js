/* DK Live Block: fail-safe guard for automatic list refreshes.
   Accept normal changes; reject only catastrophic loss of actionable rules
   versus the already cached list. No URL, rule text, or telemetry retained. */
(function(root){"use strict";
const PRIOR_MIN=120,KEEP_RATIO=0.25,MAX_LINES=350000;
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
function check(previous,proposed){
 if(typeof proposed!=="string")return {accept:false,reason:"Invalid replacement filter list."};
 const next=count(proposed),before=count(previous?.text);
 // New subscriptions and legitimately small custom lists cannot be judged
 // against a previously working, substantial snapshot.
 if(before<PRIOR_MIN||next>=Math.ceil(before*KEEP_RATIO))
  return {accept:true,previousCount:before,nextCount:next};
 return {accept:false,previousCount:before,nextCount:next,
  reason:"Filter list shrank unexpectedly; keeping last working copy."};
}
const API=Object.freeze({count,check,PRIOR_MIN,KEEP_RATIO,MAX_LINES});
root.DKSubscriptionUpdateGuard=API;
if(typeof module!=="undefined")module.exports=API;
})(typeof globalThis!=="undefined"?globalThis:this);
