"use strict";
const test=require("node:test"),assert=require("node:assert/strict");
const C=require("../src/subscription-cache.js");
test("conditional validators are sent only when a successful list cache exists",()=>{
 assert.deepEqual(C.headers(null),{});
 assert.deepEqual(C.headers({etag:'"abc"'}),{});
 assert.deepEqual(C.headers({text:"list",etag:'W/"a123"'}),{"If-None-Match":'W/"a123"'});
 assert.deepEqual(C.headers({text:"list",lastModified:"Wed, 21 Oct 2015 07:28:00 GMT"}),{"If-Modified-Since":"Wed, 21 Oct 2015 07:28:00 GMT"});
});
test("reject injected cache metadata and invalid dates",()=>{
 assert.equal(C.safeTag('"a"\nInjected: yes'),"");
 assert.equal(C.safeTag("not-a-tag"),"");
 assert.equal(C.safeDate("not-a-date"),"");
 assert.deepEqual(C.headers({text:"list",etag:'"a"\nInjected: yes'}),{});
});
test("304 preserves current working list, increments checked time only",()=>{
 const prev={text:"[Adblock Plus 2.0] cached",updated:123,checked:124,etag:'"abc"'};
 const item=C.store(prev,{unchanged:true,metadata:{etag:'"abc"',lastModified:""}},999);
 assert.equal(item.text,prev.text);
 assert.equal(item.updated,123);
 assert.equal(item.checked,999);
 assert.throws(()=>C.store(null,{unchanged:true,metadata:{}},999),/without a cached/);
});
test("200 accepts new verified list and changes cache metadata",()=>{
 const item=C.store({text:"old",updated:10},{unchanged:false,text:"new",metadata:{etag:'"new"',lastModified:""}},100);
 assert.equal(item.text,"new");
 assert.equal(item.updated,100);
 assert.equal(item.etag,'"new"');
});
