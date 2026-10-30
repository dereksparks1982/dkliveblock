/* DK Live Block: local detection of subscription overlays on already-loaded articles.
   No requests, account changes, paid-content fabrication, or remote scripts. */
(function(root){"use strict";
const patterns=[
 /\bsubscribe\s+(?:now\s+|today\s+)?to\s+(?:continue|keep|finish|start)\s+reading\b/i,
 /\b(?:you(?:'ve|\s+have)?\s+reached|your)\s+(?:the\s+)?(?:monthly\s+)?(?:free\s+)?(?:article|story)\s+limit\b/i,
 /\b(?:continue|keep)\s+reading\s+(?:with|by\s+getting)\s+(?:a\s+)?subscription\b/i,
 /\b(?:you\s+have\s+read|you(?:'ve|\s+have)\s+used)\s+(?:all\s+)?(?:your\s+)?(?:free\s+)?articles\s+(?:this\s+month|for\s+this\s+month)\b/i,
 /\b(?:abonnez[ -]vous\s+pour\s+continuer\s+(?:à|a)\s+lire|suscr[ií]bete\s+para\s+(?:seguir|continuar)\s+leyendo)\b/i,
 /\babonnieren\s+sie,?\s+um\s+weiterzulesen\b/i,
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

function hasLoadedArticle(doc,excluded=null){
 if(!doc||typeof doc.querySelectorAll!=="function")return false;
 const groups=["article","[itemprop='articleBody']","[data-testid*='article-body' i]","[class*='article-body' i]","[data-module*='ArticleBody' i]","main"];
 for(const query of groups){
  let candidates;
  try{candidates=doc.querySelectorAll(query);}catch(_){continue;}
  let checked=0;
  for(const node of candidates){
   if(++checked>8)break;
   let paragraphs;
   try{paragraphs=node.querySelectorAll("p");}catch(_){continue;}
   if(paragraphs.length<3)continue;
   let characters=0,paragraphCount=0;
   for(const p of paragraphs){
    if(paragraphCount>=45)break;
    if(excluded){
     try{if(excluded.contains?.(p))continue;}catch(_){continue;}
    }
    try{if(p.closest?.('dialog, [role="dialog"], [aria-modal="true"], [class*="paywall" i], [class*="subscription-modal" i]'))continue;}catch(_){} 
    const text=String(p.textContent||"").trim();
    if(text.length<35)continue;
    paragraphCount++;characters+=text.length;
    if(paragraphCount>=3&&characters>=420)return true;
   }
  }
 }
 return false;
}
root.DKPaywall={isSubscriptionWall,shouldHide,hasLoadedArticle};
if(typeof module!=="undefined")module.exports=root.DKPaywall;
})(typeof globalThis!=="undefined"?globalThis:this);
