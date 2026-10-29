/* DK Live Block: local detection of subscription overlays on already-loaded articles.
   No requests, account changes, paid-content fabrication, or remote scripts. */
(function(root){"use strict";
const patterns=[
 /\bsubscribe\s+(?:now\s+|today\s+)?to\s+(?:continue|keep|finish|start)\s+reading\b/i,
 /\b(?:subscribe|join|sign\s+up)\s+to\s+(?:read|unlock|access)\s+(?:the\s+)?(?:full|rest\s+of\s+the|entire)\s+(?:article|story)\b/i,
 /\b(?:to\s+)?(?:continue|keep)\s+reading[,:]?\s+(?:please\s+)?(?:subscribe|become\s+a\s+subscriber)\b/i,
 /\b(?:you(?:'ve|\s+have)?|you)\s+(?:reached|hit|used)\s+(?:your|the)?\s*(?:free\s+)?(?:monthly\s+)?article\s+limit\b/i,
 /\b(?:you(?:'ve|\s+have)\s+reached|this\s+is)\s+(?:the\s+)?(?:end\s+of\s+)?(?:your\s+)?(?:free\s+)?(?:article|story)\s+(?:limit|allowance)\b/i,
 /\b(?:subscriber[s]?[ -]only|exclusive\s+to\s+subscribers)\s+(?:content|article|story|access)\b/i,
 /\b(?:unlock|read|access)\s+(?:the\s+)?(?:full|rest\s+of\s+the|entire)\s+(?:article|story)\s+(?:with|by)\s+(?:a\s+)?subscription\b/i,
 /\b(?:subscribe|become\s+a\s+subscriber)\s+(?:now\s+)?(?:to\s+)?(?:continue|read)\s+(?:this\s+)?(?:article|story)\b/i
];
const negative=/\b(?:cookie\s+preferences|privacy\s+settings|confirm\s+your\s+purchase|checkout|payment\s+confirmation|unsubscribe|subscription\s+cancelled)\b/i;
function isSubscriptionWall(text){
 const normalized=String(text||"").replace(/\s+/g," ").trim().slice(0,1600);
 return normalized.length>=17&&!negative.test(normalized)&&patterns.some(pattern=>pattern.test(normalized));
}
function shouldHide({text="",visible=false,overlay=false,articleLoaded=false,containsPlayer=false,rootElement=false}={}){
 return Boolean(visible&&overlay&&articleLoaded&&!containsPlayer&&!rootElement&&isSubscriptionWall(text));
}
root.DKPaywall={isSubscriptionWall,shouldHide};
if(typeof module!=="undefined")module.exports=root.DKPaywall;
})(typeof globalThis!=="undefined"?globalThis:this);
