"use strict";
const test=require("node:test"),assert=require("node:assert/strict");
const {validate}=require("../src/subscriptions.js");
test("accept up to five explicit HTTPS subscriptions and deduplicate",()=>{
 assert.deepEqual(validate(["https://lists.example/adblock.txt","https://lists.example/adblock.txt"]),{urls:["https://lists.example/adblock.txt"]});
});
test("do not allow HTTP, credentials, fragments, localhost or over-limit",()=>{
 for(const url of ["http://example.test/rules.txt","https://user:pass@example.test/a.txt","https://example.test/a.txt#fragment","https://localhost/a.txt"])
  assert.equal(typeof validate([url]).error,"string");
 assert.equal(typeof validate(Array(6).fill("https://example.test/list.txt")).error,"string");
});
test("reject malformed backup payloads instead of coercing arbitrary values",()=>{
 assert.equal(typeof validate("https://example.test/filter.txt").error,"string");
 assert.equal(typeof validate([null]).error,"string");
});
