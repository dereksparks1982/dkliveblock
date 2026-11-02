/* DK Live Block Build 235: opt-in, local ad evidence inspection.
   Reads only bounded DOM structure and fixed ad markers. No page-body export,
   remote model, personal-history training, automatic hiding or rule creation. */
(function(root){"use strict";
const SLOT='ins.adsbygoogle,amp-ad,amp-auto-ads,[data-ad-client][data-ad-slot],[data-google-query-id],[id^="div-gpt-ad-"],[data-testid="ad-slot"],[class~="ad-slot"],[aria-label="Advertisement" i]';
const FEED='[role="article"],[data-pagelet^="FeedUnit"]';
const PROTECTED='main,[role="main"],[role="feed"],[role="navigation"],nav,form,[role="dialog"],[aria-modal="true"]';
const LABELS='span,a,[aria-label],use,text';
const FACEBOOK='a[target="rhcad2"],a[attributionsrc],a[href*="/ads/about"],[aria-label]';
const REASONS=Object.freeze({
 knownSlot:"Recognized ad-slot markup or advertiser container",
 sponsoredMenu:"Facebook explicitly labeled the post menu as sponsored",
 adExplainer:"Facebook included a Why am I seeing this ad? link",
 railAdLink:"Facebook advertising-specific right-rail link attributes",
 authorAdByline:"An Ad/Sponsored marker appears beside the post author",
 protectedContext:"This appears to contain a protected page, form, or dialog"
});
const fb=()=>root.DKFacebookAds;
const model=()=>root.DKAdaptiveModel;
function hostname(win,doc){return String(win?.location?.hostname||doc?.location?.hostname||"").toLowerCase();}
function boxOK(node,doc,win){
 if(!node||node===doc?.body||node===doc?.documentElement||!node.style?.setProperty)return false;
 if(node.matches?.(PROTECTED)||node.querySelector?.('main,[role="main"],[role="feed"],nav,[role="dialog"]'))return false;
 const rect=node.getBoundingClientRect?.();
 if(!rect||!Number.isFinite(rect.width)||!Number.isFinite(rect.height)||
    rect.width<160||rect.width>1000||rect.height<60||rect.height>1800)return false;
 if((node.querySelectorAll?.(FEED)?.length||0)>1)return false;
 return true;
}
function candidateFor(target,doc,win){
 if(!target||target.nodeType!==1||!doc?.body||!doc.documentElement)return null;
 if(target.closest?.('form,[role="dialog"],[aria-modal="true"],nav,[role="navigation"],input,textarea,select,[contenteditable="true"]'))return null;
 const feed=target.closest?.(FEED);
 if(feed&&boxOK(feed,doc,win))return feed;
 let node=target,best=null;
 for(let depth=0;depth<12&&node;depth++,node=node.parentElement){
  if(node===doc.body||node===doc.documentElement||node.matches?.(PROTECTED))break;
  if(!boxOK(node,doc,win))continue;
  best=node;
  // Prefer one complete, bounded card over a tiny child. Stop when a
  // container already has a visible author heading and substantial content.
  const r=node.getBoundingClientRect?.();
  if(r?.height>=140&&node.querySelector?.('h2,h3,h4,[role="heading"]'))break;
 }
 return best;
}
function factsFor(candidate,doc,win){
 if(!candidate)return null;
 const facebook=!!fb()?.isFacebook?.(hostname(win,doc));
 const protectedContext=!!(
  candidate.matches?.(PROTECTED)||
  candidate.closest?.('form,[role="dialog"],[aria-modal="true"],nav')||
  candidate.querySelector?.('main,[role="main"],[role="feed"],nav,[role="dialog"],[aria-modal="true"]')||
  (candidate.querySelectorAll?.(FEED)?.length||0)>1
 );
 let knownSlot=false;
 if(root.DKAdRecognition?.hasStrongSignal?.(candidate))knownSlot=true;
 if(!knownSlot&&candidate.querySelector?.(SLOT))knownSlot=true;
 const input={knownSlot,sponsoredMenu:false,adExplainer:false,
  railAdLink:false,authorAdByline:false,protectedContext};
 if(facebook){
  input.adExplainer=!!candidate.querySelector?.('a[href*="/ads/about"]');
  const nodes=candidate.querySelectorAll?.(LABELS)||[];
  for(let i=0;i<Math.min(nodes.length,220);i++){
   const el=nodes[i];
   if(!input.sponsoredMenu&&fb()?.sponsoredMenu?.(el))input.sponsoredMenu=true;
   if(!input.authorAdByline&&fb()?.inByline?.(el,candidate)&&
      fb()?.labelsOf?.(el,win)?.some?.(fb()?.isAdLabel))
    input.authorAdByline=true;
   if(input.sponsoredMenu&&input.authorAdByline)break;
  }
  const links=candidate.querySelectorAll?.(FACEBOOK)||[];
  const rightSide=(candidate.getBoundingClientRect?.().left||0)>
   Math.max(480,(win?.innerWidth||1200)*0.57);
  if(rightSide)for(let i=0;i<Math.min(links.length,80);i++){
   if(fb()?.railAdLink?.(links[i])){input.railAdLink=true;break;}
  }
 }
 return input;
}
function draftSelector(candidate,doc){
 if(!candidate||!doc?.querySelectorAll)return "";
 const id=String(candidate.id||"");
 let selector="";
 if(/^div-gpt-ad-[a-z0-9_-]{1,70}$/i.test(id))selector="#"+id;
 else{
  const testid=String(candidate.getAttribute?.("data-testid")||"");
  if(["ad-slot","ad-container","advertisement","ad-banner"].includes(testid))
   selector='[data-testid="'+testid+'"]';
  else if(String(candidate.localName||"").toLowerCase()==="ins"&&
          candidate.classList?.contains?.("adsbygoogle"))selector="ins.adsbygoogle";
 }
 if(!selector)return "";
 // A draft must identify exactly one element on the current page.
 try{if(doc.querySelectorAll(selector).length!==1)return "";}catch(_){return "";}
 return selector;
}
function inspect(target,doc,win,exceptions=[]){
 const candidate=candidateFor(target,doc,win);
 if(!candidate)return {ok:false,reason:"Choose a bounded page item, not a form, dialog, or whole page."};
 const facts=factsFor(candidate,doc,win);
 let siteException=false;
 if(Array.isArray(exceptions))for(const raw of exceptions.slice(0,120)){
  if(typeof raw!=="string"||raw.length>240||/[\r\n{};]/.test(raw))continue;
  try{if(candidate.matches?.(raw)||candidate.closest?.(raw)){siteException=true;break;}}
  catch(_){}
 }
 const output=model()?.inspectAdCandidate?.(facts);
 if(!output)return {ok:false,reason:"The local evidence model is not available."};
 const reasons=Object.keys(REASONS).filter(k=>facts[k]).map(k=>REASONS[k]).slice(0,6);
 if(siteException)reasons.unshift("A local element-hiding exception matches this item");
 const selector=draftSelector(candidate,doc);
 return {ok:true,candidate,facts,assessment:output.assessment,
  evidenceScore:output.score,modelVersion:output.modelVersion,reasons,selector,
  siteException,explanation:siteException?
    "A local exception applies. Review your site settings before changing it.":
    output.assessment==="strong-evidence"?
    "Recognized advertising markers were found. This does not prove an automatic rule already ran.":
    "No strong known markers found. This may be an unrecognized ad or ordinary page content."};
}
const API=Object.freeze({REASONS,hostname,boxOK,candidateFor,factsFor,draftSelector,inspect});
root.DKAdInvestigation=API;
if(typeof module!=="undefined")module.exports=API;
})(typeof globalThis!=="undefined"?globalThis:this);
