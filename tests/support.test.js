"use strict";
const test=require("node:test"),assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path");
const S=require("../src/support.js");
function fakeButton(){
 const events=new Map();
 return {disabled:false,textContent:"",title:"",addEventListener:(type,fn)=>events.set(type,fn),
  click:()=>events.get("click")?.()};
}
test("missing creator URL leaves Patreon disabled with no network calls",()=>{
 const button=fakeButton();let opened=0;
 S.installButton(button,{url:"",browserApi:{tabs:{create:()=>{opened++;return Promise.resolve();}}}});
 assert.equal(button.disabled,true);
 assert.match(button.textContent,/Coming soon/);
 button.click();
 assert.equal(opened,0);
});
test("only exact HTTPS Patreon creator links pass validation",()=>{
 for(const url of ["https://www.patreon.com/c/DKLiveBlock","https://patreon.com/DKLiveBlock"])
  assert.equal(S.validPatreonUrl(url),url);
 for(const url of ["","http://patreon.com/DKLiveBlock",
  "https://patreon.com.evil.example/DKLiveBlock","https://patreon.com@evil.example/DKLiveBlock",
  "https://www.patreon.com/c/DKLiveBlock?tracking=true",
  "https://www.patreon.com/c/DKLiveBlock#fragment","https://patreon.com",
  "https://patreon.com:8443/c/DKLiveBlock","javascript:alert(1)"])
  assert.equal(S.validPatreonUrl(url),"",url);
});
test("owner-approved default Patreon link only opens after a user click",()=>{
 const b=fakeButton(),opened=[];
 S.installButton(b,{browserApi:{tabs:{create:info=>{opened.push(info);return Promise.resolve();}}}});
 assert.equal(b.disabled,false);
 assert.match(b.textContent,/Support DK Live Block on Patreon/);
 assert.equal(opened.length,0,"no donation tab opens during initialization");
 b.click();
 assert.deepEqual(opened,[{url:"https://www.patreon.com/c/dkliveblock"}]);
});
test("invalid Patreon override cannot open a new tab",()=>{
 for(const bad of ["https://patreon.com.evil.example/c/dkliveblock",
  "https://www.patreon.com/c/dkliveblock?tracking=true",
  "http://www.patreon.com/c/dkliveblock"]){
  const b=fakeButton(),opened=[];
  S.installButton(b,{url:bad,browserApi:{tabs:{create:info=>{opened.push(info);return Promise.resolve();}}}});
  assert.equal(b.disabled,true);
  b.click();
  assert.equal(opened.length,0);
 }
});
test("configured button only opens a voluntary Patreon creator page",()=>{
 const button=fakeButton(),opened=[];
 S.installButton(button,{url:"https://www.patreon.com/c/DKLiveBlock",
  browserApi:{tabs:{create:info=>{opened.push(info);return Promise.resolve();}}}});
 assert.equal(button.disabled,false);button.click();
 assert.deepEqual(opened,[{url:"https://www.patreon.com/c/DKLiveBlock"}]);
});
test("both interfaces load support code before their controllers",()=>{
 const root=path.join(__dirname,"../src");
 for(const [file,script] of [["popup.html","popup.js"],["options.html","options.js"]]){
  const html=fs.readFileSync(path.join(root,file),"utf8"),js=fs.readFileSync(path.join(root,script),"utf8");
  assert.match(html,/id="patreonSupport"/);
  assert.ok(html.indexOf('src="support.js"')<html.indexOf('src="'+script+'"'));
  assert.match(js,/DKSupport\.installButton/);
  assert.match(html,/id="patreonSupport"[^>]*disabled>Support on Patreon<\/button>/);
  assert.match(html,/Every feature stays free|No paywall/);
 }
});
