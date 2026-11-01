/* Facebook-only DK Live Block ad removal.
   Ad-label decoding and safe rail/post resolution adapted from Inky's
   fb-sponsored-ad-post-blocker (MIT), Copyright (c) 2026 Inky.
   Full notice packaged at LICENSE-FACEBOOK-MIT.txt (source: licenses/facebook-sponsored-MIT.txt).
   No tracking, remote scripts or network-rule exceptions. */
(function(root){"use strict";
const ARTICLE='[role="article"],[data-pagelet^="FeedUnit"],[aria-posinset]';
const HEADING='h1,h2,h3,h4,h5,h6,[role="heading"]';
const ROOTS='main,[role="main"],[role="feed"],[role="navigation"],nav,form,[role="dialog"]';
function isFacebook(host){return typeof host==="string"&&(host==="facebook.com"||host.endsWith(".facebook.com"));}
function normalize(text){return String(text||"").replace(/[\p{Cf}\p{Mn}\p{Co}]/gu,"").replace(/[\s·•|]+/g," ").trim().toLowerCase();}
function isAdLabel(text){return normalize(text)==="ad"||normalize(text)==="sponsored";}
function ownText(el){let out="";for(const c of el?.childNodes||[]){if(c.nodeType===3)out+=String(c.textContent||"");if(out.length>120)return "";}return out;}
function labelsOf(el,win){
 if(!el)return [];
 const out=[];
 if(!el.children?.length)out.push(el.textContent);
 else{
  const direct=ownText(el);if(direct)out.push(direct);
  const kids=el.children;
  if(kids.length>=4&&kids.length<=96&&Array.from(kids).every(c=>
    c.tagName==="SPAN"&&!c.children?.length&&String(c.textContent||"").length<=3)){
   const pieces=Array.from(kids,(c,i)=>{
    let order=i,hidden=false;
    try{const s=win.getComputedStyle?.(c);if(s){
     const p=Number.parseInt(s.order,10);if(Number.isFinite(p))order=p;
     hidden=s.display==="none"||s.visibility==="hidden";
    }}catch(_){}
    return {s:String(c.textContent||""),order,i,n:c.classList?.length||0,hidden};
   }).filter(x=>!x.hidden).sort((a,b)=>a.order-b.order||a.i-b.i);
   for(const keep of [()=>true,x=>x.n>10,x=>x.n<=10])
    out.push(pieces.filter(keep).map(x=>x.s).join(""));
  }
 }
 try{out.push(el.getAttribute?.("aria-label"));}catch(_){}
 return out.filter(x=>typeof x==="string"&&x.length<=160);
}
function inByline(label,card){
 if(label.closest?.("p,blockquote,[role='paragraph'],[role='dialog']"))return false;
 let el=label;
 for(let depth=0;el&&el!==card&&depth<9;depth++,el=el.parentElement){
  const p=el.parentElement;
  if(!p||!card.contains?.(p))break;
  const name=p.querySelector?.("h2,h3,h4");
  if(!name||name.contains?.(label))continue;
  if(String(p.textContent||"").length>300||p.getBoundingClientRect?.().height>165)continue;
  if(name.compareDocumentPosition&&typeof Node!=="undefined"&&
     !(name.compareDocumentPosition(label)&Node.DOCUMENT_POSITION_FOLLOWING))continue;
  return true;
 }return false;
}
function referenceLabels(el,doc,cache){
 const out=[];
 const keys=String(el.getAttribute?.("aria-labelledby")||"").split(/\s+/).slice(0,10);
 for(const id of keys){if(!id)continue;out.push(doc.getElementById?.(id)?.textContent||cache.get(id)||"");}
 const href=el.localName==="use"||el.tagName==="use"?
  el.getAttribute?.("href")||el.getAttribute?.("xlink:href")||"":"";
 if(/^#[\w:-]{1,90}$/.test(href)){
  const id=href.slice(1);out.push(doc.getElementById?.(id)?.textContent||cache.get(id)||"");
 }return out;
}
function hasAdEvidence(card,doc,win,cache){
 if(card.querySelector?.('a[href*="/ads/about/"],a[href*="/ads/about?"]'))return true;
 const nodes=card.querySelectorAll?.('span,a,[aria-label],[aria-labelledby],use,text')||[];
 for(let i=0;i<Math.min(650,nodes.length);i++){
  const el=nodes[i];
  if(!inByline(el,card))continue;
  if(labelsOf(el,win).some(isAdLabel)||referenceLabels(el,doc,cache).some(isAdLabel))return true;
 }return false;
}
function safeCard(c,doc){
 if(!c||c===doc.body||c===doc.documentElement||c.isConnected===false||!c.style?.setProperty||
    c.matches?.(ROOTS)||c.querySelector?.(ROOTS)||c.closest?.('[role="dialog"]')||
    c.closest?.('[role="complementary"]'))return false;
 const r=c.getBoundingClientRect?.();
 return !!r&&r.width>=250&&r.width<=880&&r.height>=90&&r.height<=2500&&
  (c.querySelectorAll?.(ARTICLE)?.length||0)<=1;
}
function railSection(label,rail,doc){
 let node=label.closest?.(HEADING)||label,best=null;
 if(!node||!rail.contains?.(node))return null;
 for(let i=0;i<11&&node.parentElement&&node.parentElement!==rail;i++){
  const p=node.parentElement,headers=p.querySelectorAll?.(HEADING)||[];
  if(headers.length>5||p.querySelector?.(ROOTS))break;
  let other=false;
  for(let k=0;k<Math.min(30,headers.length);k++){
   const h=headers[k];
   if(h!==label&&!label.contains?.(h)&&/^(contacts|birthdays|group chats|your pages|friends)$/i.test(String(h.textContent||"").trim()))other=true;
  }
  if(other)break;
  const r=p.getBoundingClientRect?.();
  if(!r||r.width<180||r.width>480||r.height>850)break;
  if(r.height>=100&&(p.querySelector?.("img")||(p.querySelectorAll?.("a[href]")?.length||0)>=2))best=p;
  node=p;
 }
 return best&&best!==rail&&best!==doc.body?best:null;
}
function create(doc,win,max=100){
 const host=String(win?.location?.hostname||doc?.location?.hostname||"").toLowerCase();
 if(!isFacebook(host)||(win?.top&&win.top!==win))return null;
 const hidden=new Map(),cache=new Map(),limit=Math.max(1,Math.min(120,max));
 let exceptions=[];
 function allowed(el){return exceptions.some(s=>{try{return el.matches?.(s)||el.closest?.(s);}catch(_){return false;}});}
 function hide(el){
  if(!el||allowed(el)||hidden.has(el)||hidden.size>=limit||!el.style?.setProperty||
     el.isConnected===false||!el.getClientRects?.().length)return false;
  for(const other of hidden.keys())if(other.contains?.(el)||el.contains?.(other))return false;
  hidden.set(el,{value:el.style.getPropertyValue("display"),priority:el.style.getPropertyPriority("display")});
  el.style.setProperty("display","none","important");return true;
 }
 function restoreOne(el,old){
  if(el.style?.getPropertyValue("display")!=="none"||el.style.getPropertyPriority("display")!=="important")return;
  if(old.value)el.style.setProperty("display",old.value,old.priority);else el.style.removeProperty("display");
 }
 function restore(){for(const [el,old]of hidden)restoreOne(el,old);hidden.clear();}
 function setExceptions(list){
  exceptions=Array.isArray(list)?list.filter(s=>typeof s==="string"&&s.length>0&&s.length<=240&&!/[\r\n{};]/.test(s)).slice(0,120):[];
  for(const [el,old]of hidden)if(allowed(el)){restoreOne(el,old);hidden.delete(el);}
 }
 function remember(el){
  if(!el||el.nodeType!==1)return;
  const record=n=>{
   const id=String(n.id||""),text=String(n.textContent||"");
   if(id&&id.length<=100&&text.length<=60&&isAdLabel(text)){
    if(cache.size>=200)cache.delete(cache.keys().next().value);
    cache.set(id,text);
   }
  };
  record(el);const all=el.querySelectorAll?.("[id]")||[];
  for(let i=0;i<Math.min(60,all.length);i++)record(all[i]);
 }
 function observeMutation(r){
  if(!r)return false;
  if(r.type==="attributes")return r.attributeName==="aria-labelledby"||r.attributeName==="aria-label";
  if(r.type!=="childList")return false;
  const removed=r.removedNodes||[],added=r.addedNodes||[];
  for(let i=0;i<Math.min(12,removed.length);i++)remember(removed[i]);
  for(let i=0;i<Math.min(12,added.length);i++)remember(added[i]);
  return added.length>0;
 }
 function scan(){
  if(!doc?.querySelectorAll||!doc.body||win?.innerWidth<650)return 0;
  for(const el of hidden.keys())if(el.isConnected===false)hidden.delete(el);
  let count=0;
  const rails=doc.querySelectorAll('[role="complementary"]');
  for(let i=0;i<Math.min(8,rails.length);i++){
   const rail=rails[i],heads=rail.querySelectorAll?.(HEADING)||[];
   for(let k=0;k<Math.min(80,heads.length);k++){
    const h=heads[k];
    if(normalize(h.textContent)!=="sponsored")continue;
    const section=railSection(h,rail,doc);
    if(section&&hide(section))count++;
   }
  }
  const cards=doc.querySelectorAll(ARTICLE),seen=new Set();
  for(let i=0;i<Math.min(180,cards.length)&&count<15;i++){
   const card=cards[i];if(seen.has(card))continue;seen.add(card);
   if(safeCard(card,doc)&&hasAdEvidence(card,doc,win,cache)&&hide(card))count++;
  }
  return count;
 }
 return {scan,restore,setExceptions,observeMutation,get hiddenCount(){return hidden.size;}};
}
const api={create,isFacebook,isAdLabel,labelsOf,inByline,hasAdEvidence,safeCard,railSection};
root.DKFacebookAds=api;
if(typeof module!=="undefined")module.exports=api;
})(typeof globalThis!=="undefined"?globalThis:this);
