"use strict";
const test=require("node:test"),assert=require("node:assert/strict");
const {validHost,allowHostOnSite}=require("../src/manual-rules.js");
test("build site-specific allow rules",()=>{
 assert.equal(allowHostOnSite("site.example","ads.example"),"@@||ads.example^$domain=site.example");
 assert.equal(validHost("cdn.example.com"),true);
});
test("reject malformed or injected hostnames",()=>{
 for(const bad of ["","-bad.com","bad-.com","hello..com","site.com,script","test.com^$important","EXAMPLE.COM","other/a.com","a".repeat(70)+".com","localhost:80"]){
  assert.equal(validHost(bad),false,bad);
  assert.equal(allowHostOnSite("site.example",bad),null);
 }
});
test("reject invalid page host",()=>{assert.equal(allowHostOnSite("evil^$important","ads.example"),null);});
