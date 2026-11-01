"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict");
const I=require("../src/domain-investigation.js");
const sample={
 objectClassName:"domain",handle:"DOM-123",ldhName:"example.net",
 nameservers:[{ldhName:"ns1.example.net"}],status:["active","client transfer prohibited"],
 secureDNS:{delegationSigned:true,dsData:[{},{}]},
 events:[{eventAction:"registration",eventDate:"2020-01-01T00:00:00Z"}],
 entities:[{roles:["registrant"],handle:"CONTACT1",
  vcardArray:["vcard",[["org",{},"text","Example Services LLC"],
   ["email",{},"text","help@example.net"],["tel",{},"text","+1-555-555"]]]}],
 notices:[{title:"Notice",description:["Public registry data only"]}],
 links:[{rel:"self",href:"https://rdap.example/domain/example.net?private=SECRET"},
  {rel:"alternate",href:"javascript:alert(1)"}]
};
test("Build 216 retains public RDAP registration fields without inventing ownership",()=>{
 const r=I.registration(sample);
 assert.equal(r.ldhName,"example.net");
 assert.equal(r.handle,"DOM-123");
 assert.equal(r.entities[0].org,"Example Services LLC");
 assert.equal(r.entities[0].email,"help@example.net");
 assert.equal(r.events[0].action,"registration");
 assert.equal(r.dnssec.delegationSigned,true);
 assert.equal(r.dnssec.dsDataCount,2);
 assert.deepEqual(r.nameservers,["ns1.example.net"]);
 assert.equal(r.notices[0].description[0],"Public registry data only");
 assert.deepEqual(r.links,[{relation:"self",label:"",url:"https://rdap.example/domain/example.net"}]);
 assert.equal(JSON.stringify(r).includes("SECRET"),false);
});
test("Build 216 RDAP records cannot inject HTML or unsafe links into evidence",()=>{
 const poisoned={...sample,handle:"<script>alert(1)</script>\n"+("x".repeat(500)),
  links:[{href:"data:text/html,evil"},{href:"http://insecure.example"},
   {href:"https://user:password@bad.example/"},{href:"https://safe.example/path?token=SECRET"}]};
 const r=I.registration(poisoned);
 assert.equal(r.handle.length<=120,true);
 assert.doesNotMatch(r.handle,/\n/);
 assert.equal(r.links.length,1);
 assert.equal(r.links[0].url,"https://safe.example/path");
 assert.equal(JSON.stringify(r.links).includes("SECRET"),false);
});
test("Build 216 DNS evidence distinguishes addresses from legal ownership",()=>{
 const d=I.dns({addresses:["8.8.8.8","8.8.8.8","192.0.2.1",
  "broken?host","2001:4860:4860::8888"],canonicalName:"edge.example.net",isTRR:true});
 assert.deepEqual(d.addresses,["8.8.8.8","192.0.2.1","2001:4860:4860::8888"]);
 assert.equal(d.canonicalName,"edge.example.net");
 assert.equal(d.isTRR,true);
 assert.equal(I.dns(null).status,"Not available");
});
test("Build 216 only public IP addresses qualify for sampled registry lookup",()=>{
 for(const ip of ["10.0.0.2","192.168.1.1","172.16.2.2","127.0.0.1",
  "169.254.1.2","100.64.2.3","192.0.2.1","198.51.100.2",
  "203.0.113.4","239.1.1.1","not-an-ip"]){
  assert.equal(I.publicIPv4(ip),false,ip);
 }
 assert.equal(I.publicIPv4("8.8.8.8"),true);
 assert.equal(I.publicIPv4("1.1.1.1"),true);
 assert.equal(I.publicIPv4("2001:db8::1"),false);
});
test("Build 216 distinguishes IP network registrant from domain registrant",()=>{
 const record=I.network({name:"EXAMPLE-NET",handle:"NET-ONE",country:"US",
  startAddress:"8.8.8.0",endAddress:"8.8.8.255",
  entities:[{roles:["registrant"],vcardArray:["vcard",[
   ["org",{},"text","Infrastructure Network Operator"]]]}]});
 assert.equal(record.name,"EXAMPLE-NET");
 assert.equal(record.entities[0].org,"Infrastructure Network Operator");
 assert.equal(record.country,"US");
 assert.equal(record.startAddress,"8.8.8.0");
});
test("Build 216 live lookup remains opt-in, scoped to a recorded blocked host",()=>{
 const fs=require("node:fs"),path=require("node:path");
 const bg=fs.readFileSync(path.join(__dirname,"../src/background.js"),"utf8");
 const ui=fs.readFileSync(path.join(__dirname,"../src/site-dashboard.js"),"utf8");
 const html=fs.readFileSync(path.join(__dirname,"../src/site-dashboard.html"),"utf8");
 assert.match(bg,/function lookupBlockedDomain/);
 assert.match(bg,/data\.logs\.get\(id\)/);
 assert.match(bg,/browser\.dns\.resolve\(target\)/);
 assert.match(bg,/DKDomainInvestigation\.network/);
 assert.match(ui,/blockRdapLookup/);
 assert.match(ui,/JSON\.stringify\(response\.publicRecord/);
 assert.match(html,/id="blockRdapLookup"/);
});
