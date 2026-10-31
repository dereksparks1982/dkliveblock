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
