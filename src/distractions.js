/* Build 44: cautious newsletter, survey and corner-ad overlay classification.
   No page data is transmitted. Never suppress an active video player, sign-in,
   payment or security challenge. Recognition is explainable and reversible. */
(function(root){"use strict";
const NEWSLETTER=/(?:\b(?:subscribe|sign[\s-]?up|join)\b.{0,55}\b(?:newsletter|email updates|mailing list)\b|\b(?:newsletter|email updates|mailing list)\b.{0,55}\b(?:subscribe|sign[\s-]?up|join)\b|\bget (?:our |the )?(?:latest|weekly|daily) (?:news|updates) (?:in|to) your inbox\b)/i;
const SURVEY=/(?:\b(?:take|complete|answer|fill out)\b.{0,45}\b(?:survey|questionnaire)\b|\b(?:quick|short) survey\b.{0,65}\b(?:feedback|improve|experience)\b|\bhelp us improve\b.{0,65}\b(?:survey|feedback)\b)/i;
const PAYMENT=/\b(?:payment|checkout|billing|confirm your purchase|place order|credit card|sign in|log in|password|two.factor|verification|captcha|privacy preferences|cookie consent|subscribe to (?:continue|read|watch)|unlock (?:the )?(?:full|rest of) (?:article|story))\b/i;
/* Reject VPN-off nags, not informational VPN articles or security dialogs. */
const VPN_WORD=/(?:\bVPN\b|впн|virtual private network)/iu;
const VPN_REQUEST=[
 /\b(?:turn|switch)\s+off\s+(?:your\s+|the\s+|a\s+)?(?:vpn|virtual private network)\b/i,
 /\b(?:disable|disconnect|stop\s+using)\s+(?:your\s+|the\s+|a\s+)?(?:vpn|virtual private network)\b/i,
 /\b(?:vpn|virtual private network)\b.{0,95}\b(?:detected|blocked|prohibited|restricted|disabled|slower|slow|disconnect|switch\s+off|turn\s+off)\b/i,
 /\b(?:detected|blocked|prohibited|restricted)\b.{0,55}\b(?:vpn|virtual private network)\b/i,
 /(?:VPN|впн).{0,95}(?:лучше\s+выключить|выключить|отключить|отключите|выключите|обнаружен|обнаружили|запрещ[её]н|замедля)/iu,
 /(?:отключите|выключите|отключить|выключить).{0,65}(?:VPN|впн)/iu
];
const RUTUBE_PROMO=/(?:осень\s+без\s+рекламы|30\s+дней\s+подписки\s+RUTUBE\s+за\s+1\s*₽|подключить\s+за\s+1\s*₽)/iu;
function vpnNotice(text){
 const message=label(text);
 return Boolean(message.length>=12&&message.length<=400&&VPN_WORD.test(message)&&
  VPN_REQUEST.some(re=>re.test(message)));
}
function sitePromotion(text,host){
 const message=label(text);
 return Boolean(/^(?:[\w-]+\.)?rutube\.ru$/i.test(host)&&
  message.length>=10&&message.length<=1200&&RUTUBE_PROMO.test(message));
}
const BAD_VIDEO_CONTEXT=/\b(?:youtube|disneyplus|netflix|primevideo|hulu|vimeo|twitch)\.com$/i;
const AD_MARKER=/(?:^|[\s_-])(?:ad|ads|advert|advertisement|sponsored|promoted|promo)(?:$|[\s_-])/i;
function label(text){return String(text||"").replace(/\s+/g," ").trim().slice(0,1000);}
function userEngaged(element,focused){
 if(!element||!focused||!element.contains?.(focused))return false;
 const tag=String(focused.localName||"").toLowerCase();
 if(["input","textarea","select"].includes(tag)||focused.isContentEditable===true)return true;
 try{return focused.matches?.("[role='textbox'], [role='combobox'], [contenteditable='true']")===true;}
 catch(_){return true;}
}
function classify({text="",labelText="",overlay=false,visible=false,hasPlayer=false,
 hasSensitive=false,fullscreen=false,host="",hasMediaFrame=false}={}){
 if(!overlay||!visible||hasPlayer||hasSensitive||fullscreen)return "";
 const message=label(text),marker=label(labelText);
 if(PAYMENT.test(message))return "";
 if(vpnNotice(message))return "vpn-notice";
 if(sitePromotion(message,host))return "site-promotion";
 if(NEWSLETTER.test(message))return "newsletter";
 if(SURVEY.test(message))return "survey";
 // A floating corner ad without an embedded player. We intentionally do not
 // hide anything containing a video/audio element or an embedded media frame.
 if(!BAD_VIDEO_CONTEXT.test(host)&&!hasMediaFrame&&AD_MARKER.test(marker)&&
    /\b(?:floating|corner|sticky|picture.in.picture|pip)\b/i.test(marker))return "corner-ad";
 return "";
}
const API=Object.freeze({classify,userEngaged,vpnNotice,sitePromotion});
root.DKDistractions=API;
if(typeof module!=="undefined")module.exports=API;
})(typeof globalThis!=="undefined"?globalThis:this);
