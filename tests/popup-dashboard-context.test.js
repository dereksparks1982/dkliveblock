"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path");
const popup=fs.readFileSync(path.resolve(__dirname,"../src/popup.js"),"utf8");
const start=popup.indexOf("async function resolveWebsiteTab(");
const end=popup.indexOf("async function load(){",start);
assert.ok(start>=0&&end>start,"Popup dashboard resolver must exist");
function makeResolver(){
 const browser={runtime:{getURL:p=>"moz-extension://dk-test-uuid/"+p},
  tabs:{get:async id=>{
   if(id===15)return {id:15,url:"https://www.youtube.com/watch?v=test",title:"YouTube video"};
   if(id===16)return {id:16,url:"moz-extension://dk-test-uuid/options.html"};
   throw Error("tab unavailable");
  }}};
 return new Function("browser",popup.slice(start,end)+"\nreturn resolveWebsiteTab;")(browser);
}
test("popup opened over own dashboard shows selected YouTube tab, not extension-tab count",async()=>{
 const f=makeResolver();
 const focused={id:80,url:"moz-extension://dk-test-uuid/site-dashboard.html?tab=15#blocked-requests"};
 const result=await f(focused);
 assert.equal(result.id,15);
 assert.equal(result.url,"https://www.youtube.com/watch?v=test");
});
test("popup never trusts unrelated sites, forged extension URLs or missing tab IDs",async()=>{
 const f=makeResolver();
 for(const tab of [
  {id:12,url:"https://example.com/?tab=15"},
  {id:13,url:"moz-extension://foreign-extension/site-dashboard.html?tab=15"},
  {id:14,url:"moz-extension://dk-test-uuid/site-dashboard.html?tab=16"},
  {id:17,url:"moz-extension://dk-test-uuid/site-dashboard.html?tab=12345"},
  {id:18,url:"moz-extension://dk-test-uuid/site-dashboard.html?tab=15a"}
 ]){
  assert.equal(await f(tab),tab,tab.url);
 }
});
