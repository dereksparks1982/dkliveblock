"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict");
const fs=require("node:fs"),vm=require("node:vm"),path=require("node:path");
const source=fs.readFileSync(path.join(__dirname,"../src/safe-scriptlet-runtime.js"),"utf8");
function environment(){
 const hooks={},window={adblockDetected:true,app:{adBlocked:true}},
  document={addEventListener:(k,f)=>hooks[k]=f};
 vm.runInNewContext(source,{window,document},{filename:"safe-scriptlet-runtime.js"});
 return {window,send:detail=>hooks["dk-live-block:safe-scriptlets"]({detail})};
}
function command(path,value="false"){return {name:"set-constant",path,value};}
test("Build 203 fixed MAIN helper installs and restores literal properties",()=>{
 const env=environment();
 env.send(JSON.stringify([command("adblockDetected"),command("app.adBlocked")]));
 assert.equal(env.window.adblockDetected,false);
 assert.equal(env.window.app.adBlocked,false);
 env.window.adblockDetected=true;
 assert.equal(env.window.adblockDetected,false);
 env.send("[]");
 assert.equal(env.window.adblockDetected,true);
 assert.equal(env.window.app.adBlocked,true);
});
test("Build 203 does not evaluate hostile accessors or allow protected globals",()=>{
 const env=environment();let called=0;
 Object.defineProperty(env.window,"secret",{configurable:true,
  get(){called++;throw Error("unexpected read");}});
 env.send(JSON.stringify([command("secret.flag"),command("document.cookie"),
  command("__proto__.payload"),command("adblockDetected","alert(1)")]));
 assert.equal(called,0);
 assert.equal(env.window.adblockDetected,true);
 assert.equal(env.window.payload,undefined);
});
test("Build 203 site-owned property replacement survives scriptlet teardown",()=>{
 const env=environment();env.send(JSON.stringify([command("adblockDetected")]));
 Object.defineProperty(env.window,"adblockDetected",{configurable:true,writable:true,value:"site"});
 env.send("[]");
 assert.equal(env.window.adblockDetected,"site");
});
test("Build 203 ignores oversized forged events and nonconfigurable properties",()=>{
 const env=environment();
 Object.defineProperty(env.window,"locked",{configurable:false,value:true});
 env.send(JSON.stringify([command("locked")]));
 assert.equal(env.window.locked,true);
 env.send("x".repeat(6001));
 assert.equal(env.window.adblockDetected,true);
});
test("Build 203 reviewed runtime never downloads or evaluates arbitrary JS",()=>{
 assert.doesNotMatch(source,/\beval\s*\(|new Function\s*\(|fetch\s*\(|XMLHttpRequest\s*\(|browser\./);
});
