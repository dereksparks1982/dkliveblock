/* DK Live Block: conservative overlay safety and mutation triage.
   Never inspect form values or collect text from protected inputs. */
(function(root){"use strict";
const SENSITIVE='input[type="password"], input[autocomplete="one-time-code"], input[autocomplete="cc-number"], input[type="file"], [data-sitekey], [class*="captcha" i], [id*="captcha" i], [class*="hcaptcha" i], [class*="recaptcha" i], [autocomplete="current-password"], [autocomplete="new-password"]';
const OVERLAY='dialog, [role="dialog"], [aria-modal="true"], [class*="modal" i], [id*="modal" i], [class*="popup" i], [class*="overlay" i], [class*="paywall" i], [class*="subscribe" i], [class*="adblock" i], [id*="adblock" i], [class*="gateway" i], [class*="newsletter" i], [class*="survey" i], [class*="floating-ad" i], ytd-enforcement-message-view-model';
const SIGNATURE=/(?:^|[\s_-])(?:modal|dialog|popup|overlay|paywall|subscribe|newsletter|survey|floating-ad|corner-ad|adblock|antiad|enforcement|gateway|scrim|backdrop)(?:$|[\s_-])/i;
const SENSITIVE_TEXT=/\b(?:enter\s+(?:your\s+)?password|verification\s+code|two.factor\s+authentication|complete\s+(?:your\s+)?purchase|confirm\s+(?:your\s+)?payment|human\s+verification|security\s+challenge)\b/i;
function protectedDialog(el,text=""){
 if(!el)return true;
 try{
  if(el.matches?.(SENSITIVE)||el.querySelector?.(SENSITIVE))return true;
  if(typeof DKAuthProtection!=="undefined"&&DKAuthProtection.isIdentityUI(el,text))return true;
  if(SENSITIVE_TEXT.test(String(text).slice(0,1500)))return true;
  if(el.getAttribute?.("role")==="alertdialog"&&/\b(?:security|authentication|payment|password|verification)\b/i.test(text))return true;
 }catch(_){return true;}
 return false;
}
function likelyOverlay(el){
 if(!el||el.nodeType===3)return false;
 try{
  for(let node=el,depth=0;node&&depth<4;node=node.parentElement,depth++){
   const id=String(node.id||"");
   const cls=typeof node.className==="string"?node.className:"";
   const role=node.getAttribute?.("role")||"";
   if(node.localName==="dialog"||role==="dialog"||node.getAttribute?.("aria-modal")==="true"||
      SIGNATURE.test(id)||SIGNATURE.test(cls))return true;
  }
 }catch(_){}
 return false;
}
function shouldInspectMutation(record,isHidden){
 if(!record)return false;
 if(record.type==="attributes"){
  const el=record.target;
  if(!el||el.nodeType===3)return false;
  if(isHidden?.(el)){
   try{return el.style?.getPropertyValue("display")!=="none"||
    el.style?.getPropertyPriority("display")!=="important";}catch(_){return true;}
  }
  return likelyOverlay(el);
 }
 if(record.addedNodes?.length){
  let inspected=0;
  for(const node of record.addedNodes){
   if(++inspected>12)break;
   if(likelyOverlay(node))return true;
   try{if(node?.querySelector?.(OVERLAY))return true;}catch(_){}
  }
 }
 return false;
}
const api={protectedDialog,likelyOverlay,shouldInspectMutation};
root.DKPopupGuard=api;
if(typeof module!=="undefined")module.exports=api;
})(typeof globalThis!=="undefined"?globalThis:this);
