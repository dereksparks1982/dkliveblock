"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict");
require("../src/manual-rules.js");
const A=require("../src/site-allowlist.js");
test("hostnames and pasted HTTP(S) URLs store only a canonical hostname",()=>{
 assert.equal(A.host("https://WWW.Example.org/path?token=SECRET#private"),"www.example.org");
 assert.equal(A.host("EXAMPLE.ORG"),"example.org");
 for(const input of ["https://user:secret@example.org/x","javascript:alert(1)",
  "file:///tmp/secret","example..org","https://example.org.evil.test/".repeat(200)])
  assert.equal(A.host(input),"",input);
 const added=A.add([],"https://example.org/watch?token=PRIVATE");
 assert.deepEqual(added.entries,["example.org"]);
 assert.doesNotMatch(JSON.stringify(added),/PRIVATE|watch|token/);
});
test("allowed hostname covers subdomains, but never unrelated suffixes",()=>{
 const sites=["example.org","news.example.org","other.test"];
 assert.equal(A.match(sites,"shop.example.org"),"example.org");
 assert.equal(A.match(sites,"news.example.org"),"news.example.org");
 assert.equal(A.match(sites,"notexample.org"),"");
 assert.equal(A.match(sites,"example.org.attacker.net"),"");
});
test("add and remove reuse the same setting and limit duplicates",()=>{
 const first=A.add([],"example.org"),duplicate=A.add(first.entries,"https://example.org/a");
 assert.equal(duplicate.unchanged,true);
 assert.deepEqual(duplicate.entries,["example.org"]);
 assert.equal(A.remove(duplicate.entries,"example.org").entries.length,0);
 assert.ok(A.remove([],"example.org").error);
});
test("resuming inherited subdomain allowlist removes only effective matching parent entries",()=>{
 const paused=["example.org","www.example.org","other.test"];
 const result=A.resume(paused,"www.example.org");
 assert.deepEqual(result.removed,["example.org","www.example.org"]);
 assert.deepEqual(result.entries,["other.test"]);
 assert.equal(A.match(result.entries,"www.example.org"),"");
});
test("malformed stored settings are bounded and filtered",()=>{
 const input=["example.org",null,"EXAMPLE.ORG","bad..example","example.org",
  ...Array.from({length:600},(_,i)=>"site"+i+".example")];
 const normalized=A.normalize(input);
 assert.equal(normalized.length,500);
 assert.equal(normalized[0],"example.org");
 assert.equal(normalized.includes("EXAMPLE.ORG"),false);
 assert.ok(A.add(normalized,"last.example").error);
});
