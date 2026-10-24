/* DK Live Block: safe builder for user-initiated site exceptions. */
(function(root){"use strict";
function validHost(input){
 if(typeof input!=="string"||!input||input.length>253||input!==input.toLowerCase())return false;
 const labels=input.split(".");
 return labels.every(label=>/^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/.test(label));
}
function allowHostOnSite(site,requestHost){
 if(!validHost(site)||!validHost(requestHost))return null;
 return "@@||"+requestHost+"^$domain="+site;
}
root.DKManualRules={validHost,allowHostOnSite};
if(typeof module!=="undefined")module.exports=root.DKManualRules;
})(typeof globalThis!=="undefined"?globalThis:this);
