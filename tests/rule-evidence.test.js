"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict");
const R=require("../src/rule-evidence.js");
test("safe hostname-only blocking patterns are visible",()=>{
 assert.deepEqual(R.explain("||doubleclick.net^"),{
  source:"Native network filter (original list not determined)",pattern:"||doubleclick.net^"});
 assert.deepEqual(R.explain("[Ghostery network filter]"),{
  source:"Embedded Ghostery network filter",pattern:"Rule text not exposed by embedded matcher"});
});
test("private query strings and URL paths never leak in explanations",()=>{
 for(const input of ["||www.google.com/path?token=PRIVATE^","secret=PRIVATE","/track\\/user@example.com/",
  "||a.example^$domain=customer.internal","https://site.test/a?token=PRIVATE"]){
  const output=JSON.stringify(R.explain(input));
  assert.equal(output.includes("PRIVATE"),false);
  assert.equal(output.includes("customer.internal"),false);
  assert.equal(output.includes("user@example"),false);
  assert.match(output,/withheld/);
 }
});
