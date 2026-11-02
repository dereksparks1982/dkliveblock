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

test("Build 164 exact-site cosmetic allowances restore auto-hidden ad slots",()=>{
 const node=ad({cls:"ad-slot",tag:"div"});
 node.matches=selector=>selector===".ad-slot";
 const scanner=A.create(documentFor([node]),{});
 assert.equal(scanner.scan(),1);
 assert.equal(node.style.getPropertyValue("display"),"none");
 scanner.setExceptions([".ad-slot"]);
 assert.equal(scanner.hiddenCount,0);
 assert.equal(node.style.getPropertyValue("display"),"");
 assert.equal(scanner.scan(),0,"allowed selector must never be hidden again");
 scanner.setExceptions([]);
 assert.equal(scanner.scan(),1,"removing an exception enables normal ad recognition");
 scanner.restore();
 assert.equal(node.style.getPropertyValue("display"),"");
});
test("Build 164 allowed container ancestors also protect ad descendants",()=>{
 const node=ad({cls:"ad-slot",tag:"div"});
 node.closest=selector=>selector===".manually-allowed"?{}:null;
 const scanner=A.create(documentFor([node]),{});
 scanner.setExceptions([".manually-allowed"]);
 assert.equal(scanner.scan(),0);
 assert.equal(node.style.getPropertyValue("display"),"");
});
test("Build 164 invalid CSS selectors are harmless and bounded",()=>{
 const node=ad({cls:"ad-slot",tag:"div"});
 node.matches=selector=>{if(selector==="???")throw Error("invalid CSS");return false;};
 const scanner=A.create(documentFor([node]),{});
 scanner.setExceptions(["???",4,".bad\\n#", ";injected",".a".repeat(300)]);
 assert.equal(scanner.scan(),1);
 scanner.restore();
});

test("Build 202 recognizes precise YouTube ad tiles and leaves real video cards alone",()=>{
 const paid=["ytd-ad-slot-renderer","ytd-display-ad-renderer",
  "ytd-in-feed-ad-layout-renderer","ytd-promoted-sparkles-web-renderer",
  "ytd-promoted-video-renderer","ytm-promoted-video-renderer"];
 for(const tag of paid){
  const node=ad({cls:"",tag}),scanner=A.create(documentFor([node]),{});
  assert.equal(A.hasStrongSignal(node),true,tag);
  assert.equal(scanner.scan(),1);
  assert.equal(node.style.getPropertyValue("display"),"none");
  scanner.restore();assert.equal(node.style.getPropertyValue("display"),"");
 }
 for(const tag of ["ytd-video-renderer","ytd-rich-item-renderer",
  "ytm-video-with-context-renderer","ytd-playlist-video-renderer"])
  assert.equal(A.hasStrongSignal(ad({cls:"",tag})),false,tag);
});
test("Build 202 manual exceptions and protected players still win against ad tags",()=>{
 const protectedNode=ad({cls:"",tag:"ytd-ad-slot-renderer",excluded:true});
 assert.equal(A.safe(protectedNode,documentFor([protectedNode])),false);
 const allowed=ad({cls:"",tag:"ytd-ad-slot-renderer"});
 allowed.matches=selector=>selector==="ytd-ad-slot-renderer";
 const scanner=A.create(documentFor([allowed]),{});
 scanner.setExceptions(["ytd-ad-slot-renderer"]);
 assert.equal(scanner.scan(),0);
 scanner.setExceptions([]);
 assert.equal(scanner.scan(),1);
 scanner.restore();
});
test("Build 202 giant DOM insertions cannot invoke untrusted NodeList iterator",()=>{
 let reads=0;
 const added=new Proxy({length:1000000},{get(target,key){
  if(key===Symbol.iterator)throw Error("Untrusted iterator must not run");
  if(/^\d+$/.test(String(key))){reads++;return ad({cls:"content",tag:"div"});}
  return target[key];
 }});
 assert.equal(A.relevantMutation({type:"childList",addedNodes:added}),false);
 assert.equal(reads,12);
 assert.equal(A.relevantMutation({type:"childList",
  addedNodes:[ad({cls:"",tag:"ytd-ad-slot-renderer"})]}),true);
});

test("Build 223 site-owned cam promotions hide only the narrow sidebar and restore cleanly",()=>{
 const heading={textContent:"CHAT WITH LIVE GIRLS"};
 const panel=ad({tag:"aside",cls:"live-cam-panel"});
 panel.textContent="CHAT WITH LIVE GIRLS Live Live Live Live CLICK TO SEE MORE CAM GIRLS";
 panel.getBoundingClientRect=()=>({left:945,width:320,height:530});
 panel.querySelectorAll=selector=>selector==="img,video"?Array.from({length:6},()=>({})): [];
 panel.parentElement=null;heading.parentElement=panel;
 const contentVideo=ad({tag:"video",cls:"player"});contentVideo.style.setProperty("display","block");
 const doc={body:{},documentElement:{},location:{hostname:"www.xnxx.com"},
  querySelectorAll:selector=>selector.includes("h2,h3")?[heading,panel]:[]};
 const scanner=A.create(doc,{location:{hostname:"www.xnxx.com"},innerWidth:1300},12);
 assert.equal(A.hasStrongSignal(panel),false,"site promo does not rely on standard ad selectors");
 assert.equal(scanner.scan(),1);
 assert.equal(panel.style.getPropertyValue("display"),"none");
 assert.equal(contentVideo.style.getPropertyValue("display"),"block","normal video untouched");
 assert.equal(scanner.scan(),0,"idempotent");
 scanner.restore();
 assert.equal(panel.style.getPropertyValue("display"),"");
 assert.equal(scanner.hiddenCount,0);
});
test("Build 223 same-looking content outside the observed site is never hidden",()=>{
 const heading={textContent:"CHAT WITH LIVE GIRLS"};
 const panel=ad({tag:"aside",cls:"cams"});
 panel.textContent="CHAT WITH LIVE GIRLS CLICK TO SEE MORE CAM GIRLS";
 panel.getBoundingClientRect=()=>({left:955,width:335,height:550});
 panel.querySelectorAll=selector=>selector==="img,video"?[{},{}]:[];
 heading.parentElement=panel;
 const doc={body:{},documentElement:{},querySelectorAll:q=>q.includes("h2,h3")?[heading,panel]:[]};
 for(const hostname of ["example.org","xnxx.com.evil.example"]){
  const scanner=A.create(doc,{location:{hostname},innerWidth:1300});
  assert.equal(scanner.scan(),0);assert.equal(panel.style.getPropertyValue("display"),"");
 }
});
test("Build 223 refuses broad, left-side, player-containing or undecorated panels",()=>{
 const heading={textContent:"CHAT WITH LIVE GIRLS"};
 const panel=ad({tag:"aside",cls:"cams"});heading.parentElement=panel;
 panel.textContent="CHAT WITH LIVE GIRLS CLICK TO SEE MORE CAM GIRLS";
 panel.querySelectorAll=selector=>selector==="img,video"?[{},{}]:[];
 const doc={body:{},documentElement:{},querySelectorAll:q=>q.includes("h2,h3")?[heading,panel]:[]};
 const win={location:{hostname:"xnxx.com"},innerWidth:1300};
 panel.getBoundingClientRect=()=>({left:250,width:320,height:530});
 assert.equal(A.create(doc,win).scan(),0);
 panel.getBoundingClientRect=()=>({left:940,width:910,height:530});
 assert.equal(A.create(doc,win).scan(),0);
 panel.getBoundingClientRect=()=>({left:940,width:320,height:530});
 panel.querySelector=selector=>selector.includes("video[controls]")?{}:null;
 assert.equal(A.create(doc,win).scan(),0);
 panel.querySelector=()=>null;
 panel.querySelectorAll=()=>[];
 assert.equal(A.create(doc,win).scan(),0);
});
test("Build 223 site promo exception preserves panel and allows reversible hiding",()=>{
 const heading={textContent:"CHAT WITH LIVE GIRLS"};
 const panel=ad({tag:"aside",cls:"cams"});heading.parentElement=panel;
 panel.textContent="CHAT WITH LIVE GIRLS CLICK TO SEE MORE CAM GIRLS";
 panel.getBoundingClientRect=()=>({left:940,width:320,height:530});
 panel.querySelectorAll=selector=>selector==="img,video"?[{},{}]:[];
 panel.matches=selector=>selector===".cams";
 const doc={body:{},documentElement:{},querySelectorAll:q=>q.includes("h2,h3")?[heading,panel]:[]};
 const scanner=A.create(doc,{location:{hostname:"xnxx.com"},innerWidth:1300});
 scanner.setExceptions([".cams"]);
 assert.equal(scanner.scan(),0);
 scanner.setExceptions([]);
 assert.equal(scanner.scan(),1);
 scanner.setExceptions([".cams"]);
 assert.equal(panel.style.getPropertyValue("display"),"");
});

const FB=require("../src/facebook-ads.js");
test("Build 232 Facebook limits host and label recognition to actual ads",()=>{
 for(const h of ["facebook.com","www.facebook.com","m.facebook.com"])assert.equal(FB.isFacebook(h),true);
 for(const h of ["notfacebook.com","facebook.com.evil.test","youtube.com","xnxx.com"])assert.equal(FB.isFacebook(h),false);
 for(const s of ["Ad","Sponsored","S\u200bponsored"])assert.equal(FB.isAdLabel(s),true);
 for(const s of ["Advertisement","Adventures","Shared","Suggested for you"])assert.equal(FB.isAdLabel(s),false);
});
test("Build 232 Facebook refuses an oversized, protected or top-level container",()=>{
 const make=(w,protectedNode=false)=>({style:new Style(),isConnected:true,
  matches:()=>protectedNode,querySelector:()=>protectedNode?{}:null,closest:()=>null,
  querySelectorAll:()=>[],getBoundingClientRect:()=>({width:w,height:400})});
 const doc={body:{},documentElement:{}};
 assert.equal(FB.safeCard(make(520),doc),true);
 assert.equal(FB.safeCard(make(1100),doc),false);
 assert.equal(FB.safeCard(make(520,true),doc),false);
 assert.equal(FB.create({location:{hostname:"youtube.com"}},{}),null);
});
test("Build 232 XNXX GOLD banner hides narrowly, restores and protects video",()=>{
 const link={getAttribute:()=> "https://xnxx.gold/",parentElement:null};
 const banner=ad({tag:"div",cls:"promo"});link.parentElement=banner;
 banner.textContent="Try XNXX.GOLD. Ad-free experience with extra content and features.";
 banner.getBoundingClientRect=()=>({left:0,top:54,width:1295,height:60});
 banner.querySelector=()=>null;
 const win={location:{hostname:"www.xnxx.com"},innerWidth:1295};
 const doc={body:{},documentElement:{},querySelectorAll:q=>q.includes('a[href*="xnxx.gold"]')?[link]:[]};
 const scanner=A.create(doc,win);
 assert.equal(scanner.scan(),1);assert.equal(banner.style.getPropertyValue("display"),"none");
 scanner.restore();assert.equal(banner.style.getPropertyValue("display"),"");
 banner.querySelector=()=>({});
 assert.equal(A.create(doc,win).scan(),0);
 assert.equal(A.create(doc,{location:{hostname:"youtube.com"},innerWidth:1295}).scan(),0);
});
test("Build 232 site-specific dynamic mutation rules remain site-scoped",()=>{
 const node={nodeType:1,matches:s=>s.includes("xnxx.gold"),querySelector:()=>null};
 assert.equal(A.relevantMutation({type:"childList",addedNodes:[node]},"www.xnxx.com"),true);
 assert.equal(A.relevantMutation({type:"childList",addedNodes:[node]},"example.com"),false);
 assert.equal(A.relevantMutation({type:"attributes",attributeName:"aria-labelledby",target:node},"www.facebook.com"),true);
 assert.equal(A.relevantMutation({type:"attributes",attributeName:"aria-labelledby",target:node},"example.com"),false);
});


function facebookCard233(label){
 const item={style:new Style(),isConnected:true,tagName:"DIV",
  matches:()=>false,closest:()=>null,getClientRects:()=>[{}],
  getBoundingClientRect:()=>({left:399,width:520,height:420}),
  querySelector:()=>null,
  querySelectorAll:q=>q.includes("span,a,[aria-label]")?label?[label]:[]:[],
  contains:n=>n===label};
 return item;
}
test("Build 233 recognizes Facebook sponsored-content menu without hiding organic posts",()=>{
 const advertMenu={nodeType:1,children:[],childNodes:[],textContent:"",
  getAttribute:k=>k==="aria-label"?"Open menu for Dawn of Jets sponsored content":null,
  closest:()=>null};
 const organicText={nodeType:1,children:[],childNodes:[],textContent:"Ad",
  getAttribute:()=>null,closest:q=>q.includes("p,blockquote")?{}:null};
 const adCard=facebookCard233(advertMenu),goodCard=facebookCard233(organicText);
 const doc={body:{},documentElement:{},location:{hostname:"www.facebook.com"},
  getElementById:()=>null,
  querySelectorAll:q=>q.includes("h1,h2,h3")?[]:q.includes('[role="article"]')?[adCard,goodCard]:[]};
 const scanner=FB.create(doc,{location:{hostname:"www.facebook.com"},innerWidth:1295});
 assert.equal(scanner.scan(),1);
 assert.equal(adCard.style.getPropertyValue("display"),"none");
 assert.equal(goodCard.style.getPropertyValue("display"),"");
 scanner.restore();
 assert.equal(adCard.style.getPropertyValue("display"),"");
 assert.equal(FB.sponsoredMenu(organicText),false);
 assert.equal(FB.sponsoredMenu(advertMenu),true);
});
test("Build 233 finds right-rail Sponsored module without complementary landmark",()=>{
 const heading={nodeType:1,textContent:"Sponsored",
  getBoundingClientRect:()=>({left:1040,width:220,height:27}),
  closest:q=>q.includes("h1,h2,h3")?heading:null};
 const panel={nodeType:1,style:new Style(),isConnected:true,getClientRects:()=>[{}],
  matches:()=>false,querySelector:q=>q==="img"?{}:null,
  querySelectorAll:q=>q.includes("h1,h2,h3")?[heading]:[],
  getBoundingClientRect:()=>({left:1015,width:285,height:390})};
 const body={contains:x=>x===heading||x===panel};
 heading.parentElement=panel;panel.parentElement=body;
 const doc={body,documentElement:{},location:{hostname:"www.facebook.com"},
  querySelectorAll:q=>q.includes("h1,h2,h3")?[heading]:[]};
 const scanner=FB.create(doc,{location:{hostname:"www.facebook.com"},innerWidth:1295});
 assert.equal(scanner.scan(),1);
 assert.equal(panel.style.getPropertyValue("display"),"none");
 scanner.restore();assert.equal(panel.style.getPropertyValue("display"),"");
});
test("Build 233 recognizes bounded nested scrambled Sponsored labels",()=>{
 const chars=Array.from("Sponsored",(c,i)=>({nodeType:1,tagName:"SPAN",children:[],
  childNodes:[{nodeType:3,textContent:c}],textContent:c,classList:{length:19},order:i}));
 const middle={nodeType:1,tagName:"SPAN",children:chars,childNodes:chars};
 const outer={nodeType:1,children:[middle],childNodes:[middle],getAttribute:()=>null};
 const labels=FB.labelsOf(outer,{getComputedStyle:n=>({order:n.order})});
 assert.ok(labels.some(FB.isAdLabel));
 assert.equal(FB.isAdLabel("Sponsored articles"),false);
});
test("Build 233 protects feed layout and comment forms; detects dynamic Facebook pagelet mutation",()=>{
 const fake=facebookCard233(null);
 fake.querySelector=q=>q==="form"?{}:null;
 assert.equal(FB.safeCard(fake,{body:{},documentElement:{}}),true,
  "comment form inside a sponsored feed card must not prevent filtering");
 fake.querySelector=q=>q.includes("main,")?{}:null;
 assert.equal(FB.safeCard(fake,{body:{},documentElement:{}}),false,
  "never hide a container holding another feed root");
 const scanner=FB.create({location:{hostname:"www.facebook.com"}},{location:{hostname:"www.facebook.com"}});
 assert.equal(scanner.observeMutation({type:"attributes",attributeName:"data-pagelet"}),true);
 assert.equal(scanner.observeMutation({type:"attributes",attributeName:"title"}),false);
 assert.equal(FB.create({location:{hostname:"example.com"}},{location:{hostname:"example.com"}}),null);
});


test("Build 234 uBO-inspired Facebook rail signatures avoid ordinary links",()=>{
 const link=a=>({tagName:"A",getAttribute:k=>a[k]||"",querySelector:()=>null,closest:()=>null});
 assert.equal(FB.railAdLink(link({target:"rhcad2",rel:"nofollow noreferrer noopener"})),true);
 assert.equal(FB.railAdLink(link({attributionsrc:"/privacy_sandbox/comet/register/?eid=abc"})),true);
 assert.equal(FB.railAdLink(link({rel:"noreferrer",href:"https://example.org/?fbclid=1&utm_medium=cpc&utm_source=fb&utm_id=9&utm_content=z&utm_term=b&utm_campaign=test"})),true);
 assert.equal(FB.railAdLink(link({rel:"noreferrer",href:"https://example.org/?fbclid=1&utm_medium=cpc&utm_source=fb&utm_campaign=test"})),false);
 assert.equal(FB.railAdLink(link({href:"/friends/"})),false);
});
test("Build 234 narrowly removes and restores Facebook right-rail ad-link card",()=>{
 const attr={target:"rhcad2",rel:"nofollow noreferrer noopener"};
 const link={tagName:"A",getAttribute:k=>attr[k]||"",getBoundingClientRect:()=>({left:1050,width:200,height:30}),closest:()=>null};
 const panel={style:new Style(),isConnected:true,tagName:"DIV",getClientRects:()=>[{}],
  matches:()=>false,getBoundingClientRect:()=>({left:1015,width:280,height:170}),
  querySelector:q=>q==="img"?{}:null,querySelectorAll:()=>[]};
 const body={};link.parentElement=panel;panel.parentElement=body;
 const doc={body,documentElement:{},location:{hostname:"www.facebook.com"},
  querySelectorAll:q=>q.includes('a[target="rhcad2"]')?[link]:[]};
 const scan=FB.create(doc,{location:{hostname:"www.facebook.com"},innerWidth:1295});
 assert.equal(scan.scan(),1);
 assert.equal(panel.style.getPropertyValue("display"),"none");
 scan.restore();assert.equal(panel.style.getPropertyValue("display"),"");
 link.getBoundingClientRect=()=>({left:80,width:180,height:30});
 assert.equal(FB.rightRailLinkCard(link,doc,{innerWidth:1295}),null);
});
test("Build 234 does not compute styles across ordinary Facebook wrappers",()=>{
 let reads=0;
 const regular={children:Array.from({length:12},()=>({tagName:"DIV",children:[],textContent:"Hi"})),
  childNodes:[],getAttribute:()=>null};
 FB.labelsOf(regular,{getComputedStyle:()=>{reads++;return{};}});
 assert.equal(reads,0);
 const chars=Array.from("Sponsored",(x,i)=>({tagName:"SPAN",children:[],textContent:x,
  classList:{length:20},order:i}));
 const split={children:chars,childNodes:[],getAttribute:()=>null};
 assert.ok(FB.labelsOf(split,{getComputedStyle:x=>{reads++;return{order:x.order};}}).some(FB.isAdLabel));
 assert.equal(reads,9);
});

test("Build 235 resolves Facebook's SVG label portals and rejects organic timestamps",()=>{
 const FB235=require("../src/facebook-ads.js");
 const glyphs=Array.from("Sponsored",(c,i)=>({tagName:"SPAN",children:[],
  textContent:c,classList:{length:22},order:i}));
 const symbol={id:"sprite_a",children:glyphs,childNodes:[],getAttribute:()=>null};
 const doc={getElementById:id=>id==="sprite_a"?symbol:null};
 const win={getComputedStyle:e=>({order:e.order})};
 const use={tagName:"use",getAttribute:k=>k==="href"?"#sprite_a":null};
 assert.ok(FB235.referenceLabels(use,doc,new Map(),win).some(FB235.isAdLabel));
 assert.equal(FB235.referenceLabels(use,{getElementById:()=>null},new Map(),win).some(FB235.isAdLabel),false);
 const normal={tagName:"use",getAttribute:k=>k==="href"?"#time_1":null};
 assert.equal(FB235.referenceLabels(normal,{getElementById:()=>({children:[],childNodes:[],textContent:"2h"})},
   new Map(),win).some(FB235.isAdLabel),false);
});
test("Build 235 reconstructs separately referenced character fragments safely",()=>{
 const ids=Array.from("Sponsored",(c,i)=>["ref_"+i,c]);
 const link={getAttribute:k=>k==="aria-labelledby"?ids.map(x=>x[0]).join(" "):null};
 const doc={getElementById:id=>({children:[],childNodes:[],textContent:ids.find(x=>x[0]===id)?.[1]||""})};
 assert.ok(FB.referenceLabels(link,doc,new Map(),{}).some(FB.isAdLabel));
 assert.ok(!FB.referenceLabels({getAttribute:()=>"unknown_123"},doc,new Map(),{}).some(FB.isAdLabel));
 assert.ok(!FB.referenceLabels({getAttribute:()=> "../unsafe"},doc,new Map(),{}).some(FB.isAdLabel));
});
test("Build 235 uses captured removed portal label and detects text replacement",()=>{
 const sprite={nodeType:1,id:"stored_label",children:[],childNodes:[],textContent:"Sponsored",
  getAttribute:()=>null,querySelectorAll:()=>[]};
 const label={nodeType:1,tagName:"SPAN",children:[],childNodes:[],textContent:"",
  getAttribute:k=>k==="aria-labelledby"?"stored_label":null,closest:()=>null};
 const name={contains:()=>false};
 const byline={textContent:"Poster · Sponsored · 3h",
  getBoundingClientRect:()=>({height:75}),querySelector:()=>name,
  parentElement:null};
 const card=facebookCard233(label);
 label.parentElement=byline;byline.parentElement=card;
 card.querySelectorAll=q=>q.includes("span,a")?[label]:[];
 card.contains=n=>n===label||n===byline;
 const doc={body:{},documentElement:{},location:{hostname:"www.facebook.com"},
  getElementById:()=>null,querySelectorAll:q=>q.includes("h1,h2,h3")?[]:
   q.includes('[role="article"]')?[card]:[]};
 const scanner=FB.create(doc,{location:{hostname:"www.facebook.com"},innerWidth:1295});
 assert.equal(scanner.observeMutation({type:"childList",removedNodes:[sprite],addedNodes:[]}),true);
 assert.equal(scanner.scan(),1);
 assert.equal(card.style.getPropertyValue("display"),"none");
 scanner.restore();assert.equal(card.style.getPropertyValue("display"),"");
 assert.equal(scanner.observeMutation({type:"characterData",target:{textContent:"Ad"}}),true);
 assert.equal(scanner.observeMutation({type:"characterData",target:{textContent:"Adventure"}}),false);
});

test("Build 235 SVG nested text labels survive external reference and removal",()=>{
 const symbol={nodeType:1,id:"fb_svg_sponsored",tagName:"symbol",
  children:[{tagName:"text",children:[],textContent:"Sponsored"}],
  textContent:"Sponsored",childNodes:[],getAttribute:()=>null,querySelectorAll:()=>[]};
 const use={tagName:"use",getAttribute:k=>k==="href"?"#fb_svg_sponsored":null};
 const lookup={getElementById:id=>id==="fb_svg_sponsored"?symbol:null};
 assert.ok(FB.referenceLabels(use,lookup,new Map(),{}).some(FB.isAdLabel));
 assert.ok(FB.referenceTargetLabels(symbol,{}).some(FB.isAdLabel));
 const organic={nodeType:1,id:"fb_svg_time",tagName:"symbol",
  children:[{tagName:"text",children:[],textContent:"2h"}],
  textContent:"2h",childNodes:[],getAttribute:()=>null,querySelectorAll:()=>[]};
 assert.equal(FB.referenceTargetLabels(organic,{}).some(FB.isAdLabel),false);
 const scanner=FB.create({location:{hostname:"www.facebook.com"}},{location:{hostname:"www.facebook.com"}});
 assert.equal(scanner.observeMutation({type:"childList",removedNodes:[symbol],addedNodes:[]}),true);
});
