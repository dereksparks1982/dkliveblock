"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path");
const root=path.join(__dirname,"../src");
test("individual filter list UI has specific actions and local text-only status",()=>{
 const html=fs.readFileSync(path.join(root,"options.html"),"utf8");
 const js=fs.readFileSync(path.join(root,"options.js"),"utf8");
 for(const id of ["filterListRows","filterListNotice","customListRows","customListNotice","customSubscriptions"])
  assert.ok(html.includes('id="'+id+'"'));
 for(const action of ["setBuiltInListEnabled","updateFilterList","removeCustomFilterList"])
  assert.ok(js.includes('action:"'+action+'"'));
 assert.ok(js.includes("status.textContent"));
 assert.match(js,/makeLine\(\)/);
});
test("background validates built-in list IDs and custom list ownership",()=>{
 const js=fs.readFileSync(path.join(root,"background.js"),"utf8");
 assert.match(js,/Object\.prototype\.hasOwnProperty\.call\(SOURCES,msg\.key\)/);
 assert.match(js,/customSubscriptions\.includes\(msg\.url\)/);
 assert.match(js,/DKSubscriptionCache\.store\(prev,result,Date\.now\(\)\)/);
 assert.match(js,/data\.updateJob/);
 assert.match(js,/delete data\.customLists\[msg\.url\]/);
});
