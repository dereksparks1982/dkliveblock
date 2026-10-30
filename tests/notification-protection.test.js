"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict");
const N=require("../src/notification-protection.js");
function make(level="controllable_by_this_extension",value=false){
 let calls=[],state={levelOfControl:level,value};
 return {calls,browser:{browserSettings:{webNotificationsDisabled:{
  get:async()=>({...state}),
  set:async x=>{calls.push(["set",x.value]);state={levelOfControl:"controlled_by_this_extension",value:x.value};},
  clear:async()=>{calls.push(["clear"]);state={levelOfControl:"controllable_by_this_extension",value:false};}
 }}}};
}
test("enabled protection sets Firefox's global fallback to deny",async()=>{
 const f=make(),status=await N.sync(f.browser,true);
 assert.equal(status.supported,true);assert.equal(status.blocked,true);
 assert.equal(status.controlled,true);assert.deepEqual(f.calls,[["set",true]]);
 await N.sync(f.browser,true);assert.equal(f.calls.length,1);
});
test("turning protection off clears only this extension's override",async()=>{
 const f=make();
 await N.sync(f.browser,true);const status=await N.sync(f.browser,false);
 assert.equal(status.blocked,false);assert.deepEqual(f.calls,[["set",true],["clear"]]);
});
test("conflicts with other extension are respected",async()=>{
 const f=make("controlled_by_other_extensions",true);
 const status=await N.sync(f.browser,true);
 assert.equal(status.controlled,false);assert.ok(status.error);assert.equal(f.calls.length,0);
 await N.sync(f.browser,false);assert.equal(f.calls.length,0);
});
test("unavailable API fails safely",async()=>{
 const result=await N.sync({},true);
 assert.equal(result.supported,false);
});
