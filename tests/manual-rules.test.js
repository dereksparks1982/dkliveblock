"use strict";
const test=require("node:test"),assert=require("node:assert/strict");
const {validHost,allowHostOnSite,listSiteExceptions,removeSiteException}=require("../src/manual-rules.js");
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

test("list only exact site-specific allow rules, deduplicated",()=>{
 const content="@@||ads.example^$domain=site.example\n@@||ads.example^$domain=site.example\n@@||cdn.example^$domain=other.example\n||ads.example^";
 assert.deepEqual(listSiteExceptions(content,"site.example"),["ads.example"]);
 assert.deepEqual(listSiteExceptions(content,"other.example"),["cdn.example"]);
 assert.deepEqual(listSiteExceptions(content,"elsewhere.example"),[]);
});
test("remove exact exception without affecting unrelated rules",()=>{
 const before="||ads.example^\n@@||ads.example^$domain=site.example\n@@||cdn.example^$domain=other.example";
 const value=removeSiteException(before,"site.example","ads.example");
 assert.equal(value.removed,1);
 assert.equal(value.text,"||ads.example^\n@@||cdn.example^$domain=other.example");
 assert.equal(typeof removeSiteException(value.text,"site.example","ads.example").error,"string");
});
