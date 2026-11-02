/* Facebook-only DK Live Block ad removal.
   Ad-label decoding and safe rail/post resolution adapted from Inky's
   fb-sponsored-ad-post-blocker (MIT), Copyright (c) 2026 Inky.
   Full notice packaged at LICENSE-FACEBOOK-MIT.txt (source: licenses/facebook-sponsored-MIT.txt).
   No tracking, remote scripts or network-rule exceptions. */
(function(root){"use strict";
const ARTICLE='[role="article"],[data-pagelet^="FeedUnit"],[aria-posinset]';
const HEADING='h1,h2,h3,h4,h5,h6,[role="heading"]';
const ROOTS='main,[role="main"],[role="feed"],[role="navigation"],nav,form,[role="dialog"]';
function isFacebook(host){
 const modules=root.DKCompanyModules;
 if(modules)return modules.profileFor(host)?.platform==="facebook";
 return typeof host==="string"&&(host==="facebook.com"||host.endsWith(".facebook.com"));
}
function normalize(text){return String(text||"").replace(/[\p{Cf}\p{Mn}\p{Co}]/gu,"").replace(/[\s·•|]+/g," ").trim().toLowerCase();}
function isAdLabel(text){return normalize(text)==="ad"||normalize(text)==="sponsored";}
function ownText(el){let out="";for(const c of el?.childNodes||[]){if(c.nodeType===3)out+=String(c.textContent||"");if(out.length>120)return "";}return out;}

// Avoid expensive computed-style checks across arbitrary Facebook feed wrappers.
// Decode CSS-split labels only where all leaf spans have character-sized text.
function splitLabelRoot(el){
 let node=el;
 for(let d=0;d<4&&node;d++){
  const children=node.children||[];
  // "Ad" can be two single-letter spans. Do not perform expensive style
  // queries on arbitrary two-child wrappers: accept only an exact A+d pair.
  if(children.length===2&&Array.from(children).every(x=>
    x.tagName==="SPAN"&&!x.children?.length)){
   const pair=Array.from(children).map(x=>normalize(x.textContent||"")).join("");
   if(pair==="ad"||pair==="da")return node;
  }
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
// Bounded nested character-span decoder, adapted from the MIT blocker's
// ordered-leaves strategy. Only attempt on a tiny wrapper containing 4-48
// leaf spans: ordinary posts and large feed wrappers must never be traversed.
function nestedLabelVariants(el,win){
 if(!el||!el.children||el.children.length>3)return [];
 const raw=String(el.textContent||"");
 if(raw.length<2||raw.length>88)return [];
 const spans=el.querySelectorAll?.("span")||[];
 if(spans.length<4||spans.length>48)return [];
 const leaves=[];
 let invalid=false;
 function walk(node,depth){
  if(depth>4||leaves.length>50){invalid=true;return;}
  const childNodes=Array.from(node?.children||[]).slice(0,50);
  const parts=childNodes.map((child,index)=>{
   let order=index,hidden=false;
   try{
    const style=win?.getComputedStyle?.(child);
    const o=Number.parseInt(style?.order,10);
    if(Number.isFinite(o))order=o;
    hidden=style?.display==="none"||style?.visibility==="hidden";
   }catch(_){}
   return {child,index,order,hidden};
  }).sort((a,b)=>a.order-b.order||a.index-b.index);
  for(const part of parts){
   if(part.hidden)continue;
   const child=part.child;
   if(child?.tagName!=="SPAN"){invalid=true;return;} // Not a label.
   if((child.children?.length||0)===0){
    if(String(child.textContent||"").length>3){invalid=true;return;}
    leaves.push({value:String(child.textContent||""),
     classes:child.classList?.length||0});
   }else walk(child,depth+1);
  }
 }
 walk(el,0);
 if(invalid||leaves.length<4||leaves.length>48)return [];
 const make=keep=>leaves.filter(x=>keep(x.classes)).map(x=>x.value).join("");
 return [make(()=>true),make(x=>x>10),make(x=>x<=10)];
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
 }else{
  out.push(...nestedLabelVariants(el,win));
 }
 // Agent Nesty Meta 01: short, segmented CSS-ordered Sponsored labels.
 out.push(...(root.DKMetaAgentNesty?.segmentedLabels?.(el,win)||[]));
 try{out.push(el.getAttribute?.("aria-label"));}catch(_){}
 return out.filter(x=>typeof x==="string"&&x.length<=160);
}
function sponsoredMenu(el){
 const text=normalize(el?.getAttribute?.("aria-label"));
 return text.length<=200&&(
  /^(?:open menu for |actions for |more options for )(?:.{1,120} )?sponsored content$/.test(text)||
  text==="sponsored content"&&
    (el?.getAttribute?.("role")==="button"||el?.getAttribute?.("aria-haspopup")==="menu")||
  root.DKMetaAgentNesty?.sponsoredAction?.(el)===true
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
const CACHED_SPONSORED_TTL_MS=15000;
function cachedSponsored(entry,target,liveVariants,now=Date.now()){
 // A recently removed label can establish ephemeral ad evidence, but React
 // may reuse the same ID for a benign post. Live targets are authoritative.
 const value=typeof entry==="string"?entry:entry?.value;
 const at=typeof entry==="string"?now:entry?.at;
 if(!isAdLabel(value)||!Number.isFinite(at)||at>now||now-at>=CACHED_SPONSORED_TTL_MS)return "";
 if(target&&target.isConnected!==false&&String(target.textContent||"").trim()&&
    !liveVariants.some(isAdLabel))return "";
 return normalize(value);
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
  const saved=cachedSponsored(cache?.get?.(id),target,variants);
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

// MIT upstream approach: treat an exact short Ad/Sponsored label in the
// author's header as evidence, even when Facebook renders the author as a link
// rather than h2/h3/h4. Never accept body paragraphs or free-floating labels.
function explicitHeaderAd(label,card,win){
 if(!label||!card||!labelsOf(label,win).some(isAdLabel)||
    label.closest?.("p,blockquote,[role='paragraph'],[role='dialog']"))return false;
 const cardBox=card.getBoundingClientRect?.(),labelBox=label.getBoundingClientRect?.();
 if(!cardBox||!labelBox||labelBox.top<cardBox.top-6||
    labelBox.top>cardBox.top+Math.min(190,cardBox.height*0.36))return false;
 let n=label;
 for(let depth=0;depth<6&&n&&n!==card;depth++,n=n.parentElement){
  const parent=n.parentElement;if(!parent||!card.contains?.(parent))break;
  const box=parent.getBoundingClientRect?.();
  if(!box||box.height>190||String(parent.textContent||"").length>350)continue;
  const author=parent.querySelector?.("h2,h3,h4,[role='heading'],a[role='link'],a[href*='/profile.php'],a[href*='facebook.com/']");
  if(author&&!author.contains?.(label))return true;
 }
 return false;
}
function hasAdEvidence(card,doc,win,cache){
 if(card.querySelector?.('a[href*="/ads/about/"],a[href*="/ads/about?"]'))return true;
 const nodes=card.querySelectorAll?.('span,a,[aria-label],[aria-labelledby],use,text')||[];
 for(let i=0;i<Math.min(850,nodes.length);i++){
  const el=nodes[i];
  if(sponsoredMenu(el))return true;
  if(explicitHeaderAd(el,card,win))return true;
  if(!inByline(el,card))continue;
  if(labelsOf(el,win).some(isAdLabel)||referenceLabels(el,doc,cache,win).some(isAdLabel))return true;
 }
 return false;
}


// Nested list positions and quoted content are not separate feed posts.
// Count only independent article/pagelet anchors before hiding an ancestor.
// Adapted conceptually from the MIT blocker's holdsSeveralCards protections.
// A wrapper holding two real card-sized sibling posts is not itself a post.
// Facebook often reuses role="article" for shared/embedded content, so do not
// treat nested positional markers alone as proof of additional cards.
function holdsSeparatePostSiblings(card){
 let siblings=0;
 for(const child of Array.from(card?.children||[]).slice(0,60)){
  const r=child.getBoundingClientRect?.();
  if(!r||r.width<300||r.height<160)continue;
  const landmark=child.matches?.('[role="article"],[data-pagelet^="FeedUnit"]')||
   child.querySelector?.('[role="article"],[data-pagelet^="FeedUnit"]');
  if(landmark&&++siblings>1)return true;
 }
 return false;
}
function independentPostCount(card){
 if(holdsSeparatePostSiblings(card))return 2;
 const descendants=card.querySelectorAll?.(ARTICLE)||[];
 // An explicit article/FeedUnit is the post boundary. Nested list positions
 // (comments, cards, quotes) should not disqualify that same post.
 if(card.matches?.('[role="article"],[data-pagelet^="FeedUnit"]'))return 1;
 let independent=0;
 for(let i=0;i<Math.min(100,descendants.length);i++){
  const item=descendants[i];
  let p=item?.parentElement,nested=false;
  while(p&&p!==card){
   if(p.matches?.(ARTICLE)){nested=true;break;}
   p=p.parentElement;
  }
  if(!nested&&++independent>1)return independent;
 }
 return independent;
}
function safeCard(c,doc){
 if(!c||c===doc.body||c===doc.documentElement||c.isConnected===false||!c.style?.setProperty||
    c.matches?.(ROOTS)||c.closest?.('[role="dialog"],[role="complementary"],form,nav')||
    c.querySelector?.('main,[role="main"],[role="feed"],[role="navigation"],nav,[role="dialog"]'))return false;
 const r=c.getBoundingClientRect?.();
 return !!r&&r.width>=250&&r.width<=880&&r.height>=90&&r.height<=2500&&
   independentPostCount(c)<=1;
}
function feedCardFrom(label,doc){
 // Prefer a real post container over an aria-posinset used by other lists.
 const designated=label.closest?.('[role="article"],[data-pagelet^="FeedUnit"]')||
   label.closest?.('[aria-posinset]');
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



/* Selected MIT upstream integration: mobile Facebook uses a virtualised feed
   with no desktop article markers. A feed is recognized by a wide direct
   child of a many-child container; never hide an off-screen placeholder. */
function mobileLayout(doc){
 return !!doc?.body?.classList?.contains?.("html-renderer");
}
function marketplacePage(win){
 return /^\/marketplace(?:\/|$)/.test(String(win?.location?.pathname||""));
}
function marketplaceTileFrom(label,doc){
 let node=label;
 for(let depth=0;depth<25&&node?.parentElement;depth++,node=node.parentElement){
  const parent=node.parentElement;
  if(parent===doc.body||parent===doc.documentElement)break;
  const cells=parent.children||[];
  if(cells.length>=6){
   let listings=0;
   for(let j=0;j<Math.min(20,cells.length);j++)
    if(cells[j].querySelector?.('a[href*="/marketplace/item/"]')&&++listings>=2)break;
   if(listings>=2){
    const box=node.getBoundingClientRect?.();
    if(!box||box.width<120||box.width>650||box.height<90||box.height>1250||
       !node.style?.setProperty||!node.getClientRects?.().length||
       node.querySelectorAll?.('a[href*="/marketplace/item/"]').length!==1||
       node.querySelector?.('[role="feed"],[role="dialog"],main'))return null;
    return node;
   }
  }
  if(parent.matches?.(ROOTS))break;
 }
 return null;
}
function marketplaceSignal(label,tile,win){
 if(label.closest?.('p,blockquote,[role="paragraph"],[role="dialog"]'))return false;
 if(!sponsoredMenu(label)&&
    !labelsOf(label,win).some(x=>normalize(x)==="sponsored"))return false;
 const labelBox=label.getBoundingClientRect?.(),cardBox=tile.getBoundingClientRect?.();
 // Never hide a tile because the word Sponsored occurs in its description.
 // A true listing badge lives close to the tile's own upper edge.
 return !!labelBox&&!!cardBox&&labelBox.top>=cardBox.top-8&&
  labelBox.top<=cardBox.top+Math.min(110,cardBox.height*.32);
}
function mobilePostFrom(label,doc,win,onFeed){
 if(!mobileLayout(doc)||label.closest?.('nav,form,[role="dialog"],[role="navigation"]'))
  return null;
 let node=label;
 for(let depth=0;depth<16&&node?.parentElement;depth++,node=node.parentElement){
  const parent=node.parentElement;
  if(parent===doc.body||parent===doc.documentElement)return null;
  if((parent.children?.length||0)>=10){
   onFeed?.(parent);
   const minWidth=(parent.clientWidth||parent.getBoundingClientRect?.().width||0)*.6;
   const box=node.getBoundingClientRect?.();
   if(!box||box.width<Math.max(190,minWidth)||box.height<90||box.height>2500||
      !node.getClientRects?.().length||!node.style?.setProperty||
      (node.offsetWidth===0&&node.offsetHeight===0)||
      node.querySelector?.('main,[role="main"],[role="feed"],[role="dialog"]'))
    return null;
   // A post itself must not be a multi-post grid or a feed wrapper.
   if(independentPostCount(node)>1)return null;
   return node;
  }
  if(parent.matches?.(ROOTS))return null;
 }
 return null;
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
 const landmark=menu.closest?.('[role="article"],[data-pagelet^="FeedUnit"]')||
  menu.closest?.('[aria-posinset]');
 if(landmark&&safeCard(landmark,doc)&&landmark.contains?.(menu))return landmark;
 // Facebook also renders cards without article/pagelet attributes.
 // MIT-inspired whole-post resolution: an author may be a link, not an h2,
 // and the first plausible ancestor can be just a header or ad subsection.
 // Retain the *largest* safe single-post card; never climb into the feed.
 let node=menu,best=null;
 for(let depth=0;depth<12&&node?.parentElement;depth++,node=node.parentElement){
  const parent=node.parentElement;
  if(parent.matches?.(ROOTS)||parent===doc.body||parent===doc.documentElement)break;
  if(!safeCard(parent,doc))continue;
  const box=parent.getBoundingClientRect?.();
  if(!box||box.height<140||box.width<350)continue;
  if(best){
   const previous=best.getBoundingClientRect?.();
   if(previous&&box.width>previous.width*1.7&&box.width>previous.width+200)break;
  }
  const author=parent.querySelector?.('h2,h3,h4,[role="heading"],a[role="link"],a[href*="/profile.php"]');
  if(!author||author.contains?.(menu))continue;
  // A wrapper with multiple sponsored menus or independent post boundaries
  // is not a single card. This also protects ordinary sibling feed posts.
  const menus=parent.querySelectorAll?.('[aria-label]')||[];
  let sponsored=0;
  for(let i=0;i<Math.min(menus.length,100);i++)
   if(sponsoredMenu(menus[i])&&++sponsored>1)break;
  if(sponsored===1)best=parent;
 }
 return best;
}
function create(doc,win,max=100){
 const host=String(win?.location?.hostname||doc?.location?.hostname||"").toLowerCase();
 if(!isFacebook(host)||(win?.top&&win.top!==win))return null;
 const hidden=new Map(),cache=new Map(),limit=Math.max(1,Math.min(120,max));
 // Only aggregate counts. Never record Facebook post text, user IDs, URLs,
 // message contents or other personal information in detector diagnostics.
 const stats={scans:0,lastScanAt:0,lastHidden:0,lastFeedCards:0,
  lastRailSignals:0,lastRailUnresolved:0,lastMenuSignals:0,
  lastMenuUnresolved:0,lastBylineSignals:0,lastBylineUnresolved:0,
  recycledRestored:0,rechecks:0};
 let menuCursor=0;
 let mobileFeed=null,revealObserver=null,revealQueued=false;
 function watchMobileFeed(feed){
  if(!feed||typeof win?.IntersectionObserver!=="function")return;
  if(!revealObserver){
   revealObserver=new win.IntersectionObserver(entries=>{
    if(!entries.some(entry=>entry.isIntersecting)||revealQueued||!mobileFeed)return;
    revealQueued=true;
    const delay=typeof win?.setTimeout==="function"?win.setTimeout.bind(win):
     typeof setTimeout==="function"?setTimeout:null;
    if(!delay){revealQueued=false;return;}
    delay(()=>{
     revealQueued=false;
     // A pause or allowlist calls restore(), which disarms the observer.
     if(mobileFeed&&revealObserver)scan();
    },180);
   },{rootMargin:"800px"});
  }
  if(feed!==mobileFeed){revealObserver.disconnect();mobileFeed=feed;}
  const children=feed.children||[];
  for(let j=Math.max(0,children.length-200);j<children.length;j++)
   revealObserver.observe(children[j]);
 }
 function stopMobileWatch(){
  revealObserver?.disconnect();revealObserver=null;mobileFeed=null;revealQueued=false;
 }
 let exceptions=[];
 function allowed(el){return exceptions.some(s=>{try{return el.matches?.(s)||el.closest?.(s);}catch(_){return false;}});}
 function hide(el,trigger=null){
  if(!el||allowed(el)||hidden.has(el)||hidden.size>=limit||!el.style?.setProperty||
     el.isConnected===false||!el.getClientRects?.().length)return false;
  for(const other of hidden.keys())if(other.contains?.(el)||el.contains?.(other))return false;
  hidden.set(el,{value:el.style.getPropertyValue("display"),
   priority:el.style.getPropertyPriority("display"),trigger,
   hiddenAt:Date.now(),dirty:false,misses:0,lastMiss:0});
  el.style.setProperty("display","none","important");return true;
 }
 function restoreOne(el,old){
  if(el.style?.getPropertyValue("display")!=="none"||el.style.getPropertyPriority("display")!=="important")return;
  if(old.value)el.style.setProperty("display",old.value,old.priority);else el.style.removeProperty("display");
 }
 function stillSponsored(el,old){
  // Explicit label/attribution evidence, never mere card shape or Meta domain.
  const trigger=old.trigger;
  if(trigger&&trigger.isConnected!==false&&el.contains?.(trigger)){
   if(sponsoredMenu(trigger)||railAdLink(trigger)||
      labelsOf(trigger,win).some(isAdLabel)||
      referenceLabels(trigger,doc,cache,win).some(isAdLabel))return true;
  }
  if(el.querySelector?.('a[href*="/ads/about/"],a[href*="/ads/about?"],a[target="rhcad2"],a[attributionsrc*="/privacy_sandbox/comet/register/"]'))return true;
  if(el.matches?.(ARTICLE)||el.querySelector?.('[role="article"],[data-pagelet^="FeedUnit"]')){
   if(hasAdEvidence(el,doc,win,cache))return true;
  }
  const headings=el.querySelectorAll?.(HEADING)||[];
  for(let i=0;i<Math.min(12,headings.length);i++)
   if(isAdLabel(headings[i]?.textContent))return true;
  return false;
 }
 function flagChangedContainer(target){
  // Walk ancestors, never compare every mutation against every hidden card.
  let node=target?.nodeType===3?target.parentElement:target;
  for(let depth=0;node&&depth<32;depth++,node=node.parentElement){
   const old=hidden.get(node);
   if(old){old.dirty=true;return true;}
  }
  return false;
 }
 function restore(){stopMobileWatch();for(const [el,old]of hidden)restoreOne(el,old);hidden.clear();}
 function setExceptions(list){
  exceptions=Array.isArray(list)?list.filter(s=>typeof s==="string"&&s.length>0&&s.length<=240&&!/[\r\n{};]/.test(s)).slice(0,120):[];
  for(const [el,old]of hidden)if(allowed(el)||old.trigger&&allowed(old.trigger)){restoreOne(el,old);hidden.delete(el);}
 }
 function cacheAdId(id,text){
  if(!/^[A-Za-z0-9_:-]{1,90}$/.test(String(id||""))||!isAdLabel(text))return false;
  if(cache.size>=200&&!cache.has(id))cache.delete(cache.keys().next().value);
  cache.set(id,Object.freeze({value:normalize(text),at:Date.now()}));return true;
 }
 function remember(el){
  if(!el||el.nodeType!==1)return false;
  const record=n=>{
   const id=String(n.id||"");
   if(!/^[\w:-]{1,90}$/.test(id))return false;
   const text=referenceTargetLabels(n,win).find(isAdLabel);
   return text?cacheAdId(id,text):false;
  };
  let changed=record(el);const all=el.querySelectorAll?.("[id]")||[];
  for(let i=0;i<Math.min(60,all.length);i++)changed=record(all[i])||changed;
  return changed;
 }
 function observeMutation(r){
  if(!r)return false;
  const tracked=hidden.size?flagChangedContainer(r.target):false;
  if(r.type==="attributes")return r.attributeName==="aria-labelledby"||r.attributeName==="aria-label"||r.attributeName==="data-pagelet"||
   tracked||root.DKMetaAgentNesty?.labelMutation?.(r,win)===true;
  if(r.type==="characterData"){
   // An ephemeral ad-label portal can be OUTSIDE the feed. If its short text
   // changes, cache it and request a re-scan of the referencing post.
   const target=r.target,parent=target?.parentElement;
   const raw=String(target?.textContent||"");
   const cached=parent?.id?cacheAdId(parent.id,raw):false;
   if(raw.length>48)return false;
   const inFeed=!!parent?.closest?.(ARTICLE)||
     !!parent?.closest?.('main,[role="main"]');
   return cached||inFeed&&(isAdLabel(raw)||
     (parent&&labelsOf(parent,win).some(isAdLabel)));
  }
  if(r.type!=="childList")return false;
  const removed=r.removedNodes||[],added=r.addedNodes||[];
  let changed=false;
  for(let i=0;i<Math.min(12,removed.length);i++){
   const node=removed[i];
   if(node?.nodeType===3&&r.target?.id)
    changed=cacheAdId(r.target.id,node.textContent)||changed;
   else changed=remember(node)||changed;
  }
  for(let i=0;i<Math.min(12,added.length);i++){
   const node=added[i];
   if(node?.nodeType===3&&r.target?.id)
    changed=cacheAdId(r.target.id,node.textContent)||changed;
   else changed=remember(node)||changed;
  }
  return added.length>0||changed;
 }

 function scan(){
  if(!doc?.querySelectorAll||!doc.body)return 0;
  stats.scans++;stats.lastScanAt=Date.now();
  // Bounded evidence expiration: stale IDs must never persist indefinitely.
  for(const [id,entry] of cache){
   if(!entry||!Number.isFinite(entry.at)||entry.at>stats.lastScanAt||
      stats.lastScanAt-entry.at>=CACHED_SPONSORED_TTL_MS)cache.delete(id);
  }
  for(const key of ["lastHidden","lastFeedCards","lastRailSignals",
   "lastRailUnresolved","lastMenuSignals","lastMenuUnresolved",
   "lastBylineSignals","lastBylineUnresolved"])stats[key]=0;
  for(const [el,old]of hidden){
   if(el.isConnected===false){hidden.delete(el);continue;}
   // Respect a newly added exception immediately, including the original
   // Sponsored trigger. Never re-hide a user-excepted card.
   if(allowed(el)||old.trigger&&allowed(old.trigger)){
    restoreOne(el,old);hidden.delete(el);continue;
   }
   if((old.dirty||old.misses>0)&&Date.now()-old.hiddenAt>=1800){
    old.dirty=false;
    stats.rechecks++;
    if(stillSponsored(el,old)){old.misses=0;old.lastMiss=0;}
    else if(old.misses>=1&&Date.now()-old.lastMiss>=700){
     restoreOne(el,old);hidden.delete(el);stats.recycledRestored++;continue;
    }else{old.misses++;old.lastMiss=Date.now();}
   }
   if(el.style?.getPropertyValue("display")!=="none"){
    old.value=el.style.getPropertyValue("display");
    old.priority=el.style.getPropertyPriority("display");
    el.style.setProperty("display","none","important");
   }
  }
  let count=0;
  // Marketplace is a grid: an advertising label may hide ONE listing tile,
  // never the results grid, its filters, or ordinary shopping listings.
  if(marketplacePage(win)){
   const labels=doc.querySelectorAll('main span,main [aria-label],[role="main"] span,[role="main"] [aria-label]');
   for(let i=0;i<Math.min(3500,labels.length)&&count<15;i++){
    const label=labels[i];
    if((label.children?.length||0)>120)continue;
    const likely=sponsoredMenu(label)||labelsOf(label,win).some(x=>normalize(x)==="sponsored");
    if(!likely)continue;
    stats.lastBylineSignals++;
    const tile=marketplaceTileFrom(label,doc);
    if(!tile||!marketplaceSignal(label,tile,win)){stats.lastBylineUnresolved++;continue;}
    if(hide(tile,label))count++;
   }
   stats.lastHidden=count;
   return count;
  }
  // The mobile html-renderer virtualises feed items. Only touch rendered
  // full-width children, with IntersectionObserver rechecks on reveal.
  if(mobileLayout(doc)){
   const nodes=doc.querySelectorAll('span,a,[aria-label],[aria-labelledby],use,text');
   for(let i=0;i<Math.min(5000,nodes.length)&&count<15;i++){
    const label=nodes[i],split=splitLabelRoot(label);
    if((label.children?.length||0)>120||
       ((label.children?.length||0)>2&&!split))continue;
    const menu=sponsoredMenu(label);
    const direct=labelsOf(label,win).some(isAdLabel);
    const ref=!direct&&referenceLabels(label,doc,cache,win).some(isAdLabel);
    const explains=String(label.getAttribute?.("href")||"").includes("/ads/about/");
    if(!menu&&!direct&&!ref&&!explains)continue;
    stats.lastBylineSignals++;
    const card=mobilePostFrom(label,doc,win,watchMobileFeed);
    const first=card?.firstElementChild;
    // Mobile's own author row is the first subtree. A quoted or commented
    // "Sponsored" inside the body must never hide the parent post.
    if(!card||!first||!first.contains?.(label)){
     stats.lastBylineUnresolved++;continue;
    }
    if(hide(card,label))count++;
   }
   stats.lastHidden=count;
   return count;
  }
  // A role=complementary wrapper is not guaranteed on Facebook's new right rail.
  const headings=doc.querySelectorAll(HEADING);
  for(let i=0;i<Math.min(260,headings.length)&&count<15;i++){
   const h=headings[i];
   if(normalize(h.textContent)!=="sponsored")continue;
   stats.lastRailSignals++;
   const section=rightRailCandidate(h,doc,win);
   if(!section)stats.lastRailUnresolved++;
   if(section&&hide(section))count++;
  }
  // MIT-inspired rail fallback: Facebook can render the visible Sponsored
  // heading as an ordinary span rather than h1..h6 or role=heading. Examine
  // short, on-screen right-column labels and hide only a bounded rail section.
  // Unlike a broad text filter this never treats a feed post or Contacts as an ad.
  // Accessible Sponsored names may sit on a button/link rather than a span.
  // Keep this strictly inside the right rail; geometry + section guards apply.
  const railLabels=doc.querySelectorAll('span,[role="complementary"] div,aside div,[role="complementary"] [aria-label],aside [aria-label]');
  for(let i=0;i<Math.min(5500,railLabels.length)&&count<15;i++){
   const label=railLabels[i];
   // The visible right-rail Sponsored label can itself be character-split.
   // The old >4-children prefilter discarded it before labelsOf() decoded it.
   const childCount=label.children?.length||0;
   const split=splitLabelRoot(label);
   if((childCount>4&&!split)||childCount>120||
      (!split&&String(label.textContent||"").length>88))continue;
   const r=label.getBoundingClientRect?.();
   if(!r||r.left<Math.max(480,(win?.innerWidth||1200)*0.57)||
      r.width>270||r.height>80)continue;
   if(!labelsOf(label,win).some(x=>normalize(x)==="sponsored"))continue;
   stats.lastRailSignals++;
   const section=rightRailCandidate(label,doc,win);
   if(!section)stats.lastRailUnresolved++;
   if(section&&hide(section,label))count++;
  }
  // Advertiser-tagged links are detected even when "Sponsored" is obfuscated.
  const railLinks=doc.querySelectorAll('a[target="rhcad2"],a[attributionsrc],a[href*="utm_campaign"]');
  for(let i=0;i<Math.min(220,railLinks.length)&&count<15;i++){
   const card=rightRailLinkCard(railLinks[i],doc,win);
   if(railAdLink(railLinks[i]))stats.lastRailSignals++;
   if(!card&&railAdLink(railLinks[i]))stats.lastRailUnresolved++;
   if(card&&hide(card))count++;
  }
  const cards=doc.querySelectorAll(ARTICLE),seen=new Set();
  for(let i=0;i<Math.min(240,cards.length)&&count<15;i++){
   const card=cards[i];if(seen.has(card))continue;seen.add(card);
   if(safeCard(card,doc)&&hasAdEvidence(card,doc,win,cache)){
    stats.lastFeedCards++;
    if(hide(card))count++;
   }
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
    stats.lastMenuSignals++;
    if(++evidenceChecks>24)break;
    const card=sponsoredFeedCard(menu,doc,win);
    if(!card)stats.lastMenuUnresolved++;
    if(card&&hide(card,menu))count++;
   }
   menuCursor=(start+limitNodes)%menuNodes.length;
  }
  // Some feed advertisements only show the short "Ad" byline in ordinary
  // spans; require a plausible author-level heading and safe feed card shape.
  const bylines=doc.querySelectorAll('main span,[role="main"] span,main a,[role="main"] a');
  for(let i=0;i<Math.min(2400,bylines.length)&&count<15;i++){
   const el=bylines[i];
   // Real Facebook Sponsored labels may contain dozens of single-letter
   // spans (plus decoys). The decoder already supports them, so don't
   // reject the wrapper before it gets a chance to decode its letters.
   const split=splitLabelRoot(el),childCount=el.children?.length||0;
   if((childCount>2&&!split)||childCount>120||
      (!split&&String(el.textContent||"").length>45))continue;
   if(!labelsOf(el,win).some(isAdLabel))continue;
   stats.lastBylineSignals++;
   const card=feedCardFrom(el,doc);
   if(!card||!(inByline(el,card)||explicitHeaderAd(el,card,win)))
    stats.lastBylineUnresolved++;
   else if(hide(card))count++;
  }
  // A feed byline can reference a portal span or SVG sprite with all the ad
  // text outside the card. Walk ONLY referencing elements in the main feed;
  // an orphan portal cannot by itself justify hiding a full container.
  const refs=doc.querySelectorAll('main [aria-labelledby],main use,[role="main"] [aria-labelledby],[role="main"] use');
  for(let i=0;i<Math.min(1200,refs.length)&&count<15;i++){
   const el=refs[i];
   if(!referenceLabels(el,doc,cache,win).some(isAdLabel))continue;
   const card=feedCardFrom(el,doc);
   if(card&&(inByline(el,card)||explicitHeaderAd(el,card,win))&&hide(card))count++;
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
  stats.lastHidden=count;
  return count;
 }

 return {scan,restore,setExceptions,observeMutation,
  diagnostics(){return Object.freeze({platform:"facebook",hidden:hidden.size,
   cachedLabels:cache.size,limit,menuCursor,exceptions:exceptions.length,
   metaAgents:Object.freeze(root.DKMetaAgentNesty?.agents?.map(x=>x.id)||[]),...stats});},
  get hiddenCount(){return hidden.size;}};
}
const api={create,isFacebook,isAdLabel,labelsOf,inByline,referenceLabels,referenceTargetLabels,cachedSponsored,CACHED_SPONSORED_TTL_MS,hasAdEvidence,safeCard,holdsSeparatePostSiblings,railSection,feedCardFrom,rightRailCandidate,sponsoredMenu,railAdLink,rightRailLinkCard,splitLabelRoot,nestedLabelVariants,sponsoredFeedCard,mobileLayout,mobilePostFrom,marketplacePage,marketplaceTileFrom,marketplaceSignal};
root.DKFacebookAds=api;
if(typeof module!=="undefined")module.exports=api;
})(typeof globalThis!=="undefined"?globalThis:this);
