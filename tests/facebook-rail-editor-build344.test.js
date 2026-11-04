"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict");
const FB=require("../src/facebook-ads.js");
function section(editor){
 const doc={body:{}},win={innerWidth:1300};
 const rail={contains:()=>true,parentElement:null},p={parentElement:rail,
  getBoundingClientRect:()=>({width:240,height:140,left:1000}),
  querySelector:s=>s.includes('contenteditable="true"')?(editor?{}:null):s==="img"?{}:null,
  querySelectorAll:()=>[]};
 const label={parentElement:p,closest:()=>null,contains:()=>false};
 return {label,rail,doc,win,p};
}
test("Build 344: interactive rail section never hidden",()=>{
 const f=section(true);assert.equal(FB.railSection(f.label,f.rail,f.doc,f.win),null);
});
test("Build 344: ordinary narrow Sponsored rail section remains selectable",()=>{
 const f=section(false);assert.equal(FB.railSection(f.label,f.rail,f.doc,f.win),f.p);
});
test("Build 344: right-rail link card refuses editor descendants",()=>{
 const src=require("node:fs").readFileSync(require("node:path").join(__dirname,"../src/facebook-ads.js"),"utf8");
 const part=src.slice(src.indexOf("function rightRailLinkCard"),src.indexOf("function sponsoredFeedCard"));
 assert.match(part,/contenteditable="true"/);
});
test("Build 344: byline in editable context cannot justify rail hide",()=>{
 const src=require("node:fs").readFileSync(require("node:path").join(__dirname,"../src/facebook-ads.js"),"utf8");
 const part=src.slice(src.indexOf("function rightRailCandidate"),src.indexOf("function railAdLink"));
 assert.match(part,/\[role="textbox"\]/);
 assert.match(part,/\[role="searchbox"\]/);
});
test("Build 344: Firefox manifest and package version unchanged in scope",()=>{
 const m=require("../src/manifest.json"),p=require("../package.json");
 assert.equal(m.version,p.version);
});
