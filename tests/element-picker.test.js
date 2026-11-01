"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path");
const content=fs.readFileSync(path.join(__dirname,"../src/content.js"),"utf8");
const background=fs.readFileSync(path.join(__dirname,"../src/background.js"),"utf8");
const popup=fs.readFileSync(path.join(__dirname,"../src/popup.js"),"utf8");
test("Build 229: Block Element only hides in current document memory",()=>{
 const picker=content.slice(content.indexOf(" async function choose("),content.indexOf(" function keys(",content.indexOf(" async function choose(")));
 assert.match(picker,/temporarySelectors\.push\(selector\)/);
 assert.doesNotMatch(picker,/browser\.runtime\.sendMessage|persistSettings/);
 assert.match(content,/let temporarySelectors=\[\]/);
 assert.match(content,/const safe=active\?temporarySelectors\.filter/);
 assert.doesNotMatch(content,/pickerSelectors/);
 assert.doesNotMatch(background,/action==="addElementRule"|action==="undoElementRule"|pickerSelectors:/);
});
test("Build 229: Undo affects current page only; reload restores",()=>{
 assert.match(content,/action==="undoTemporaryHide"/);
 assert.match(content,/temporarySelectors\.pop\(\)/);
 assert.match(popup,/action:"undoTemporaryHide"/);
 assert.doesNotMatch(popup,/action:"undoElementRule"/);
 const manifest=JSON.parse(fs.readFileSync(path.join(__dirname,"../src/manifest.json"),"utf8"));
 assert.equal(manifest.version,require("../package.json").version);
});
