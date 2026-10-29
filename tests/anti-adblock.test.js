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
