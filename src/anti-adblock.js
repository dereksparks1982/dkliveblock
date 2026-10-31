/* DK Live Block: conservative anti-adblock notice detector. */
(function(root){"use strict";
const blocker=/(?:\bad[\s-]?block(?:er|ers|ing)?\b|\badvertis(?:ement|ing)\s+blocker\b|\bblock(?:ing)?\s+ads\b)/i;
const demand=/\b(?:detected|detecting|disable|disabled|turn\s+off|switch\s+off|pause|allowlist|whitelist|allow\s+ads|blocked|not\s+allowed|violate|violates|remove|deactivate|deactivated|prevent|using|disabling)\b/i;
const specific=[
 /ad[\s-]?block(?:er|ing)?\s+(?:was\s+)?detected/i,
 /(?:turn|switch)\s+off\s+(?:your\s+)?ad[\s-]?block/i,
 /(?:please\s+)?(?:consider\s+)?disabl(?:e|ing)\s+(?:your\s+)?ad[\s-]?block/i,
 /ad[\s-]?blockers?\s+(?:are\s+)?not\s+allowed\s+(?:on\s+)?youtube/i,
 /(?:turn|switch)\s+off\s+(?:your\s+)?ad[\s-]?block(?:er)?\s+(?:to\s+)?(?:watch|continue)/i,
 /(?:we\s+)?(?:noticed|detected)\s+(?:that\s+)?you(?:'re|\s+are)?\s+(?:using|have)\s+(?:an?\s+)?ad[\s-]?block/i,
 /ad[\s-]?blockers?\s+violate\s+(?:youtube'?s?|our)\s+terms/i,
 /(?:video\s+)?playback\s+is\s+blocked\s+unless\s+(?:you\s+)?(?:disable|turn\s+off)/i,
 /(?:we\s+)?(?:noticed|detected)\s+(?:you(?:'re|\s+are)?\s+)?(?:using|have)\s+(?:an?\s+)?ad[\s-]?block/i,
 /(?:support\s+us|support\s+(?:our|this)\s+site).{0,100}(?:disable|turn\s+off|ad[\s-]?block)/i,
 /(?:your\s+)?ad[\s-]?block(?:er)?\s+(?:is\s+)?(?:on|enabled|active)/i,
 /(?:please\s+)?(?:whitelist|allowlist)\s+(?:this|our)\s+(?:website|site)/i,
 /(?:bloqueador\s+de\s+anuncios).{0,90}(?:desactiv|detectad)/i,
 /(?:werbeblocker).{0,90}(?:deaktivier|erkannt)/i
];
function normalize(input){return String(input||"").replace(/\s+/g," ").trim().slice(0,1800);}
function isAntiAdblockNotice(input){
 const text=normalize(input).replace(/[’‘]/g,String.fromCharCode(39));
 if(text.length<12)return false;
 if(specific.some(re=>re.test(text)))return true;
 return blocker.test(text)&&demand.test(text)&&/(?:detected|disabl(?:e|ing)|turn\s+off|support\s+.{0,70}ads?|allow\s+ads|whitelist|not\s+allowed|using\s+an?\s+ad)/i.test(text);
}
function isPlaybackEnforcement(input){
 const text=normalize(input).replace(/[’‘]/g,"'").toLowerCase();
 return text.length>=20&&(
  /ad[\s-]?blockers?\s+violate\s+youtube'?s?\s+terms/.test(text)||
  /ad[\s-]?blockers?\s+(?:are\s+)?not\s+allowed\s+on\s+youtube/.test(text)||
  /(?:video\s+)?playback\s+is\s+blocked\s+unless/.test(text)&&/(?:ad[\s-]?block|youtube)/.test(text)||
  /(?:youtube|watching\s+videos).{0,100}ad[\s-]?block(?:er|ing)?[^.!?]{0,120}(?:disabled|turn\s+off|allowlist)/.test(text)
 );
}
function shouldHide({text="",visible=false,overlay=false,containsPlayer=false,rootElement=false}={}){
 return Boolean(visible&&overlay&&!containsPlayer&&!rootElement&&isAntiAdblockNotice(text));
}
root.DKAntiAdblock={isAntiAdblockNotice,isPlaybackEnforcement,shouldHide};
if(typeof module!=="undefined")module.exports=root.DKAntiAdblock;
})(typeof globalThis!=="undefined"?globalThis:this);
