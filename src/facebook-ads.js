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

// Avoid expensive computed-style checks across arbitrary Facebook feed wrappers.
// Decode CSS-split labels only where all leaf spans have character-sized text.
function splitLabelRoot(el){
 let node=el;
 for(let d=0;d<4&&node;d++){
  const children=node.children||[];
  if(children.length>=4&&children.length<=120&&Array.from(children).every(x=>
    x.tagName==="SPAN"&&!x.children?.length&&String(x.textContent||"").length<=3))return node;
  node=children.length===1&&children[0].tagName==="SPAN"?children[0]:null;
 }
 return null;
}
function orderedPieces(el,win){
 return Array.from(el.children||[]).slice(0,120).map((child,index)=>{
  let order=index,hidden=false;
  try{
   const s=win?.getComputedStyle?.(child),n=Number.parseInt(s?.order,10);
   if(Number.isFinite(n))order=n;
   hidden=s?.display==="none"||s?.visibility==="hidden";
  }catch(_){}
  return {s:String(child.textContent||""),n:child.classList?.length||0,order,index,hidden};
 }).filter(x=>!x.hidden).sort((a,b)=>a.order-b.order||a.index-b.index);
}
function labelsOf(el,win){
 if(!el)return [];
 const out=[],direct=ownText(el);
 if(direct)out.push(direct);
 if(!el.children?.length&&String(el.textContent||"").length<=160)out.push(el.textContent);
 const split=splitLabelRoot(el);
 if(split){
  const leaves=orderedPieces(split,win);
  for(const keep of [()=>true,x=>x.n>10,x=>x.n<=10])
   out.push(leaves.filter(keep).map(x=>x.s).join(""));
 }
 try{out.push(el.getAttribute?.("aria-label"));}catch(_){}
 return out.filter(x=>typeof x==="string"&&x.length<=160);
}
function sponsoredMenu(el){
 const text=normalize(el?.getAttribute?.("aria-label"));
 return text.length<=200&&(
  /^(?:open menu for |actions for |more options for ).{1,120} sponsored content$/.test(text)||
  text==="sponsored content"&&
    (el?.getAttribute?.("role")==="button"||el?.getAttribute?.("aria-haspopup")==="menu")
 );
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
// Facebook can create an accessible ad label in an external SVG symbol or
// ephemeral portal span. Decode it at the reference target, including bounded
// scrambled character spans, and retain only explicit ad words in the cache.
// Reference interpretation adapted from Inky's MIT Facebook blocker.
function referenceTargetLabels(target,win){
 if(!target)return [];
 const variants=labelsOf(target,win);
 // SVG <symbol><text>Sponsored</text></symbol> renders the label inside
 // nested SVG nodes, not a flat span. Only read bounded known label targets.
 const tag=String(target.localName||target.tagName||"").toLowerCase();
 if(["symbol","text","title","span","svg"].includes(tag)&&
    (target.children?.length||0)<=24){
  const raw=String(target.textContent||"");
  if(raw.length<=64&&isAdLabel(raw))variants.push(raw);
 }
 return variants;
}
function referenceLabels(el,doc,cache,win){
 const out=[],ids=String(el?.getAttribute?.("aria-labelledby")||"").split(/\s+/).filter(Boolean).slice(0,10);
 const tag=String(el?.localName||el?.tagName||"").toLowerCase();
 const href=tag==="use"?(el.getAttribute?.("href")||el.getAttribute?.("xlink:href")||""):"";
 if(/^#[\w:-]{1,90}$/.test(href))ids.push(href.slice(1));
 const pieces=[];
 for(const id of ids){
  if(!/^[\w:-]{1,90}$/.test(id))continue;
  const target=doc?.getElementById?.(id);
  const variants=referenceTargetLabels(target,win);
  const saved=cache?.get?.(id);
  out.push(...variants);
  if(saved)out.push(saved);
  // Short referenced fragments may concatenate to spell Sponsored or Ad.
  const text=variants.find(isAdLabel)||variants.find(x=>String(x).length<=16)||saved||"";
  if(text)pieces.push(text);
 }
 if(pieces.length>=2&&pieces.length<=9){
  const combined=pieces.join("");
  if(combined.length<=100)out.push(combined);
 }
 return out.filter(x=>typeof x==="string"&&x.length<=160);
}

function hasAdEvidence(card,doc,win,cache){
 if(card.querySelector?.('a[href*="/ads/about/"],a[href*="/ads/about?"]'))return true;
 const nodes=card.querySelectorAll?.('span,a,[aria-label],[aria-labelledby],use,text')||[];
 for(let i=0;i<Math.min(850,nodes.length);i++){
  const el=nodes[i];
  if(sponsoredMenu(el))return true;
  if(!inByline(el,card))continue;
  if(labelsOf(el,win).some(isAdLabel)||referenceLabels(el,doc,cache,win).some(isAdLabel))return true;
 }
 return false;
}


function safeCard(c,doc){
 if(!c||c===doc.body||c===doc.documentElement||c.isConnected===false||!c.style?.setProperty||
    c.matches?.(ROOTS)||c.closest?.('[role="dialog"],[role="complementary"],form,nav')||
    c.querySelector?.('main,[role="main"],[role="feed"],[role="navigation"],nav,[role="dialog"]'))return false;
 const r=c.getBoundingClientRect?.();
 return !!r&&r.width>=250&&r.width<=880&&r.height>=90&&r.height<=2500&&
   (c.querySelectorAll?.(ARTICLE)?.length||0)<=1;
}
function feedCardFrom(label,doc){
 const designated=label.closest?.(ARTICLE);
 if(designated&&safeCard(designated,doc))return designated;
 let node=label,best=null;
 for(let i=0;i<14&&node?.parentElement;i++,node=node.parentElement){
  const p=node.parentElement;
  if(p===doc.body||p===doc.documentElement||p.matches?.(ROOTS)||p.closest?.('[role="dialog"],[role="complementary"]'))break;
  if(!safeCard(p,doc))continue;
  const r=p.getBoundingClientRect();
  if(r.width>=350&&r.height>=140)best=p;
 }
 return best;
}


function railSection(label,rail,doc,win){
 let node=label.closest?.(HEADING)||label,best=null;
 if(!node||!rail?.contains?.(node))return null;
 for(let i=0;i<11&&node.parentElement;i++){
  const p=node.parentElement;
  if(p===rail||p===rail.parentElement||p===doc.body||p===doc.documentElement||p.matches?.(ROOTS))break;
  const r=p.getBoundingClientRect?.();
  if(!r||r.width<180||r.width>480||r.height>900||r.height<1||
     r.left<Math.max(480,(win?.innerWidth||1200)*0.57))break;
  if(p.querySelector?.(ROOTS)||p.querySelector?.('video[controls]'))break;
  const headers=p.querySelectorAll?.(HEADING)||[];
  if(headers.length>8)break;
  if(Array.from(headers).some(h=>h!==label&&!label.contains?.(h)&&
    /^(contacts|birthdays|group chats|your pages|friends|suggested for you|your shortcuts)$/i.test(normalize(h.textContent))))break;
  if(r.height>=90&&(p.querySelector?.("img")||(p.querySelectorAll?.("a[href]")?.length||0)>=2))best=p;
  node=p;
 }
 return best&&best!==rail&&best!==doc.body?best:null;
}
function rightRailCandidate(label,doc,win){
 if(label.closest?.('main,[role="main"],[role="feed"],[role="article"],[data-pagelet^="FeedUnit"],[role="dialog"],form,nav'))return null;
 const r=label.getBoundingClientRect?.();
 if(!r||r.left<Math.max(480,(win?.innerWidth||1200)*0.57))return null;
 const rail=label.closest?.('[role="complementary"]')||doc.body;
 return railSection(label,rail,doc,win);
}

// uBlock Origin's public Facebook quick-fixes identify ads using right-rail
// link attributes as well as Sponsored headings. Require geometry and strict
// container bounds so normal feeds, contacts, and navigation remain untouched.
function railAdLink(a){
 if(!a||String(a.tagName||"").toLowerCase()!=="a")return false;
 const get=k=>String(a.getAttribute?.(k)||"");
 const rel=get("rel"),target=get("target"),href=get("href"),attr=get("attributionsrc");
 if(target==="rhcad2"&&/noreferrer/.test(rel))return true;
 if(attr.includes("/privacy_sandbox/comet/register/")&&attr.includes("eid="))return true;
 if(attr&&target==="_blank"&&/noreferrer/.test(rel)&&/^https?:\/\//i.test(href)&&a.querySelector?.("img"))return true;
 if(/noreferrer/.test(rel)&&/fbclid=/.test(href)&&/utm_medium=/.test(href)&&/utm_source=/.test(href)&&/utm_id=/.test(href)&&/utm_content=/.test(href)&&/utm_term=/.test(href)&&/utm_campaign=/.test(href))return true;
 return false;
}
function rightRailLinkCard(a,doc,win){
 if(!railAdLink(a)||!a.closest||!doc?.body)return null;
 if(a.closest('main,[role="main"],[role="feed"],[role="article"],[role="dialog"],nav,form'))return null;
 const r=a.getBoundingClientRect?.();
 if(!r||r.left<Math.max(480,(win?.innerWidth||1200)*0.57))return null;
 let node=a,best=null;
 for(let i=0;i<10&&node?.parentElement;i++,node=node.parentElement){
  const p=node.parentElement;
  if(p===doc.body||p===doc.documentElement||p.matches?.(ROOTS))break;
  const pr=p.getBoundingClientRect?.();
  if(!pr||pr.width<160||pr.width>480||pr.height>560||
     pr.left<Math.max(480,(win?.innerWidth||1200)*0.57))break;
  if(p.querySelector?.(ROOTS)||p.querySelector?.('video[controls]'))break;
  const headings=p.querySelectorAll?.(HEADING)||[];
  if(Array.from(headings).some(h=>/^(contacts|birthdays|group chats|friends|your pages|your shortcuts)$/i.test(normalize(h.textContent))))break;
  if(pr.height>=65&&(p.querySelector?.("img")||p.querySelector?.("a")))best=p;
 }
 return best;
}
// The owner reproduced a surviving sponsored feed post that the optional
// Ad Investigator identified via the post menu. Share its bounded card
// resolver instead of relying only on Facebook's article landmarks and a CSS
// suffix selector that misses labels with trailing whitespace/formatting.
function sponsoredFeedCard(menu,doc,win){
 if(!sponsoredMenu(menu)||menu.closest?.('nav,form,[role="dialog"],[role="navigation"],[role="complementary"]'))return null;
 const investigator=root.DKAdInvestigation;
 // Prefer the investigator's vetted choice, but never make automatic
 // filtering depend on an optional inspector module loading successfully.
 if(investigator?.candidateFor&&investigator?.factsFor){
  const card=investigator.candidateFor(menu,doc,win);
  if(card&&card.contains?.(menu)&&safeCard(card,doc)){
   const evidence=investigator.factsFor(card,doc,win);
   if(evidence?.sponsoredMenu&&!evidence.protectedContext)return card;
  }
 }
 // A feed landmark identifies one post without climbing into a surrounding
 // stream. Never hide the feed itself, a dialog, or a multi-post wrapper.
 const landmark=menu.closest?.(ARTICLE);
 if(landmark&&safeCard(landmark,doc)&&landmark.contains?.(menu))return landmark;
 // Facebook also renders cards without article/pagelet attributes.
 // Anchor on the local author heading, then take the first complete card.
 let node=menu;
 for(let depth=0;depth<11&&node?.parentElement;depth++,node=node.parentElement){
  const parent=node.parentElement;
  if(parent.matches?.(ROOTS)||parent===doc.body||parent===doc.documentElement)break;
  if(!safeCard(parent,doc))continue;
  const box=parent.getBoundingClientRect?.();
  if(!box||box.height<140||box.width<350)continue;
  if(!parent.querySelector?.('h2,h3,h4,[role="heading"]'))continue;
  // A wrapper with multiple post action menus is not a single card.
  const menus=parent.querySelectorAll?.('[aria-label]')||[];
  let sponsored=0;
  for(let i=0;i<Math.min(menus.length,100);i++)
   if(sponsoredMenu(menus[i])&&++sponsored>1)break;
  if(sponsored===1)return parent;
 }
 return null;
}
function create(doc,win,max=100){
 const host=String(win?.location?.hostname||doc?.location?.hostname||"").toLowerCase();
 if(!isFacebook(host)||(win?.top&&win.top!==win))return null;
 const hidden=new Map(),cache=new Map(),limit=Math.max(1,Math.min(120,max));
 let menuCursor=0;
 let exceptions=[];
 function allowed(el){return exceptions.some(s=>{try{return el.matches?.(s)||el.closest?.(s);}catch(_){return false;}});}
 function hide(el,trigger=null){
  if(!el||allowed(el)||hidden.has(el)||hidden.size>=limit||!el.style?.setProperty||
     el.isConnected===false||!el.getClientRects?.().length)return false;
  for(const other of hidden.keys())if(other.contains?.(el)||el.contains?.(other))return false;
  hidden.set(el,{value:el.style.getPropertyValue("display"),priority:el.style.getPropertyPriority("display"),trigger});
  el.style.setProperty("display","none","important");return true;
 }
 function restoreOne(el,old){
  if(el.style?.getPropertyValue("display")!=="none"||el.style.getPropertyPriority("display")!=="important")return;
  if(old.value)el.style.setProperty("display",old.value,old.priority);else el.style.removeProperty("display");
 }
 function restore(){for(const [el,old]of hidden)restoreOne(el,old);hidden.clear();}
 function setExceptions(list){
  exceptions=Array.isArray(list)?list.filter(s=>typeof s==="string"&&s.length>0&&s.length<=240&&!/[\r\n{};]/.test(s)).slice(0,120):[];
  for(const [el,old]of hidden)if(allowed(el)||old.trigger&&allowed(old.trigger)){restoreOne(el,old);hidden.delete(el);}
 }
 function remember(el){
  if(!el||el.nodeType!==1)return false;
  const record=n=>{
   const id=String(n.id||"");
   if(!/^[\w:-]{1,90}$/.test(id))return false;
   const text=referenceTargetLabels(n,win).find(isAdLabel);
   if(!text)return false;
   if(cache.size>=200&&!cache.has(id))cache.delete(cache.keys().next().value);
   cache.set(id,normalize(text));return true;
  };
  let changed=record(el);const all=el.querySelectorAll?.("[id]")||[];
  for(let i=0;i<Math.min(60,all.length);i++)changed=record(all[i])||changed;
  return changed;
 }
 function observeMutation(r){
  if(!r)return false;
  if(r.type==="attributes")return r.attributeName==="aria-labelledby"||r.attributeName==="aria-label"||r.attributeName==="data-pagelet";
  if(r.type==="characterData"){
   // React sometimes replaces a bare Ad/Sponsored label without adding nodes.
   return isAdLabel(r.target?.textContent);
  }
  if(r.type!=="childList")return false;
  const removed=r.removedNodes||[],added=r.addedNodes||[];
  let changed=false;
  for(let i=0;i<Math.min(12,removed.length);i++)changed=remember(removed[i])||changed;
  for(let i=0;i<Math.min(12,added.length);i++)changed=remember(added[i])||changed;
  return added.length>0||changed;
 }

 function scan(){
  if(!doc?.querySelectorAll||!doc.body||win?.innerWidth<650)return 0;
  for(const [el,old]of hidden){
   if(el.isConnected===false){hidden.delete(el);continue;}
   if(!allowed(el)&&el.style?.getPropertyValue("display")!=="none"){
    old.value=el.style.getPropertyValue("display");old.priority=el.style.getPropertyPriority("display");
    el.style.setProperty("display","none","important");
   }
  }
  let count=0;
  // A role=complementary wrapper is not guaranteed on Facebook's new right rail.
  const headings=doc.querySelectorAll(HEADING);
  for(let i=0;i<Math.min(260,headings.length)&&count<15;i++){
   const h=headings[i];
   if(normalize(h.textContent)!=="sponsored")continue;
   const section=rightRailCandidate(h,doc,win);
   if(section&&hide(section))count++;
  }
  // Advertiser-tagged links are detected even when "Sponsored" is obfuscated.
  const railLinks=doc.querySelectorAll('a[target="rhcad2"],a[attributionsrc],a[href*="utm_campaign"]');
  for(let i=0;i<Math.min(220,railLinks.length)&&count<15;i++){
   const card=rightRailLinkCard(railLinks[i],doc,win);
   if(card&&hide(card))count++;
  }
  const cards=doc.querySelectorAll(ARTICLE),seen=new Set();
  for(let i=0;i<Math.min(240,cards.length)&&count<15;i++){
   const card=cards[i];if(seen.has(card))continue;seen.add(card);
   if(safeCard(card,doc)&&hasAdEvidence(card,doc,win,cache)&&hide(card))count++;
  }
  // Automatic detection now uses the same concrete sponsored-menu fact
  // and bounded card identification that succeeded in the owner's inspector.
  // Read labels directly, not only [aria-label$="sponsored content"] (Facebook
  // can insert trailing whitespace or invisible formatting).
  const menuNodes=doc.querySelectorAll('[aria-label]');
  if(menuNodes.length){
   const limitNodes=Math.min(2200,menuNodes.length),start=menuCursor%menuNodes.length;
   let evidenceChecks=0;
   for(let i=0;i<limitNodes&&count<15;i++){
    const menu=menuNodes[(start+i)%menuNodes.length];
    if(!sponsoredMenu(menu)||allowed(menu))continue;
    if(++evidenceChecks>24)break;
    const card=sponsoredFeedCard(menu,doc,win);
    if(card&&hide(card,menu))count++;
   }
   menuCursor=(start+limitNodes)%menuNodes.length;
  }
  // Some feed advertisements only show the short "Ad" byline in ordinary
  // spans; require a plausible author-level heading and safe feed card shape.
  const bylines=doc.querySelectorAll('main span,[role="main"] span,main a,[role="main"] a');
  for(let i=0;i<Math.min(2400,bylines.length)&&count<15;i++){
   const el=bylines[i];
   if((el.children?.length||0)>2||String(el.textContent||"").length>45)continue;
   if(!labelsOf(el,win).some(isAdLabel))continue;
   const card=feedCardFrom(el,doc);
   if(card&&inByline(el,card)&&hide(card))count++;
  }
  // A feed byline can reference a portal span or SVG sprite with all the ad
  // text outside the card. Walk ONLY referencing elements in the main feed;
  // an orphan portal cannot by itself justify hiding a full container.
  const refs=doc.querySelectorAll('main [aria-labelledby],main use,[role="main"] [aria-labelledby],[role="main"] use');
  for(let i=0;i<Math.min(1200,refs.length)&&count<15;i++){
   const el=refs[i];
   if(!referenceLabels(el,doc,cache,win).some(isAdLabel))continue;
   const card=feedCardFrom(el,doc);
   if(card&&inByline(el,card)&&hide(card))count++;
  }
  // Fallback for ad-labelled feed cards without role=article or pagelet markup.
  const hard=doc.querySelectorAll('a[href*="/ads/about/"],a[href*="/ads/about?"],[aria-label$="sponsored content" i]');
  for(let i=0;i<Math.min(160,hard.length)&&count<15;i++){
   const el=hard[i];
   if(!sponsoredMenu(el)&&!el.getAttribute?.("href")?.includes("/ads/about"))continue;
   const card=feedCardFrom(el,doc);
   if(card&&hide(card)){count++;continue;}
   const section=rightRailCandidate(el,doc,win);
   if(section&&hide(section))count++;
  }
  return count;
 }

 return {scan,restore,setExceptions,observeMutation,get hiddenCount(){return hidden.size;}};
}
const api={create,isFacebook,isAdLabel,labelsOf,inByline,referenceLabels,referenceTargetLabels,hasAdEvidence,safeCard,railSection,feedCardFrom,rightRailCandidate,sponsoredMenu,railAdLink,rightRailLinkCard,splitLabelRoot,sponsoredFeedCard};
root.DKFacebookAds=api;
if(typeof module!=="undefined")module.exports=api;
})(typeof globalThis!=="undefined"?globalThis:this);
