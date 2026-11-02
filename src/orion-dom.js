/* DK Live Block Orion experimental DOM-only adapter.
   Reuses official DK scanners without Firefox APIs, remote code or telemetry.
   This is not evidence of Orion WebExtensions API parity or network blocking. */
(function(root){"use strict";
 const doc=root.document,win=root.window||root;
 if(!doc||!win||win.top!==win||!/^https?:$/.test(win.location?.protocol||""))return;
 const generic=root.DKAdRecognition?.create?.(doc,win,55)||null;
 const facebook=root.DKFacebookAds?.create?.(doc,win,90)||null;
 if(!generic&&!facebook)return;
 let observer=null,timer=null,queued=null,active=false;
 function scan(){
  queued=null;
  if(!active||doc.visibilityState==="hidden"||!doc.documentElement)return;
  try{generic?.scan();}catch(_){}
  try{facebook?.scan();}catch(_){}
 }
 function schedule(){
  if(!active||queued!==null||typeof win.setTimeout!=="function")return;
  queued=win.setTimeout(scan,450);
 }
 function changed(records){
  let n=0;
  for(const item of records||[]){
   if(++n>40)break;
   // Use the identical evidence triage as desktop DK's ad recognizers.
   try{
    if(facebook?.observeMutation?.(item)||
       root.DKAdRecognition?.relevantMutation?.(item,win.location.hostname))
     return true;
   }catch(_){}
  }
  return false;
 }
 function stop(){
  active=false;
  try{observer?.disconnect();}catch(_){}
  observer=null;
  if(queued!==null){win.clearTimeout?.(queued);queued=null;}
  if(timer!==null){win.clearInterval?.(timer);timer=null;}
  try{facebook?.restore();}catch(_){}
  try{generic?.restore();}catch(_){}
 }
 function start(){
  if(active)return;
  active=true;
  if(typeof win.MutationObserver==="function"&&doc.documentElement){
   try{
    observer=new win.MutationObserver(records=>{if(changed(records))schedule();});
    observer.observe(doc.documentElement,{
     childList:true,subtree:true,characterData:!!facebook,attributes:true,
     attributeFilter:["class","style","hidden","aria-hidden","id",
      "data-testid","aria-label","aria-labelledby","data-pagelet",
      "data-google-query-id","data-ad-client","data-ad-slot"]
    });
   }catch(_){observer=null;}
  }
  scan();
  if(typeof win.setInterval==="function")timer=win.setInterval(scan,6000);
 }
 if(typeof win.addEventListener==="function"){
  // Restore styles when entering page cache; restart only on genuine pageshow.
  win.addEventListener("pagehide",stop,false);
  win.addEventListener("pageshow",start,false);
 }
 if(doc.documentElement)start();
 else if(typeof win.addEventListener==="function")
  win.addEventListener("DOMContentLoaded",start,{once:true});
})(typeof globalThis!=="undefined"?globalThis:this);
