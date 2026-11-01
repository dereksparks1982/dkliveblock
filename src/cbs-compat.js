/* DK Live Block Build 229: narrowly scoped CBS News video compatibility. */
(function(root){"use strict";
function isCBS(site){return typeof site==="string"&&(site==="cbsnews.com"||site.endsWith(".cbsnews.com"));}
function playerConfig(request,site){
 if(!isCBS(site)||!request||!["script","xmlhttprequest"].includes(request.type))return false;
 try{const url=new URL(request.url);
  if(url.protocol!=="https:"||url.username||url.password||url.port) return false;
  // uBlock Origin's CBS News unbreak rules identify these exact playback
  // bootstrap files. Keep unrelated Tealium and advertising requests blocked.
  if(url.hostname==="tealium.cbsnews.com")
   return request.type==="script"&&url.pathname==="/site/prod/utag.js";
  if(url.hostname==="imasdk.googleapis.com")
   return request.type==="script"&&
    ["/js/sdkloader/ima3_dai.js","/js/sdkloader/ima3_dai_debug.js"].includes(url.pathname);
  return url.hostname==="doppler-config.cbsivideo.com";
 }catch(_){return false;}
}
function autoplayProtection(page){
 if(typeof page!=="string"||page.length>2048)return false;
 try{
  const url=new URL(page);
  return url.protocol==="https:"&&["cbsnews.com","www.cbsnews.com"].includes(url.hostname)&&
   (url.pathname==="/"||url.pathname.startsWith("/news/"));
 }catch(_){return false;}
}
function clearLegacyCBS(text){
 if(typeof text!=="string"||!text)return {text:typeof text==="string"?text:"",removed:0};
 let removed=0;
 const lines=text.split("\n").filter(line=>{
  const match=/^([^#\s]+)##(?!@)(.{1,600})$/.exec(line.trim());
  if(!match||!isCBS(match[1].toLowerCase()))return true;
  removed++;return false;
 });
 return {text:lines.join("\n"),removed};
}
const api=Object.freeze({isCBS,playerConfig,autoplayProtection,clearLegacyCBS});
root.DKCBSCompat=api;
if(typeof module!=="undefined")module.exports=api;
})(typeof globalThis!=="undefined"?globalThis:this);
