/* DK Live Block Build 239: explicit, private, movable ad investigation UI.
   An owner-triggered picker presents evidence and a draft; never sends DOM,
   URLs, labels, or model output to background servers or auto-saves rules. */
(function(){"use strict";
 if(typeof browser==="undefined"||!browser.runtime?.onMessage)return;
 const INFO_STYLE="position:fixed!important;z-index:2147483646!important;right:12px!important;top:12px!important;width:min(420px,calc(100vw - 24px))!important;max-height:85vh!important;overflow:auto!important;padding:14px!important;background:#09232a!important;color:#f1fbfb!important;border:2px solid #38e2da!important;border-radius:9px!important;box-shadow:0 8px 28px #000a!important;font:14px/1.45 system-ui,sans-serif!important;";
 let picking=false,overlay=null,highlight=null,oldOutline=null,selected=null,undoStack=[],activeExceptions=[],activeSelectors=[],inspectorNote="",panelPosition=null;
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
  const secondary=/^(Pick another|Cancel|Close)$/.test(title);
  const primary=title==="Hide this page item";
  const bg=primary?"#19d6cc":secondary?"#071a19":"#fafdfc";
  const fg=secondary?"#f1fbf8":"#042522";
  const border=secondary?"#608b84":primary?"#19d6cc":"#c8e6de";
  b.setAttribute("style","background:"+bg+"!important;color:"+fg+"!important;border:1px solid "+border+"!important;border-radius:5px!important;padding:8px 11px!important;margin:5px 6px 0 0!important;font:700 13px system-ui,sans-serif!important;cursor:pointer!important");
  b.addEventListener("click",event=>{event.preventDefault();event.stopPropagation();fn();});
  return b;
 }

 let dragging=null;
 function endPanelDrag(){
  if(!dragging)return;
  dragging=null;
  document.removeEventListener("pointermove",movePanel,true);
  document.removeEventListener("pointerup",releasePanel,true);
  document.removeEventListener("pointercancel",releasePanel,true);
 }
 function positionPanel(x,y){
  if(!overlay||!Number.isFinite(x)||!Number.isFinite(y))return;
  const r=overlay.getBoundingClientRect();
  const left=Math.max(0,Math.min(Math.max(0,window.innerWidth-r.width),x));
  const top=Math.max(0,Math.min(Math.max(0,window.innerHeight-r.height),y));
  overlay.style.setProperty("right","auto","important");
  overlay.style.setProperty("left",Math.round(left)+"px","important");
  overlay.style.setProperty("top",Math.round(top)+"px","important");
  panelPosition={left,top};
 }
 function movePanel(e){
  if(!dragging||dragging.id!==e.pointerId)return;
  positionPanel(dragging.left+e.clientX-dragging.x,dragging.top+e.clientY-dragging.y);
  e.preventDefault();e.stopPropagation();
 }
 function releasePanel(e){
  if(!dragging||dragging.id!==e.pointerId)return;
  endPanelDrag();e.stopPropagation();
 }
 function movableTitle(label){
  const title=make("div",label);
  title.tabIndex=0;
  title.setAttribute("role","group");
  title.setAttribute("aria-label","Drag to move DK Live Block panel. Arrow keys also move it.");
  title.setAttribute("title","Grab and drag to move this panel.");
  title.setAttribute("style","cursor:move!important;touch-action:none!important;user-select:none!important;font-weight:700!important;padding:4px 0 8px!important;border-bottom:1px solid #38e2da!important;");
  title.addEventListener("pointerdown",e=>{
   if(!overlay||e.isPrimary===false||(e.pointerType==="mouse"&&e.button!==0))return;
   endPanelDrag();
   const r=overlay.getBoundingClientRect();
   dragging={id:e.pointerId,x:e.clientX,y:e.clientY,left:r.left,top:r.top};
   document.addEventListener("pointermove",movePanel,true);
   document.addEventListener("pointerup",releasePanel,true);
   document.addEventListener("pointercancel",releasePanel,true);
   e.preventDefault();e.stopPropagation();
  });
  title.addEventListener("keydown",e=>{
   const directions={ArrowLeft:[-1,0],ArrowRight:[1,0],ArrowUp:[0,-1],ArrowDown:[0,1]};
   const d=directions[e.key];
   if(!d||!overlay)return;
   const r=overlay.getBoundingClientRect(),step=e.shiftKey?40:12;
   positionPanel(r.left+d[0]*step,r.top+d[1]*step);
   e.preventDefault();e.stopPropagation();
  });
  return title;
 }
 function close(){
  endPanelDrag();
  picking=false;restoreOutline();selected=null;activeExceptions=[];activeSelectors=[];inspectorNote="";panelPosition=null;
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
  overlay.replaceChildren(movableTitle("DK Live Block · Ad Investigator"),make("p",message));
  if(panelPosition)positionPanel(panelPosition.left,panelPosition.top);
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
  endPanelDrag();
  const head=movableTitle("DK Live Block · Local ad investigation");
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
  // User-requested DOM and cosmetic rule evidence inside the same movable
  // investigator window. Only explicit click triggers read-only inspection.
  const details=make("details");
  const summary=make("summary","DOM hierarchy & cosmetic filter matches");
  summary.setAttribute("style","cursor:pointer!important;font-weight:700!important;");
  details.appendChild(summary);
  const hierarchy=globalThis.DKInspectorDetails?.hierarchy?.(result.candidate,document)||[];
  details.appendChild(make("p","Selected item and parent tags (no page text, IDs or classes):"));
  for(let i=0,node=result.candidate;i<hierarchy.length&&node;i++,node=node.parentElement){
   const rowInfo=make("div",hierarchy[i].element+
     (hierarchy[i].size?" · "+hierarchy[i].size.width+"×"+hierarchy[i].size.height+" px":""));
   if(node!==document.body&&node!==document.documentElement&&i<hierarchy.length-1){
    const element=node;
    rowInfo.appendChild(button("Outline",()=>{
     mark(element);notice.textContent="Outlined hierarchy level "+(i+1)+". No rule was changed.";
    }));
   }
   details.appendChild(rowInfo);
  }
  const cosmetic=globalThis.DKInspectorDetails?.matchedCosmetics?.(result.candidate,activeSelectors);
  details.appendChild(make("p","Cosmetic selector matches: "+
    (cosmetic?.matches?.length||0)+" match(es) among "+(cosmetic?.checked||0)+" checked."));
  if(inspectorNote)details.appendChild(make("p",inspectorNote));
  for(const match of cosmetic?.matches||[]){
   details.appendChild(make("div",match.selector+" · "+match.where));
  }
  details.appendChild(make("p","A matching CSS selector is not proof that it hid anything. The Network Monitor and Site Dashboard show observed request decisions and their recorded rule sources."));
  overlay.appendChild(details);
  const tools=make("div");
  tools.setAttribute("style","border-top:1px solid #38e2da!important;margin-top:8px!important;padding-top:8px!important");
  const openTool=async tool=>{
   try{
    const response=await browser.runtime.sendMessage({action:"openInvestigatorTool",tool});
    notice.textContent=response?.ok?"Opened the DK Live Block "+(tool==="network"?"Network Monitor":tool==="dashboard"?"Site Dashboard":"Cosmetic Debugger")+
      ".":response?.error||"Unable to open the requested tool.";
   }catch(_){notice.textContent="Unable to open this DK tool. Open it from the extension toolbar.";}
  };
  tools.appendChild(button("Network log & tracker controls",()=>openTool("network")));
  tools.appendChild(button("Recorded rule details",()=>openTool("dashboard")));
  tools.appendChild(button("Cosmetic filter debugger",()=>openTool("cosmetic")));
  overlay.appendChild(tools);
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
  banner("Move over an ad and click it to inspect. Drag the title to move this panel. Esc cancels. No content leaves Firefox.");
  document.addEventListener("mouseover",onHover,true);
  document.addEventListener("click",onChoose,true);
  document.addEventListener("keydown",onKey,true);
 }
 async function start(){
  if(window.top!==window||!/^https?:$/.test(location.protocol)||!document.body||
     !globalThis.DKAdaptiveModel?.inspectAdCandidate||
     !globalThis.DKAdInvestigation?.inspect)return {ok:false,error:"Ad investigation is unavailable on this page."};
  close();
  try{
   const settings=await browser.runtime.sendMessage({action:"getStyle",url:location.href});
   if(!settings?.active)return {ok:false,error:"Enable DK Live Block for this site first."};
   activeExceptions=Array.isArray(settings.adRecognitionExceptions)?settings.adRecognitionExceptions.slice(0,120):[];
  }catch(_){return {ok:false,error:"Couldn't verify this site's protection settings."};}
  // Only when explicitly requested. No background DOM scrape or remote API.
  try{
   const evidence=await browser.runtime.sendMessage({action:"getInvestigatorCosmetics"});
   if(evidence?.ok&&Array.isArray(evidence.selectors))
    activeSelectors=evidence.selectors.slice(0,80);
   inspectorNote=String(evidence?.note||evidence?.error||"").slice(0,180);
  }catch(_){inspectorNote="Cosmetic selector list unavailable; local investigation still works.";}
  beginListening();
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
