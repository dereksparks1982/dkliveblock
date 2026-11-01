/* Build 227: stop unsolicited CBS News article video playback.
 * Restrained to CBS article tabs by background; no page-world hooks, no requests,
 * no interference with YouTube/Disney+ or an explicit player click. */
(function(root){"use strict";
function create(doc,win){
 let enabled=false,observer=null;
 const userStarted=new WeakSet();
 const selector="video";
 function eachVideo(node,fn){
  if(!node||typeof fn!=="function")return;
  if(String(node.localName||"").toLowerCase()==="video")fn(node);
  if(typeof node.querySelectorAll==="function"){
   let count=0;
   for(const video of node.querySelectorAll(selector)){if(++count>120)break;fn(video);}
  }
 }
 function pauseUnrequested(video){
  if(!video||userStarted.has(video))return;
  try{
   video.autoplay=false;
   if(video.hasAttribute?.("autoplay"))video.removeAttribute("autoplay");
   if(!video.paused)video.pause?.();
  }catch(_){/* Unsupported or detached media element. */}
 }
 function scan(rootNode=doc){if(enabled)eachVideo(rootNode,pauseUnrequested);}
 function play(event){
  if(!enabled)return;
  const video=event?.target;
  if(String(video?.localName||"").toLowerCase()==="video")
   pauseUnrequested(video);
 }
 function intent(event){
  if(!enabled||event?.isTrusted===false)return;
  const target=event?.target;
  if(!target?.closest)return;
  // A normal click elsewhere on the news page does not allow autoplay.
  let box;
  try{box=target.closest("video, .jwplayer, .video-js, [class*='video-player' i], [id*='video-player' i], [data-player], [class*='embed-player' i]");}
  catch(_){return;}
  if(!box)return;
  eachVideo(box,video=>userStarted.add(video));
 }
 function changes(records){
  if(!enabled)return;
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
   doc.addEventListener("play",play,true);
   doc.addEventListener("pointerdown",intent,true);
   doc.addEventListener("click",intent,true);
   doc.addEventListener("keydown",intent,true);
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
   doc.removeEventListener("pointerdown",intent,true);
   doc.removeEventListener("click",intent,true);
   doc.removeEventListener("keydown",intent,true);
  }
 }
 return Object.freeze({setEnabled,scan});
}
root.DKCBSAutoplay=Object.freeze({create});
if(typeof module!=="undefined")module.exports=root.DKCBSAutoplay;
})(typeof globalThis!=="undefined"?globalThis:this);
