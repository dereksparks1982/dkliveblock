"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict");
const vm=require("node:vm"),fs=require("node:fs"),path=require("node:path");
const Rules=require("../src/safe-scriptlet-rules.js");
const source=fs.readFileSync(path.join(__dirname,"../src/safe-scriptlet-runtime.js"),"utf8");
function setup(){
 const hooks={},window={adCheck:true,app:{adCheck:true,organic:"keep"}};
 const document={addEventListener:(name,fn)=>hooks[name]=fn};
 vm.runInNewContext(source,{window,document});
 return {window,apply:rows=>hooks["dk-live-block:safe-scriptlets"]({detail:JSON.stringify(rows)})};
}
test("Build 241 abort-read requires a valid manual domain rule",()=>{
 assert.deepEqual(Rules.select("facebook.com##+js(abort-on-property-read, adCheck)","www.facebook.com"),
  [{name:"abort-on-property-read",path:"adCheck"}]);
 assert.deepEqual(Rules.select("facebook.com##+js(abort-on-property-read, adCheck)","example.com"),[]);
 assert.deepEqual(Rules.select("facebook.com##+js(abort-on-property-read, document.cookie)","facebook.com"),[]);
 assert.deepEqual(Rules.select("facebook.com##+js(abort-on-property-read, fetch)","facebook.com"),[]);
 assert.deepEqual(Rules.select("facebook.com##+js(abort-on-property-read, adCheck, extra)","facebook.com"),[]);
});
test("Build 241 manual exception undoes matching scriptlet",()=>{
 const t="facebook.com##+js(abort-on-property-read, adCheck)\nfacebook.com#@#+js(abort-on-property-read, adCheck)";
 assert.deepEqual(Rules.select(t,"facebook.com"),[]);
});
test("Build 241 abort-read throws only for explicit path, restores original on disable",()=>{
 const env=setup();
 env.apply([{name:"abort-on-property-read",path:"app.adCheck"}]);
 assert.throws(()=>env.window.app.adCheck,/blocked scripted property read/);
 assert.equal(env.window.app.organic,"keep");
 env.apply([]);
 assert.equal(env.window.app.adCheck,true);
});
test("Build 241 later-created path and duplicate refresh are safe",()=>{
 const env=setup(),rule=[{name:"abort-on-property-read",path:"future.adCheck"}];
 env.apply(rule);
 env.window.future={adCheck:true,other:123};
 assert.throws(()=>env.window.future.adCheck,/blocked scripted property read/);
 assert.equal(env.window.future.other,123);
 env.apply(rule);
 assert.throws(()=>env.window.future.adCheck,/blocked scripted property read/);
 env.apply([]);
 assert.equal(env.window.future.adCheck,true);
});
test("Build 241 generic ad engine is not a prerequisite for Facebook scanner",()=>{
 const content=fs.readFileSync(path.join(__dirname,"../src/content.js"),"utf8");
 assert.match(content,/\(!adRecognizer&&!facebookRecognizer\)/);
 assert.match(content,/adRecognizer\?\.scan\(\);facebookRecognizer\?\.scan\(\)/);
});
