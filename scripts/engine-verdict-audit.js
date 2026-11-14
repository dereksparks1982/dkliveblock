"use strict";
/* Build 162 offline-only differential audit. No browser, URLs logs or network I/O. */
const fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
const ROOT=path.join(__dirname,"../src"),MAX_CASES=96;
const SAMPLES=Object.freeze([
 {id:"simple-script-block",rules:"||ads.example^$script",
  url:"https://ads.example/banner.js",type:"script",origin:"news.example"},
 {id:"simple-image-allow",rules:"||ads.example^$script",
  url:"https://ads.example/banner.jpg",type:"image",origin:"news.example"},
 {id:"native-scoped-exception",rules:"||ads.example^\n@@||ads.example^$domain=trusted.example",
  url:"https://ads.example/banner.js",type:"script",origin:"trusted.example"},
 {id:"nonmatching-exception",rules:"||ads.example^\n@@||ads.example^$domain=trusted.example",
  url:"https://ads.example/banner.js",type:"script",origin:"news.example"},
 {id:"entity-domain-exception",rules:"||ads.example^\n@@||ads.example^$domain=news.*",
  url:"https://ads.example/banner.js",type:"script",origin:"news.example"},
 {id:"important-block",rules:"||ads.example^$important\n@@||ads.example^",
  url:"https://ads.example/banner.js",type:"script",origin:"news.example"},
 {id:"vetted-script-redirect",rules:"||ads.example^$redirect=noop.js",
  url:"https://ads.example/banner.js",type:"script",origin:"news.example"},
 {id:"unsupported-script-redirect",rules:"||ads.example^$redirect=unknown-resource.js",
  url:"https://ads.example/banner.js",type:"script",origin:"news.example"},
 {id:"method-post",rules:"||ads.example^$xmlhttprequest,method=POST",
  url:"https://ads.example/api",type:"xmlhttprequest",origin:"news.example",method:"POST"},
 {id:"method-get",rules:"||ads.example^$xmlhttprequest,method=POST",
  url:"https://ads.example/api",type:"xmlhttprequest",origin:"news.example",method:"GET"},
 {id:"document-exemption",rules:"||ads.example^",
  url:"https://ads.example/banner.js",type:"script",origin:"news.example",policy:{document:true}},
 {id:"popup-exception",rules:"||ads.example^",
  url:"https://ads.example/pop",type:"popup",origin:"news.example"},
 {id:"page-frame",rules:"||ads.example^",
  url:"https://ads.example/page",type:"main_frame",origin:"news.example"},
 // Build 405: licensed Ghostery adapter coverage, using self-created hosts.
 {id:"responsive-image-alias",rules:"||ads.example^$image",
  url:"https://ads.example/asset.webp",type:"imageset",origin:"news.example"},
 {id:"beacon-ping-alias",rules:"||metrics.example^$ping",
  url:"https://metrics.example/event",type:"beacon",origin:"news.example",method:"POST"},
 {id:"subdomain-image",rules:"||ads.example^$image",
  url:"https://cdn.ads.example/banner.png",type:"image",origin:"news.example"},
 {id:"unrelated-image",rules:"||ads.example^$image",
  url:"https://static.news.example/banner.png",type:"image",origin:"news.example"},
 {id:"badfilter-disabled",rules:"||ads.example^$script\n||ads.example^$script,badfilter",
  url:"https://ads.example/ad.js",type:"script",origin:"news.example"},
 {id:"genericblock-exemption",rules:"||ads.example^$script",
  url:"https://ads.example/ad.js",type:"script",origin:"news.example",policy:{genericblock:true}},
 {id:"media-ad-stream",rules:"||ads.example^$media",
  url:"https://ads.example/clip.m3u8",type:"media",origin:"news.example"},
 {id:"important-image-allow",rules:"||ads.example^$image,important\n@@||ads.example^$image",
  url:"https://ads.example/image.webp",type:"image",origin:"news.example"},
 {id:"targeted-exception-other-site",rules:"||ads.example^$script\n@@||ads.example^$script,domain=trusted.example",
  url:"https://ads.example/ad.js",type:"script",origin:"elsewhere.example"},
 {id:"stylesheet-local-redirect",rules:"||ads.example^$stylesheet,redirect=empty.css",
  url:"https://ads.example/ad.css",type:"stylesheet",origin:"news.example"},
 {id:"websocket-vendor-gap",rules:"||tracker.example^$websocket",
  url:"wss://tracker.example/socket",type:"websocket",origin:"news.example"}
]);
function loadEnvironment(){
 const ctx=vm.createContext({URL,TextEncoder,TextDecoder,Uint8Array,Uint32Array,
  ArrayBuffer,console,setTimeout,clearTimeout});
 ctx.globalThis=ctx;
 for(const name of ["public-suffix.js","rules.js","engine.js","ghostery-vendor.js","hybrid-engine.js"])
  vm.runInContext(fs.readFileSync(path.join(ROOT,name),"utf8"),ctx,
   {filename:name,timeout:12000});
 if(!ctx.DKGhosteryVendor?.FiltersEngine?.parse||!ctx.DKHybridEngine?.create)
  throw Error("Bundled filtering engines are unavailable");
 return ctx;
}
function eligible(row){
 return !row.policy?.document&&!row.policy?.genericblock&&
  !["popup","main_frame","document"].includes(row.type)&&
  /^https?:\/\//i.test(row.url)&&row.url.length<=16384;
}
function classify(native,verdict,{skipped=false,production=null}={}){
 if(skipped)return "production_skips_vendor";
 if(verdict?.error)return "vendor_error";
 if(verdict?.redirect)return production?.rule?.source==="ghostery-safe-redirect"&&
   ((production.rule.redirect==="noop.js")||(production.rule.redirect==="empty.css"))&&
   production.block===true?"vendor_vetted_redirect_applied":"vendor_redirect_unsupported";
 if(verdict?.rewrite)return "vendor_rewrite_unsupported";
 if(native.block&&verdict?.exception)return "native_block_vendor_exception";
 if(native.rule?.exception&&verdict?.match&&!verdict?.exception)
  return "native_exception_vendor_block";
 if(!native.block&&verdict?.match&&!verdict?.exception)
  return "native_allow_vendor_block";
 if(native.block&&!verdict?.match&&!verdict?.exception)
  return "native_block_vendor_no_match";
 if(native.block&&verdict?.match)return "both_block";
 if(native.rule?.exception&&verdict?.exception)return "both_exception";
 if(native.rule?.exception)return "native_exception";
 if(verdict?.exception)return "vendor_exception";
 return "both_allow";
}
function state(native,vendor,hybrid,row){
 return Object.freeze({
  id:row.id,category:classify(native,vendor,{skipped:!eligible(row),production:hybrid}),
  nativeBlock:!!native.block,nativeException:!!native.rule?.exception,
  vendorMatch:!!vendor?.match,vendorException:!!vendor?.exception,
  vendorRedirect:!!vendor?.redirect,vendorRewrite:!!vendor?.rewrite,
  productionBlock:!!hybrid.block,
  vettedLocalRedirect:!!(hybrid?.block&&
   hybrid?.rule?.source==="ghostery-safe-redirect"&&
   (hybrid.rule.redirect==="noop.js"||hybrid.rule.redirect==="empty.css"))
 });
}
function audit(env,rows=SAMPLES){
 if(!Array.isArray(rows)||rows.length>MAX_CASES)throw Error("Bounded case array required");
 const output=[],cache=new Map();
 for(const row of rows){
  if(!row||typeof row.id!=="string"||!/^[a-z0-9-]{1,60}$/.test(row.id)||
     typeof row.rules!=="string"||row.rules.length>24000||
     typeof row.url!=="string"||row.url.length>16384||
     typeof row.origin!=="string"||
     !/^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/.test(row.origin)||
     !env.DKRules.validDomains(row.origin)||
     typeof row.type!=="string"||row.type.length>25)
   throw Error("Invalid bounded synthetic engine case");
  let engine=cache.get(row.rules);
  if(!engine){engine=env.DKHybridEngine.create(row.rules);cache.set(row.rules,engine);}
  const policy=row.policy||{},method=row.method||"GET";
  const own=engine.native.checkRequest(row.url,row.type,row.origin,policy,method);
  const prod=engine.checkRequest(row.url,row.type,row.origin,policy,method);
  let verdict={match:false};
  if(eligible(row)&&engine.vendor){
   try{
    const req=env.DKGhosteryVendor.Request.fromRawDetails({
     // Compare the exact type passed to Ghostery by the shipping hybrid
     // engine. Firefox's imageset/beacon aliases were previously compared
     // using the unnormalized raw type, creating false coverage gaps.
     url:row.url,type:env.DKHybridEngine.ghosteryType(row.type),
     sourceUrl:"https://"+row.origin+"/",method
    });
    verdict=engine.vendor.match(req)||{match:false};
   }catch(_){verdict={error:true};}
  }
  output.push(state(own,verdict,prod,row));
 }
 return output;
}
function summarize(results){
 const categories=Object.create(null);
 for(const result of results)
  categories[result.category]=(categories[result.category]||0)+1;
 return {caseCount:results.length,categories};
}
if(require.main===module){
 const cases=audit(loadEnvironment());
 console.log("DK Live Block Build 162: OFFLINE engine verdict comparison");
 console.log("Synthetic cases only. No URLs, filter lines or browser events included.");
 console.log(JSON.stringify({summary:summarize(cases),cases},null,2));
 console.log("Disagreements are diagnostic findings, not production policy changes.");
}
module.exports={SAMPLES,loadEnvironment,eligible,classify,state,audit,summarize};
