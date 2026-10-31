"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict");
const V=require("../src/video-assist.js");
function btn({cls="ytp-ad-skip-button",label="Skip Ad",visible=true,disabled=false,ad=true}={}){
 let clicks=0;
 const button={className:cls,textContent:label,isConnected:true,disabled,
  getAttribute:name=>name==="aria-label"?label:null,
  getClientRects:()=>visible?[1]:[],
  closest:selector=>ad&&selector.includes("ad-showing")?{}:null,
  click:()=>{clicks++;}};
 return {button,clicks:()=>clicks};
}
test("only known streaming hosts receive player-safe cosmetics",()=>{
 for(const name of ["youtube.com","www.youtube.com","m.youtube.com","youtube-nocookie.com","www.disneyplus.com"])
  assert.equal(V.isStreamingHost(name),true,name);
 for(const name of ["youtube.com.attacker.net","fakedisneyplus.com","video.example","youtubecom"])
  assert.equal(V.isStreamingHost(name),false,name);
 const input=["ytd-ad-slot-renderer","video","#movie_player",".html5-video-player",".ytp-chrome-bottom",
   ".sponsored,.video-stream",".advertisement","div:has(video)"];
 assert.deepEqual(V.safeCosmetics(input,"www.youtube.com"),["ytd-ad-slot-renderer",".advertisement"]);
 assert.deepEqual(V.safeCosmetics(input,"news.example"),input);
});
test("guard real player containers while allowing ad-slot UI to be hidden",()=>{
 for(const selector of ["video",".video-stream","ytd-player","#movie_player",".ad, video",".box:has(video)",".ytp-progress-bar"])
  assert.equal(V.protectSelector(selector),true,selector);
 for(const selector of [".ad-slot","ytd-ad-slot-renderer","#player-ads",".sponsored"])
  assert.equal(V.protectSelector(selector),false,selector);
});
test("skip known visible ad controls once per cooldown window",()=>{
 const x=btn(),controller=V.createController();
 const doc={querySelectorAll:()=>[x.button]};
 assert.equal(controller.scan(doc,10000).clicked,true);
 assert.equal(x.clicks(),1);
 assert.equal(controller.scan(doc,11000).clicked,false);
 assert.equal(x.clicks(),1);
 assert.equal(controller.scan(doc,16100).clicked,true);
 assert.equal(x.clicks(),2);
});
test("never click intro, skip-next, disabled or invisible controls",()=>{
 const controls=[btn({cls:"",label:"Skip Intro"}),btn({cls:"",label:"Skip Ad",ad:false}),
  btn({cls:"ytp-ad-skip-button",disabled:true}),btn({cls:"ytp-ad-skip-button",visible:false})];
 const controller=V.createController();
 assert.equal(controller.scan({querySelectorAll:()=>controls.map(x=>x.button)}).clicked,false);
 for(const x of controls)assert.equal(x.clicks(),0);
});
test("ad-labelled generic controls require the actual ad player context",()=>{
 const x=btn({cls:"",label:"Skip Ads",ad:true});
 assert.equal(V.isAdSkip(x.button),true);
 const controller=V.createController();
 assert.equal(controller.scan({querySelectorAll:()=>[x.button]},100).clicked,true);
});
test("exhaustive scanning is bounded and malformed pages fail safely",()=>{
 const controls=Array.from({length:40},()=>btn({cls:"",label:"Skip Intro"}));
 const x=btn();
 const result=V.createController().scan({querySelectorAll:()=>[...controls.map(a=>a.button),x.button]},200);
 assert.equal(result.clicked,false);
 assert.equal(x.clicks(),0);
 assert.equal(V.createController().scan({querySelectorAll:()=>{throw Error("bad selector")}}).clicked,false);
});
test("element picker never allows selecting live player controls",()=>{
 const node={matches:selector=>selector.includes("video"),closest:()=>null};
 assert.equal(V.playerElement(node),true);
 assert.equal(V.playerElement({matches:()=>false,closest:()=>null}),false);
});

test("Playback Rescue is opt-in, media only, and bound to a single website hostname",()=>{
 assert.equal(V.mediaRecoveryAllowed("www.youtube.com","media",[]),false);
 assert.equal(V.mediaRecoveryAllowed("www.youtube.com","script",["www.youtube.com"]),false);
 assert.equal(V.mediaRecoveryAllowed("www.youtube.com","xmlhttprequest",["www.youtube.com"]),false);
 assert.equal(V.mediaRecoveryAllowed("news.example","media",["news.example"]),false);
 assert.equal(V.mediaRecoveryAllowed("m.youtube.com","media",["www.youtube.com"]),false);
 assert.equal(V.mediaRecoveryAllowed("www.youtube.com","media",["www.youtube.com"]),true);
 assert.equal(V.mediaRecoveryAllowed("www.disneyplus.com","media",["www.disneyplus.com"]),true);
});

test("the element picker refuses parent wrappers containing active media",()=>{
 const wrapper={matches:()=>false,closest:()=>null,querySelector:x=>x.includes("video")?{}:null};
 assert.equal(V.playerElement(wrapper),true);
 const unrelated={matches:()=>false,closest:()=>null,querySelector:()=>null};
 assert.equal(V.playerElement(unrelated),false);
});

test("stale button cooldown cannot hide the next available Skip Ad control",()=>{
 const first=btn(),second=btn(),controller=V.createController(5000);
 assert.equal(controller.scan({querySelectorAll:()=>[first.button]},1000).clicked,true);
 assert.equal(controller.scan({querySelectorAll:()=>[first.button,second.button]},2000).clicked,true);
 assert.equal(first.clicks(),1);assert.equal(second.clicks(),1);
});
test("a skip control in a hidden or inert ancestor is not clicked",()=>{
 const x=btn(),original=x.button.closest;
 x.button.closest=selector=>selector.includes("[inert]")?{}:original(selector);
 assert.equal(V.isAdSkip(x.button),false);
 assert.equal(x.clicks(),0);
});
test("a recycled ad-skip wrapper cannot click Skip Intro or Next Episode",()=>{
 const controller=V.createController();
 for(const label of ["Skip Intro","Skip Recap","Next Episode","Play Next","Skip Credits"]){
  const x=btn({cls:"ytp-ad-skip-button",label});
  assert.equal(V.isAdSkip(x.button),false,label);
  assert.equal(controller.scan({querySelectorAll:()=>[x.button]}).clicked,false,label);
  assert.equal(x.clicks(),0,label);
 }
});
test("cosmetic filtering does not hide the player Skip Ad buttons",()=>{
 for(const selector of [".ytp-ad-skip-button",".ytp-ad-skip-button-slot",".ytp-skip-ad-button",".ytp-ad-skip-button-container"])
  assert.equal(V.protectSelector(selector),true,selector);
});

test("a recycled skip button is not allowed to click unrelated controls",()=>{
 for(const label of ["Learn more","Report ad","Continue","Cancel","Next","Go to sponsor"]){
  const x=btn({cls:"ytp-ad-skip-button",label,ad:true});
  assert.equal(V.isAdSkip(x.button),false,label);
  assert.equal(V.createController().scan({querySelectorAll:()=>[x.button]}).clicked,false,label);
  assert.equal(x.clicks(),0);
 }
});
test("compact Skip-only label needs dedicated class AND genuine ad context",()=>{
 const ordinary=btn({cls:"",label:"Skip",ad:true});
 const detached=btn({cls:"ytp-ad-skip-button",label:"Skip",ad:false});
 const adSkip=btn({cls:"ytp-ad-skip-button",label:"Skip",ad:true});
 assert.equal(V.isAdSkip(ordinary.button),false);
 assert.equal(V.isAdSkip(detached.button),false);
 assert.equal(V.isAdSkip(adSkip.button),true);
});
test("computed-style hidden and disabled-ancestor buttons are ignored",()=>{
 for(const property of [
  {display:"block",visibility:"hidden",opacity:"1",pointerEvents:"auto"},
  {display:"block",visibility:"visible",opacity:"0",pointerEvents:"auto"},
  {display:"block",visibility:"visible",opacity:"1",pointerEvents:"none"},
  {display:"none",visibility:"visible",opacity:"1",pointerEvents:"auto"}
 ]){
  const x=btn();
  x.button.ownerDocument={defaultView:{getComputedStyle:()=>property}};
  assert.equal(V.isAdSkip(x.button),false,JSON.stringify(property));
 }
 const x=btn();
 x.button.closest=selector=>selector.includes("[aria-disabled='true']")?{}:null;
 assert.equal(V.isAdSkip(x.button),false);
});
test("expanded accessible ad labels remain recognized in ad context",()=>{
 for(const label of ["Skip Advertisement","Skip Advertisements","Skip Commercial","Skip Ads"]){
  const x=btn({cls:"",label,ad:true});
  assert.equal(V.isAdSkip(x.button),true,label);
 }
});

test("Build 57 recognizes explicit multilingual ad skips, never generic next controls",()=>{
 for(const label of ["Passer l'annonce","Ignorer l’annonce","Werbung überspringen",
  "Saltar anuncio","Omitir anuncios","Pular anúncio","Reklamı geç","Reklamları atla",
  "Пропустить рекламу","تخطي الإعلان","跳过广告"]){
  assert.equal(V.isAdSkip(btn({label}).button),true,label);
 }
 for(const label of ["Skip Intro","Play Next","Passer l'intro","Reklam ayarları",
  "Пропустить вступление","Saltar introducción","跳过片头"]){
  assert.equal(V.isAdSkip(btn({label}).button),false,label);
 }
});
test("Build 57 conflicting caption, aria label, and title prevent automatic clicking",()=>{
 const mismatch=btn({label:"Skip Ad"});
 mismatch.button.getAttribute=name=>name==="aria-label"?"Skip Intro":null;
 assert.equal(V.isAdSkip(mismatch.button),false);
 const title=btn({label:"Skip Ad"});
 title.button.getAttribute=name=>name==="aria-label"?"Skip Ad":name==="title"?"Continue":null;
 assert.equal(V.isAdSkip(title.button),false);
 const caption=btn({label:"Skip Intro"});
 caption.button.getAttribute=name=>name==="aria-label"?"Skip Ad":null;
 assert.equal(V.isAdSkip(caption.button),false);
});
test("Build 57 never click navigation, pressed-toggle or form-submit actions",()=>{
 for(const attrs of [{href:"/"},{"aria-pressed":"false"},{"aria-checked":"false"}]){
  const x=btn();x.button.getAttribute=name=>name==="aria-label"?"Skip Ad":attrs[name]??null;
  assert.equal(V.isAdSkip(x.button),false);
 }
 const link=btn();link.button.localName="a";
 assert.equal(V.isAdSkip(link.button),false);
 const form=btn();form.button.form={};form.button.type="submit";
 assert.equal(V.isAdSkip(form.button),false);
});
test("Build 57 explicit reset allows a new SPA skip, not an early repeat",()=>{
 const x=btn(),ctrl=V.createController(),doc={querySelectorAll:()=>[x.button]};
 assert.equal(ctrl.scan(doc,1000).clicked,true);
 assert.equal(ctrl.scan(doc,2000).clicked,false);
 ctrl.reset();
 assert.equal(ctrl.scan(doc,2100).clicked,true);
 assert.equal(x.clicks(),2);
});
test("Build 57 translated generic skip action requires ad context",()=>{
 const x=btn({cls:"",label:"Passer l’annonce",ad:false});
 assert.equal(V.isAdSkip(x.button),false);
 x.button.closest=selector=>selector.includes("ad-showing")?{}:null;
 assert.equal(V.isAdSkip(x.button),true);
});
