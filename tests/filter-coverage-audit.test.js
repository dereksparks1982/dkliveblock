"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict");
const Audit=require("../scripts/filter-coverage-audit.js");
test("Build 165 native filter syntax is counted without revealing rule text",()=>{
 const result=Audit.analyze([
  "! header","||ads.example^$script","news.example##.ad",
  "news.example##+js(foo)","||ads.example^$csp=script-src 'none'",
  "||ads.example^$redirect-rule=noop.js",
  "@@||ads.example^$domain=news.*"
 ].join("\n"));
 assert.equal(result.lines,7);
 assert.equal(result.ignored,1);
 assert.equal(result.supported,2);
 assert.equal(result.unsupported,4);
 assert.equal(result.categories.unsupported_scriptlet,1);
 assert.equal(result.categories.unsupported_csp,1);
 assert.equal(result.categories.unsupported_redirect_rule,1);
 assert.equal(result.categories.unsupported_entity_domain,1);
 assert.ok(!("rules" in result)&&!("sources" in result));
});
test("Build 165 classification handles unsupported cosmetic syntax and valid native rules",()=>{
 assert.equal(Audit.category("news.example##.ad:style(color:red)"),
  "unsupported_extended_cosmetic");
 assert.equal(Audit.category("news.example#^#div"),"unsupported_html_filter");
 assert.equal(Audit.category("||ads.example^$image"),"native_network");
 assert.equal(Audit.category(""),"ignored");
});
test("Build 165 bounds maliciously large filters and supports bundled snapshots",()=>{
 assert.throws(()=>Audit.analyze("x".repeat(Audit.MAX_BYTES+1)),/size limit/);
 assert.throws(()=>Audit.analyze("x\n".repeat(Audit.MAX_LINES)),/line limit/);
 const bundled=Audit.bundled();
 assert.equal(typeof bundled.files,"number");
 assert.equal(typeof bundled.report.considered,"number");
 assert.ok(bundled.report.considered>=bundled.report.supported);
});

test("Build 179 hide-only style filters count as supported, arbitrary styling remains unsupported",()=>{
 const input=[
  "news.example##.sponsored:style(display:none!important)",
  "news.example#@#.sponsored:style(display:none!important)",
  "news.example##.arbitrary:style(color:red)",
  "##.unsafe-global:style(display:none!important)",
  "news.example##.native",
  "||ads.example^$image"
 ].join("\n");
 const result=Audit.analyze(input);
 assert.equal(result.categories.native_style_hide,2);
 assert.equal(result.categories.unsupported_extended_cosmetic,2);
 assert.equal(result.supported,4);
 assert.equal(result.unsupported,2);
 assert.equal(result.lines,6);
 assert.ok(!JSON.stringify(result).includes("news.example"));
});
