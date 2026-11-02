/* DK Live Block Build 235: explicit, private ad investigation UI.
   An owner-triggered picker presents evidence and a draft; never sends DOM,
   URLs, labels, or model output to background servers or auto-saves rules. */
(function(){"use strict";
 if(typeof browser==="undefined"||!browser.runtime?.onMessage)return;
 const INFO_STYLE="position:fixed!important;z-index:2147483646!important;right:12px!important;top:12px!important;width:min(420px,calc(100vw - 24px))!important;max-height:85vh!important;overflow:auto!important;padding:14px!important;background:#09232a!important;color:#f1fbfb!important;border:2px solid #38e2da!important;border-radius:9px!important;box-shadow:0 8px 28px #000a!important;font:14px/1.45 system-ui,sans-serif!important;";
 let picking=false,overlay=null,highlight=null,oldOutline=null,selected=null,undoStack=[],activeExceptions=[];
 function restoreOutline(){
  if(!highlight)return;
  try{
   if(highlight.style.getPropertyValue("outline")==="3px solid rgb(56, 226, 218)")
    if(oldOutline?.value)highlight.style.setProperty("outline",oldOutline.value,oldOutline.priority);
    else highlight.style.removeProperty("outline");
  }catch(_){}
  highlight=null;oldOutline=null;
 }
 function mark(candidate){
  if(candidate===highlight)return;
  restoreOutline();
  if(!candidate)return;
  highlight=candidate;
  oldOutline={value:candidate.style.getPropertyValue("outline"),
   priority:candidate.style.getPropertyPriority("outline")};
  candidate.style.setProperty("outline","3px solid rgb(56, 226, 218)","important");
 }
 function make(tag,text){
  const el=document.createElement(tag);
  if(text!==undefined)el.textContent=text;
  return el;
 }
 function button(title,fn){
  const b=make("button",title);
  b.type="button";
  b.setAttribute("style","background:#18d2d1!important;color:#032224!important;border:0!important;border-radius:5px!important;padding:8px 11px!important;margin:5px 6px 0 0!important;font:700 13px system-ui,sans-serif!important;cursor:pointer!important");
  b.addEventListener("click",event=>{event.preventDefault();event.stopPropagation();fn();});
  return b;
 }
 function close(){
  picking=false;restoreOutline();selected=null;activeExceptions=[];
  overlay?.remove();overlay=null;
  document.removeEventListener("mouseover",onHover,true);
  document.removeEventListener("click",onChoose,true);
  document.removeEventListener("keydown",onKey,true);
 }
 function banner(message){
  if(!overlay){
   overlay=make("section");overlay.id="dk-ad-investigation-panel";
   overlay.setAttribute("role","status");
   overlay.setAttribute("style",INFO_STYLE);
   document.documentElement.appendChild(overlay);
  }
  overlay.replaceChildren(make("strong","DK Live Block · Ad Investigator"),make("p",message));
 }
 function onHover(event){
  if(!picking||overlay?.contains(event.target))return;
  const candidate=globalThis.DKAdInvestigation?.candidateFor?.(event.target,document,window);
  mark(candidate);
 }
 function showResult(result){
  picking=false;restoreOutline();
  document.removeEventListener("mouseover",onHover,true);
  document.removeEventListener("click",onChoose,true);
  document.removeEventListener("keydown",onKey,true);
  selected=result.candidate;
  if(!overlay)banner("");
  overlay.setAttribute("role","dialog");
  overlay.setAttribute("aria-label","DK Live Block ad investigation");
  const head=make("strong","DK Live Block · Local ad investigation");
  const assessment=result.assessment==="strong-evidence"?
   "Strong advertising evidence":"Insufficient evidence to identify an ad";
  const p=make("p",assessment+" · Evidence score "+result.evidenceScore.toFixed(2)+
   " (synthetic local model, not a probability).");
  const explanation=make("p",result.explanation||"");
  const ul=make("ul");
  for(const reason of result.reasons){
   const li=make("li",reason);ul.appendChild(li);
  }
  if(!result.reasons.length)ul.appendChild(make("li","No recognized advertising markers were found."));
  const notice=make("p","Nothing has been blocked or saved. Any hide is temporary until you undo it or reload the page.");
  overlay.replaceChildren(head,p,explanation,ul,notice);
  const row=make("div");
  if(!result.facts.protectedContext){
   row.appendChild(button("Hide this page item",()=>{
    const el=selected;
    if(!el||el.isConnected===false||!el.style?.setProperty){
     notice.textContent="That item changed; inspect it again.";return;
    }
    undoStack.push({el,value:el.style.getPropertyValue("display"),priority:el.style.getPropertyPriority("display")});
    if(undoStack.length>32)undoStack.shift();
    el.style.setProperty("display","none","important");
    notice.textContent="Hidden for this page only. Use Undo hide in the toolbar or reload to restore it.";
    selected=null;
    row.replaceChildren(button("Close",close));
   }));
  }else notice.textContent="Protected form, dialog or page container: hiding is disabled.";
  if(result.selector){
   row.appendChild(button("Copy draft rule",async()=>{
    try{
     const host=globalThis.location.hostname.toLowerCase();
     await navigator.clipboard.writeText(host+"##"+result.selector);
     notice.textContent="Draft copied for your review; it was NOT installed.";
    }catch(_){notice.textContent="Clipboard unavailable. No rule was installed.";}
   }));
  }
  row.appendChild(button("Pick another",()=>{selected=null;overlay?.remove();overlay=null;beginListening();}));
  row.appendChild(button("Cancel",close));
  overlay.appendChild(row);
 }
 function onChoose(event){
  if(!picking||overlay?.contains(event.target))return;
  event.preventDefault();event.stopImmediatePropagation();
  const result=globalThis.DKAdInvestigation?.inspect?.(event.target,document,window,activeExceptions);
  if(!result?.ok){banner(result?.reason||"Choose a visible page item.");return;}
  showResult(result);
 }
 function onKey(event){if(event.key==="Escape"){event.preventDefault();close();}}
 function beginListening(){
  picking=true;
  banner("Move over an ad and click it to inspect. Esc cancels. No content leaves Firefox.");
  document.addEventListener("mouseover",onHover,true);
  document.addEventListener("click",onChoose,true);
  document.addEventListener("keydown",onKey,true);
 }
 async function start(){
  if(window.top!==window||!/^https?:$/.test(location.protocol)||!document.body||
     !globalThis.DKAdaptiveModel?.inspectAdCandidate||
     !globalThis.DKAdInvestigation?.inspect)return {ok:false,error:"Ad investigation is unavailable on this page."};
  try{
   const settings=await browser.runtime.sendMessage({action:"getStyle",url:location.href});
   if(!settings?.active)return {ok:false,error:"Enable DK Live Block for this site first."};
   activeExceptions=Array.isArray(settings.adRecognitionExceptions)?settings.adRecognitionExceptions.slice(0,120):[];
  }catch(_){return {ok:false,error:"Couldn't verify this site's protection settings."};}
  close();beginListening();
  return {ok:true};
 }
 function undo(){
  while(undoStack.length){
   const old=undoStack.pop(),el=old.el;
   if(!el?.isConnected||el.style?.getPropertyValue("display")!=="none"||
      el.style.getPropertyPriority("display")!=="important")continue;
   if(old.value)el.style.setProperty("display",old.value,old.priority);
   else el.style.removeProperty("display");
   return {restored:true};
  }
  return {restored:false};
 }
 browser.runtime.onMessage.addListener(msg=>{
  if(msg?.action==="startAdInvestigation")return start();
  if(msg?.action==="undoAiHide")return Promise.resolve(undo());
 });
})();
