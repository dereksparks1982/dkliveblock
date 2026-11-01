"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path");
const root=path.join(__dirname,"../src");
test("Build 227 picker saves only on a successful background response, then hides the chosen element",()=>{
 const code=fs.readFileSync(path.join(root,"content.js"),"utf8");
 const picker=code.slice(code.indexOf(" async function choose("),code.indexOf(" function keys(",code.indexOf(" async function choose(")));
 assert.match(picker,/const result=await browser\.runtime\.sendMessage/);
 assert.match(picker,/if\(!result\?\.ok\)/);
 assert.match(picker,/pickerSelectors\.push\(selector\)/);
 assert.match(picker,/applyPickerCSS\(\)/);
 assert.match(picker,/refresh\(\)/);
 assert.ok(picker.indexOf("if(!result?.ok)")<picker.indexOf("pickerSelectors.push(selector)"));
 assert.doesNotMatch(picker,/event\.target\.style\.display\s*=/);
});
test("Build 227 own-picked CSS survives filter-list budget but is removable after undo or pause",()=>{
 const bg=fs.readFileSync(path.join(root,"background.js"),"utf8");
 const source=fs.readFileSync(path.join(root,"content.js"),"utf8");
 assert.match(bg,/pickerSelectors:active\?/);
 assert.match(bg,/data\.settings\.customRules\.split/);
 assert.match(bg,/split\("\\n"\)\.includes\(rule\)/);
 assert.match(bg,/await persistSettings\(\);rebuild\(\);return \{ok:true\}/);
 assert.match(source,/function applyPickerCSS\(/);
 assert.match(source,/pickerStyle\?\.remove\(\)/);
 assert.match(source,/pickerSelectors=active&&Array\.isArray\(s\.pickerSelectors\)/);
 assert.match(source,/pickerStyle\.id="dk-live-block-picker-style"/);
 assert.doesNotMatch(source,/event\.target\.style\.setProperty\("display"/);
});
test("Build 227 element-picking messages remain restricted to website content frames",()=>{
 const bg=fs.readFileSync(path.join(root,"background.js"),"utf8");
 assert.match(bg,/if\(!fromContent\|\|!activeTab\(id,h\)\)return \{error:"Element selection/);
 assert.match(bg,/selector\.length>600/);
 assert.match(bg,/Custom filter rule limit reached/);
});
