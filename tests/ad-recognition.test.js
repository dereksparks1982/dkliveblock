"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict");
require("../src/auth-protection.js");
require("../src/video-assist.js");
const A=require("../src/ad-recognition.js");
class Style{
 constructor(){this.data=new Map();}
 getPropertyValue(k){return this.data.get(k)?.v||"";}
 getPropertyPriority(k){return this.data.get(k)?.p||"";}
 setProperty(k,v,p=""){this.data.set(k,{v,p});}
 removeProperty(k){this.data.delete(k);}
}
function ad({cls="adsbygoogle",tag="ins",id="",aria="",attrs=[],excluded=false,closest=false}={}){
 const node={localName:tag,className:cls,id,style:new Style(),isConnected:true,
  matches:()=>excluded,querySelector:()=>excluded?{}:null,closest:()=>closest?{}:null,
  getClientRects:()=>[1],getAttribute:k=>k==="aria-label"?aria:attrs.find(x=>x[0]===k)?.[1]||null,
  hasAttribute:k=>attrs.some(x=>x[0]===k)};
 return node;
}
function documentFor(nodes){return {body:{},documentElement:{},querySelectorAll:()=>nodes};}
test("automatically recognizes unmistakable inline and GPT ad slots",()=>{
 for(const node of [
  ad(),ad({tag:"div",cls:"ad-slot"}),ad({tag:"div",id:"div-gpt-ad-123456"}),
  ad({cls:"",tag:"div",aria:"Advertisement"}),
  ad({tag:"div",cls:"",attrs:[["data-ad-client","ca-pub-1"],["data-ad-slot","12"]]})
 ])assert.equal(A.hasStrongSignal(node),true);
});
test("normal articles, branded content, and generic sponsored headlines are not hidden",()=>{
 for(const node of [
  ad({tag:"article",cls:"sponsored"}),ad({tag:"div",cls:"promotion"}),
  ad({tag:"div",cls:"advice"}),ad({tag:"div",aria:"Sponsored article"}),
  ad({tag:"div",aria:"Google Sign In"})
 ])assert.equal(A.hasStrongSignal(node),false);
});
test("protect players, forms, login dialogs and article containers even if ad labeled",()=>{
 for(const node of [ad({excluded:true}),ad({closest:true})]){
  const doc=documentFor([node]);
  assert.equal(A.safe(node,doc),false);
  assert.equal(A.create(doc,{}).scan(),0);
 }
});
test("only ad nodes are hidden and all changes can be reverted",()=>{
 const a=ad(),normal=ad({cls:"",tag:"section"}),doc=documentFor([a,normal]),scanner=A.create(doc,{});
 assert.equal(scanner.scan(),1);
 assert.equal(a.style.getPropertyValue("display"),"none");
 assert.equal(normal.style.getPropertyValue("display"),"");
 assert.equal(scanner.scan(),0);
 scanner.restore();
 assert.equal(a.style.getPropertyValue("display"),"");
 assert.equal(scanner.hiddenCount,0);
});
test("preserve original inline display and avoid overwriting a site's later changes",()=>{
 const x=ad();x.style.setProperty("display","inline-block","important");
 const scanner=A.create(documentFor([x]),{});
 scanner.scan();
 scanner.restore();
 assert.equal(x.style.getPropertyValue("display"),"inline-block");
 assert.equal(x.style.getPropertyPriority("display"),"important");
 scanner.scan();
 x.style.setProperty("display","block");
 scanner.restore();
 assert.equal(x.style.getPropertyValue("display"),"block");
});
test("bound scanning and hidden-element retention during long page sessions",()=>{
 const nodes=Array.from({length:200},()=>ad()),scanner=A.create(documentFor(nodes),{},8);
 assert.equal(scanner.scan(),6);
 scanner.scan();scanner.scan();
 assert.ok(scanner.hiddenCount<=8);
});
test("never hide the root body or an invalid detached element",()=>{
 const item=ad(),doc=documentFor([item]);
 assert.equal(A.safe(doc.body,doc),false);
 item.isConnected=false;
 assert.equal(A.safe(item,doc),false);
});

test("recognizes explicit ad unit pairs, labelled test ads and standard Google ad frames",()=>{
 for(const node of [
  ad({tag:"div",cls:"",attrs:[["data-ad-unit","leaderboard"],["data-ad-slot","header"]]}),
  ad({tag:"div",cls:"",attrs:[["data-testid","advertisement"]]}),
  ad({tag:"iframe",cls:"",id:"google_ads_iframe_123"})
 ])assert.equal(A.hasStrongSignal(node),true);
 for(const node of [
  ad({tag:"div",cls:"",attrs:[["data-ad-unit","hero"]]}),
  ad({tag:"div",cls:"",attrs:[["data-testid","sponsored-article"]]}),
  ad({tag:"iframe",cls:"",id:"video_iframe_123"})
 ])assert.equal(A.hasStrongSignal(node),false);
});
test("long candidate lists are fairly examined without hiding generic content",()=>{
 const nodes=Array.from({length:125},()=>ad({tag:"div",cls:"normal-content"}));
 const advertisement=ad({tag:"ins",cls:"adsbygoogle"});nodes.push(advertisement);
 const doc=documentFor(nodes),scanner=A.create(doc,{},6);
 assert.equal(scanner.scan(),0);
 assert.equal(scanner.scan(),1);
 assert.equal(advertisement.style.getPropertyValue("display"),"none");
 scanner.restore();
 assert.equal(advertisement.style.getPropertyValue("display"),"");
});
test("recognizer will not hide labelled ads nested in protected article or player contexts",()=>{
 for(const node of [
  ad({tag:"div",aria:"Advertisement",closest:true}),
  ad({tag:"iframe",id:"google_ads_iframe_123",excluded:true})
 ]){
  const doc=documentFor([node]);
  assert.equal(A.safe(node,doc),false);
  assert.equal(A.create(doc,{}).scan(),0);
 }
});

test("Build 56 recognizes and restores ad slots across nested open shadows",()=>{
 const first=ad(),second=ad({cls:"ad-slot",tag:"div"}),closed=ad();
 const nested={mode:"open",children:[second],querySelectorAll:()=>[second]};
 const open={mode:"open",children:[first,{children:[],shadowRoot:nested}],querySelectorAll:()=>[first]};
 const secret={mode:"closed",children:[closed],querySelectorAll:()=>[closed]};
 const doc={body:{},documentElement:{children:[{children:[],shadowRoot:open},{children:[],shadowRoot:secret}]},querySelectorAll:()=>[]};
 const scanner=A.create(doc,{});
 assert.equal(scanner.scan(),2);
 assert.equal(first.style.getPropertyValue("display"),"none");
 assert.equal(second.style.getPropertyValue("display"),"none");
 assert.equal(closed.style.getPropertyValue("display"),"");
 scanner.restore();
 assert.equal(first.style.getPropertyValue("display"),"");
 assert.equal(second.style.getPropertyValue("display"),"");
});
test("Build 56 never hide focused or protected-shadow advertisements",()=>{
 const node=ad(),focus={};node.contains=x=>x===focus;
 const doc=documentFor([node]);doc.activeElement=focus;
 assert.equal(A.safe(node,doc),false);
 doc.activeElement=null;
 node.getRootNode=()=>({host:{closest:()=>({}),getRootNode:()=>({host:null})}});
 assert.equal(A.safe(node,doc),false);
});
test("Build 56 mutation trigger ignores CSS feedback and ordinary page updates",()=>{
 const known=ad(),normal=ad({tag:"div",cls:"normal-content"});
 assert.equal(A.relevantMutation({type:"childList",addedNodes:[known]}),true);
 assert.equal(A.relevantMutation({type:"attributes",attributeName:"id",target:known}),true);
 assert.equal(A.relevantMutation({type:"attributes",attributeName:"style",target:known}),false);
 assert.equal(A.relevantMutation({type:"attributes",attributeName:"class",target:normal}),false);
 assert.equal(A.relevantMutation({type:"childList",addedNodes:[normal]}),false);
});
test("Build 56 existing hidden slots can be re-hidden at tracking capacity",()=>{
 const a=ad(),b=ad({tag:"div",cls:"ad-slot"}),scanner=A.create(documentFor([a,b]),{},1);
 assert.equal(scanner.scan(),1);
 a.style.setProperty("display","block");
 assert.equal(scanner.scan(),1);
 assert.equal(a.style.getPropertyValue("display"),"none");
 assert.equal(b.style.getPropertyValue("display"),"");
 scanner.restore();
});
test("Build 56 respects shadow discovery work caps on large pages",()=>{
 const tree={children:[]};let cur=tree;
 for(let i=0;i<950;i++){const child={children:[]};cur.children=[child];cur=child;}
 cur.shadowRoot={mode:"open",children:[],querySelectorAll:()=>[ad()]};
 const doc={documentElement:tree,body:{},querySelectorAll:()=>[]};
 assert.equal(A.collectScopes(doc).length,1);
 assert.equal(A.create(doc,{}).scan(),0);
});

test("Build 127 recognizes dedicated AMP ad elements but not editorial AMP content",()=>{
 const visible=ad({tag:"amp-ad",cls:""}),auto=ad({tag:"amp-auto-ads",cls:""});
 const article=ad({tag:"amp-story",cls:""}),video=ad({tag:"amp-video",cls:""});
 assert.equal(A.hasStrongSignal(visible),true);
 assert.equal(A.hasStrongSignal(auto),true);
 assert.equal(A.hasStrongSignal(article),false);
 assert.equal(A.hasStrongSignal(video),false);
 const doc=documentFor([visible,article,auto]);
 const scanner=A.create(doc,{});
 assert.equal(scanner.scan(),2);
 assert.equal(visible.style.getPropertyValue("display"),"none");
 assert.equal(auto.style.getPropertyValue("display"),"none");
 assert.equal(article.style.getPropertyValue("display"),"");
 scanner.restore();
 assert.equal(visible.style.getPropertyValue("display"),"");
});
test("Build 127 AMP ad containers within protected form/player remain untouched",()=>{
 const embedded=ad({tag:"amp-ad",cls:"",closest:true});
 const doc=documentFor([embedded]);
 assert.equal(A.safe(embedded,doc),false);
 assert.equal(A.create(doc,{}).scan(),0);
 assert.equal(A.relevantMutation({type:"childList",addedNodes:[ad({tag:"amp-ad",cls:""})]}),true);
});

test("Build 129 exact ad-banner signals are recognized without hiding editorial lookalikes",()=>{
 for(const node of [
  ad({tag:"div",cls:"",attrs:[["data-testid","ad-container"]]}),
  ad({tag:"div",cls:"",attrs:[["data-testid","ad-banner"]]}),
  ad({tag:"div",cls:"",aria:"Paid advertisement"}),
  ad({tag:"section",cls:"",aria:"Ad slot"})
 ])assert.equal(A.hasStrongSignal(node),true);
 for(const node of [
  ad({tag:"div",cls:"",attrs:[["data-testid","ad-banner-news"]]}),
  ad({tag:"article",cls:"",aria:"Sponsored article"}),
  ad({tag:"div",cls:"",aria:"Advice"}),
  ad({tag:"section",cls:"",attrs:[["data-testid","banner-content"]]})
 ])assert.equal(A.hasStrongSignal(node),false);
});
test("Build 129 explicit ad slots still cannot hide controls or forms",()=>{
 const item=ad({tag:"div",aria:"Paid advertisement",excluded:true});
 assert.equal(A.safe(item,documentFor([item])),false);
});

test("Build 140 rehidden ad containers restore the site's most recent display",()=>{
 const element=ad(),scanner=A.create(documentFor([element]),{});
 element.style.setProperty("display","grid");
 assert.equal(scanner.scan(),1);
 element.style.setProperty("display","inline-flex","important");
 assert.equal(scanner.scan(),1);
 assert.equal(element.style.getPropertyValue("display"),"none");
 scanner.restore();
 assert.equal(element.style.getPropertyValue("display"),"inline-flex");
 assert.equal(element.style.getPropertyPriority("display"),"important");
});

test("Build 143 recognizes Google Ad Manager query-ID ad slots",()=>{
 const slot=ad({tag:"div",cls:"",attrs:[["data-google-query-id","CM4BEAE"]]});
 const normal=ad({tag:"div",cls:"",attrs:[["data-query-id","article-id"]]});
 assert.equal(A.hasStrongSignal(slot),true);
 assert.equal(A.hasStrongSignal(normal),false);
 const scanner=A.create(documentFor([slot,normal]),{});
 assert.equal(scanner.scan(),1);
 assert.equal(slot.style.getPropertyValue("display"),"none");
 assert.equal(normal.style.getPropertyValue("display"),"");
 scanner.restore();
 assert.equal(slot.style.getPropertyValue("display"),"");
});
test("Build 143 dynamic Google ad slot attributes trigger bounded scans",()=>{
 const slot=ad({tag:"div",cls:"",attrs:[["data-google-query-id","123"]]});
 assert.equal(A.relevantMutation({type:"attributes",
  attributeName:"data-google-query-id",target:slot}),true);
 assert.equal(A.relevantMutation({type:"attributes",
  attributeName:"data-query-id",target:slot}),false);
 const protectedSlot=ad({tag:"div",cls:"",attrs:[["data-google-query-id","123"]],closest:true});
 assert.equal(A.safe(protectedSlot,documentFor([protectedSlot])),false);
});

test("Build 146 Google Ad Manager iframe names are strongly identified",()=>{
 const frame=ad({tag:"iframe",cls:"",id:"",attrs:[["name","google_ads_iframe_76543"]]});
 const normal=ad({tag:"iframe",cls:"",id:"",attrs:[["name","google_user_iframe_76543"]]});
 assert.equal(A.hasStrongSignal(frame),true);
 assert.equal(A.hasStrongSignal(normal),false);
 const scanner=A.create(documentFor([frame,normal]),{});
 assert.equal(scanner.scan(),1);
 assert.equal(normal.style.getPropertyValue("display"),"");
 scanner.restore();
});
test("Build 146 dynamic iframe name changes trigger ad scans but protect sign-in",()=>{
 const frame=ad({tag:"iframe",cls:"",attrs:[["name","google_ads_iframe_5"]]});
 assert.equal(A.relevantMutation({type:"attributes",attributeName:"name",target:frame}),true);
 assert.equal(A.relevantMutation({type:"attributes",attributeName:"name",target:
  ad({tag:"iframe",cls:"",attrs:[["name","editorial_player"]]})}),false);
 const protectedFrame=ad({tag:"iframe",cls:"",closest:true,
  attrs:[["name","google_ads_iframe_5"]]});
 assert.equal(A.safe(protectedFrame,documentFor([protectedFrame])),false);
});

test("Build 148 accepts slash-form Google Ad Manager iframe IDs and names",()=>{
 const legitimate=[
  ad({tag:"iframe",id:"google_ads_iframe_/12345/desktop_0",cls:""}),
  ad({tag:"iframe",cls:"",attrs:[["name","google_ads_iframe_/2160/news-header_0"]]}),
  ad({tag:"iframe",cls:"",attrs:[["name","google_ads_iframe_76543"]]})
 ];
 for(const frame of legitimate)assert.equal(A.hasStrongSignal(frame),true);
 for(const malformed of [
  ad({tag:"iframe",id:"google_ads_iframe_/123 45/",cls:""}),
  ad({tag:"iframe",id:"not_google_ads_iframe_/12345",cls:""}),
  ad({tag:"iframe",cls:"",attrs:[["name","google_ads_iframe_/../normal?"]]})
 ])assert.equal(A.hasStrongSignal(malformed),false);
});
