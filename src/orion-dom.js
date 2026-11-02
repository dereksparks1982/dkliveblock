/* DK Live Block Orion experimental DOM-only adapter.
   Reuses official DK scanners without Firefox APIs, remote code or telemetry.
   This is not evidence of Orion WebExtensions API parity or network blocking. */
(function(root){"use strict";
 const doc=root.document,win=root.window||root;
 if(!doc||!win||win.top!==win||!/^https?:$/.test(win.location?.protocol||""))return;
 const generic=root.DKAdRecognition?.create?.(doc,win,55)||null;
 const facebook=root.DKFacebookAds?.create?.(doc,win,90)||null;
 if(!generic&&!facebook)return;
 let observer=null,timer=null,queued=null,active=false,generation=0;
 let paused=false,ready=!root.DKOrionPause;
 function scan(){
  queued=null;
  if(!active||doc.visibilityState==="hidden"||!doc.documentElement)return;
  try{generic?.scan();}catch(_){}
  try{facebook?.scan();}catch(_){}
 }
 function schedule(){
  if(!active||queued!==null||typeof win.setTimeout!=="function")return;
  const current=generation;
  queued=win.setTimeout(()=>{
   // A queued callback from a prior pagehide must not affect a restored tab.
   if(!active||generation!==current)return;
   scan();
  },450);
 }
 function changed(records){
  let n=0,interesting=false;
  for(const item of records||[]){
   if(++n>40)break;
   // Keep observing the entire bounded batch. An earlier style mutation
   // must not prevent Facebook's ephemeral ad-ID cache from seeing the later
   // removed Sponsored label in the same React update.
   try{
    const meta=facebook?.observeMutation?.(item)===true;
    if(meta)interesting=true;
    if(!interesting&&root.DKAdRecognition?.relevantMutation?.(item,win.location.hostname))
     interesting=true;
   }catch(_){}
  }
  return interesting;
 }
 function stop(){
  generation++;
  active=false;
  try{observer?.disconnect();}catch(_){}
  observer=null;
  if(queued!==null){win.clearTimeout?.(queued);queued=null;}
  if(timer!==null){win.clearInterval?.(timer);timer=null;}
  try{facebook?.restore();}catch(_){}
  try{generic?.restore();}catch(_){}
 }
 function start(){
  if(active||paused||!ready)return;
  generation++;
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
 // On mobile, backgrounding a tab may stop its timers. Resume promptly only
 // on visibility return; do not wake a paused or hidden document.
 doc.addEventListener?.("visibilitychange",()=>{
  if(active&&doc.visibilityState==="visible")schedule();
 });
 root.DKOrionPause?.register(value=>{
  ready=true;paused=value===true;if(paused)stop();else start();
 });
 if(ready&&doc.documentElement)start();
 else if(ready&&typeof win.addEventListener==="function")
  win.addEventListener("DOMContentLoaded",start,{once:true});
})(typeof globalThis!=="undefined"?globalThis:this);
