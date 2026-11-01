"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path");
const source=fs.readFileSync(path.join(__dirname,"../src/content.js"),"utf8");
const popup=fs.readFileSync(path.join(__dirname,"../src/popup.js"),"utf8");
test("Build 228 picker is page-only; a document reload resets its picks",()=>{
 const picker=source.slice(source.indexOf(" async function choose("),source.indexOf(" function keys(",source.indexOf(" async function choose(")));
 assert.match(picker,/temporarySelectors\.push\(selector\)/);
 assert.match(picker,/applyPickerCSS\(\)/);
 assert.doesNotMatch(picker,/sendMessage\(\{action:"addElementRule"/);
 assert.match(source,/let temporarySelectors=\[\]/);
 assert.match(source,/function applyPickerCSS\(/);
 assert.match(source,/\.\.\.temporarySelectors/);
 assert.doesNotMatch(picker,/browser\.runtime\.sendMessage|await persistSettings\(/);
});
test("Build 228 undo restores temporary picks first while keeping legacy saved-rule Undo",()=>{
 assert.match(source,/action==="undoTemporaryHide"/);
 assert.match(source,/temporarySelectors\.pop\(\)/);
 assert.match(popup,/browser\.tabs\.sendMessage\(tab\.id,\{action:"undoTemporaryHide"\}\)/);
 assert.match(popup,/action:"undoElementRule"/);
 assert.match(popup,/action:"refresh"/);
});
test("Build 228 selected picker CSS stays style-based and obeys pause",()=>{
 assert.match(source,/pickerStyle\.id="dk-live-block-picker-style"/);
 assert.match(source,/pickerStyle\?\.remove\(\)/);
 assert.match(source,/if\(!nextActive\)temporarySelectors=\[\]/);
 const manifest=JSON.parse(fs.readFileSync(path.join(__dirname,"../src/manifest.json"),"utf8"));
 assert.equal(manifest.version,"0.3.198");
});
