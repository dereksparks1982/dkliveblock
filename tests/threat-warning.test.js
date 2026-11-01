"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path");
require("../src/threat-database.js");
const Warning=require("../src/threat-warning.js");
const random={getRandomValues(array){for(let i=0;i<array.length;i++)array[i]=i+1;return array;}};

test("Build 217 per-tab tokens contain no URL data and do not cross tabs",()=>{
 const records=new Map();
 const nonce=Warning.issue(records,4,"phish.example.org",1234,100000,random);
 assert.match(nonce,/^[a-f0-9]{32}$/);
 assert.deepEqual(Object.keys(records.get(4)).sort(),["created","expires","host","nonce","updated"]);
 assert.equal(Warning.read(records,4,nonce,100020).host,"phish.example.org");
 assert.equal(Warning.read(records,4,"f".repeat(32),100020),null);
 assert.equal(Warning.read(records,5,nonce,100020),null);
 assert.equal(Warning.url({getURL:p=>"moz-extension://test/"+p},nonce),
  "moz-extension://test/blocked.html#"+nonce);
});

test("Build 217 warning tokens expire and reject clock rollback",()=>{
 const records=new Map();
 let nonce=Warning.issue(records,5,"phish.example.org",0,120000,random);
 assert.equal(Warning.read(records,5,nonce,119999),null);
 assert.equal(records.size,0);
 nonce=Warning.issue(records,5,"phish.example.org",0,120000,random);
 assert.ok(Warning.read(records,5,nonce,120000+Warning.TTL_MS));
 assert.equal(Warning.read(records,5,nonce,120000+Warning.TTL_MS+1),null);
 assert.equal(records.size,0);
});

test("Build 217 rejects malformed hostname, missing randomness and overfilled map",()=>{
 const records=new Map();
 for(const host of ["somewhere.example/path","evil.example?token=x","EVIL.EXAMPLE",
  "localhost","../bad.example","sub..example"])
  assert.equal(Warning.issue(records,1,host,0,1000,random),null,host);
 assert.equal(Warning.issue(records,1,"valid.example.org",0,1000,null),null);
 assert.equal(Warning.url({getURL:p=>p},"invalid"),null);
 for(let i=0;i<Warning.MAX_TABS+7;i++)
  assert.ok(Warning.issue(records,i,"phish.example.org",0,1000,random));
 assert.equal(records.size,Warning.MAX_TABS);
 assert.equal(records.has(0),false);
 Warning.clear(records,Warning.MAX_TABS+6);
 assert.equal(records.size,Warning.MAX_TABS-1);
});

test("Build 217 warning assets are local and do not accept attacker query data",()=>{
 const root=path.resolve(__dirname,"../src");
 const html=fs.readFileSync(path.join(root,"blocked.html"),"utf8");
 const js=fs.readFileSync(path.join(root,"blocked.js"),"utf8");
 const manifest=JSON.parse(fs.readFileSync(path.join(root,"manifest.json"),"utf8"));
 assert.ok(manifest.web_accessible_resources.includes("blocked.html"));
 assert.ok(manifest.background.scripts.indexOf("threat-database.js")<
  manifest.background.scripts.indexOf("threat-warning.js"));
 assert.ok(manifest.background.scripts.indexOf("threat-warning.js")<
  manifest.background.scripts.indexOf("background.js"));
 assert.match(html,/id="acknowledge"/);
 assert.match(html,/id="proceed"/);
 assert.doesNotMatch(html,/<script[^>]+src="https?:/i);
 assert.match(js,/location\.hash\.slice\(1\)/);
 assert.doesNotMatch(js,/URLSearchParams|location\.search|innerHTML|eval\(/);
 assert.match(js,/details\.host/);
 assert.match(js,/textContent/);
});
