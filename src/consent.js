/* DK Live Block: conservative cookie consent text recognition. */
(function(root){"use strict";
const LABELS=new Set([
 "reject all","decline all","deny all","refuse all","reject optional","only necessary","necessary only",
 "tout refuser","refuser tout","alle ablehnen","alles ablehnen","rechazar todas","rechazar todo",
 "recusar todas","rejeitar todas","tümünü reddet","hepsini reddet","رفض الكل","رفض الجميع",
 "رفض جميع ملفات تعريف الارتباط","السماح بالضروري فقط","إعدادات ضرورية فقط",
 "отклонить все","отклонить необязательные","только необходимые",
 "拒绝全部","全部拒绝","仅必要","只接受必要的",
 "gwrthod pob un","angenrheidiol yn unig","alle cookies ablehnen"
]);
function normalize(text){return String(text||"").trim().toLocaleLowerCase().replace(/\s+/g," ");}
function rejectLabel(text){return LABELS.has(normalize(text));}
function cookieContext(text){
 const sample=String(text||"").slice(0,1500).toLocaleLowerCase();
 return /cookie|cookies|consent|privacy preferences|galletas|privacidad|confidentialité|datenschutz|einwilligung|çerez|ملفات تعريف الارتباط|الكوكيز|файл(?:ы|ов)? cookie|куки|согласие на обработку данных|隐私|个性化广告|饼干|餅乾|cwcis|preifatrwydd/.test(sample);
}
function shouldReject({context="",text="",ariaLabel="",visible=false,disabled=false,protectedUI=false}={}){
 if(!visible||disabled||protectedUI||!cookieContext(context))return false;
 const labels=[text,ariaLabel].map(normalize).filter(Boolean);
 if(!labels.length)return false;
 // Conflicting visible and accessible labels should NOT be clicked.
 if(labels.some(x=>/^(?:accept|agree|allow|enable|continue|accept all|allow all|aceptar|accepter|akzeptieren|قبول|接受|同意)/i.test(x)))return false;
 return labels.some(rejectLabel);
}
root.DKConsent={rejectLabel,cookieContext,shouldReject};
if(typeof module!=="undefined")module.exports=root.DKConsent;
})(typeof globalThis!=="undefined"?globalThis:this);
