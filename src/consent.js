/* DK Live Block: conservative cookie consent text recognition. */
(function(root){"use strict";
const LABELS=new Set([
 "reject all","decline all","deny all","refuse all","reject optional","only necessary","necessary only",
 "tout refuser","refuser tout","alle ablehnen","alles ablehnen","rechazar todas","rechazar todo",
 "recusar todas","rejeitar todas","tümünü reddet","hepsini reddet","رفض الكل","رفض الجميع"
]);
function normalize(text){return String(text||"").trim().toLocaleLowerCase().replace(/\s+/g," ");}
function rejectLabel(text){return LABELS.has(normalize(text));}
function cookieContext(text){
 const sample=String(text||"").slice(0,1500).toLocaleLowerCase();
 return /cookie|cookies|consent|privacy preferences|galletas|privacidad|confidentialité|datenschutz|einwilligung|çerez|ملفات تعريف الارتباط|الكوكيز/.test(sample);
}
root.DKConsent={rejectLabel,cookieContext};
if(typeof module!=="undefined")module.exports=root.DKConsent;
})(typeof globalThis!=="undefined"?globalThis:this);
