/* DK Live Block: conservative cookie consent text recognition. */
(function(root){"use strict";
const LABELS=new Set([
 "reject all","reject all cookies","decline all","deny all","refuse all","reject optional",
 "reject optional cookies","reject non-essential cookies","reject nonessential cookies",
 "only necessary","necessary only","only essential cookies","only strictly necessary",
 "tout refuser","refuser tout","alle ablehnen","alles ablehnen","rechazar todas","rechazar todo",
 "recusar todas","rejeitar todas","tümünü reddet","hepsini reddet","رفض الكل","رفض الجميع",
 "رفض جميع ملفات تعريف الارتباط","السماح بالضروري فقط","إعدادات ضرورية فقط",
 "отклонить все","отклонить необязательные","только необходимые",
 "拒绝全部","全部拒绝","仅必要","只接受必要的",
 "gwrthod pob un","angenrheidiol yn unig","alle cookies ablehnen"
]);
function normalize(text){return String(text||"").normalize("NFKC").trim().toLocaleLowerCase().replace(/\s+/g," ");}
function rejectLabel(text){return LABELS.has(normalize(text));}
function cookieContext(text){
 const sample=String(text||"").slice(0,1500).toLocaleLowerCase();
 return /cookie|cookies|consent|privacy preferences|galletas|privacidad|confidentialité|datenschutz|einwilligung|çerez|ملفات تعريف الارتباط|الكوكيز|файл(?:ы|ов)? cookie|куки|согласие на обработку данных|隐私|个性化广告|饼干|餅乾|cwcis|preifatrwydd/.test(sample);
}
function shouldReject({context="",text="",ariaLabel="",title="",visible=false,
 disabled=false,protectedUI=false,isLink=false,isSubmit=false,isToggle=false}={}){
 if(!visible||disabled||protectedUI||isLink||isSubmit||isToggle||!cookieContext(context))return false;
 const labels=[text,ariaLabel,title].map(normalize).filter(Boolean);
 if(!labels.length)return false;
 // Every populated label must explicitly describe the same reject action.
 // A "Reject all" button labelled "Continue" or "Delete" is ambiguous.
 return labels.every(rejectLabel);
}
root.DKConsent={rejectLabel,cookieContext,shouldReject};
if(typeof module!=="undefined")module.exports=root.DKConsent;
})(typeof globalThis!=="undefined"?globalThis:this);
