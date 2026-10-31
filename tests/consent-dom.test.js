"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict");
const D=require("../src/consent-dom.js"),C=require("../src/consent.js");
test("Build 55 discovers normal and nested open shadows but not closed roots",()=>{
 const a={id:"normal"},b={id:"open"},c={id:"nested"};
 const inner={mode:"open",children:[c],querySelectorAll:()=>[c]};
 const outer={mode:"open",children:[b,{children:[],shadowRoot:inner}],querySelectorAll:()=>[b]};
 const closed={mode:"closed",children:[],querySelectorAll:()=>[{id:"not-exposed"}]};
 const doc={querySelectorAll:()=>[a,a],documentElement:{children:[{children:[],shadowRoot:outer},{children:[],shadowRoot:closed}]}};
 assert.deepEqual(D.findBanners(doc),[a,b,c]);
});
test("Build 55 caps candidates and DOM node scans",()=>{
 const many=Array.from({length:45},(_,id)=>({id}));
 assert.equal(D.findBanners({querySelectorAll:()=>many,documentElement:{children:[]}}).length,20);
 const start={children:[]};let current=start;
 for(let i=0;i<950;i++){current.children=[{children:[]}];current=current.children[0];}
 current.shadowRoot={mode:"open",children:[],querySelectorAll:()=>[{id:"too-deep"}]};
 assert.equal(D.findBanners({querySelectorAll:()=>[],documentElement:start}).length,0);
});
function button(options={}){
 const attrs=options.attrs||{},form=options.form||null;
 return {localName:options.tag||"button",isConnected:options.connected!==false,
  type:options.type||"button",disabled:!!options.disabled,form,
  getClientRects:()=>options.noRects?[]:[{}],
  getAttribute:name=>Object.prototype.hasOwnProperty.call(attrs,name)?attrs[name]:null,
  closest:sel=>sel==="form"?form:options.hidden?{}:null,
  getRootNode:()=>options.scope||{host:null}};
}
const view={getComputedStyle:()=>({display:"block",visibility:"visible",opacity:1,pointerEvents:"auto"})};
test("Build 55 refuses linked, form, toggle, hidden or disabled reject actions",()=>{
 const context={context:"Manage cookie preferences",text:"Reject all"};
 assert.equal(C.shouldReject({...context,...D.inspectButton(button(),view)}),true);
 for(const el of [button({tag:"a",attrs:{href:"/"}}),button({form:{},type:"submit"}),
  button({attrs:{"aria-pressed":"false"}}),button({attrs:{"aria-checked":"false"}}),
  button({disabled:true}),button({hidden:true}),button({noRects:true}),
  button({scope:{host:{closest:()=>({}),getRootNode:()=>({host:null})}}})
 ])assert.equal(C.shouldReject({...context,...D.inspectButton(el,view)}),false);
 assert.equal(D.inspectButton(button(),{getComputedStyle:()=>({display:"block",visibility:"visible",opacity:0,pointerEvents:"auto"})}).visible,false);
});
test("Build 55 does not auto-act on ordinary or shadow-root focused dialogs",()=>{
 const inside={},outside={};
 const simple={contains:x=>x===inside,getRootNode:()=>({activeElement:outside})};
 const shadow={contains:x=>x===inside,getRootNode:()=>({activeElement:inside})};
 assert.equal(D.userEngaged(simple,{activeElement:inside}),true);
 assert.equal(D.userEngaged(simple,{activeElement:outside}),false);
 assert.equal(D.userEngaged(shadow,{activeElement:outside}),true);
});
