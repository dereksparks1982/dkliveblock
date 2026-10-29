"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path");
const root=path.join(__dirname,"..");
test("PSL license and reproducible canonical refresh are present",()=>{
 const psl=fs.readFileSync(path.join(root,"vendor/public_suffix_list.dat"),"utf8");
 const manifest=JSON.parse(fs.readFileSync(path.join(root,"src/manifest.json"),"utf8"));
 const license=fs.readFileSync(path.join(root,"src/LICENSE-PSL.txt"),"utf8");
 const refresh=fs.readFileSync(path.join(root,"scripts/update-psl.py"),"utf8");
 const names=manifest.background.scripts;
 assert.ok(names.indexOf("public-suffix.js")>=0);
 assert.ok(names.indexOf("public-suffix.js")<names.indexOf("rules.js"));
 assert.match(license,/Mozilla Public License Version 2.0/);
 assert.match(psl,/BEGIN PRIVATE DOMAINS/);
 assert.match(psl,/BEGIN ICANN DOMAINS/);
 assert.match(refresh,/https:\/\/publicsuffix\.org\/list\/public_suffix_list\.dat/);
 assert.match(refresh,/--refresh/);
});

test("generated PSL snapshot exactly matches vendored MPL source",()=>{
 const raw=fs.readFileSync(path.join(root,"vendor/public_suffix_list.dat"),"utf8");
 const javascript=fs.readFileSync(path.join(root,"src/public-suffix.js"),"utf8");
 const match=/^const RAW=(.*);$/m.exec(javascript);
 assert.ok(match,"Missing generated PSL data");
 const normalized=raw.split(/\r?\n/).map(x=>x.trim()).filter(x=>x&&!x.startsWith("//")).join("\n");
 assert.equal(JSON.parse(match[1]),normalized);
});
