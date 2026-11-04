"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path");
const root=path.resolve(__dirname,"..");
const source=p=>fs.readFileSync(path.join(root,p),"utf8");
const control=require("../src/options-back-to-top.js");
test("Build 376: settings has one accessible Back to Top control",()=>{
 const html=source("src/options.html"),css=source("src/style.css");
 assert.equal((html.match(/id="settingsBackToTop"/g)||[]).length,1);
 assert.match(html,/<button id="settingsBackToTop" type="button"[^>]*hidden/);
 assert.match(html,/aria-label="Back to top"/);
 assert.match(html,/src="options-back-to-top.js"/);
 assert.match(css,/\.options #settingsBackToTop\[hidden\]\s*\{display:none/);
 assert.match(css,/position:fixed/);
});
test("Build 376: only appears when page is long and has actually been scrolled",()=>{
 assert.equal(control.shouldShow(239,1800,700),false);
 assert.equal(control.shouldShow(240,1800,700),true);
 assert.equal(control.shouldShow(500,745,700),false);
 assert.equal(control.shouldShow(500,1900,700),true);
 assert.equal(control.shouldShow(NaN,1900,700),false);
});
function fixture(reduced=false){
 const events={},calls=[],button={hidden:true,handlers:{},addEventListener(k,fn){this.handlers[k]=fn;}};
 const doc={documentElement:{scrollTop:0,scrollHeight:1800},
  getElementById:id=>id==="settingsBackToTop"?button:null,
  addEventListener(name,fn){events["document:"+name]=fn;}};
 const win={scrollY:0,innerHeight:700,requestAnimationFrame:cb=>cb(),
  addEventListener(name,fn){events[name]=fn;},
  matchMedia:()=>({matches:reduced}),scrollTo:args=>calls.push(args)};
 return {doc,win,events,calls,button};
}
test("Build 376: scroll, collapse and resize correctly toggle visibility",()=>{
 const f=fixture();
 assert.equal(control.init(f.doc,f.win),true);
 assert.equal(f.button.hidden,true);
 f.win.scrollY=330;f.events.scroll();
 assert.equal(f.button.hidden,false);
 f.doc.documentElement.scrollHeight=750;f.events["document:toggle"]();
 assert.equal(f.button.hidden,true);
 f.doc.documentElement.scrollHeight=1800;f.events.resize();
 assert.equal(f.button.hidden,false);
 f.win.scrollY=0;f.events.scroll();
 assert.equal(f.button.hidden,true);
});
test("Build 376: click scrolls window to top and honors reduced motion",()=>{
 for(const reduced of [false,true]){
  const f=fixture(reduced);control.init(f.doc,f.win);
  f.button.handlers.click();
  assert.deepEqual(f.calls,[{top:0,behavior:reduced?"auto":"smooth"}]);
 }
});
test("Build 376: settings UI remains isolated from content and blockers",()=>{
 const html=source("src/options.html"),script=source("src/options-back-to-top.js");
 assert.ok(html.indexOf('src="options-back-to-top.js"')>html.indexOf('src="options.js"'));
 for(const bad of ["browser.runtime","storage.local","fetch(","XMLHttpRequest","location.href"])
  assert.ok(!script.includes(bad),bad);
 assert.match(source("src/ui-language.js"),/"Back to top":"Наверх"/);
});
