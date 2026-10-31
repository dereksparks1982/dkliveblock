"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path");
const src=path.resolve(__dirname,"../src");
test("Build 44 overlay integration is bounded, reversible and respects media and checkout",()=>{
 const content=fs.readFileSync(path.join(src,"content.js"),"utf8");
 const module=fs.readFileSync(path.join(src,"distractions.js"),"utf8");
 const bg=fs.readFileSync(path.join(src,"background.js"),"utf8");
 assert.match(content,/function suppressDistractions\(\)/);
 assert.match(content,/inspected>100\|\|removed>=4/);
 assert.match(content,/el\.querySelector\?\.\("video, audio,/);
 assert.match(content,/el\.querySelector\?\.\("iframe, object, embed"\)/);
 assert.match(content,/overlayRecovery\.hide\(el\)/);
 assert.match(content,/kind:"distraction",count:removed/);
 assert.match(content,/distractionControl&&!nextDistractions/);
 assert.match(module,/confirm your purchase/);
 assert.match(bg,/\["antiAdblock","paywall","distraction"\]/);
});
test("Build 44 cookie logic only clicks explicit rejection, never accept-all",()=>{
 const content=fs.readFileSync(path.join(src,"content.js"),"utf8");
 assert.match(content,/DKConsent\.shouldReject/);
 assert.match(content,/clickedRejectButtons\.add\(button\)/);
 assert.match(content,/DKPopupGuard\.protectedDialog\(root,info\)/);
 assert.match(content,/inspected>35/);
 assert.doesNotMatch(content,/button\.click\(\);.*Accept all/);
});

test("Build 55 cookie safety delegates to bounded open-shadow helper",()=>{
 const content=fs.readFileSync(path.join(src,"content.js"),"utf8");
 const helper=fs.readFileSync(path.join(src,"consent-dom.js"),"utf8");
 assert.match(content,/DKDistractions\.userEngaged\(el,document\.activeElement\)/);
 assert.match(content,/DKConsentDOM\.findBanners\(document\)/);
 assert.match(content,/DKConsentDOM\.userEngaged\(root,document\)/);
 assert.match(content,/DKConsentDOM\.inspectButton\(button,window\)/);
 assert.match(content,/clickedRejectRoots\.add\(root\)/);
 assert.match(content,/lastConsentScan>=3500/);
 assert.match(helper,/isLink:tag==="a"/);
 assert.match(helper,/isSubmit:!!form&&type==="submit"/);
 assert.match(content,/typeof button\.click!=="function"/);
});

test("Build 63 RUTUBE VPN and subscription notices have bounded, reversible scanning",()=>{
 const content=fs.readFileSync(path.join(src,"content.js"),"utf8");
 const guard=fs.readFileSync(path.join(src,"popup-guard.js"),"utf8");
 assert.match(content,/\[class\*='banner' i\]/);
 assert.match(content,/\[role='alert'\]/);
 assert.match(content,/DKDistractions\.vpnNotice\(text\)/);
 assert.match(content,/DKDistractions\.sitePromotion\(text,host\)/);
 assert.match(content,/overlayRecovery\.hide\(el\)/);
 assert.match(content,/distractionControl&&!nextDistractions/);
 assert.match(guard,/\[class\*="banner" i\]/);
 assert.match(guard,/\[class\*="vpn" i\]/);
});
