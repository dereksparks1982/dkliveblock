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

test("reject direct IPs, internal and special-use names",()=>{
 for(const value of ["https://127.0.0.1/a","https://192.168.1.3/rules","https://10.0.0.3/a","https://[::1]/list","https://[fd00::1]/list","https://router.lan/list","https://device.home.arpa/a","https://host.internal/a","https://printer.local/a","https://example.invalid/list"])
  assert.equal(typeof validate([value]).error,"string",value);
});
test("custom subscriptions must have publicly named HTTPS hosts",()=>{
 const {publicHost}=require("../src/subscriptions.js");
 assert.equal(publicHost("example.org"),true);
 assert.equal(publicHost("example.local"),false);
 assert.equal(publicHost("localhost"),false);
 assert.equal(publicHost("[::1]"),false);
});
