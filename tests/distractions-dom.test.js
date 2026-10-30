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

test("Build 54 content cleanup protects active editing and only explicit reject actions",()=>{
 const page=fs.readFileSync(path.join(src,"content.js"),"utf8");
 assert.match(page,/DKDistractions\.userEngaged\(el,document\.activeElement\)/);
 assert.match(page,/isLink:!!button\.getAttribute/);
 assert.match(page,/isSubmit:!!form/);
 assert.match(page,/isToggle:button\.getAttribute/);
 assert.match(page,/style\?\.pointerEvents!=="none"/);
 assert.match(page,/typeof button\.click!=="function"/);
});
