"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path");
const root=path.resolve(__dirname,"..");
const site=fs.readFileSync(path.join(root,"index.html"),"utf8");
test("Build 298: one accessible site-wide Back to top control after footer",()=>{
 assert.equal((site.match(/id="dkSiteBackToTop"/g)||[]).length,1);
 assert.match(site,/<button id="dkSiteBackToTop" class="site-back-to-top" type="button" aria-label="Back to top" title="Back to top" hidden>/);
 assert.match(site,/class="back-top-arrow" aria-hidden="true"/);
 assert.match(site,/class="back-top-label">Back to top/);
});
test("Build 298: long-page button only appears after user scrolls",()=>{
 assert.match(site,/siteBackToTop\.hidden=top<Math\.max\(480,/);
 assert.match(site,/window\.scrollY\|\|document\.documentElement\.scrollTop/);
 assert.match(site,/window\.addEventListener\("scroll",showSiteBackTop,\{passive:true\}\)/);
 assert.match(site,/window\.addEventListener\("resize",showSiteBackTop,\{passive:true\}\)/);
 assert.match(site,/showSiteBackTop\(\)/);
});
test("Build 298: clicking scrolls to actual page start, with reduced-motion respect",()=>{
 assert.match(site,/siteBackToTop\.addEventListener\("click"/);
 assert.match(site,/window\.scrollTo\(\{top:0,behavior:reduced\?"auto":"smooth"\}\)/);
 assert.match(site,/prefers-reduced-motion: reduce/);
});
test("Build 298: cyan on black, no layout shift, hidden when not needed",()=>{
 assert.match(site,/\.site-back-to-top\{position:fixed;/);
 assert.match(site,/border:2px solid #00e8eb/);
 assert.match(site,/background:#03090b;color:#00e8eb/);
 assert.match(site,/\.site-back-to-top\[hidden\]\{display:none!important\}/);
 assert.match(site,/\.site-back-to-top:focus-visible\{outline:3px solid #fff/);
 assert.match(site,/env\(safe-area-inset-bottom,0px\)/);
});
test("Build 298: Russian-language Back to top text is localized",()=>{
 assert.match(site,/dataset\.siteLanguage==="ru"\?"Наверх":"Back to top"/);
 assert.match(site,/siteBackToTop\.setAttribute\("aria-label",label\)/);
 assert.match(site,/document\.addEventListener\("dk-site-language-changed",localizeSiteBackTop\)/);
});
test("Build 298: owner-approved Russian banner asset and button order untouched",()=>{
 const localization=fs.readFileSync(path.join(root,"assets/site-localization.js"),"utf8");
 assert.match(localization,/Metallic%20Cyrillic%20Emblem%20and%20Gold%20Live%20Block%20Title/);
 assert.match(site,/id="dkSiteBanner"/);
 assert.match(site,/html\[data-site-language="ru"\] \.links \.button:nth-child\(1\)\{background:#101116/);
 assert.match(site,/html\[data-site-language="ru"\] \.links \.button:nth-child\(2\)\{background:#d1a143/);
 assert.match(site,/html\[data-site-language="ru"\] \.links \.button:nth-child\(3\)\{background:#e4e5e7/);
 assert.match(site,/html\[data-site-language="ru"\] \.links \.button:nth-child\(4\)\{background:#ba202b/);
 assert.equal((site.match(/class="feature-card-link"/g)||[]).length,12);
});
test("Build 298: brown backgrounds become charcoal with gold/red accents",()=>{
 assert.match(site,/html\[data-site-language="ru"\] body\{background:radial-gradient\(ellipse at top,#202530,#080b10 75%\)\}/);
 assert.match(site,/html\[data-site-language="ru"\] \.feature-grid \.feature-card\{background:#181c25/);
 assert.doesNotMatch(site,/background:#60262a|background:#351518|#5d1b20/);
});
test("Build 298: release version and test integration present",()=>{
 const p=require("../package.json"),m=require("../src/manifest.json");
 const runner=fs.readFileSync(path.join(root,"scripts/test-local.sh"),"utf8");
 assert.equal(p.version,require("../src/manifest.json").version);
 assert.equal(m.version,p.version);
 assert.ok(runner.includes("tests/website-back-to-top-build298.test.js"));
 assert.ok(runner.includes("tests/facebook-linked-author-build298.test.js"));
});
