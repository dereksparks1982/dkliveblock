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

test("Both card groups use the original dark theme and still share one height",()=>{
 const html=site("index.html");
 assert.match(html,/\.information-grid \.info-card\{border-color:#456b70\}/);
 assert.doesNotMatch(html,/\.information-grid \.info-card\{background:#fff/);
 assert.match(html,/\.feature-card:hover,\.feature-card:focus-within\{border-color:var\(--a\);background:#0b2731\}/);
 assert.equal((html.match(/class="feature-card info-card"/g)||[]).length,6);
 assert.equal((html.match(/class="feature-card"/g)||[]).length,6);
});
test("Close exits the modal but every Back to top scrolls inside its existing modal",()=>{
 const html=site("index.html");
 assert.equal((html.match(/class="lesson-close lesson-close-bottom" type="button" hidden>Back to top/g)||[]).length,12);
 assert.doesNotMatch(html,/Back to the six lessons|Back to the information cards/);
 assert.match(html,/querySelector\("\.lesson-close:not\(\.lesson-close-bottom\)"\)/);
 assert.match(html,/querySelector\("\.lesson-close-bottom"\)/);
 assert.match(html,/dialog\.scrollTo\(\{top:0,behavior:"smooth"\}\)/);
 assert.ok(html.includes('button class="lesson-close" type="button" aria-label="Close'));
});

test("Back to top appears only if panel overflows",()=>{const html=site("index.html");assert.equal((html.match(/class="lesson-close lesson-close-bottom" type="button" hidden>Back to top/g)||[]).length,12);assert.match(html,/button\.hidden=dialog\.scrollHeight<=dialog\.clientHeight\+4/);assert.match(html,/\.lesson-close-bottom\[hidden\]\{display:none\}/);assert.match(html,/window\.addEventListener\("resize",updateOpenBackToTop/);});

test("All modal headers show a large cyan X with accessible Close label",()=>{
 const html=site("index.html");
 assert.equal((html.match(/<button class="lesson-close" type="button" aria-label="Close [^"]+"><span aria-hidden="true">&times;<\/span><\/button>/g)||[]).length,12);
 assert.doesNotMatch(html,/Close &times;/);
 assert.match(html,/\.lesson-close:not\(\.lesson-close-bottom\)\{display:inline-grid;place-items:center;width:44px;height:44px/);
 assert.match(html,/background:transparent;color:var\(--a\)/);
 assert.equal((html.match(/class="lesson-close lesson-close-bottom" type="button" hidden>Back to top/g)||[]).length,12);
});
test("All website card and button clicks use the bundled Pixabay sound without breaking dialog controls",()=>{
 const html=site("index.html");
 assert.equal((html.match(/id="dkButtonSound"/g)||[]).length,1);
 assert.match(html,/src="\/dkliveblock\/assets\/sound\/dragon-studio-button-press-382713\.mp3"/);
 assert.match(html,/buttonSound\.volume=0\.38/);
 assert.match(html,/document\.addEventListener\("click",event=>/);
 assert.match(html,/button,\.feature-card-link,\.project-link-button,nav\.links \.button/);
 assert.match(html,/buttonSound\.pause\(\)/);
 assert.match(html,/buttonSound\.currentTime=0/);
 assert.match(html,/buttonSound\.play\(\)/);
 assert.match(html,/playResult\.catch\(\(\)=>\{\}\)/);
 assert.doesNotMatch(html,/src="https?:\/\/pixabay\./);
});
