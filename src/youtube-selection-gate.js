/* Offline selection revision guard: never reuse report data when a
   user changes selected files during an asynchronous read. */
(function(root){"use strict";
function create(){
 let revision=0;
 return Object.freeze({
  start:()=>revision,
  invalidate:()=>{revision=revision===Number.MAX_SAFE_INTEGER?0:revision+1;return revision;},
  valid:token=>Number.isSafeInteger(token)&&token===revision
 });
}
const API=Object.freeze({create});
root.DKYouTubeSelectionGate=API;
if(typeof module!=="undefined")module.exports=API;
})(typeof globalThis!=="undefined"?globalThis:this);
