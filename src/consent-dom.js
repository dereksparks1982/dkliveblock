/* DK Live Block: bounded DOM/shadow consent discovery, conservative action safety. */
(function(root){"use strict";
const SELECTOR=[
 "[role='dialog']","[aria-modal='true']","#onetrust-banner-sdk",
 "#onetrust-consent-sdk","#CybotCookiebotDialog",".qc-cmp2-container",
 "#didomi-host",".osano-cm-dialog","[class*='cookie-banner' i]",
 "[id*='cookie-consent' i]","[class*='consent-banner' i]",
 "[id*='cookie-banner' i]","[class*='cmp-dialog' i]"
].join(",");
const BLOCKED="[inert], [hidden], [aria-hidden='true'], [aria-disabled='true']";
function findBanners(doc){
 const scopes=[doc],seenScopes=new Set(),seenBanners=new Set(),out=[];
 let nodesSeen=0,shadowCount=0;
 while(scopes.length&&seenScopes.size<=12&&out.length<20){
  const scope=scopes.shift();
  if(!scope||seenScopes.has(scope))continue;
  seenScopes.add(scope);
  try{
   for(const el of scope.querySelectorAll(SELECTOR)){
    if(!seenBanners.has(el)){seenBanners.add(el);out.push(el);}
    if(out.length>=20)break;
   }
  }catch(_){/* Never interrupt page scripts. */}
  if(nodesSeen>=900||shadowCount>=12)continue;
  const nodes=[scope.documentElement||scope];
  for(let i=0;i<nodes.length&&nodesSeen<900&&shadowCount<12;i++){
   const el=nodes[i];nodesSeen++;
   try{
    if(el?.shadowRoot?.mode==="open"&&!seenScopes.has(el.shadowRoot)){
     scopes.push(el.shadowRoot);shadowCount++;
    }
    const children=el?.children;
    if(children)for(let j=0;j<children.length&&nodes.length<900;j++)nodes.push(children[j]);
   }catch(_){/* Ignore inaccessible nodes. */}
  }
 }
 return out;
}
function protectedAncestor(el){
 for(let hops=0;el&&hops<6;hops++){
  try{
   if(el.closest?.(BLOCKED))return true;
   el=el.getRootNode?.()?.host||null;
  }catch(_){return true;}
 }
 return false;
}
function inspectButton(button,view){
 const unsafe={visible:false,disabled:true,protectedUI:true,isLink:false,isSubmit:false,isToggle:false};
 if(!button)return unsafe;
 let visible=false,protectedUI=true;
 try{
  const style=view.getComputedStyle(button);
  visible=!!button.isConnected&&!!button.getClientRects?.().length&&
   style?.display!=="none"&&style?.visibility!=="hidden"&&
   style?.visibility!=="collapse"&&style?.pointerEvents!=="none"&&
   Number(style?.opacity??1)>0;
  protectedUI=protectedAncestor(button);
 }catch(_){return unsafe;}
 const attr=name=>button.getAttribute?.(name);
 const tag=String(button.localName||"").toLowerCase();
 const role=String(attr("role")||"").toLowerCase();
 const form=button.form||button.closest?.("form");
 const type=String(attr("type")||button.type||(tag==="button"?"submit":"")).toLowerCase();
 return {visible,protectedUI,disabled:!!button.disabled||attr("aria-disabled")==="true",
  isLink:tag==="a"||attr("href")!=null||role==="link",
  isSubmit:!!form&&type==="submit",
  isToggle:attr("aria-pressed")!=null||attr("aria-checked")!=null||
   ["switch","checkbox","radio"].includes(role)};
}
function userEngaged(banner,doc){
 if(!banner||!doc)return false;
 try{
  const focused=banner.getRootNode?.()?.activeElement;
  return !!((focused&&banner.contains?.(focused))||
   (doc.activeElement&&banner.contains?.(doc.activeElement)));
 }catch(_){return true;}
}
const api=Object.freeze({findBanners,inspectButton,userEngaged});
root.DKConsentDOM=api;
if(typeof module!=="undefined")module.exports=api;
})(typeof globalThis!=="undefined"?globalThis:this);
