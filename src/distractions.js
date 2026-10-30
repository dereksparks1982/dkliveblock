/* Build 44: cautious newsletter, survey and corner-ad overlay classification.
   No page data is transmitted. Never suppress an active video player, sign-in,
   payment or security challenge. Recognition is explainable and reversible. */
(function(root){"use strict";
const NEWSLETTER=/(?:\b(?:subscribe|sign[\s-]?up|join)\b.{0,55}\b(?:newsletter|email updates|mailing list)\b|\b(?:newsletter|email updates|mailing list)\b.{0,55}\b(?:subscribe|sign[\s-]?up|join)\b|\bget (?:our |the )?(?:latest|weekly|daily) (?:news|updates) (?:in|to) your inbox\b)/i;
const SURVEY=/(?:\b(?:take|complete|answer|fill out)\b.{0,45}\b(?:survey|questionnaire)\b|\b(?:quick|short) survey\b.{0,65}\b(?:feedback|improve|experience)\b|\bhelp us improve\b.{0,65}\b(?:survey|feedback)\b)/i;
const PAYMENT=/\b(?:payment|checkout|billing|confirm your purchase|place order|credit card|sign in|log in|password|two.factor|verification|captcha|privacy preferences|cookie consent|subscribe to (?:continue|read|watch)|unlock (?:the )?(?:full|rest of) (?:article|story))\b/i;
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
 if(NEWSLETTER.test(message))return "newsletter";
 if(SURVEY.test(message))return "survey";
 // A floating corner ad without an embedded player. We intentionally do not
 // hide anything containing a video/audio element or an embedded media frame.
 if(!BAD_VIDEO_CONTEXT.test(host)&&!hasMediaFrame&&AD_MARKER.test(marker)&&
    /\b(?:floating|corner|sticky|picture.in.picture|pip)\b/i.test(marker))return "corner-ad";
 return "";
}
const API=Object.freeze({classify,userEngaged});
root.DKDistractions=API;
if(typeof module!=="undefined")module.exports=API;
})(typeof globalThis!=="undefined"?globalThis:this);
