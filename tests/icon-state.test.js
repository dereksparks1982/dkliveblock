"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path");
const I=require("../src/icon-state.js");
test("active, allowed, global-off and temporarily paused icons are distinct",()=>{
 assert.equal(I.state(true,false,false),"active");
 assert.equal(I.state(true,false,true),"paused");
 assert.equal(I.state(true,true,false),"disabled");
 assert.equal(I.state(true,true,true),"disabled");
 assert.equal(I.state(false,false,false),"disabled");
 assert.equal(I.state(false,false,true),"disabled");
});
test("recolor leaves alpha and original art pixels unchanged",()=>{
 const source={data:Uint8ClampedArray.from([0,200,255,255,0,100,200,0])};
 const red=I.tint(source,{data:new Uint8ClampedArray(8)},I.COLORS.disabled);
 const amber=I.tint(source,{data:new Uint8ClampedArray(8)},I.COLORS.paused);
 assert.deepEqual(Array.from(source.data),[0,200,255,255,0,100,200,0]);
 assert.equal(red.data[3],255);assert.equal(red.data[7],0);
 assert.equal(amber.data[7],0);
 assert.ok(red.data[0]>red.data[1]&&red.data[0]>red.data[2]);
 assert.ok(amber.data[0]>amber.data[2]&&amber.data[1]>amber.data[2]);
});
test("icon variants are cached and applied only on tab state change or navigation",async()=>{
 const calls=[],stats={images:0,canvases:0};
 const browser={runtime:{getURL:p=>"moz-extension://local-test/"+p},
  browserAction:{setIcon:async a=>{calls.push(a);},setTitle:async()=>{}}};
 class ImageMock{
  set src(value){stats.images++;assert.match(value,/\/icons\/dk-live-block\.png$/);
   queueMicrotask(()=>this.onload());}
 }
 const doc={createElement:()=>{
  stats.canvases++;
  return {getContext:()=>({
   drawImage(){},
   getImageData:(_x,_y,w,h)=>{
    const data=new Uint8ClampedArray(w*h*4);
    for(let i=0;i<data.length;i+=4){data[i]=50;data[i+1]=200;data[i+2]=255;data[i+3]=255;}
    return {data,width:w,height:h};},
   createImageData:(w,h)=>({data:new Uint8ClampedArray(w*h*4),width:w,height:h})
  })};
 }};
 const icons=I.create(browser,doc,ImageMock);
 icons.apply(3,"paused");await icons.prepare();await new Promise(r=>setImmediate(r));
 assert.equal(calls.length,1);
 assert.deepEqual(Object.keys(calls[0].imageData),["16","32"]);
 icons.apply(3,"paused");await new Promise(r=>setImmediate(r));
 assert.equal(calls.length,1,"Repeated blocked requests must not regenerate icons");
 icons.apply(3,"disabled");await new Promise(r=>setImmediate(r));
 assert.equal(calls.length,2);
 assert.ok(calls[1].imageData["16"].data[0]>calls[1].imageData["16"].data[1]);
 icons.apply(3,"active");await new Promise(r=>setImmediate(r));
 assert.equal(calls[2].path,I.SOURCE);
 icons.reset(3);icons.apply(3,"paused");await new Promise(r=>setImmediate(r));
 assert.equal(calls.length,4);
 assert.equal(stats.images,1);
 assert.equal(stats.canvases,2);
});
test("icon controller loads from Firefox background manifest before normal logic",()=>{
 const m=JSON.parse(fs.readFileSync(path.resolve(__dirname,"../src/manifest.json"),"utf8"));
 assert.ok(m.background.scripts.indexOf("icon-state.js")>=0);
 assert.ok(m.background.scripts.indexOf("icon-state.js")<m.background.scripts.indexOf("background.js"));
 assert.ok(m.background.scripts.indexOf("rule-evidence.js")<m.background.scripts.indexOf("background.js"));
 assert.equal(m.background.scripts.at(-1),"background.js");
 assert.equal(m.browser_action.default_icon,I.SOURCE);
});
