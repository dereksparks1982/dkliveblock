"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path");
const ROOT=path.resolve(__dirname,"..");
test("Firefox manifest and package versions agree",()=>{
 const manifest=JSON.parse(fs.readFileSync(path.join(ROOT,"src/manifest.json"),"utf8"));
 const pkg=JSON.parse(fs.readFileSync(path.join(ROOT,"package.json"),"utf8"));
 assert.equal(manifest.version,pkg.version);
});
test("no test freezes the Firefox manifest version at an old release",()=>{
 const folder=path.join(ROOT,"tests");
 const frozen=/assert\.(?:equal|strictEqual)\(\s*(?:[a-zA-Z_$][\w$]*\.)?version\s*,\s*["']\d+\.\d+\.\d+["']/;
 for(const filename of fs.readdirSync(folder).filter(x=>x.endsWith(".test.js"))){
  const src=fs.readFileSync(path.join(folder,filename),"utf8");
  assert.doesNotMatch(src,frozen,filename+" must not pin a historical version");
 }
});
