"use strict";
const {test}=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path");
const Details=require("../src/inspector-details.js");
const Groups=require("../src/tracker-groups.js");
const Access=require("../src/access-inspector.js");
const read=name=>fs.readFileSync(path.join(__dirname,"../src",name),"utf8");

test("Build 239 DOM inspector exposes only safe, bounded hierarchy",()=>{
 const body={nodeType:1,localName:"body"};
 const doc={body,documentElement:{}};
 const target={nodeType:1,localName:"div",parentElement:body,
  id:"private-order-347",className:"customer-77",textContent:"private conversation",
  getAttribute:k=>k==="role"?"article":null,
  getBoundingClientRect:()=>({width:500,height:240})};
 const rows=Details.hierarchy(target,doc);
 assert.equal(rows.length,2);
 assert.deepEqual(rows.map(x=>x.element),["div [role=article]","body"]);
 assert.equal(rows[0].size.width,500);
 const raw=JSON.stringify(rows);
 for(const privateText of ["private-order","customer-77","private conversation"])
  assert.equal(raw.includes(privateText),false);
 let node=target;for(let i=0;i<40;i++)node={nodeType:1,localName:"span",parentElement:node};
 assert.ok(Details.hierarchy(node,doc).length<=8);
});

test("Build 239 cosmetic inspector distinguishes matches from applied rule evidence",()=>{
 const target={nodeType:1,matches:s=>s===".direct",
  querySelector:s=>s===".descendant"?{}:null};
 const selections=Details.matchedCosmetics(target,[
  ".direct",".descendant",".organic","##:has-text(Sponsored)",":matches-css(display:block)"
 ]);
 assert.equal(selections.matches.length,2);
 assert.deepEqual(selections.matches.map(x=>x.where),["selected item","inside selected item"]);
 assert.ok(selections.unsupported>=2);
 assert.match(selections.disclaimer,/not proof/i);
 assert.equal(Details.matchedCosmetics(target,Array(200).fill(".organic")).checked,80);
 assert.equal(Details.selectorOK("".padEnd(250,"x")),false);
});

test("Build 239 third-party summary groups actual captured requests only",()=>{
 const log={siteHost:"facebook.com",rows:[
  {host:"facebook.com",type:"image",status:"allowed"},
  {host:"ads.example",type:"script",status:"blocked"},
  {host:"ads.example",type:"script",status:"allowed"},
  {host:"metrics.example",type:"image",status:"allowed"},
  {host:"ads.example",type:"script",status:"failed"},
  {host:"ads.example",type:"main_frame",status:"allowed"},
  {host:"bad/?q=private",type:"script",status:"blocked"},
  {host:"nothing.invalid",type:"script",status:"not-requested"}
 ]};
 const groups=Groups.group(log,Access);
 assert.equal(groups.some(x=>x.host==="facebook.com"),false);
 const ad=groups.find(x=>x.host==="ads.example"&&x.type==="script");
 assert.ok(ad);
 assert.equal(ad.total,3);assert.equal(ad.blocked,1);assert.equal(ad.allowed,1);
 assert.match(ad.purpose.purpose,/advertis|script|purpose cannot/i);
 assert.equal(groups.some(x=>x.host.includes("/?")),false);
 assert.equal(Groups.group({siteHost:"facebook.com",rows:[]} ,Access).length,0);
});

test("Build 239 tracker summary bounds long captures and distinct destinations",()=>{
 const rows=[];
 for(let i=0;i<1600;i++)rows.push({
  host:"host"+i+".example",type:"image",status:"allowed"});
 const grouped=Groups.group({siteHost:"facebook.com",rows},Access);
 assert.equal(grouped.length,30);
 assert.ok(grouped.every(x=>x.host!=="host0.example"),
  "The oldest discarded entries must not reappear");
 assert.ok(Groups.group({siteHost:"facebook.com",rows},Access,5).length<=5);
});

test("Build 239 integrated inspector tools remain local, opt-in, and source-ordered",()=>{
 const manifest=JSON.parse(read("manifest.json")),scripts=manifest.content_scripts[0].js;
 assert.ok(scripts.indexOf("inspector-details.js")>scripts.indexOf("ad-investigation.js"));
 assert.ok(scripts.indexOf("inspector-details.js")<scripts.indexOf("ad-investigation-ui.js"));
 const ui=read("ad-investigation-ui.js");
 for(const needle of ["DOM hierarchy & cosmetic filter matches","getInvestigatorCosmetics",
  "openInvestigatorTool","Network log & tracker controls",
  'openTool("dashboard")','openTool("cosmetic")',"activeSelectors","activeExceptions"])
  assert.ok(ui.includes(needle),needle);
 assert.ok(ui.includes("  close();\n  try{"),"Reset UI before loading the site's exceptions");
 assert.doesNotMatch(ui,/fetch\(|XMLHttpRequest|WebSocket|browser\.storage\./);
 const background=read("background.js");
 assert.match(background,/msg\.action==="getInvestigatorCosmetics"/);
 assert.match(background,/sender\.frameId!==0/);
 assert.match(background,/browser\.tabs\.get\(id\)/);
 assert.match(background,/activeTab\(id,h\)/);
 assert.match(background,/Object\.prototype\.hasOwnProperty\.call\(tools,msg\.tool\)/);
 assert.doesNotMatch(ui,/saveRule|autoBlockFromScore/);
});

test("Build 239 request controls are slider-shaped real checkboxes, not fake buttons",()=>{
 const monitor=read("network-monitor.js"),dashboard=read("site-dashboard.js");
 const css=read("style.css"),html=read("network-monitor.html");
 assert.match(monitor,/wrap\.append\(input,track,caption\)/);
 assert.match(dashboard,/wrap\.append\(input,track,caption\)/);
 assert.match(monitor,/toggle\.type="checkbox"/);
 assert.match(dashboard,/checkbox\.type="checkbox"/);
 assert.match(monitor,/requestSwitch\(toggle,"Allow"\)/);
 assert.match(monitor,/requestSwitch\(toggle,"Block"\)/);
 assert.match(dashboard,/requestSwitch\(checkbox,"Allow"\)/);
 assert.match(dashboard,/requestSwitch\(checkbox,"Block"\)/);
 assert.match(css,/\.dk-toggle input:checked\+\.dk-toggle-track/);
 assert.match(css,/\.dk-toggle input:focus-visible\+\.dk-toggle-track/);
 assert.match(css,/\.dk-toggle input:disabled\+\.dk-toggle-track/);
 assert.match(html,/id="trackerRows"/);
 assert.match(html,/src="tracker-groups\.js"/);
 assert.match(monitor,/DKTrackerGroups\.group\(snapshot,DKAccessInspector\)/);
 assert.match(monitor,/setSelectiveBlock|blockAllowedEntry/);
});

test("Build 239 popup icon + LIVE BLOCK brand, three-tone controls preserve geometry",()=>{
 const html=read("popup.html"),css=read("style.css");
 assert.match(html,/<img src="icons\/dk-live-block\.png"/);
 assert.match(html,/<strong>LIVE BLOCK<\/strong>/);
 assert.doesNotMatch(html,/<strong>DK LIVE BLOCK<\/strong>/);
 for(const tone of ["cyan","white","black"])assert.match(html,new RegExp('data-tone="'+tone+'"'));
 assert.match(css,/\.popup\{width:340px\}/);
 assert.match(css,/\.popup button\[data-tone="cyan"\]/);
 assert.match(css,/\.popup button\[data-tone="white"\]/);
 assert.match(css,/\.popup button\[data-tone="black"\]/);
 assert.match(css,/\.popup #enabled:checked::after/);
 assert.match(html,/id="investigateAd"/);
});

test("Build 239 existing context picker and adjustable investigator remain intact",()=>{
 const ui=read("ad-investigation-ui.js"),popup=read("popup.html");
 assert.match(ui,/document\.addEventListener\("pointermove",movePanel,true\)/);
 assert.match(ui,/panelPosition=\{left,top\}/);
 assert.match(ui,/button\("Hide this page item"/);
 assert.match(ui,/undoStack\.push/);
 assert.match(ui,/button\("Copy draft rule"/);
 assert.match(popup,/id="picker"/);
 assert.match(popup,/id="undo"/);
});
