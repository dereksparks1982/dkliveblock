/* DK Live Block: narrowly scoped authentication compatibility.
   Prevent ad popup rules and unrelated cosmetic cleanup from breaking
   real federated sign-in; never bypass account security or read credentials. */
(function(root){"use strict";
const PROVIDERS=new Set(["accounts.google.com","oauth2.googleapis.com",
 "login.microsoftonline.com","login.live.com","appleid.apple.com",
 "login.yahoo.com","id.twitch.tv","login.salesforce.com"]);
const GOOGLE_PATH=/^\/(?:gsi(?:\/|$)|o\/oauth2(?:\/|$)|signin(?:\/|$)|ServiceLogin(?:\/|$)|v3\/signin(?:\/|$)|CheckCookie(?:\/|$))/i;
const OTHER_PATH=/^\/(?:login\/oauth(?:\/|$)|sessions(?:\/|$)|oauth(?:2)?\/authorize(?:\/|$)|signin(?:\/|$)|login(?:\/|$))/i;
function parsed(url){
 try{
  const u=new URL(url);
  if(u.protocol!=="https:"||u.username||u.password)return null;
  return u;
 }catch(_){return null;}
}
function isIdentityHost(host){return PROVIDERS.has(String(host||"").toLowerCase());}
function isAuthPopup(url){
 const u=parsed(url);if(!u)return false;
 const host=u.hostname.toLowerCase();
 if(isIdentityHost(host))return true;
 if(host==="github.com")return /^\/(?:login\/oauth(?:\/|$)|login(?:\/|$)|sessions(?:\/|$))/i.test(u.pathname);
 if(host==="discord.com")return /^\/oauth2\/authorize(?:\/|$)/i.test(u.pathname);
 if(host==="www.facebook.com"||host==="facebook.com")return /^\/(?:login|dialog\/oauth)(?:\/|$)/i.test(u.pathname);
 return false;
}
function isCriticalRequest(url,type,documentUrl=""){
 const u=parsed(url);if(!u)return false;
 const host=u.hostname.toLowerCase(),document=parsed(documentUrl);
 if(!["script","xmlhttprequest","sub_frame","other","stylesheet"].includes(type))return false;
 if(host==="accounts.google.com"&&GOOGLE_PATH.test(u.pathname))return true;
 if(host==="apis.google.com"&&/^\/js\/(?:platform|api)\.js$/i.test(u.pathname))return true;
 if(isIdentityHost(host)&&document&&isIdentityHost(document.hostname.toLowerCase()))return true;
 if(host==="github.com"&&OTHER_PATH.test(u.pathname)&&document&&isIdentityHost(document.hostname.toLowerCase()))return true;
 return false;
}
const LOGIN_TEXT=/\b(?:sign\s+in\s+with\s+google|continue\s+with\s+google|log\s+in\s+with\s+google|google\s+(?:sign[ -]?in|account\s+sign[ -]?in)|choose\s+an\s+account|use\s+another\s+account|verify\s+it(?:'|’)s\s+you|sign\s+in\s+to\s+your\s+(?:google|microsoft|apple)\s+account|sign\s+in\s+with\s+(?:microsoft|apple|github)|continue\s+with\s+(?:microsoft|apple|github)|google\s+one\s+tap)\b/i;
const LOGIN_STRUCTURE='form[action*="accounts.google.com"], iframe[src*="accounts.google.com"], .g_id_signin, #g_id_onload, [data-google-signin], [data-provider="google"], [data-testid*="google-signin" i], [id*="google-signin" i], [class*="google-signin" i], [autocomplete="username"], [autocomplete="current-password"]';
function isIdentityUI(el,text=""){
 if(LOGIN_TEXT.test(String(text||"").slice(0,1800)))return true;
 try{return !!(el?.matches?.(LOGIN_STRUCTURE)||el?.querySelector?.(LOGIN_STRUCTURE));}
 catch(_){return true;} // Never hide a dialog when identity checks are unavailable.
}
const AUTH_STYLE=/(?:\.g_id_signin|#g_id_onload|#credential_picker_container|\.google-signin|#google-signin|\.signin-with-google)(?![\w-])|(?:iframe\s*\[\s*src[*^$]?\s*=\s*["']?https?:\/\/accounts\.google\.com)/i;
function safeCosmetics(selectors){
 if(!Array.isArray(selectors))return [];
 return selectors.filter(s=>typeof s==="string"&&!AUTH_STYLE.test(s));
}
const api={isIdentityHost,isAuthPopup,isCriticalRequest,isIdentityUI,safeCosmetics};
root.DKAuthProtection=api;
if(typeof module!=="undefined")module.exports=api;
})(typeof globalThis!=="undefined"?globalThis:this);
