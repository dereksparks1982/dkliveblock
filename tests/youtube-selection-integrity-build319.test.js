"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path");
const Gate=require("../src/youtube-selection-gate.js");
test("Build 319: initially selected files remain valid until changed",()=>{
 const g=Gate.create(),n=g.start();assert.equal(g.valid(n),true);
});
test("Build 319: mid-read file selection invalidates prior revision",async()=>{
 const g=Gate.create(),old=g.start();
 await Promise.resolve();g.invalidate();
 assert.equal(g.valid(old),false);assert.equal(g.valid(g.start()),true);
});
test("Build 319: clearing reports invalidates in-progress comparison",()=>{
 const g=Gate.create(),old=g.start();g.invalidate();
 assert.equal(g.valid(old),false);assert.equal(g.valid("0"),false);
});
test("Build 319: revision does not capture filenames or private file contents",()=>{
 const g=Gate.create();g.invalidate();const r=JSON.stringify(g);
 assert.ok(!r.includes("watch?v"));assert.equal(g.valid(-1),false);
});
test("Build 319: UI guards compare and export and loads gate in correct order",()=>{
 const ui=fs.readFileSync(path.join(__dirname,"../src/youtube-lab-ui.js"),"utf8");
 const html=fs.readFileSync(path.join(__dirname,"../src/youtube-lab.html"),"utf8");
 assert.ok(html.indexOf('src="youtube-selection-gate.js"')<html.indexOf('src="youtube-lab-ui.js"'));
 for(const needle of ["selectionGate.start()","selectionGate.valid(revision)",
  "selectionGate.invalidate()","if(labBusy||!comparison||!projected)return"])
  assert.ok(ui.includes(needle),needle);
 assert.equal(require("../package.json").version,require("../src/manifest.json").version);
});