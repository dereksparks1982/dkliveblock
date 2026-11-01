/* Build 231: CBS player-safe compatibility.
 * The former autoplay guard changed HTMLMediaElement before CBS/JW Player
 * initialized, causing a black, unclickable video in real Firefox testing.
 * Do not inspect or mutate media, register capture listeners, or suppress
 * autoplay until we have a proven safe CBS-specific player API.
 * Retain the interface so background/content wiring needs no alteration. */
(function(root){"use strict";
function create(){
 let enabled=false;
 return Object.freeze({
  setEnabled(value){enabled=value===true;},
  scan(){return false;},
  get enabled(){return enabled;}
 });
}
const api=Object.freeze({create});
root.DKCBSAutoplay=api;
if(typeof module!=="undefined")module.exports=api;
})(typeof globalThis!=="undefined"?globalThis:this);
