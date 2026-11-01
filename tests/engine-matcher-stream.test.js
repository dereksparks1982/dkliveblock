"use strict";
const test=require("node:test"),assert=require("node:assert/strict");
const R=require("../src/rules.js");
const {FilterEngine}=require("../src/engine.js");

// Independent reference for the Build 205 candidate order. Deliberately
// retain the old allocation-heavy method here as an equivalence oracle.
function legacyCandidates(e,url,target=R.host(url)){
 const result=e.generic.slice(),parts=target.split(".");
 for(let i=0;i<parts.length;i++){
  const bucket=e.hostIndex.get(parts.slice(i).join("."));
  if(bucket)result.push(...bucket);
 }
 if(!e.tokenIndex.size)return result;
 const lower=url.toLowerCase(),seen=new Set();
 for(let i=0;i<lower.length-3;i++){
  const token=lower.slice(i,i+4);
  if(seen.has(token))continue;
  seen.add(token);
  const bucket=e.tokenIndex.get(token);
  if(bucket)result.push(...bucket);
 }
 return result;
}
function legacyCheck(e,url,type,docHost,policy={},method=""){
 if(typeof url!=="string"||url.length>16384||!/^https?:/i.test(url)||policy.document)
  return {block:false,rule:null};
 const target=R.host(url),kind=R.TYPE[type]||type||"other";
 let block=null,allow=null,important=null;
 for(const r of legacyCandidates(e,url,target)){
  if(kind==="popup"&&!r.include.has("popup"))continue;
  if(r.methods){
   const m=typeof method==="string"?method.toUpperCase():"";
   if(!m||r.methods.no.has(m)||r.methods.yes.size&&!r.methods.yes.has(m))continue;
  }
  if(policy.genericblock&&!r.scope&&!r.exception)continue;
  if(r.include.size&&!r.include.has(kind)||r.exclude.has(kind)||
     !R.networkScopeMatches(docHost,r.scope))continue;
  if(r.targetScope&&!R.domains(target,r.targetScope))continue;
  if(r.denyallow&&R.domains(target,r.denyallow))continue;
  if(r.third!==null&&r.third!==(!!(target&&docHost&&R.site(target)!==R.site(docHost))))continue;
  if(r.anchor&&!R.sub(target,r.anchor)||!r.compiled.test(url))continue;
  if(r.exception)allow=r;else if(r.important)important=r;else block=r;
 }
 return important?{block:true,rule:important}:allow?{block:false,rule:allow}:
  {block:!!block,rule:block};
}
const FILTERS=[
 "||ads.example^$script",
 "@@||ads.example/private^$script,domain=trusted.example",
 "||ad*.example.com^$image",
 "||cdn*.tracker.net^$xmlhttprequest,third-party",
 "||pop.example^$popup",
 "||important.example^$important",
 "@@||important.example^$script",
 "||case.example^$match-case,script",
 "*promo*$image",
 "promo*img$script",
 "adsbanner",
 "adserver",
 "||deep.host.example^$image,method=GET",
 "||remote.example^$script,domain=news.example",
 "||error.example^$script,denyallow=trusted.example,domain=news.example",
 "$script,domain=publisher.example",
 "$popup,domain=publisher.example",
 "||ads.example^$badfilter",
 "||ads.example^$script,important"
].concat(Array.from({length:180},(_,i)=>
 i%3===0?"||ads"+i+".perf.invalid^$image":
 i%3===1?"tracking"+i+"*$script":
 "||cdn"+i+".perf.invalid^$xmlhttprequest"));
const REQUESTS=[
 "https://ads.example/a.js","https://ads.example/private/offer.js",
 "https://ad1.example.com/asset.png",
 "https://cdn42.tracker.net/api","https://important.example/ads.js",
 "https://pop.example/new","https://case.example/CASE.js",
 "https://case.example/case.js","https://adsbanner.invalid/ads",
 "https://notads.example/path","https://adserver123.invalid/ads",
 "https://deep.host.example/photo.jpg","https://remote.example/promo.js",
 "https://error.example/ads.js","https://cdn19.perf.invalid/api",
 "https://ads20.perf.invalid/banner.jpg","https://news.example/tracking1.js",
 "https://images.example/promo-banner.img",
 "https://news.example/nothing"
];
const plainVerdict=v=>({block:v.block,key:v.rule?.key||null});

test("Build 206 candidate sequence matches prior allocation-based scanner",()=>{
 const e=new FilterEngine(FILTERS.join("\n"));
 for(const url of REQUESTS){
  assert.deepEqual(e.candidates(url).map(x=>x.key),
   legacyCandidates(e,url).map(x=>x.key),url);
  const visited=[];
  e.visitCandidates(url,R.host(url),rule=>visited.push(rule.key));
  assert.deepEqual(visited,legacyCandidates(e,url).map(x=>x.key));
 }
});
test("Build 206 all matching precedences agree with original matcher",()=>{
 const e=new FilterEngine(FILTERS.join("\n"));
 let cases=0;
 for(const url of REQUESTS)
 for(const type of ["script","image","xmlhttprequest","popup","main_frame"])
 for(const origin of ["news.example","trusted.example","publisher.example","stranger.invalid"])
 for(const policy of [{},{genericblock:true},{document:true}])
 for(const method of ["GET","POST"]){
  const expected=legacyCheck(e,url,type,origin,policy,method);
  const actual=e.checkRequest(url,type,origin,policy,method);
  assert.deepEqual(plainVerdict(actual),plainVerdict(expected),
   "Mismatch at request "+cases);
  cases++;
 }
 assert.equal(cases,REQUESTS.length*5*4*3*2);
});
test("Build 206 optimized checkRequest avoids copying the candidates array",()=>{
 const e=new FilterEngine(FILTERS.join("\n"));
 e.candidates=()=>{throw Error("candidate array allocated on hot path");};
 assert.equal(e.shouldBlock("https://ad1.example.com/banner.png","image",
  "news.example"),true);
 assert.equal(e.shouldBlock("https://adserver123.invalid/banner.js","script",
  "news.example"),true);
});
test("Build 206 literal path is regex-equivalent for ASCII and falls back for Unicode",()=>{
 const e=new FilterEngine([
  "sponsored","Sponsored$match-case","||ads.example^",
  "a*b$script","/a[0-9]+b/$script","x+y","foo?bar"
 ].join("\n"));
 for(const rule of e.candidates("https://news.example/sponsored/x+y?foo?bar"))
 for(const url of ["https://news.example/sponsored/x+y?foo?bar",
   "https://news.example/SPONSORED/X+Y?FOO?BAR",
   "https://news.example/\u212a/sponsored",
   "https://news.example/a1b","https://news.example/normal"]){
  assert.equal(e.matchesRule(rule,url,url.toLowerCase(),!/[^\x00-\x7f]/.test(url)),
   rule.compiled.test(url),rule.p);
 }
});
test("Build 206 external candidate API and reload remain compatible",()=>{
 const e=new FilterEngine(FILTERS.join("\n"));
 assert.equal(Array.isArray(e.candidates("https://ads.example/a.js")),true);
 e.load("||new.example^$script\n@@||new.example/allowed^$script");
 assert.equal(e.shouldBlock("https://new.example/a.js","script","news.example"),true);
 assert.equal(e.shouldBlock("https://new.example/allowed","script","news.example"),false);
 assert.equal(e.shouldBlock("https://ads.example/a.js","script","news.example"),false);
});
