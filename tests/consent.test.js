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

test("Build 44 Chinese, Russian, Arabic and Welsh rejection stays explicit",()=>{
 const C=require("../src/consent.js");
 for(const text of ["отклонить все","только необходимые","拒绝全部","仅必要",
  "رفض جميع ملفات تعريف الارتباط","السماح بالضروري فقط","gwrthod pob un"]){
  assert.equal(C.rejectLabel(text),true,text);
 }
 for(const text of ["我们使用隐私和饼干","Мы используем куки","Defnyddiwn cwcis"]){
  assert.equal(C.cookieContext(text),true,text);
 }
 for(const text of ["接受全部","принять все","قبول الكل","aceptar todo"]){
  assert.equal(C.rejectLabel(text),false,text);
 }
});
test("Build 44 consent clicks need context, visibility, safe UI and no conflicting aria label",()=>{
 const C=require("../src/consent.js");
 const base={context:"We use cookies to remember your privacy preferences",
  text:"Reject all",ariaLabel:"",visible:true,disabled:false,protectedUI:false};
 assert.equal(C.shouldReject(base),true);
 for(const options of [{visible:false},{disabled:true},{protectedUI:true},
  {context:"Would you like to subscribe to the mailing list?"},
  {ariaLabel:"Accept all"}]){
  assert.equal(C.shouldReject({...base,...options}),false,JSON.stringify(options));
 }
 assert.equal(C.shouldReject({...base,text:"Continue"}),false);
 assert.equal(C.shouldReject({...base,text:"",ariaLabel:"Only Necessary"}),true);
});
