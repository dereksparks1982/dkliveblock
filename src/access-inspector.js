/* DK Live Block Build 38: cautious, explainable request classification.
   Heuristics are descriptive, NOT proof of a site's intentions. */
(function(root){"use strict";
const AD=/(^|[.-])(adserver|ads|adservice|adnxs|doubleclick|googlesyndication|taboola|outbrain|criteo)([.-]|$)/i;
const ANALYTICS=/(^|[.-])(analytics|telemetry|metrics|pixel|beacon|scorecardresearch)([.-]|$)/i;
const AUTH=/(^|[.-])(auth|login|signin|accounts)([.-]|$)/i;
const TYPES=Object.freeze({
 script:"JavaScript code",image:"Image resource",imageset:"Image resource",
 stylesheet:"Stylesheet",media:"Audio or video",font:"Web font",object:"Embedded object",
 xmlhttprequest:"Background data request",sub_frame:"Embedded frame",
 ping:"Tracking-capable beacon",beacon:"Tracking-capable beacon",
 websocket:"Persistent connection",other:"Other network resource",
 main_frame:"Page navigation",popup:"New tab or window"
});
function describe(host,type,site){
 const h=typeof host==="string"?host.toLowerCase():"";
 const third=typeof site==="string"&&site.length>0&&h!==site&&
  !h.endsWith("."+site)&&!site.endsWith("."+h);
 let intent="Purpose cannot be determined from a request alone.",certainty="unknown";
 if(AD.test(h)){intent="Possible advertising delivery or advertising measurement.";certainty="likely";}
 else if(ANALYTICS.test(h)){intent="Possible analytics or tracking measurement.";certainty="likely";}
 else if(AUTH.test(h)){intent="Likely account authentication or sign-in service.";certainty="likely";}
 else if(type==="media"){intent="Likely video or audio playback resource.";certainty="likely";}
 else if(type==="stylesheet"||type==="font"){intent="Likely page presentation resource.";certainty="likely";}
 else if(type==="image"||type==="imageset"){intent="Likely image content; an image can also be a tracking pixel.";certainty="likely";}
 else if(type==="script"){intent="A JavaScript resource. Its behavior is not visible from this network record alone.";certainty="unknown";}
 else if(type==="popup"){intent="A new tab or window. The destination alone does not prove intent.";certainty="unknown";}
 return {observed:TYPES[type]||"Network request",thirdParty:third,
  purpose:intent,certainty,access:"Firefox web request only; not evidence of filesystem, camera, microphone, or device access."};
}
const api=Object.freeze({describe});
root.DKAccessInspector=api;
if(typeof module!=="undefined")module.exports=api;
})(typeof globalThis!=="undefined"?globalThis:this);