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

test("Build 208 waits for a two-segment property created after document_start",()=>{
 const env=environment();
 env.send(JSON.stringify([command("later.visible","false")]));
 assert.equal(Object.prototype.hasOwnProperty.call(env.window,"later"),true);
 assert.equal(env.window.later,undefined);
 env.window.later={visible:true,ordinary:"preserve"};
 assert.equal(env.window.later.visible,false);
 assert.equal(env.window.later.ordinary,"preserve");
 env.window.later.visible=true;
 assert.equal(env.window.later.visible,false);
 env.send("[]");
 assert.equal(env.window.later.visible,true);
 assert.equal(env.window.later.ordinary,"preserve");
});
test("Build 208 three-step assignment reattaches only to the new object",()=>{
 const env=environment();
 env.send(JSON.stringify([command("next.ready.visible","false")]));
 const old={ready:{visible:true}};
 env.window.next=old;
 assert.equal(old.ready.visible,false);
 const original=old.ready;
 const newer={visible:true};
 old.ready=newer;
 assert.equal(original.visible,true,
  "stale child property must be restored after an intermediate reassignment");
 assert.equal(newer.visible,false);
 env.send("[]");
 assert.equal(newer.visible,true);
 assert.equal(old.ready,newer);
});
test("Build 208 existing object subproperties remain usable by sibling shims",()=>{
 const env=environment();
 env.send(JSON.stringify([command("app.adBlocked"),command("app.anotherFlag")]));
 assert.equal(env.window.app.adBlocked,false);
 env.window.app.anotherFlag=true;
 assert.equal(env.window.app.anotherFlag,false);
 env.send("[]");
 assert.equal(env.window.app.adBlocked,true);
 assert.equal(env.window.app.anotherFlag,true);
});
test("Build 208 disabled waiting rules restore original page assignments",()=>{
 const env=environment();
 env.send(JSON.stringify([command("future.ready.active")]));
 env.window.future={ready:{active:true}};
 assert.equal(env.window.future.ready.active,false);
 env.send("[]");
 assert.equal(env.window.future.ready.active,true);
 const old=env.window.future;
 env.send(JSON.stringify([command("future.ready.active")]));
 Object.defineProperty(old.ready,"active",{configurable:true,writable:true,value:"site-owned"});
 env.send("[]");
 assert.equal(old.ready.active,"site-owned");
});
test("Build 208 never invokes an accessor while waiting for a chain",()=>{
 const env=environment();let count=0;
 Object.defineProperty(env.window,"future",{configurable:true,get(){
  count++;throw Error("side effect");
 }});
 env.send(JSON.stringify([command("future.ready.active")]));
 assert.equal(count,0);
 env.send("[]");
 assert.equal(count,0);
});


test("Build 210 shared missing intermediate activates both sibling paths",()=>{
 const env=environment();
 const cmds=[command("future.ads"),command("future.tracking","true")];
 env.send(JSON.stringify(cmds));
 env.window.future={ads:true,tracking:false,regular:42};
 assert.equal(env.window.future.ads,false);
 assert.equal(env.window.future.tracking,true);
 assert.equal(env.window.future.regular,42);
 env.window.future.ads=1;
 env.window.future.tracking=0;
 env.send("[]");
 assert.equal(env.window.future.ads,1);
 assert.equal(env.window.future.tracking,0);
});
test("Build 210 shared three-part intermediate rebinds all descendants",()=>{
 const env=environment();
 env.send(JSON.stringify([command("late.flags.ads"),command("late.flags.tracking","true")]));
 const old={ads:true,tracking:false};
 env.window.late={flags:old};
 assert.equal(old.ads,false);assert.equal(old.tracking,true);
 const fresh={ads:true,tracking:false};
 env.window.late.flags=fresh;
 assert.equal(old.ads,true);assert.equal(old.tracking,false);
 assert.equal(fresh.ads,false);assert.equal(fresh.tracking,true);
 env.send("[]");
 assert.equal(fresh.ads,true);assert.equal(fresh.tracking,false);
});
test("Build 210 replacing top-level object restores all old descendants",()=>{
 const env=environment();
 env.send(JSON.stringify([command("later.flag"),command("later.other","true")]));
 const prev={flag:true,other:false};
 env.window.later=prev;
 assert.equal(prev.flag,false);
 env.window.later={flag:true,other:false};
 assert.equal(prev.flag,true);
 assert.equal(prev.other,false);
 assert.equal(env.window.later.flag,false);
 assert.equal(env.window.later.other,true);
 env.send("[]");
 assert.equal(env.window.later.flag,true);
 assert.equal(env.window.later.other,false);
});
test("Build 210 identical configuration refresh does not clear page values",()=>{
 const env=environment();
 const config=JSON.stringify([command("future.ready")]);
 env.send(config);
 env.window.future={ready:true};
 env.window.future.ready="site-assignment";
 const first=Object.getOwnPropertyDescriptor(env.window,"future").get;
 env.send(config);
 assert.equal(Object.getOwnPropertyDescriptor(env.window,"future").get,first);
 assert.equal(env.window.future.ready,false);
 env.send("[]");
 assert.equal(env.window.future.ready,"site-assignment");
});
test("Build 210 nonwritable data and inherited properties are never changed",()=>{
 const env=environment(),locked={flag:true};
 Object.defineProperty(env.window,"readonly",{configurable:true,
  enumerable:true,writable:false,value:locked});
 const prototype={prototypeOnly:{flag:true}};
 Object.setPrototypeOf(env.window,prototype);
 env.send(JSON.stringify([command("readonly.flag"),command("prototypeOnly.flag")]));
 assert.equal(locked.flag,false,"read-only data can be traversed without replacing it");
 assert.equal(prototype.prototypeOnly.flag,true,"never invoke or intercept inherited chains");
 assert.equal(Object.getOwnPropertyDescriptor(env.window,"readonly").writable,false);
 env.send("[]");
 assert.equal(locked.flag,true);
});
test("Build 210 rejects getter-backed intermediate nodes and doesn't invoke them",()=>{
 const env=environment();let invoked=0;
 Object.defineProperty(env.window,"unsafe",{configurable:true,get(){invoked++;throw Error("GETTER");}});
 env.send(JSON.stringify([command("unsafe.ads"),command("unsafe.tracker","true")]));
 assert.equal(invoked,0);
 env.send("[]");
 assert.equal(invoked,0);
});
