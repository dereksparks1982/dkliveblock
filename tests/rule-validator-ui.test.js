"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path");
const dir=path.resolve(__dirname,"../src");
test("custom filter diagnostics are explicitly user-triggered and remain read-only",()=>{
 const html=fs.readFileSync(path.join(dir,"options.html"),"utf8"),
  logic=fs.readFileSync(path.join(dir,"options.js"),"utf8");
 assert.match(html,/id="validateCustomRules"/);
 assert.match(html,/id="customRuleValidationStatus"/);
 assert.match(html,/src="rules.js"/);
 assert.match(html,/src="rule-validator.js"/);
 assert.match(logic,/DKRuleValidator\.validate\(\$\("customRules"\)\.value\)/);
 assert.match(logic,/Read-only check: no rules saved or changed/);
 assert.doesNotMatch(logic.slice(logic.indexOf('$("validateCustomRules").addEventListener'),logic.indexOf('$("languageRecommend").addEventListener')),/saveSettings|sendMessage|eval\(/);
});
