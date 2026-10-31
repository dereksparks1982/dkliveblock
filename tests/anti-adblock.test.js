"use strict";
const test=require("node:test"),assert=require("node:assert/strict");
const {isAntiAdblockNotice,shouldHide}=require("../src/anti-adblock.js");
test("detect ad-blocker nags and YouTube enforcement prompts",()=>{
 for(const msg of ["Ad blocker detected! Please disable your ad blocker to continue.","Ad blockers violate YouTube's Terms of Service.","Video playback is blocked unless you disable your ad blocker.","We've noticed you're using an ad blocker","Please whitelist our site to support us.","Please turn off your ad blocker before continuing.","Your AdBlocker is enabled. Please deactivate it.","Bloqueador de anuncios detectado, desactiva el bloqueador de anuncios.","Werbeblocker erkannt. Bitte deaktivieren."])
  assert.equal(isAntiAdblockNotice(msg),true,msg);
});
test("not normal articles, payment or cookie dialogs",()=>{
 for(const msg of ["Accept cookies to continue","Subscribe to read more articles","YouTube playback resumed","How ad blockers work","Advertising pays for this site.","Thanks for supporting our community","Turn off your computer","Please disable autoplay","Sign in to watch"])
  assert.equal(isAntiAdblockNotice(msg),false,msg);
});
test("only suppress visible notices, never containing players or site roots",()=>{
 const v={text:"Ad blocker detected. Please disable your ad blocker.",visible:true,overlay:true};
 assert.equal(shouldHide(v),true);
 for(const n of [{visible:false},{overlay:false},{containsPlayer:true},{rootElement:true}])assert.equal(shouldHide({...v,...n}),false);
});
test("do not mistake subscription paywalls for anti-adblock nags",()=>{
 assert.equal(shouldHide({text:"To continue watching this video, please sign in or subscribe.",visible:true,overlay:true}),false);
});

test("AP support-journalism anti-adblock dialogs and newer YouTube wording",()=>{
 for(const msg of [
  "Support Independent Journalism. Advertising delivers vital revenue. Please consider disabling your ad blocker, or support AP directly by making a donation.",
  "We noticed that you're using an ad blocker. Please turn it off to continue.",
  "Ad blockers are not allowed on YouTube",
  "To continue watching, please turn off your ad blocker.",
  "We’ve noticed you’re using an ad blocker."
 ])assert.equal(isAntiAdblockNotice(msg),true,msg);
});
test("do not classify articles and unrelated donation or player notices",()=>{
 for(const msg of [
  "Please read our article on ad blockers, published today.",
  "Support our journalism by making a donation.",
  "Please enable cookies to continue.",
  "Use an ad blocker to improve your privacy.",
  "Please pause this video while you read.",
  "Allow ads for an advertising campaign in your newsletter"
 ])assert.equal(isAntiAdblockNotice(msg),false,msg);
});

test("distinguishes YouTube playback enforcement from ordinary blocker warnings",()=>{
 const {isPlaybackEnforcement}=require("../src/anti-adblock.js");
 assert.equal(isPlaybackEnforcement("Ad blockers violate YouTube's Terms of Service"),true);
 assert.equal(isPlaybackEnforcement("Video playback is blocked unless YouTube is allowlisted or the ad blocker is disabled"),true);
 assert.equal(isPlaybackEnforcement("Ad blockers are not allowed on YouTube"),true);
 assert.equal(isPlaybackEnforcement("Ad blocker detected. Please disable your ad blocker."),false);
});
