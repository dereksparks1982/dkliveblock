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
