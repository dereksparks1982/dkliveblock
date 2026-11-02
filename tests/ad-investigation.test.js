"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path");
const M=require("../src/adaptive-model.js");
const A=require("../src/ad-investigation.js");
function style(){
 const map=new Map();
 return {setProperty:(key,value,p)=>map.set(key,{value,p}),
  getPropertyValue:key=>map.get(key)?.value||"",
  getPropertyPriority:key=>map.get(key)?.p||"",
  removeProperty:key=>map.delete(key)};
}
function candidate(overrides={}){
 const item={nodeType:1,tagName:"DIV",localName:"div",children:[],
  style:style(),isConnected:true,querySelector:()=>null,querySelectorAll:()=>[],
  getAttribute:()=>null,closest:()=>null,matches:()=>false,
  getBoundingClientRect:()=>({left:460,width:550,height:330}),...overrides};
 return item;
}
function page(el,selectorCount=0){
 const body={},documentElement={};
 el.parentElement=body;
 return {body,documentElement,location:{hostname:"www.facebook.com"},
  querySelectorAll:()=>Array.from({length:selectorCount},()=>el)};
}
test("Build 236 synthetic offline ad-evidence model has 64 deterministic decisions",()=>{
 let cases=0;
 for(let mask=0;mask<64;mask++){
  const flags=Object.fromEntries(M.AD_FEATURES.map((name,i)=>[name,Boolean(mask&(1<<i))]));
  const expected=!flags.protectedContext&&M.AD_FEATURES.slice(0,5).some(k=>flags[k]);
  const result=M.inspectAdCandidate(flags);
  assert.equal(result?.assessment==="strong-evidence",Boolean(expected));
  assert.equal(Object.isFrozen(result),true);
  assert.equal(result.modelVersion,"synthetic-ad-evidence-v1");
  cases++;
 }
 assert.equal(cases,64);
 assert.equal(M.inspectAdCandidate(null),null);
 assert.equal(M.inspectAdCandidate({knownSlot:"true"}),null);
 assert.equal(M.VERSION,"offline-synthetic-v2","existing YouTube model stays untouched");
});
test("Build 236 owner inspector leaves ordinary page items unclassified",()=>{
 const el=candidate(),doc=page(el);
 const result=A.inspect(el,doc,{location:doc.location,innerWidth:1300});
 assert.equal(result.ok,true);
 assert.equal(result.assessment,"unconfirmed");
 assert.equal(result.reasons.length,0);
 assert.equal(result.selector,"");
 assert.equal(el.style.getPropertyValue("display"),"","inspector must not hide");
});
test("Build 236 uses only fixed strong ad markers; no automatic hiding",()=>{
 const el=candidate({id:"div-gpt-ad-123",getAttribute:()=>null,
  querySelector:s=>s.includes("ins.adsbygoogle")?{}:null});
 const doc=page(el,1);
 const result=A.inspect(el,doc,{location:doc.location,innerWidth:1300});
 assert.equal(result.ok,true);
 assert.equal(result.assessment,"strong-evidence");
 assert.ok(result.reasons.some(x=>/ad-slot|advertis/i.test(x)));
 assert.equal(el.style.getPropertyValue("display"),"");
 assert.equal(result.selector,"#div-gpt-ad-123");
});
test("Build 236 site exception is reported, never silently overridden",()=>{
 const el=candidate({matches:s=>s===".owner-allow"});
 const doc=page(el);
 const result=A.inspect(el,doc,{location:doc.location,innerWidth:1300},[".owner-allow"]);
 assert.equal(result.ok,true);
 assert.equal(result.siteException,true);
 assert.match(result.explanation,/exception/i);
 assert.equal(el.style.getPropertyValue("display"),"");
});
test("Build 236 refuses whole pages, dialogs, and ambiguous or shared draft selectors",()=>{
 const el=candidate({closest:s=>s.includes('[role="dialog"]')?{}:null}),doc=page(el);
 assert.equal(A.inspect(el,doc,{location:doc.location,innerWidth:1300}).ok,false);
 const normal=candidate({id:"div-gpt-ad-123"}),other=page(normal,2);
 assert.equal(A.draftSelector(normal,other),"","duplicate selector is not a stable rule");
 assert.equal(A.candidateFor(other.body,other,{innerWidth:1300}),null);
});
test("Build 236 Firefox loader includes local model before inspector; UI cannot auto-save rules",()=>{
 const manifest=JSON.parse(fs.readFileSync(path.join(__dirname,"../src/manifest.json"),"utf8"));
 const content=manifest.content_scripts[0].js;
 for(const script of ["adaptive-model.js","ad-investigation.js","ad-investigation-ui.js"])
  assert.ok(content.includes(script));
 assert.ok(content.indexOf("adaptive-model.js")<content.indexOf("ad-investigation.js"));
 assert.ok(content.indexOf("ad-investigation.js")<content.indexOf("ad-investigation-ui.js"));
 const ui=fs.readFileSync(path.join(__dirname,"../src/ad-investigation-ui.js"),"utf8");
 assert.match(ui,/startAdInvestigation/);
 assert.match(ui,/undoAiHide/);
 assert.doesNotMatch(ui,/browser\.storage\.|fetch\(|XMLHttpRequest|WebSocket/);
 const html=fs.readFileSync(path.join(__dirname,"../src/popup.html"),"utf8");
 assert.match(html,/id="investigateAd"/);
 const popup=fs.readFileSync(path.join(__dirname,"../src/popup.js"),"utf8");
 assert.match(popup,/startAdInvestigation/);
});
