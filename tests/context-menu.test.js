"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict");
const C=require("../src/context-menu.js");
test("menu registers only a user-click command for website tabs",async()=>{
 let listener,created=[],calls=[],updates=[];
 const browser={contextMenus:{create:data=>created.push(data),
  onClicked:{addListener:fn=>listener=fn},update:async(id,data)=>updates.push({id,data})},
  tabs:{sendMessage:async(...args)=>calls.push(args)}};
 assert.equal(C.install(browser,()=>true,()=>true),true);
 assert.equal(created[0].title,"Block element with DK Live Block");
 listener({menuItemId:"unrelated",frameId:0},{id:1,url:"https://test.example/"});
 listener({menuItemId:C.ID,frameId:2},{id:1,url:"https://test.example/"});
 await Promise.resolve();
 assert.equal(calls.length,1);
 assert.deepEqual(calls[0],[1,{action:"startPicker"},{frameId:2}]);
 assert.equal(await C.sync(browser,false),true);
 assert.deepEqual(updates[0],{id:C.ID,data:{visible:false}});
});
test("menu never runs on a restricted browser page, missing tab, or disabled site",async()=>{
 let listener,calls=0,enabled=true,allowed=true;
 const browser={contextMenus:{create:()=>{},onClicked:{addListener:f=>listener=f}},
  tabs:{sendMessage:async()=>{calls++;}}};
 assert.equal(C.install(browser,()=>enabled,()=>allowed),true);
 for(const tab of [null,{id:3,url:"about:config"},{id:-1,url:"https://example.com"},
 {id:3,url:"file:///tmp/test"},{id:3,url:"moz-extension://internal"}])
  listener({menuItemId:C.ID,frameId:0},tab);
 enabled=false;listener({menuItemId:C.ID},{id:3,url:"https://example.org"});
 enabled=true;allowed=false;listener({menuItemId:C.ID},{id:3,url:"https://example.org"});
 await Promise.resolve();
 assert.equal(calls,0);
});
test("missing context menu API is non-fatal",async()=>{
 assert.equal(C.install({tabs:{sendMessage:async()=>{}}},()=>true,()=>true),false);
 assert.equal(await C.sync({},true),false);
});
