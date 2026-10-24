"use strict";
const test=require("node:test"),assert=require("node:assert/strict");
const {rejectLabel,cookieContext}=require("../src/consent.js");
test("conservative reject labels in several languages",()=>{
 for(const value of ["Reject All","  Only Necessary ","Tout refuser","Alle ablehnen","Rechazar todas","Tümünü reddet","رفض الكل"])assert.equal(rejectLabel(value),true,value);
});
test("acceptance and ambiguous buttons must never match",()=>{
 for(const value of ["Accept all","Agree to all","Continue","OK","Reject all changes","Decline offer"])assert.equal(rejectLabel(value),false,value);
});
test("detect cookie consent contexts, never unrelated dialogs",()=>{
 for(const value of ["We use cookies","Gestion des cookies","Política de privacidad","Çerez tercihleri","ملفات تعريف الارتباط"])assert.equal(cookieContext(value),true,value);
 for(const value of ["Close video","Video unavailable","Book a table","Ignore all"])assert.equal(cookieContext(value),false,value);
});
