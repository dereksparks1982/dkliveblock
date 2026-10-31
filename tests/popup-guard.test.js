"use strict";
const test=require("node:test"),assert=require("node:assert/strict");
require("../src/auth-protection.js");
const G=require("../src/popup-guard.js");
function el({name="div",id="",cls="",role="",modal="",childSelector=""}={}){
 return {nodeType:1,localName:name,id,className:cls,parentElement:null,
  getAttribute:key=>key==="role"?role:key==="aria-modal"?modal:null,
  matches:selector=>childSelector&&selector.includes(childSelector),
  querySelector:selector=>childSelector&&selector.includes(childSelector)?{}:null};
}
test("sensitive dialogs are never suppressed even if they ask to disable adblock",()=>{
 for(const childSelector of ["password","one-time-code","cc-number","captcha","data-sitekey"]){
  assert.equal(G.protectedDialog(el({childSelector}),"Please disable your ad blocker"),true,childSelector);
 }
 assert.equal(G.protectedDialog(el(),"Ad blocker detected. Disable your adblocker."),false);
});
test("payment, CAPTCHA and account recovery instructions are protected",()=>{
 for(const text of ["Enter your password to continue reading","Confirm your payment and subscribe to continue reading",
  "Complete your purchase: subscribe to keep reading","Human verification: disable your adblocker",
  "Enter the verification code before proceeding"]){
  assert.equal(G.protectedDialog(el(),text),true,text);
 }
 assert.equal(G.protectedDialog(el({role:"alertdialog"}),"Security challenge: Turn off adblock"),true);
});
test("recognize modal signals and bounded parent lookups, avoid generic churn",()=>{
 const parent=el({cls:"paywall-gateway"}),child=el();
 child.parentElement=parent;
 assert.equal(G.likelyOverlay(child),true);
 assert.equal(G.likelyOverlay(el({id:"newsletter-popup"})),true);
 assert.equal(G.likelyOverlay(el({name:"dialog"})),true);
 assert.equal(G.likelyOverlay(el({cls:"video-player"})),false);
 assert.equal(G.likelyOverlay(el({cls:"search-box"})),false);
});
test("only relevant DOM mutations trigger expensive overlay scanning",()=>{
 const popup=el({cls:"modal"});
 const unrelated=el({cls:"video-player"});
 assert.equal(G.shouldInspectMutation({type:"attributes",target:popup}),true);
 assert.equal(G.shouldInspectMutation({type:"attributes",target:unrelated}),false);
 assert.equal(G.shouldInspectMutation({type:"childList",addedNodes:[popup]}),true);
 assert.equal(G.shouldInspectMutation({type:"childList",addedNodes:[unrelated]}),false);
 assert.equal(G.shouldInspectMutation({type:"attributes",target:{nodeType:3}}),false);
});
test("site-visible hidden overlays get re-checked; our hidden style changes do not",()=>{
 const popup=el({cls:"modal"});
 popup.style={getPropertyValue:()=>"none",getPropertyPriority:()=>"important"};
 assert.equal(G.shouldInspectMutation({type:"attributes",target:popup},()=>true),false);
 popup.style={getPropertyValue:()=>"block",getPropertyPriority:()=>""};
 assert.equal(G.shouldInspectMutation({type:"attributes",target:popup},()=>true),true);
});
test("malformed or unexpected nodes are handled conservatively without throwing",()=>{
 assert.equal(G.protectedDialog(null),true);
 assert.equal(G.shouldInspectMutation(null),false);
 assert.equal(G.likelyOverlay(null),false);
 const hostile={matches:()=>{throw Error("inaccessible element")}};
 assert.equal(G.protectedDialog(hostile),true);
});

test("Build 63 banner or VPN notification insertions trigger overlay scanning",()=>{
 assert.equal(G.likelyOverlay(el({id:"vpn-warning"})),true);
 assert.equal(G.likelyOverlay(el({cls:"bottom-banner"})),true);
 assert.equal(G.shouldInspectMutation({type:"childList",addedNodes:[el({cls:"vpn-notification"})]}),true);
});
