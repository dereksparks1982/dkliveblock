/* DK Live Block settings: page-only Back to Top control.
   No site filtering, permissions, telemetry or stored preferences. */
(function(root){"use strict";
const MIN_SCROLL=240;
function shouldShow(top,height,viewport){
 return Number.isFinite(top)&&Number.isFinite(height)&&
  Number.isFinite(viewport)&&viewport>0&&height>viewport+80&&top>=MIN_SCROLL;
}
function init(doc=root.document,win=root){
 const button=doc?.getElementById?.("settingsBackToTop");
 if(!button||!win?.addEventListener||!doc?.documentElement)return false;
 let scheduled=false;
 function update(){
  scheduled=false;
  const scrollNode=doc.scrollingElement||doc.documentElement;
  const top=Math.max(0,Number(win.scrollY??scrollNode.scrollTop)||0);
  const pageHeight=Math.max(scrollNode.scrollHeight||0,doc.documentElement.scrollHeight||0);
  button.hidden=!shouldShow(top,pageHeight,win.innerHeight);
 }
 function scheduleUpdate(){
  if(scheduled)return;
  scheduled=true;
  if(typeof win.requestAnimationFrame==="function")win.requestAnimationFrame(update);
  else update();
 }
 button.addEventListener("click",()=>{
  const reduced=win.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches===true;
  win.scrollTo({top:0,behavior:reduced?"auto":"smooth"});
 });
 win.addEventListener("scroll",scheduleUpdate,{passive:true});
 win.addEventListener("resize",scheduleUpdate);
 // Collapsing a long settings group may eliminate the need for the button.
 doc.addEventListener?.("toggle",scheduleUpdate,true);
 update();
 return true;
}
const API=Object.freeze({MIN_SCROLL,shouldShow,init});
if(typeof module!=="undefined")module.exports=API;
if(typeof document!=="undefined")init(document,root);
})(typeof globalThis!=="undefined"?globalThis:this);
