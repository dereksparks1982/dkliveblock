/* DK Live Block Build 228: CBS News click-to-play without player deadlock.
 * The background enables this only for CBS News article tabs. No network changes. */
(function(root){"use strict";
function create(doc){
 let enabled=false,observer=null,playerActivated=false;
 const playerControl="video, .jwplayer, .video-js, [class*='video-player' i], [id*='video-player' i], [class*='embed-player' i], [data-player], [class*='play-button' i], [class*='play-button'], [aria-label*='play' i], [class*='video' i], [id*='video' i]";
 function eachVideo(node,callback){
  if(!node||typeof callback!=="function")return;
  if(String(node.localName||"").toLowerCase()==="video")callback(node);
  if(typeof node.querySelectorAll==="function"){
   let i=0;
   for(const video of node.querySelectorAll("video")){if(++i>120)break;callback(video);}
  }
 }
 function pauseUnrequested(video){
  if(!enabled||playerActivated||!video)return;
  try{
   video.autoplay=false;
   if(video.hasAttribute?.("autoplay"))video.removeAttribute("autoplay");
   if(!video.paused)video.pause?.();
  }catch(_){/* Unknown or detached media element. */}
 }
 function scan(node=doc){if(enabled&&!playerActivated)eachVideo(node,pauseUnrequested);}
 function play(event){
  if(!enabled||playerActivated)return;
  const video=event?.target;
  if(String(video?.localName||"").toLowerCase()==="video")pauseUnrequested(video);
 }
 function insideVideo(event){
  if(!Number.isFinite(event?.clientX)||!Number.isFinite(event?.clientY))return false;
  let found=false;
  eachVideo(doc,video=>{
   if(found||typeof video.getBoundingClientRect!=="function")return;
   try{
    const r=video.getBoundingClientRect(),x=event.clientX,y=event.clientY;
    if(r.width>0&&r.height>0&&x>=r.left&&x<=r.right&&y>=r.top&&y<=r.bottom)
     found=true;
   }catch(_){}
  });
  return found;
 }
 function gesture(event){
  if(!enabled||playerActivated||event?.isTrusted!==true)return;
  if(event.type==="keydown"&&!["Enter"," ","Spacebar"].includes(event.key))return;
  const target=event?.target;
  let withinPlayer=false;
  if(target&&typeof target.closest==="function"){
   try{withinPlayer=!!target.closest(playerControl);}catch(_){}
  }
  if(!withinPlayer)withinPlayer=insideVideo(event);
  if(!withinPlayer)return;
  // Critical: CBS can replace its video element after Play. Leave the
  // entire player alone from this point until a new document navigation.
  // In particular do NOT cancel delayed play events: that caused the spinner.
  playerActivated=true;
  observer?.disconnect();observer=null;
  doc.removeEventListener("play",play,true);
 }
 function changes(records){
  if(!enabled||playerActivated)return;
  for(const record of records){
   if(record.type==="attributes"){pauseUnrequested(record.target);continue;}
   for(const node of record.addedNodes||[])scan(node);
  }
 }
 function setEnabled(value){
  const next=value===true;
  if(next===enabled)return;
  enabled=next;
  if(enabled){
   playerActivated=false;
   doc.addEventListener("play",play,true);
   doc.addEventListener("pointerdown",gesture,true);
   doc.addEventListener("click",gesture,true);
   doc.addEventListener("keydown",gesture,true);
   scan();
   try{
    if(typeof MutationObserver!=="undefined"){
     observer=new MutationObserver(changes);
     observer.observe(doc,{subtree:true,childList:true,attributes:true,attributeFilter:["autoplay"]});
    }
   }catch(_){observer?.disconnect();observer=null;}
  }else{
   observer?.disconnect();observer=null;
   doc.removeEventListener("play",play,true);
   doc.removeEventListener("pointerdown",gesture,true);
   doc.removeEventListener("click",gesture,true);
   doc.removeEventListener("keydown",gesture,true);
   playerActivated=false;
  }
 }
 return Object.freeze({setEnabled,scan});
}
root.DKCBSAutoplay=Object.freeze({create});
if(typeof module!=="undefined")module.exports=root.DKCBSAutoplay;
})(typeof globalThis!=="undefined"?globalThis:this);
