"use strict";
/* Build 166: deterministic OFFLINE benchmark input; no live URLs or network calls. */
const {performance}=require("node:perf_hooks");
const Audit=require("./engine-verdict-audit.js");
const MAX_RULES=1800,MAX_REQUESTS=180;
function inputs(ruleCount=600,requestCount=80){
 if(!Number.isInteger(ruleCount)||ruleCount<1||ruleCount>MAX_RULES||
    !Number.isInteger(requestCount)||requestCount<1||requestCount>MAX_REQUESTS)
  throw Error("Synthetic benchmark size out of range");
 const filters=Array.from({length:ruleCount},(_,i)=>
  "||ads"+i+".perf.invalid^$image").join("\n");
 const requests=Array.from({length:requestCount},(_,i)=>({
  url:"https://"+(i%2===0?"ads"+(i%ruleCount):"cdn"+i)+".perf.invalid/banner.png",
  type:"image",origin:"news.perf.invalid",method:"GET"
 }));
 return {filters,requests};
}
function median(values){
 if(!Array.isArray(values)||!values.length||
    values.some(n=>!Number.isFinite(n)||n<0))throw Error("Invalid timings");
 const ordered=[...values].sort((a,b)=>a-b),m=ordered.length>>1;
 return ordered.length%2?ordered[m]:(ordered[m-1]+ordered[m])/2;
}
function measure(fn,repetitions=3){
 const results=[];
 for(let i=0;i<repetitions;i++){
  const start=performance.now();fn();results.push(performance.now()-start);
 }
 return Math.round(median(results)*1000)/1000;
}
// Count URL hostname parses in the actual engine. This is deterministic
// work avoided, independent of variable wall-clock timing or GC.
function hostnameParses(env,filters,requests){
 const original=env.DKRules.host;
 let count=0;
 env.DKRules.host=function(url){count++;return original(url);};
 try{
  const engine=new env.DKFilter.FilterEngine(filters);
  for(const request of requests)
   engine.checkRequest(request.url,request.type,request.origin,{},request.method);
  return count;
 }finally{env.DKRules.host=original;}
}
function bench(options={}){
 const n=options.ruleCount??600,k=options.requestCount??80;
 const env=Audit.loadEnvironment(),{filters,requests}=inputs(n,k);
 const before=process.memoryUsage().heapUsed;
 let native,hybrid;
 const nativeParseMs=measure(()=>{native=new env.DKFilter.FilterEngine(filters);});
 const hybridParseMs=measure(()=>{hybrid=env.DKHybridEngine.create(filters);});
 const after=process.memoryUsage().heapUsed;
 if(!hybrid.vendor)throw Error("Bundled Ghostery engine did not initialize");
 const nativeMatchMs=measure(()=>{for(const r of requests)
  native.shouldBlock(r.url,r.type,r.origin,{},r.method);});
 const hybridMatchMs=measure(()=>{for(const r of requests)
  hybrid.shouldBlock(r.url,r.type,r.origin,{},r.method);});
 const nativeHostnameParses=hostnameParses(env,filters,requests);
 const result={syntheticOnly:true,ruleCount:n,requestCount:k,
  nativeHostnameParses,
  nativeHostnameParsesPerRequest:nativeHostnameParses/k,
  nativeParseMedianMs:nativeParseMs,hybridParseMedianMs:hybridParseMs,
  nativeMatchBatchMedianMs:nativeMatchMs,hybridMatchBatchMedianMs:hybridMatchMs,
  heapAfterMinusBeforeBytes:after-before,
  memoryCaveat:"Coarse process heap delta; includes retained GC state, not engine-exclusive bytes"};
 return result;
}
if(require.main===module){
 console.log("DK Live Block Build 166: synthetic offline engine performance baseline");
 console.log("Timing is local Node process data, NOT real Firefox performance.");
 console.log(JSON.stringify(bench(),null,2));
}
module.exports={inputs,median,measure,hostnameParses,bench,MAX_RULES,MAX_REQUESTS};
