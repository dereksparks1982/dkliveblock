"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict");
const DB=require("../src/threat-database.js");
const hostnames=Array.from({length:100},(_,i)=>"phish"+i+".testdomain.net");
const feed="# Phishing Army domain feed\n"+hostnames.join("\n")+"\n";
const saved=DB.parse(feed);

test("Build 215 strictly accepts only plain hostname intelligence",()=>{
 assert.equal(saved.count,100);
 assert.equal(saved.hosts.has("phish0.testdomain.net"),true);
 for(const text of ["<html>Service unavailable</html>\n".repeat(80),
  "||ads.example^\n".repeat(100),
  "0.0.0.0 bad.example\n".repeat(100),
  '{"error":"rate limited"}',
  "hello\n".repeat(120),
  "phish1.example.com\n".repeat(10)]){
  assert.ok(DB.parse(text).error,"Invalid or too-small feed accepted");
 }
});
test("Build 215 exact-host matching never blocks shared parents or unlisted siblings",()=>{
 const data={hosts:saved.hosts,count:saved.count,updated:1000};
 assert.equal(DB.match(data,"phish4.testdomain.net").category,"phishing");
 for(const host of ["testdomain.net","safe.testdomain.net","sub.phish4.testdomain.net",
  "phish4.testdomain.net.attacker.com","phish4.testdomain.net.evil","localhost"]){
  assert.equal(DB.match(data,host),null,host);
 }
});
test("Build 215 no browsing-domain requests are needed for local matching",()=>{
 const data={hosts:saved.hosts,count:saved.count,updated:1000};
 assert.equal(DB.match(data,"phish4.testdomain.net",["phish4.testdomain.net"]),null);
 assert.ok(DB.match(data,"phish4.testdomain.net",["testdomain.net"]));
 assert.equal(DB.SOURCE.url,"https://phishing.army/download/phishing-army-domains.txt");
});
test("Build 215 only exact validated hostnames can become overrides",()=>{
 assert.deepEqual(DB.overrides(["phish4.testdomain.net","phish4.testdomain.net"]),["phish4.testdomain.net"]);
 for(const host of ["bad..site", "example.com/path","http://example.com","localhost",
  "127.0.0.1","UPPER.EXAMPLE","bad.tld?q=secret",null]){
  assert.equal(DB.overrides([host]),null,JSON.stringify(host));
 }
 assert.equal(DB.overrides(Array.from({length:251},(_,i)=>"host"+i+".example.net")),null);
});
test("Build 215 keeps the last-good list if a new response loses coverage",()=>{
 const current={count:1000};
 assert.equal(DB.shouldReplace(current,{count:300,hosts:new Set(["a"])}),false);
 assert.equal(DB.shouldReplace(current,{count:500,hosts:new Set(["a"])}),true);
 assert.equal(DB.shouldReplace(null,{count:2,hosts:new Set(["a","b"])}),false);
});
test("Build 215 quarantines broken persisted data and preserves verified cache",()=>{
 const cache={text:feed,updated:1700000000000};
 const restored=DB.restore(cache,1700000001000);
 assert.equal(restored.count,100);
 assert.equal(restored.updated,cache.updated);
 assert.equal(DB.restore({text:"<html>bad</html>",updated:cache.updated},1700000001000).count,0);
 assert.equal(DB.restore({text:feed,updated:1700000005000},1700000001000).count,100);
 assert.equal(DB.restore({text:feed,updated:1700004000000},1700000001000).count,0);
});
test("Build 215 harmless published test domains are not labeled phishing",()=>{
 const report=DB.parse(feed+"amiprotected.it\nwww.amiprotected.it\n");
 assert.equal(report.count,100);
 assert.equal(report.hosts.has("amiprotected.it"),false);
 assert.equal(report.hosts.has("www.amiprotected.it"),false);
});
test("Build 215 status reports an unloaded/stale database without false confidence",()=>{
 const x=DB.status(null,true,0,10000000);
 assert.equal(x.ready,false);
 assert.equal(x.count,0);
 const y=DB.status({count:100,updated:1},true,2,DB.AGE_MS*4);
 assert.equal(y.stale,true);
 assert.equal(y.overrides,2);
});
test("Build 215 real source/settings integration keeps threat blocking separate",()=>{
 const fs=require("node:fs"),path=require("node:path");
 const root=path.join(__dirname,"../src");
 const m=JSON.parse(fs.readFileSync(path.join(root,"manifest.json"),"utf8"));
 assert.ok(m.background.scripts.indexOf("threat-database.js")>=0);
 assert.ok(m.background.scripts.indexOf("threat-database.js")<m.background.scripts.indexOf("settings.js"));
 assert.ok(m.background.scripts.indexOf("threat-database.js")<m.background.scripts.indexOf("background.js"));
 const bg=fs.readFileSync(path.join(root,"background.js"),"utf8");
 assert.match(bg,/const threat=data.settings.threatProtection\?/);
 assert.match(bg,/DKThreatDB.match\(data.threatDB,host\(d.url\),data.settings.threatOverrides\)/);
 assert.match(bg,/if\(d.type==="main_frame"\)/);
 assert.ok(bg.indexOf("const threat=data.settings.threatProtection")<
  bg.indexOf('if(d.type==="main_frame"){'));
 assert.match(bg,/setThreatOverride/);
 assert.match(bg,/updateThreatDatabase/);
});
