"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict");
const D=require("../src/distractions.js");
const visible={overlay:true,visible:true,hasPlayer:false,hasSensitive:false,fullscreen:false};
test("only strongly identified newsletter or survey overlays qualify",()=>{
 for(const line of ["Subscribe to our newsletter","Join our mailing list",
   "Sign up for email updates","Get the latest news in your inbox"]){
  assert.equal(D.classify({...visible,text:line}),"newsletter",line);
 }
 for(const line of ["Please take our survey","Complete this short questionnaire",
  "Help us improve: take this survey"]){
  assert.equal(D.classify({...visible,text:line}),"survey",line);
 }
 for(const line of ["Subscribe to continue reading","Subscribe to watch the full video",
  "Confirm your purchase","Welcome to our newsletter archive",
  "Read about survey methods","Please sign in to your account"]){
  assert.equal(D.classify({...visible,text:line}),"",line);
 }
});
test("sensitive, embedded-media and non-overlays remain untouched",()=>{
 for(const override of [{visible:false},{overlay:false},{hasPlayer:true},
  {hasSensitive:true},{fullscreen:true}]){
  assert.equal(D.classify({...visible,...override,text:"Subscribe to our newsletter"}),"");
 }
 assert.equal(D.classify({...visible,text:"",labelText:"floating-ad-video",
  hasPlayer:true}),"");
 assert.equal(D.classify({...visible,text:"",labelText:"floating-ad-video",
  hasMediaFrame:true}),"");
 assert.equal(D.classify({...visible,text:"",labelText:"floating-ad-video",
  host:"www.youtube.com"}),"");
 assert.equal(D.classify({...visible,text:"",labelText:"floating-ad-slot",
  host:"news.example"}),"corner-ad");
 assert.equal(D.classify({...visible,text:"",labelText:"floating-player",
  host:"news.example"}),"");
});

test("Build 54 leaves a newsletter or survey visible while the user edits it",()=>{
 const D=require("../src/distractions.js");
 const input={localName:"input"},textarea={localName:"textarea"};
 const dialog={contains:node=>node===input||node===textarea};
 assert.equal(D.userEngaged(dialog,input),true);
 assert.equal(D.userEngaged(dialog,textarea),true);
 assert.equal(D.userEngaged(dialog,{localName:"button"}),false);
 assert.equal(D.userEngaged(null,input),false);
 const editor={localName:"div",isContentEditable:true};
 assert.equal(D.userEngaged({contains:n=>n===editor},editor),true);
});

test("Build 63 suppresses Russian and English VPN nags plus RUTUBE paid subscription promotion",()=>{
 for(const line of [
  "VPN лучше выключить: RUTUBE будет работать быстрее, а доступных видео станет больше.",
  "Отключите VPN для просмотра видео",
  "Please disable your VPN to continue watching.",
  "Turn off your VPN for a better experience.",
  "VPN detected. Please disconnect to continue."
 ]){
  assert.equal(D.vpnNotice(line),true,line);
  assert.equal(D.classify({...visible,text:line,host:"rutube.ru"}),"vpn-notice",line);
 }
 const offer="Осень без рекламы. 30 дней подписки RUTUBE за 1 ₽. Самое время устроиться поудобнее. Подключить за 1 ₽.";
 assert.equal(D.classify({...visible,text:offer,host:"rutube.ru"}),"site-promotion");
 assert.equal(D.classify({...visible,text:offer,host:"unrelated.example"}),"");
});
test("VPN articles, genuine account challenges, players and hidden UI are preserved",()=>{
 const text="Turn off your VPN for a better experience.";
 for(const override of [{visible:false},{overlay:false},{hasPlayer:true},
  {hasSensitive:true},{fullscreen:true}]){
  assert.equal(D.classify({...visible,...override,text}),"");
 }
 for(const line of ["VPN technology and privacy research","Read our VPN comparison",
  "Please sign in and turn off your VPN to access your account","Your VPN settings"]){
  assert.equal(D.classify({...visible,text:line}),"",line);
 }
});
