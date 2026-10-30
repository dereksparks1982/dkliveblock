/* DK Live Block 17: reversible popup/backdrop and scroll-lock recovery.
   Keep this script isolated from site scripts and media playback state. */
(function(root){"use strict";
const BACKDROP_SELECTOR='[class*="backdrop" i], [class*="scrim" i], [class*="modal-mask" i], [class*="overlay-mask" i], [data-testid*="backdrop" i]';
const UNSAFE_CONTAINERS='video, audio, article, [itemprop="articleBody"], main, nav, header, footer, input[type="password"], [role="main"], [role="navigation"]';
function create(document,window,limit=24){
 const hidden=new Map(),locks=new Map(),maximum=Math.max(1,Math.min(100,limit));
 function unsafe(el,allowArticle=false){
  if(!el||el===document.body||el===document.documentElement)return true;
  try{
   const restricted=allowArticle?
    'video, audio, main, nav, header, footer, input[type="password"], [role="main"], [role="navigation"]':
    UNSAFE_CONTAINERS;
   if(el.matches?.(restricted)||el.querySelector?.(restricted))return true;
  }catch(_){return true;}
  return false;
 }
 function hide(el){
  if(!el||!el.isConnected||unsafe(el))return false;
  if(!el.style?.setProperty||!el.style?.getPropertyValue||!el.style?.getPropertyPriority)return false;
  const existing=hidden.get(el);
  if(existing){
   // The site may remove our inline hiding rule to display the same gate again.
   // Keep our prior value, rather than recording a site-written "display" as baseline.
   if(el.style.getPropertyValue("display")==="none"&&
      el.style.getPropertyPriority("display")==="important")return false;
   el.style.setProperty("display","none","important");
   return true;
  }
  if(hidden.size>=maximum){prune();if(hidden.size>=maximum)return false;}
  const prior={value:el.style.getPropertyValue("display"),
    priority:el.style.getPropertyPriority("display")};
  hidden.set(el,prior);
  el.style.setProperty("display","none","important");
  return true;
 }
 function hideBackdropAround(el){
  let suppressed=0;
  // Only explicit, adjacent backdrop elements, never a whole container ancestor.
  for(const node of [el?.previousElementSibling,el?.nextElementSibling]){
   if(!node||unsafe(node))continue;
   let match=false;
   try{match=node.matches?.(BACKDROP_SELECTOR)===true;}catch(_){}
   if(match&&hide(node))suppressed++;
  }
  return suppressed;
 }
 function unlockScroll(){
  if(!document.documentElement||document.fullscreenElement)return false;
  if(document.documentElement.scrollHeight<=window.innerHeight+80)return false;
  let changes=0;
  for(const node of [document.documentElement,document.body]){
   if(!node||locks.has(node)||!node.style?.setProperty)continue;
   let overflow="";
   try{overflow=window.getComputedStyle(node).overflowY;}catch(_){}
   if(overflow!=="hidden"&&overflow!=="clip")continue;
   const before={value:node.style.getPropertyValue("overflow-y"),
    priority:node.style.getPropertyPriority("overflow-y")};
   locks.set(node,before);
   node.style.setProperty("overflow-y","auto","important");changes++;
  }
  return changes>0;
 }
 function restore(){
  for(const [node,prior] of hidden){
   try{
    // If the page has since changed display, avoid overwriting its own rule.
    if(node.isConnected&&node.style.getPropertyValue("display")==="none"&&
       node.style.getPropertyPriority("display")==="important"){
      if(prior.value)node.style.setProperty("display",prior.value,prior.priority);
      else node.style.removeProperty("display");
    }
   }catch(_){}
  }
  hidden.clear();
  for(const [node,prior] of locks){
   try{
    if(node.isConnected&&node.style.getPropertyValue("overflow-y")==="auto"&&
       node.style.getPropertyPriority("overflow-y")==="important"){
      if(prior.value)node.style.setProperty("overflow-y",prior.value,prior.priority);
      else node.style.removeProperty("overflow-y");
    }
   }catch(_){}
  }
  locks.clear();
 }
 function prune(){
  for(const node of hidden.keys())if(!node.isConnected)hidden.delete(node);
  for(const node of locks.keys())if(!node.isConnected)locks.delete(node);
 }
 return {hide,hideBackdropAround,unlockScroll,restore,prune,unsafe,wasHidden:el=>hidden.has(el),
  get hiddenCount(){return hidden.size;},get lockCount(){return locks.size;}};
}
const api={create,BACKDROP_SELECTOR};
root.DKOverlayRecovery=api;
if(typeof module!=="undefined")module.exports=api;
})(typeof globalThis!=="undefined"?globalThis:this);
