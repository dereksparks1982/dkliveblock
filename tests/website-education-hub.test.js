"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path");
const ROOT=path.resolve(__dirname,"..");
function site(pathname){return fs.readFileSync(path.join(ROOT,pathname),"utf8");}
const subjects=["ad-blocking","popups","request-control","site-control","ad-delivery","cookie-literacy"];
const info=["status","install","downloads","license","support","projects"];
test("Both live GitHub Pages entrypoints contain the same complete education hub",()=>{
 const a=site("index.html"),b=site("docs/index.html");
 assert.equal(a,b);
 assert.equal((a.match(/class="feature-card-link"/g)||[]).length,12);
 assert.equal((a.match(/<dialog class="lesson-dialog/g)||[]).length,12);
 assert.match(a,/<section id="feature-lessons"/);
 assert.match(a,/<section id="information-hub"/);
 for(const id of [...subjects.map(x=>"lesson-"+x),...info.map(x=>"info-"+x)]){
  assert.ok(a.includes('data-lesson="'+id+'"'),"missing interactive card for "+id);
  assert.ok(a.includes('id="'+id+'" aria-labelledby="'+id+'-title"'),"missing matching dialog for "+id);
 }
});
test("Original long form guidance, safety disclaimers and links remain in the information dialogs",()=>{
 const a=site("index.html");
 const required={
  status:["Development and site-test status","Build 263","Known FAIL / retest pending"],
  install:["Install for testing in Firefox","about:debugging","Load Temporary Add-on"],
  downloads:["Download options","Source ZIP","unsigned Firefox XPI"],
  license:["Free for everyone","project license","Patreon"],
  support:["Help and reporting","elderredsoftworks@proton.me","bug reporting guidance"],
  projects:["More from Elderred Softworks","Hanafi Learning Deck","Folkhold","Capital &amp; Consequence"]
 };
 for(const [name,phrases] of Object.entries(required)){
  const start=a.indexOf('<dialog class="lesson-dialog info-dialog" id="info-'+name+'"');
  assert.ok(start>=0);
  const end=a.indexOf("</dialog>",start);
  const panel=a.slice(start,end);
  for(const phrase of phrases)assert.ok(panel.includes(phrase),name+" lost: "+phrase);
 }
});
test("Information cards remain accessible via keyboard and mouse, not a decorative-only surface",()=>{
 const a=site("index.html");
 for(const slug of info)assert.ok(a.includes('href="#info-'+slug+'" data-lesson="info-'+slug+'"'));
 assert.ok(a.includes('aria-haspopup="dialog"'));
 assert.match(a,/document\.querySelectorAll\("\.feature-card-link\[data-lesson\]"\)/);
 assert.match(a,/dialog\.showModal\(\)/);
 assert.match(a,/dialog\.addEventListener\("close"/);
 assert.match(a,/\.lesson-close:focus-visible\{/);
 assert.match(a,/\.info-dialog \.lesson-inner > section\{/);
 assert.equal((a.match(/class="project-link-button"/g)||[]).length,3);
 assert.ok(!a.includes("Nougat Media Plus"));
});
test("Original top-level hero download links stay available without opening an info panel",()=>{
 const a=site("index.html");
 assert.ok(a.includes("Download source</span>"));
 assert.ok(a.includes("Download XPI</span>"));
 assert.ok(a.includes('aria-label="Downloads and support"'));
});

test("All twelve cards use one responsive measured height, regardless of which grid contains them",()=>{
 const html=site("index.html");
 assert.match(html,/\.feature-grid\{grid-auto-rows:var\(--education-card-height,auto\)\}/);
 assert.match(html,/document\.querySelectorAll\("\.feature-grid \.feature-card"\)/);
 assert.match(html,/getBoundingClientRect\(\)\.height/);
 assert.match(html,/style\.removeProperty\("--education-card-height"\)/);
 assert.match(html,/style\.setProperty\("--education-card-height",height\+"px"\)/);
 assert.match(html,/window\.addEventListener\("resize",queueCardHeights/);
 assert.match(html,/document\.fonts\.ready\.then\(queueCardHeights\)/);
 assert.ok(!html.includes('Explore the details'));
 assert.ok(!html.includes('Open details &rarr;'));
 assert.equal((html.match(/class="feature-card-link"/g)||[]).length,12);
});
