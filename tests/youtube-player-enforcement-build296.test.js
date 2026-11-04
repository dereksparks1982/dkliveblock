"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path");
const Health=require("../src/playback-health.js");
const Anti=require("../src/anti-adblock.js");
const denied="Ad blockers violate Youtubes Terms of Service. It looks like you may be using an ad blocker. Video playback is blocked unless YouTube is allowlisted or the ad blocker is disabled.";
function fixture(text=denied){
 const node={isConnected:true,textContent:text,getClientRects:()=>[{}]};
 const seen=[];
 const doc={visibilityState:"visible",hidden:false,
  querySelector(selector){seen.push(selector);return selector==="#movie_player .ytp-error"?node:null;},
  defaultView:{getComputedStyle:()=>({display:"block",visibility:"visible"})}};
 return {node,doc,seen};
}
test("Build 296 recognizes the screenshot's exact ordinary-video playback refusal",()=>{
 assert.equal(Anti.isPlaybackEnforcement(denied),true);
 const {doc}=fixture(),p=Health.createEnforcementProbe(Anti.isPlaybackEnforcement);
 assert.equal(p.scan(doc,10000),null,"a single warning sighting cannot force recovery");
 assert.equal(p.scan(doc,10800),"enforcement","the same visible refusal is confirmed after 800ms");
 assert.equal(p.scan(doc,11000),null,"ongoing refusal must not flood logs");
});
test("Build 296 does not mistake normal YouTube video titles or generic ad notices for enforcement",()=>{
 const p=Health.createEnforcementProbe(Anti.isPlaybackEnforcement);
 for(const text of ["Ad blockers and privacy: a discussion about technology",
  "This video talks about how to disable your ad blocker",
  "Ad blocker detected. Please disable your ad blocker.",
  "YouTube Terms of Service and advertising are discussed here", ""]){
  const {doc}=fixture(text);
  assert.equal(p.scan(doc,10000),null,text);
 }
});
test("Build 296 scans only the known player root and no page body or comments",()=>{
 const {doc,seen}=fixture();
 const p=Health.createEnforcementProbe(Anti.isPlaybackEnforcement);
 assert.equal(p.scan(doc,10000),null);
 assert.equal(p.scan(doc,10800),"enforcement");
 assert.ok(seen.length<=14);
 assert.ok(seen.every(x=>x.startsWith("#movie_player")));
});
test("Build 296 rejects hidden, disconnected and overlong in-player text",()=>{
 const p=Health.createEnforcementProbe(Anti.isPlaybackEnforcement);
 const {node,doc}=fixture();
 doc.visibilityState="hidden";
 assert.equal(p.scan(doc,10000),null);
 doc.visibilityState="visible";
 node.isConnected=false;
 assert.equal(p.scan(doc,11000),null);
 node.isConnected=true;
 node.getClientRects=()=>[];
 assert.equal(p.scan(doc,12000),null);
 node.getClientRects=()=>[{}];
 doc.defaultView.getComputedStyle=()=>({display:"none",visibility:"visible"});
 assert.equal(p.scan(doc,13000),null);
 doc.defaultView.getComputedStyle=()=>({display:"block",visibility:"visible"});
 node.textContent=denied+" ".repeat(2000);
 assert.equal(p.scan(doc,14000),null);
});
test("Build 296 fails open on throwing DOM or recognizer, never modifies the player",()=>{
 const {node,doc}=fixture(),old=node.textContent;
 const fail=Health.createEnforcementProbe(()=>{throw Error("unsafe");});
 assert.equal(fail.scan(doc,2000),null);
 doc.querySelector=()=>{throw Error("blocked DOM");};
 assert.equal(fail.scan(doc,2500),null);
 assert.equal(node.textContent,old);
 assert.equal(typeof node.style,"undefined");
});
test("Build 296 resets on SPA navigation; suppresses short duplicate transitions",()=>{
 const {node,doc}=fixture();
 const p=Health.createEnforcementProbe(Anti.isPlaybackEnforcement);
 assert.equal(p.scan(doc,10000),null);
 assert.equal(p.scan(doc,10800),"enforcement");
 node.textContent="ordinary video";
 assert.equal(p.scan(doc,11000),null);
 node.textContent=denied;
 assert.equal(p.scan(doc,12000),null,"a new candidate still needs confirmation");
 p.reset();
 assert.equal(p.scan(doc,13000),null);
 assert.equal(p.scan(doc,13800),"enforcement","new navigation receives a confirmed fresh sample");
});
test("Build 296 integration records only a coarse existing playback event, not text",()=>{
 const p=Health.createEnforcementProbe(Anti.isPlaybackEnforcement);
 const {node,doc}=fixture(),table=new Map();
 assert.equal(p.scan(doc,1000),null);
 const event=p.scan(doc,1800);
 assert.equal(event,"enforcement");
 assert.equal(Health.record(table,26,"www.youtube.com",event,false,1000),true);
 const exported=JSON.stringify(Health.recent(table,26,"www.youtube.com",2000));
 assert.equal(exported.includes(node.textContent),false);
 assert.equal(exported.includes("https://"),false);
 assert.equal(exported.includes("watch?v="),false);
 assert.equal(Health.record(table,26,"disneyplus.com","enforcement",false,2500),true,
  "existing streaming-event recording remains unchanged");
});
test("Build 296 content hook never hides enforcement or changes network filtering",()=>{
 const c=fs.readFileSync(path.resolve(__dirname,"../src/content.js"),"utf8");
 const h=fs.readFileSync(path.resolve(__dirname,"../src/playback-health.js"),"utf8");
 const manifest=require("../src/manifest.json"),pkg=require("../package.json");
 const runner=fs.readFileSync(path.resolve(__dirname,"../scripts/test-local.sh"),"utf8");
 assert.match(c,/createEnforcementProbe\(DKAntiAdblock\.isPlaybackEnforcement\)/);
 assert.match(c,/enforcementProbe\?\.scan\(document\)/);
 assert.match(c,/enforcementProbe\?\.reset\(\)/);
 assert.match(h,/return "enforcement"/);
 assert.equal(manifest.version,require("../package.json").version);
 assert.equal(pkg.version,manifest.version);
 assert.ok(runner.includes("tests/youtube-player-enforcement-build296.test.js"));
});
