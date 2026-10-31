"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path");
const root=path.resolve(__dirname,"..");
test("Build 56 local QA fixture covers important ad and protected UI cases",()=>{
 const page=fs.readFileSync(path.join(root,"tests/fixtures/qa-lab.html"),"utf8");
 const server=fs.readFileSync(path.join(root,"scripts/qa-lab.py"),"utf8");
 for(const value of ["adsbygoogle","div-gpt-ad-","data-ad-client","dynamic",
  "attachShadow","mode:\"open\"",'addShadow("closedShadow"',"<article>","<form",
  "<video","rejectAll","acceptAll"])assert.ok(page.includes(value),value);
 assert.match(server,/HOST = "127\.0\.0\.1"/);
 assert.doesNotMatch(server,/webbrowser\.open|0\.0\.0\.0/);
});
