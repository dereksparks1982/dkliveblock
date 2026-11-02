/* DK Live Block Build 239: browser capability negotiation.
   This is a read-only foundation, NOT a Chromium port or permission bypass.
   Avoid trusting user agent strings for a security or network-filter verdict. */
(function(root){"use strict";
function inspect(env){
 const context=env||root;
 const api=context?.browser||context?.chrome||{};
 const runtime=api.runtime||{},nav=context?.navigator||{};
 let manifest={};
 try{manifest=typeof runtime.getManifest==="function"?runtime.getManifest()||{}:{};}catch(_){}
 const version=Number(manifest.manifest_version)||0;
 const ua=String(nav.userAgent||"");
 const brandList=Array.isArray(nav.userAgentData?.brands)?nav.userAgentData.brands:[];
 const edge=/\bEdg\//i.test(ua)||brandList.some(x=>/Microsoft Edge/i.test(String(x?.brand)));
 const hasFirefoxInfo=typeof runtime.getBrowserInfo==="function";
 const chrome=/\b(?:Chrome|Chromium)\//i.test(ua)||brandList.some(x=>/Chrom(?:e|ium)/i.test(String(x?.brand)));
 const family=hasFirefoxInfo?"gecko":edge||chrome||api.declarativeNetRequest?"chromium":"unknown";
 const browserName=hasFirefoxInfo?"firefox":edge?"edge":chrome?"chrome":"unknown";
 const blockingWebRequest=version===2&&
   Array.isArray(manifest.permissions)&&manifest.permissions.includes("webRequestBlocking")&&
   typeof api.webRequest?.onBeforeRequest?.addListener==="function";
 const declarativeNetRequest=version===3&&
   typeof api.declarativeNetRequest?.updateDynamicRules==="function";
 const responseData=typeof api.webRequest?.filterResponseData==="function";
 const capabilities=Object.freeze({
  blockingWebRequest,declarativeNetRequest,responseData,
  browserSettings:!!api.browserSettings,
  dns:typeof api.dns?.resolve==="function",
  proxy:!!api.proxy,
  nativeMessaging:typeof runtime.connectNative==="function",
  promiseApi:!!context?.browser
 });
 const networkBackend=blockingWebRequest?"blocking-webrequest":
   declarativeNetRequest?"declarative-net-request":"unavailable";
 return Object.freeze({browser:browserName,family,manifestVersion:version,
  networkBackend,capabilities});
}
function requireNetworkBackend(info){
 const mode=info?.networkBackend||"unavailable";
 if(mode!=="blocking-webrequest"&&mode!=="declarative-net-request")
  return Object.freeze({ready:false,reason:"No supported extension network-blocking mechanism is available."});
 return Object.freeze({ready:true,mode});
}
const API=Object.freeze({inspect,requireNetworkBackend});
root.DKBrowserCompat=API;
if(typeof module!=="undefined")module.exports=API;
})(typeof globalThis!=="undefined"?globalThis:this);
