"use strict";
const test=require("node:test"),assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path");
const S=require("../src/support.js");
function fakeButton(){
 const events=new Map();
 return {disabled:false,textContent:"",title:"",addEventListener:(type,fn)=>events.set(type,fn),
  click:()=>events.get("click")?.()};
}
test("no creator page configured: Patreon button remains disabled with no network calls",()=>{
 const button=fakeButton();let opened=0;
 S.installButton(button,{browserApi:{tabs:{create:()=>{opened++;return Promise.resolve();}}}});
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
 }
});
