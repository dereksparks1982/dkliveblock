"use strict";
const test=require("node:test"),assert=require("node:assert/strict");
const {read,verify,MAX_BYTES}=require("../src/list-io.js");
const doc="[Adblock Plus 2.0]\n! Title: Local test\n"+"||advertisement.example.com^\n".repeat(15);
function res(value=doc,headers={}){return {ok:true,status:200,headers:{get:k=>headers[k]??null},text:async()=>value};}
test("accept list data with an expected filter header",async()=>{
 assert.equal(await read(res()),doc);
 assert.equal(verify(doc),doc);
});
test("refuse invalid content, binary data, and oversized declared payloads",async()=>{
 await assert.rejects(read(res("not a filter list")),/Invalid/);
 await assert.rejects(read(res(doc+"\0")) ,/Invalid/);
 await assert.rejects(read(res(doc,{"content-length":String(MAX_BYTES+1)})),/too large/);
 await assert.rejects(read({...res(),ok:false,status:404}),/HTTP 404/);
});
test("stream data with a size bound and close the reader",async()=>{
 const bytes=new TextEncoder().encode(doc),parts=[bytes.subarray(0,60),bytes.subarray(60)];
 let idx=0,released=false;
 const response={...res(),body:{getReader:()=>({read:async()=>idx<parts.length?{value:parts[idx++],done:false}:{done:true},releaseLock:()=>{released=true;},cancel:async()=>{}})}};
 assert.equal(await read(response),doc);
 assert.equal(released,true);
});
test("stream download rejects data exceeding cap before buffering it",async()=>{
 const huge=new Uint8Array(MAX_BYTES+1),reader={read:async()=>({done:false,value:huge}),releaseLock:()=>{},cancel:async()=>{}};
 const response={...res(),body:{getReader:()=>reader}};
 await assert.rejects(read(response),/List too large/);
});
