"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict");
const G=require("../src/ghostery-cosmetics.js");
test("strictly accepts cosmetic hide rules and rejects player elements and unsafe CSS",()=>{
 const result=G.sanitize([
  ".ad-banner {display:none!important;}", "#sponsor { display: none !important; }",
  "video {display:none!important;}",".player-overlay {display:none!important;}",
  ".unsafe {background:url(https://tracker.invalid/x)}",
  ".ad-banner {display:none!important;}"]);
 assert.match(result,/\.ad-banner/);
 assert.match(result,/#sponsor/);
 assert.doesNotMatch(result,/video|player-overlay|tracker\.invalid/);
 assert.equal((result.match(/\.ad-banner/g)||[]).length,1);
});
test("scriptlets are discarded, streaming sites do not request cosmetics",()=>{
 let calls=0;
 const vendor={getCosmeticsFilters(opts){
  calls++;assert.equal(opts.url,"https://news.example/");
  return {active:true,styles:[".sponsor-slot {display:none!important;}"],
   scripts:["document.cookie='DO_NOT_RUN';"]};
 }};
 assert.match(G.styles(vendor,"news.example"),/sponsor-slot/);
 assert.equal(calls,1);
 assert.equal(G.styles(vendor,"www.youtube.com",{streaming:true}),"");
 assert.equal(calls,1);
});
test("exception, unsupported vendor, malformed host all fail open",()=>{
 assert.equal(G.styles(null,"example.com"),"");
 assert.equal(G.styles({getCosmeticsFilters:()=>{throw Error("bad")}},"example.com"),"");
 assert.equal(G.styles({getCosmeticsFilters:()=>({active:false,styles:[".ads {display:none!important;}"]})},"example.com"),"");
 assert.equal(G.styles({getCosmeticsFilters:()=>({styles:[".ads {display:none!important;}"]})},"example.com/a"),"");
});

test("real Ghostery output is one CSS stylesheet string with comma-separated selectors",()=>{
 const vendor={getCosmeticsFilters:()=>({
  active:true,
  styles:".ad-card,\n.promoted,\nvideo,\n#player { display: none !important; }\n\n"+
   ".simple { display: none !important; }\n.bad { opacity: 0; }",
  scripts:["DO_NOT_EXECUTE();"]
 })};
 const css=G.styles(vendor,"news.example");
 assert.match(css,/\.ad-card/);
 assert.match(css,/\.promoted/);
 assert.match(css,/\.simple/);
 assert.doesNotMatch(css,/video|#player|opacity|DO_NOT_EXECUTE/);
});

test("Build 159 native document and elemhide exceptions also stop Ghostery CSS",()=>{
 let called=0;
 const vendor={getCosmeticsFilters(){called++;return {
  active:true,styles:".advertisement {display:none!important;}"};
 }};
 for(const policy of [{document:true},{elemhide:true},{document:true,elemhide:true}]){
  assert.equal(G.styles(vendor,"shop.example",{policy}),"");
 }
 assert.equal(called,0,"exception must prevent vendor CSS request");
 assert.match(G.styles(vendor,"shop.example",{policy:{}}),/advertisement/);
 assert.equal(called,1);
});
test("Build 159 generichide disables Ghostery base rules but keeps site-specific hiding",()=>{
 const seen=[],vendor={getCosmeticsFilters(opts){
  seen.push(opts);return {active:true,styles:".site-ad {display:none!important;}"};
 }};
 const css=G.styles(vendor,"news.example",{policy:{generichide:true}});
 assert.match(css,/site-ad/);
 assert.equal(seen.length,1);
 assert.equal(seen[0].getBaseRules,false,"must not inject global hiding CSS");
 assert.equal(seen[0].getRulesFromHostname,true);
 assert.equal(seen[0].getInjectionRules,true);
 G.styles(vendor,"news.example",{policy:{}});
 assert.equal(seen[1].getBaseRules,true);
});

test("Build 164 user-allowed selectors are omitted from supplemental Ghostery CSS",()=>{
 const vendor={getCosmeticsFilters:()=>({
  active:true,styles:".ad-slot {display:none!important;} .other-ad {display:none!important;}"
 })};
 const css=G.styles(vendor,"news.example",{protectSelector:x=>x===".ad-slot"});
 assert.doesNotMatch(css,/\.ad-slot/);
 assert.match(css,/\.other-ad/);
});

test("Build 203 validates same-host page paths for real Ghostery cosmetic matching",()=>{
 const paths=[],vendor={getCosmeticsFilters:opts=>{
  paths.push(opts.url);return {active:true,styles:".ad-slot {display:none!important;}"};}};
 G.styles(vendor,"news.example",{page:"https://news.example/article?lang=en"});
 G.styles(vendor,"news.example",{page:"https://attacker.test/secret"});
 G.styles(vendor,"news.example",{page:"https://user:pw@news.example/"});
 assert.deepEqual(paths,["https://news.example/article?lang=en",
  "https://news.example/","https://news.example/"]);
});
