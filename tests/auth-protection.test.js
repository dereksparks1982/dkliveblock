"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict");
const A=require("../src/auth-protection.js");
const G=require("../src/popup-guard.js");
function el(child=false){return {matches:()=>false,querySelector:()=>child?{}:null,getAttribute:()=>null};}
test("Google OAuth popup destinations are recognized without spoofable suffix matches",()=>{
 for(const url of [
  "https://accounts.google.com/o/oauth2/v2/auth?client_id=site",
  "https://accounts.google.com/ServiceLogin",
  "https://login.microsoftonline.com/common/oauth2/v2.0/authorize",
  "https://appleid.apple.com/auth/authorize",
  "https://github.com/login/oauth/authorize?client_id=site"
 ])assert.equal(A.isAuthPopup(url),true,url);
 for(const url of [
  "http://accounts.google.com/o/oauth2/v2/auth",
  "https://accounts.google.com.evil.test/login",
  "https://www.google.com/ads",
  "https://github.com/advertiser",
  "https://doubleclick.net/ads",
  "https://accounts.google.com@ads.test/login",
  "javascript:alert('test')",
  "https://discord.com/channel/3"
 ])assert.equal(A.isAuthPopup(url),false,url);
});
test("login-critical Google request exemptions do not create a blanket ad exception",()=>{
 for(const [url,type,documentUrl] of [
  ["https://accounts.google.com/gsi/client","script","https://news.test/story"],
  ["https://accounts.google.com/gsi/iframe/select","sub_frame","https://news.test/story"],
  ["https://accounts.google.com/o/oauth2/v2/auth","xmlhttprequest","https://news.test/"],
  ["https://apis.google.com/js/platform.js","script","https://news.test/"],
  ["https://accounts.google.com/static/logo.svg","other","https://accounts.google.com/ServiceLogin"]
 ])assert.equal(A.isCriticalRequest(url,type,documentUrl),true,url);
 for(const [url,type,documentUrl] of [
  ["https://doubleclick.net/ads","script","https://accounts.google.com/signin/"],
  ["https://www.google.com/pagead/script.js","script","https://news.test/"],
  ["https://accounts.google.com/gsi/client","image","https://news.test/"],
  ["http://accounts.google.com/gsi/client","script","https://news.test/"],
  ["https://accounts.google.com.evil.test/gsi/client","script","https://news.test/"],
  ["https://apis.google.com/js/advertiser.js","script","https://news.test/"]
 ])assert.equal(A.isCriticalRequest(url,type,documentUrl),false,url);
});
test("Google identity dialogs are preserved even when subscription or adblock text appears",()=>{
 for(const text of [
  "Continue with Google. Subscribe to continue reading.",
  "Sign in with Google to keep reading",
  "Choose an account",
  "Sign in to your Google account",
  "Continue with Microsoft",
  "Sign in with Apple",
  "Google One Tap"
 ]){assert.equal(A.isIdentityUI(el(),text),true,text);assert.equal(G.protectedDialog(el(),text),true,text);}
 assert.equal(G.protectedDialog(el(true),"Subscribe to continue reading"),true);
 assert.equal(A.isIdentityUI(el(),"Subscribe to continue reading"),false);
 assert.equal(G.protectedDialog(el(),"Subscribe to continue reading"),false);
});
test("no form fields, passwords or OAuth tokens are stored or read",()=>{
 const form={getAttribute:()=>null,matches:()=>false,querySelector:()=>null};
 assert.equal(A.isIdentityUI(form,"Sign in with Google"),true);
 assert.equal(G.protectedDialog(form,"Please disable your ad blocker."),false);
});

test("identity controls are not hidden by downloaded cosmetic rules",()=>{
 const selectors=[".advertisement","#g_id_onload",".g_id_signin","#credential_picker_container","div.g_id_signin","#google-signin",
  ".google-signin","iframe[src*='https://accounts.google.com']", ".sponsored", ".ad-slot"];
 assert.deepEqual(A.safeCosmetics(selectors),[".advertisement",".sponsored",".ad-slot"]);
 assert.deepEqual(A.safeCosmetics([]),[]);
});
