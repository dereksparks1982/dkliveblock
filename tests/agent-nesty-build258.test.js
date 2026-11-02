"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict"),
 fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
const C=require("../src/cookie-intelligence.js");
const raw=fs.readFileSync(path.join(__dirname,"../src/cookie-sentinels.js"),"utf8");
function moduleUnderTest(){
 const context={module:{exports:{}},globalThis:{DKCookieIntelligence:C}};
 vm.runInNewContext(raw,context);return context.module.exports;
}
test("Build 258: Agent Nesty has stable numbered IDs and unique tasks",()=>{
 const {AGENTS,TYPES}=moduleUnderTest();
 assert.equal(AGENTS.length,3);
 assert.deepEqual(Array.from(AGENTS,x=>x.id),[
  "agent_nesty_1","agent_nesty_2","agent_nesty_3"]);
 assert.equal(new Set(Array.from(AGENTS,x=>x.type)).size,3);
 assert.equal(TYPES.length,3);
});
test("Build 258: only the HTTP agent is armed and no cookie value is retained",()=>{
 const {create}=moduleUnderTest(),evidence=C.create();
 const agents=create(row=>evidence.observe(row));
 assert.deepEqual(Array.from(agents.handlers(),a=>[a.id,a.armed]),[
  ["agent_nesty_1",true],["agent_nesty_2",false],["agent_nesty_3",false]]);
 assert.equal(agents.wake("http-response",{site:"facebook.com",responseHost:"www.facebook.com",
  responseHeaders:[{name:"Set-Cookie",value:"sid=PRIVATE_SECRET; HttpOnly; SameSite=Lax"}]}),1);
 assert.equal(evidence.listObservations()[0].name,"sid");
 assert.ok(!JSON.stringify(evidence.listObservations()).includes("PRIVATE_SECRET"));
 assert.equal(agents.wake("script-write",{site:"facebook.com"}),0);
});
test("Build 258: interface and background use new names, no stale plural",()=>{
 const read=f=>fs.readFileSync(path.join(__dirname,"../src",f),"utf8");
 for(const f of ["background.js","cookie-agents-ui.js","cookie-agents.html","site-dashboard.html"]){
  assert.doesNotMatch(read(f),/Agent Nestys|CookieAgentNestys|cookieNestys/);
 }
 assert.match(read("background.js"),/getAgentNestyCookieIntel/);
 assert.match(read("cookie-agents-ui.js"),/x\.id/);
 assert.match(read("cookie-agents-ui.js"),/x\.title/);
});
