/* Local inert response replacements. No remote JavaScript, media substitution,
   data URLs, site-supplied paths or redirects outside our own extension. */
(function(root){"use strict";
const RESOURCES=Object.freeze({
 "noop.js":Object.freeze({path:"redirect/noop.js",type:"script"}),
 "empty.css":Object.freeze({path:"redirect/empty.css",type:"stylesheet"})
});
function path(rule,type){
 const entry=RESOURCES[rule?.redirect];
 return entry&&entry.type===type&&rule?.exception!==true&&rule?.special===""?
  entry.path:"";
}
function url(rule,type,runtime){
 const asset=path(rule,type);
 if(!asset||typeof runtime?.getURL!=="function")return "";
 try{
  const value=runtime.getURL(asset);
  return typeof value==="string"&&/^moz-extension:\/\/[^/]+\/redirect\/(?:noop\.js|empty\.css)$/.test(value)?value:"";
 }catch(_){return "";}
}
const API=Object.freeze({RESOURCES,path,url});
root.DKRedirectResources=API;
if(typeof module!=="undefined")module.exports=API;
})(typeof globalThis!=="undefined"?globalThis:this);
