"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict");
require("../src/rules.js");
require("../src/manual-rules.js");
const C=require("../src/cosmetic-exceptions.js");
test("an exact-site cosmetic exception is added once and can be removed",()=>{
 const a=C.change("||ads.example^","news.example",".side-ad",true);
 assert.equal(a.ok,true);assert.equal(a.changed,true);
 assert.match(a.text,/news\.example#@#\.side-ad/);
 const b=C.change(a.text,"news.example",".side-ad",true);
 assert.equal(b.changed,false);
 assert.deepEqual(C.list(a.text,"news.example"),[".side-ad"]);
 const c=C.change(a.text,"news.example",".side-ad",false);
 assert.equal(c.ok,true);assert.equal(c.text,"||ads.example^");
});
test("malicious selectors, arbitrary domains and oversized text are denied",()=>{
 for(const bad of ["x\n||ads.example^","a;body {display:block}","",":style(color:red)","a".repeat(300)]){
  assert.ok(C.change("","news.example",bad,true).error,bad);
 }
 assert.ok(C.change("","news.example.attacker.",".ad",true).error);
 assert.ok(C.change("x".repeat(1000000),"news.example",".ad",true).error);
 assert.ok(C.change("","news.example",".ad","true").error);
});
test("cosmetic exceptions do not alter network block rules",()=>{
 const input="||doubleclick.net^\nnews.example##.sponsored";
 const a=C.change(input,"news.example",".sponsored",true);
 assert.ok(a.ok);
 assert.match(a.text,/\|\|doubleclick\.net\^/);
 assert.match(a.text,/news\.example##\.sponsored/);
 assert.deepEqual(C.list(a.text,"unrelated.example"),[]);
});
