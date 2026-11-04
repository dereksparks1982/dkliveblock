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
// Exact short localised disclosure markers; never partial-word search.
// The existing author/geometry gates still decide whether a post is an ad.
function isSponsoredLabel(text){
 const s=normalize(text);
 return s==="sponsored"||s==="реклама"||s==="спонсировано";
}
function isAdLabel(text){return normalize(text)==="ad"||isSponsoredLabel(text);}
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
// Build 298: Facebook can render the advertiser's name as a nested link,
// with a tiny "Ad" badge directly below it and no heading/article semantics.
// Require an exact badge, a real adjacent author link, and the upper portion
// of one bounded post. Do NOT trust the advertiser name, image or Meta domain.
function linkedAuthorAdByline(label,card,win){
 if(!label||!card||!labelsOf(label,win).some(isAdLabel)||
    label.closest?.('p,blockquote,[role="paragraph"],[role="dialog"],[role="complementary"],nav,form'))return false;
 const cardBox=card.getBoundingClientRect?.();
 const badge=label.getBoundingClientRect?.();
 if(!cardBox||!badge||!card.contains?.(label)||
    !Number.isFinite(cardBox.top)||!Number.isFinite(cardBox.height)||
    !Number.isFinite(badge.top)||!Number.isFinite(badge.left)||
    badge.top<cardBox.top-5||badge.top>cardBox.top+Math.min(130,cardBox.height*.34)||
    badge.height>38||badge.width>150||badge.left<cardBox.left-6||
    badge.left>cardBox.left+Math.min(240,cardBox.width*.52))return false;
 let ancestor=label;
 for(let depth=0;ancestor&&ancestor!==card&&depth<17;depth++,ancestor=ancestor.parentElement){
  const parent=ancestor.parentElement;
  if(!parent||!card.contains?.(parent))break;
  const rect=parent.getBoundingClientRect?.();
  if(!rect||rect.height>165||rect.height<15||String(parent.textContent||"").length>480)continue;
  const links=parent.querySelectorAll?.('a[role="link"],a[href]')||[];
  for(let i=0;i<Math.min(12,links.length);i++){
   const author=links[i];
   if(author===label||author.contains?.(label)||!card.contains?.(author)||
      author.closest?.('p,blockquote,[role="paragraph"],[role="dialog"],nav,form'))continue;
   const name=normalize(author.textContent);
   if(name.length<2||name.length>90||isAdLabel(name))continue;
   const ar=author.getBoundingClientRect?.();
   // The author text must actually sit just above the ad marker in the
   // same left-aligned byline column, not in the post body or actions.
   if(!ar||!Number.isFinite(ar.top)||!Number.isFinite(ar.left)||
      ar.height<8||ar.height>55||ar.width<12||ar.width>300||
      ar.top>badge.top+2||ar.top<badge.top-62||
      ar.left>badge.left+38||ar.right<badge.left-38)continue;
   return true;
  }
 }
 return false;
}
// The author ad disclosure is normally near the start, but React can place
// a referenced Sponsored menu after a large subtree. Preserve most of the
// original 850-element prefix and reserve 200 places for the newest tail.
function sampleEvidenceNodes(nodes,max=850){
 const n=nodes?.length;
 if(!nodes||typeof nodes!=="object"||!Number.isSafeInteger(n)||
    n<0||n>1000000||max!==850)return [];
 const out=[];
 if(n<=850){for(let i=0;i<n;i++)out.push(nodes[i]);}
 else{for(let i=0;i<650;i++)out.push(nodes[i]);for(let i=n-200;i<n;i++)out.push(nodes[i]);}
 return out;
}
function hasAdEvidence(card,doc,win,cache){
 if(card.querySelector?.('a[href*="/ads/about/"],a[href*="/ads/about?"]'))return true;
 const nodes=sampleEvidenceNodes(card.querySelectorAll?.('span,a,[aria-label],[aria-labelledby],use,text')||[]);
 for(const el of nodes){
  if(sponsoredMenu(el))return true;
  if(explicitHeaderAd(el,card,win)||linkedAuthorAdByline(el,card,win))return true;
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
// A wrapper with many children may contain distinct posts at the end.
function samplePostSiblings(nodes,max=60){
 const n=nodes?.length;
 if(!nodes||typeof nodes!=="object"||!Number.isSafeInteger(n)||
    n<0||n>1000000||max!==60)return [];
 const out=[];
 if(n<=60){for(let i=0;i<n;i++)out.push(nodes[i]);}
 else{for(let i=0;i<30;i++)out.push(nodes[i]);for(let i=n-30;i<n;i++)out.push(nodes[i]);}
 return out;
}
function holdsSeparatePostSiblings(card){
 let siblings=0;
 for(const child of samplePostSiblings(card?.children||[])){
  const r=child.getBoundingClientRect?.();
  if(!r||r.width<300||r.height<160)continue;
  const landmark=child.matches?.('[role="article"],[data-pagelet^="FeedUnit"]')||
   child.querySelector?.('[role="article"],[data-pagelet^="FeedUnit"]');
  if(landmark&&++siblings>1)return true;
 }
 return false;
}
// Last nested post anchors matter on oversized React wrapper trees.
function sampleIndependentAnchors(nodes,max=100){
 const n=nodes?.length;
 if(!nodes||typeof nodes!=="object"||!Number.isSafeInteger(n)||
    n<0||n>1000000||max!==100)return [];
 const out=[];
 if(n<=100){for(let i=0;i<n;i++)out.push(nodes[i]);}
 else{for(let i=0;i<50;i++)out.push(nodes[i]);for(let i=n-50;i<n;i++)out.push(nodes[i]);}
 return out;
}
function independentPostCount(card){
 if(holdsSeparatePostSiblings(card))return 2;
 const descendants=sampleIndependentAnchors(card.querySelectorAll?.(ARTICLE)||[]);
 // An explicit article/FeedUnit is the post boundary. Nested list positions
 // (comments, cards, quotes) should not disqualify that same post.
 if(card.matches?.('[role="article"],[data-pagelet^="FeedUnit"]'))return 1;
 let independent=0;
 for(let i=0;i<descendants.length;i++){
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
    c.matches?.(ROOTS)||c.closest?.('[role="dialog"],[role="complementary"],form,nav,[contenteditable="true"],[role="textbox"],[role="searchbox"]')||
    c.querySelector?.('main,[role="main"],[role="feed"],[role="navigation"],nav,[role="dialog"]')||
     c.querySelector?.('[contenteditable="true"],[role="textbox"],[role="searchbox"],textarea,input:not([type="hidden"])'))return false;
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
 for(let i=0;i<22&&node?.parentElement;i++,node=node.parentElement){
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
       node.querySelector?.('[role="feed"],[role="dialog"],main')||
     node.querySelector?.('[contenteditable="true"],[role="textbox"],[role="searchbox"],textarea,input:not([type="hidden"])'))return null;
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
    !labelsOf(label,win).some(x=>isSponsoredLabel(x)))return false;
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
      node.querySelector?.('main,[role="main"],[role="feed"],[role="dialog"]')||
      node.querySelector?.('[contenteditable="true"],[role="textbox"],[role="searchbox"],textarea,input:not([type="hidden"])'))
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
  if(p.querySelector?.(ROOTS)||p.querySelector?.('video[controls]')||
    p.querySelector?.('[contenteditable="true"],[role="textbox"],[role="searchbox"],textarea,input:not([type="hidden"])'))break;
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
 if(label.closest?.('main,[role="main"],[role="feed"],[role="article"],[data-pagelet^="FeedUnit"],[role="dialog"],form,nav,[contenteditable="true"],[role="textbox"],[role="searchbox"]'))return null;
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
  if(p.querySelector?.(ROOTS)||p.querySelector?.('video[controls]')||
     p.querySelector?.('[contenteditable="true"],[role="textbox"],[role="searchbox"],textarea,input:not([type="hidden"])'))break;
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
// Review the tail as well as the head of oversized child insertions.
function sampleAddedNodes(nodes,max=8){
 const n=nodes?.length;
 if(!nodes||typeof nodes!=="object"||!Number.isSafeInteger(n)||n<0||n>1000000||max!==8)return [];
 const result=[];
 if(n<=8){for(let i=0;i<n;i++)result.push(nodes[i]);}
 else{for(let i=0;i<4;i++)result.push(nodes[i]);for(let i=n-4;i<n;i++)result.push(nodes[i]);}
 return result;
}
// Observe both ends of React child-list churn to retain ephemeral labels
// without increasing the original twelve-node cache work limit.
function sampleChangedNodes(nodes,max=12){
 const n=nodes?.length;
 if(!nodes||typeof nodes!=="object"||!Number.isSafeInteger(n)||
    n<0||n>1000000||max!==12)return [];
 const out=[];
 if(n<=12){for(let i=0;i<n;i++)out.push(nodes[i]);}
 else{for(let i=0;i<6;i++)out.push(nodes[i]);for(let i=n-6;i<n;i++)out.push(nodes[i]);}
 return out;
}
// Check both ends of unusually long changed subtrees without
// increasing the original 100-element immediate scan work limit.
function sampleFastLabels(nodes,max=100){
 const n=nodes?.length;
 if(!nodes||typeof nodes!=="object"||!Number.isSafeInteger(n)||
    n<0||n>1000000||max!==100)return [];
 const out=[];
 if(n<=100){for(let i=0;i<n;i++)out.push(nodes[i]);}
 else{for(let i=0;i<50;i++)out.push(nodes[i]);for(let i=n-50;i<n;i++)out.push(nodes[i]);}
 return out;
}
// Keep cache discovery bounded while checking both ends of id-rich portals.
function samplePortalIds(nodes,max=60){
 const n=nodes?.length;
 if(!nodes||typeof nodes!=="object"||!Number.isSafeInteger(n)||
    n<0||n>1000000||max!==60)return [];
 const result=[];
 if(n<=60){for(let i=0;i<n;i++)result.push(nodes[i]);}
 else{for(let i=0;i<30;i++)result.push(nodes[i]);for(let i=n-30;i<n;i++)result.push(nodes[i]);}
 return result;
}
// A new React subtree can hold dozens of article descendants.
 // Keep the eighteen-article fast-pass cap, including its latest entries.
function sampleFastArticles(nodes,max=18){
 const n=nodes?.length;
 if(!nodes||typeof nodes!=="object"||!Number.isSafeInteger(n)||
    n<0||n>1000000||max!==18)return [];
 const out=[];
 if(n<=18){for(let i=0;i<n;i++)out.push(nodes[i]);}
 else{for(let i=0;i<9;i++)out.push(nodes[i]);for(let i=n-9;i<n;i++)out.push(nodes[i]);}
 return out;
}
function create(doc,win,max=100,onEvidence=null){
 const host=String(win?.location?.hostname||doc?.location?.hostname||"").toLowerCase();
 if(!isFacebook(host)||(win?.top&&win.top!==win))return null;
 const hidden=new Map(),cache=new Map(),limit=Math.max(1,Math.min(120,max));
 // Only aggregate counts. Never record Facebook post text, user IDs, URLs,
 // message contents or other personal information in detector diagnostics.
 const stats={scans:0,lastScanAt:0,lastHidden:0,lastFeedCards:0,
  lastRailSignals:0,lastRailUnresolved:0,lastMenuSignals:0,
  lastMenuUnresolved:0,lastBylineSignals:0,lastBylineUnresolved:0,
  recycledRestored:0,rechecks:0,fastScans:0,fastHidden:0,visibleScans:0,visibleHidden:0,visibleFallbackHidden:0};
 let menuCursor=0,articleCursor=0,bylineCursor=0,referenceCursor=0;
 let railHeadingCursor=0,railLabelCursor=0,railLinkCursor=0,marketplaceCursor=0,mobileCursor=0,hardCursor=0;
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
 function hide(el,trigger=null,kind=""){
  if(!el||allowed(el)||hidden.has(el)||hidden.size>=limit||!el.style?.setProperty||
     el.isConnected===false||!el.getClientRects?.().length)return false;
  for(const other of hidden.keys())if(other.contains?.(el)||el.contains?.(other))return false;
  hidden.set(el,{value:el.style.getPropertyValue("display"),
   priority:el.style.getPropertyPriority("display"),trigger,
   hiddenAt:Date.now(),dirty:false,misses:0,lastMiss:0});
  el.style.setProperty("display","none","important");
  // Existing vetted hide succeeds before any Nesty observation.
  // No DOM node, URL, post text or identity crosses this interface.
  if(typeof onEvidence==="function"&&["feed","menu","rail","marketplace"].includes(kind))
   try{onEvidence(kind);}catch(_){}
  return true;
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
  let changed=record(el);const all=samplePortalIds(el.querySelectorAll?.("[id]")||[]);
  for(const candidate of all)changed=record(candidate)||changed;
  return changed;
 }
 function observeMutation(r){
  if(!r)return false;
  const tracked=hidden.size?flagChangedContainer(r.target):false;
  if(r.type==="attributes"){
   // A referenced portal/SVG Sponsored label can change appearance outside
   // the feed. Remember only an exact short ad label with a bounded ID.
   const portal=root.DKMetaAgentNesty?.portalMutation?.(r);
   const remembered=portal?cacheAdId(portal.id,portal.label):false;
   return remembered||r.attributeName==="aria-labelledby"||
    r.attributeName==="aria-label"||r.attributeName==="data-pagelet"||
    tracked||root.DKMetaAgentNesty?.labelMutation?.(r,win)===true;
  }
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
  for(const node of sampleChangedNodes(removed)){
   if(node?.nodeType===3&&r.target?.id)
    changed=cacheAdId(r.target.id,node.textContent)||changed;
   else changed=remember(node)||changed;
  }
  for(const node of sampleChangedNodes(added)){
   if(node?.nodeType===3&&r.target?.id)
    changed=cacheAdId(r.target.id,node.textContent)||changed;
   else changed=remember(node)||changed;
  }
  return added.length>0||changed;
 }

 // Inspect changed Facebook post subtrees inside the MutationObserver callback,
 // before the next paint. Do not traverse the entire feed on every mutation:
 // full scan() remains the bounded fallback for late/split labels and portals.
 function scanInserted(records){
  if(!doc?.body||!Array.isArray(records)||!records.length||marketplacePage(win)||mobileLayout(doc))return 0;
  // Marketplace grids and mobile html-renderer feeds have specialized
  // article/author boundaries. Only their dedicated scan() may hide content.
  stats.fastScans++;
  const roots=new Set(),cards=new Set();
  const take=node=>{
   if(node?.nodeType===3)node=node.parentElement;
   if(!node||node.nodeType!==1||node.isConnected===false||roots.size>=32||
      node===doc.body||node===doc.documentElement)return;
   roots.add(node);
  };
  // React often reports unimportant class/style churn before a new ad.
  // Reserve the bounded root budget for insertions and changed ad labels
  // FIRST; only then inspect ordinary attribute/child-list targets. Without
  // this priority a 32-root cap could discard a sampled late Sponsored post.
  const batch=records.slice(0,40);
  // Reserve twelve of thirty-two roots for changed text and explicit label
  // attributes. An insertion storm must not crowd out a late Ad label.
  const priorityRecords=batch.filter(r=>r?.type==="characterData"||
    r?.type==="attributes"&&["aria-label","aria-labelledby","data-pagelet"].includes(r.attributeName));
  // When more than twelve label changes arrive, reserve six slots for the
  // tail instead of letting the first twelve changes starve the newest ad.
  const urgent=priorityRecords.length<=12?priorityRecords:
   [...priorityRecords.slice(0,6),...priorityRecords.slice(-6)];
  let priorityRoots=0;
  for(const r of urgent){
   if(priorityRoots>=12)break;
   const previous=roots.size;
   take(r.target);
   if(roots.size>previous)priorityRoots++;
  }
  // Reserve eight of the original 32 roots, from the newest records
  // first. A noisy older tail record must not consume all reserved slots.
  let tailRoots=0;
  for(const r of batch.slice(-4).reverse())if(r?.type==="childList")
   for(const node of sampleAddedNodes(r.addedNodes)){
    if(tailRoots>=8)break;
    const size=roots.size;take(node);
    if(roots.size>size)tailRoots++;
   }
  for(const r of batch)if(r?.type==="childList")
   for(const node of sampleAddedNodes(r.addedNodes))take(node);
  for(const r of batch)if(r?.type==="attributes"||r?.type==="characterData"||r?.type==="childList")
   take(r.target);
  let count=0,inspected=0;
  const consider=card=>{
   if(!card||cards.has(card)||cards.size>=28)return;
   cards.add(card);
   if(safeCard(card,doc)&&hasAdEvidence(card,doc,win,cache)&&hide(card,null,"feed"))count++;
  };
  for(const rootNode of roots){
   if(inspected>=320||count>=15)break;
   // A new article can be detected even when its Sponsored label is a
   // separate nested mutation. This path does not depend on scroll speed.
   consider(rootNode.matches?.(ARTICLE)?rootNode:rootNode.closest?.(ARTICLE));
   const articles=sampleFastArticles(rootNode.querySelectorAll?.(ARTICLE)||[]);
   for(const article of articles)if(count<15)consider(article);
   // Facebook also uses non-article cards and character-split labels.
   // Restrict candidates to changed subtrees, and reuse vetted resolvers.
   const labels=[rootNode,...sampleFastLabels(rootNode.querySelectorAll?.(
    'span,a,[aria-label],[aria-labelledby],use,text,h1,h2,h3,h4,h5,h6,[role="heading"]'
   )||[])];
   for(const el of labels){
    if(++inspected>320||count>=15)break;
    if(sponsoredMenu(el)){
     const card=sponsoredFeedCard(el,doc,win);
     if(card&&hide(card,el,"menu"))count++;
    }
    const values=labelsOf(el,win);
    if(values.some(isAdLabel)){
     const card=feedCardFrom(el,doc);
     if(card&&(inByline(el,card)||explicitHeaderAd(el,card,win)||linkedAuthorAdByline(el,card,win))&&hide(card,el,"feed"))count++;
     // Right-rail handling retains the existing strict geometry/Contacts guard.
     if(values.some(v=>isSponsoredLabel(v))){
      const rail=rightRailCandidate(el,doc,win);
      if(rail&&hide(rail,el,"rail"))count++;
     }
    }
    if(el.tagName==="A"&&railAdLink(el)){
     const rail=rightRailLinkCard(el,doc,win);
     if(rail&&hide(rail,el,"rail"))count++;
    }
   }
  }
  stats.fastHidden+=count;
  return count;
 }

 // A visible media/image descendant is not always inside role=article.
 // Resolve the largest safe single-card ancestor inside a bounded climb,
 // never the feed, navigation, composer, dialog or independent-post wrapper.
 // The article landmark remains a fast path; the fallback is evidence-gated.
 function visibleFeedCardFrom(point){
  if(!point||point.nodeType!==1)return null;
  let best=null,usedFallback=false;
  const declared=point.closest?.('[role="article"],[data-pagelet^="FeedUnit"],[aria-posinset]');
  if(declared&&safeCard(declared,doc)){best=declared;}
  let node=point;
  for(let depth=0;node&&depth<24;depth++,node=node.parentElement){
   if(node===doc.body||node===doc.documentElement||node.matches?.(ROOTS)||
      node.closest?.('[role="dialog"],[role="complementary"],nav,form'))break;
   const r=node.getBoundingClientRect?.();
   if(!r||r.width<350||r.width>880||r.height<140||r.height>2500)continue;
   if(safeCard(node,doc)){best=node;usedFallback=node!==declared;}
  }
  return best?{card:best,fallback:usedFallback}:null;
 }
 // Prioritise the actual visible feed, including React cards without article
 // markers. Fifteen fixed viewport probes, no all-DOM bounding-box traversal.
 // Never hide on the literal text "Ad" alone: require vetted header or
 // attribution evidence and an independently safe complete post boundary.
 function scanVisible(){
  if(!doc?.body||typeof doc.elementFromPoint!=="function"||
     marketplacePage(win)||mobileLayout(doc))return 0;
  const width=Number(win?.innerWidth),height=Number(win?.innerHeight);
  if(!Number.isFinite(width)||!Number.isFinite(height)||width<320||height<240)return 0;
  stats.visibleScans++;
  const seen=new Set();let count=0;
  for(const y of [0.18,0.36,0.54,0.72,0.89]){
   for(const x of [0.34,0.50,0.66]){
    let node=null;
    try{node=doc.elementFromPoint(Math.floor(width*x),Math.floor(height*y));}catch(_){}
    if([...seen].some(card=>card.contains?.(node)))continue;
    const chosen=visibleFeedCardFrom(node),card=chosen?.card;
    if(!card||seen.has(card)||seen.size>=15)continue;
    seen.add(card);
    if(hidden.has(card)||!hasAdEvidence(card,doc,win,cache))continue;
    if(hide(card,null,"feed")){
     count++;stats.visibleHidden++;
     if(chosen.fallback)stats.visibleFallbackHidden++;
    }
   }
  }
  return count;
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
   let marketplaceInspected=0;
   for(;marketplaceInspected<Math.min(3500,labels.length)&&count<15;marketplaceInspected++){
    const label=labels[(marketplaceCursor+marketplaceInspected)%labels.length];
    if((label.children?.length||0)>120)continue;
    const likely=sponsoredMenu(label)||labelsOf(label,win).some(x=>isSponsoredLabel(x));
    if(!likely)continue;
    stats.lastBylineSignals++;
    const tile=marketplaceTileFrom(label,doc);
    if(!tile||!marketplaceSignal(label,tile,win)){stats.lastBylineUnresolved++;continue;}
    if(hide(tile,label,"marketplace"))count++;
   }
   marketplaceCursor=labels.length?(marketplaceCursor+marketplaceInspected)%labels.length:0;
   stats.lastHidden=count;
   return count;
  }
  // The mobile html-renderer virtualises feed items. Only touch rendered
  // full-width children, with IntersectionObserver rechecks on reveal.
  if(mobileLayout(doc)){
   const nodes=doc.querySelectorAll('span,a,[aria-label],[aria-labelledby],use,text');
   let mobileInspected=0;
   for(;mobileInspected<Math.min(5000,nodes.length)&&count<15;mobileInspected++){
    const label=nodes[(mobileCursor+mobileInspected)%nodes.length],split=splitLabelRoot(label);
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
    if(hide(card,label,"feed"))count++;
   }
   mobileCursor=nodes.length?(mobileCursor+mobileInspected)%nodes.length:0;
   stats.lastHidden=count;
   return count;
  }
  // Check actual visible feed cards before any rotating full-page windows.
  count+=scanVisible();
  // A role=complementary wrapper is not guaranteed on Facebook's new right rail.
  const headings=doc.querySelectorAll(HEADING);
  let headingInspected=0;
  for(;headingInspected<Math.min(260,headings.length)&&count<15;headingInspected++){
   const h=headings[(railHeadingCursor+headingInspected)%headings.length];
   if(!isSponsoredLabel(h.textContent))continue;
   stats.lastRailSignals++;
   const section=rightRailCandidate(h,doc,win);
   if(!section)stats.lastRailUnresolved++;
   if(section&&hide(section,null,"rail"))count++;
  }
  railHeadingCursor=headings.length?(railHeadingCursor+headingInspected)%headings.length:0;
  // MIT-inspired rail fallback: Facebook can render the visible Sponsored
  // heading as an ordinary span rather than h1..h6 or role=heading. Examine
  // short, on-screen right-column labels and hide only a bounded rail section.
  // Unlike a broad text filter this never treats a feed post or Contacts as an ad.
  // Accessible Sponsored names may sit on a button/link rather than a span.
  // Keep this strictly inside the right rail; geometry + section guards apply.
  const railLabels=doc.querySelectorAll('span,[role="complementary"] div,aside div,[role="complementary"] [aria-label],aside [aria-label]');
  let railInspected=0;
  for(;railInspected<Math.min(5500,railLabels.length)&&count<15;railInspected++){
   const label=railLabels[(railLabelCursor+railInspected)%railLabels.length];
   // The visible right-rail Sponsored label can itself be character-split.
   // The old >4-children prefilter discarded it before labelsOf() decoded it.
   const childCount=label.children?.length||0;
   const split=splitLabelRoot(label);
   if((childCount>4&&!split)||childCount>120||
      (!split&&String(label.textContent||"").length>88))continue;
   const r=label.getBoundingClientRect?.();
   if(!r||r.left<Math.max(480,(win?.innerWidth||1200)*0.57)||
      r.width>270||r.height>80)continue;
   if(!labelsOf(label,win).some(x=>isSponsoredLabel(x)))continue;
   stats.lastRailSignals++;
   const section=rightRailCandidate(label,doc,win);
   if(!section)stats.lastRailUnresolved++;
   if(section&&hide(section,label,"rail"))count++;
  }
  railLabelCursor=railLabels.length?(railLabelCursor+railInspected)%railLabels.length:0;
  // Advertiser-tagged links are detected even when "Sponsored" is obfuscated.
  const railLinks=doc.querySelectorAll('a[target="rhcad2"],a[attributionsrc],a[href*="utm_campaign"]');
  let linkInspected=0;
  for(;linkInspected<Math.min(220,railLinks.length)&&count<15;linkInspected++){
   const link=railLinks[(railLinkCursor+linkInspected)%railLinks.length];
   const card=rightRailLinkCard(link,doc,win);
   if(railAdLink(link))stats.lastRailSignals++;
   if(!card&&railAdLink(link))stats.lastRailUnresolved++;
   if(card&&hide(card,null,"rail"))count++;
  }
  railLinkCursor=railLinks.length?(railLinkCursor+linkInspected)%railLinks.length:0;
  const cards=doc.querySelectorAll(ARTICLE),seen=new Set();
  // Rotate the same bounded window; a long feed must not starve late posts.
  let articleInspected=0;
  for(;articleInspected<Math.min(240,cards.length)&&count<15;articleInspected++){
   const card=cards[(articleCursor+articleInspected)%cards.length];
   if(seen.has(card))continue;seen.add(card);
   if(safeCard(card,doc)&&hasAdEvidence(card,doc,win,cache)){
    stats.lastFeedCards++;
    if(hide(card,null,"feed"))count++;
   }
  }
  articleCursor=cards.length?(articleCursor+articleInspected)%cards.length:0;
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
    if(card&&hide(card,menu,"menu"))count++;
   }
   menuCursor=(start+limitNodes)%menuNodes.length;
  }
  // Some feed advertisements only show the short "Ad" byline in ordinary
  // spans; require a plausible author-level heading and safe feed card shape.
  const bylines=doc.querySelectorAll('main span,[role="main"] span,main a,[role="main"] a');
  let bylineInspected=0;
  for(;bylineInspected<Math.min(2400,bylines.length)&&count<15;bylineInspected++){
   const el=bylines[(bylineCursor+bylineInspected)%bylines.length];
   // Real Facebook Sponsored labels may contain dozens of single-letter
   // spans (plus decoys). The decoder already supports them, so don't
   // reject the wrapper before it gets a chance to decode its letters.
   const split=splitLabelRoot(el),childCount=el.children?.length||0;
   if((childCount>2&&!split)||childCount>120||
      (!split&&String(el.textContent||"").length>45))continue;
   if(!labelsOf(el,win).some(isAdLabel))continue;
   stats.lastBylineSignals++;
   const card=feedCardFrom(el,doc);
   if(!card||!(inByline(el,card)||explicitHeaderAd(el,card,win)||linkedAuthorAdByline(el,card,win)))
    stats.lastBylineUnresolved++;
   else if(hide(card,el,"feed"))count++;
  }
  bylineCursor=bylines.length?(bylineCursor+bylineInspected)%bylines.length:0;
  // A feed byline can reference a portal span or SVG sprite with all the ad
  // text outside the card. Walk ONLY referencing elements in the main feed;
  // an orphan portal cannot by itself justify hiding a full container.
  const refs=doc.querySelectorAll('main [aria-labelledby],main use,[role="main"] [aria-labelledby],[role="main"] use');
  let referenceInspected=0;
  for(;referenceInspected<Math.min(1200,refs.length)&&count<15;referenceInspected++){
   const el=refs[(referenceCursor+referenceInspected)%refs.length];
   if(!referenceLabels(el,doc,cache,win).some(isAdLabel))continue;
   const card=feedCardFrom(el,doc);
   if(card&&(inByline(el,card)||explicitHeaderAd(el,card,win)||linkedAuthorAdByline(el,card,win))&&hide(card,el,"feed"))count++;
  }
  referenceCursor=refs.length?(referenceCursor+referenceInspected)%refs.length:0;
  // Fallback for ad-labelled feed cards without role=article or pagelet markup.
  const hard=doc.querySelectorAll('a[href*="/ads/about/"],a[href*="/ads/about?"],[aria-label$="sponsored content" i]');
  let hardInspected=0;
  for(;hardInspected<Math.min(160,hard.length)&&count<15;hardInspected++){
   const el=hard[(hardCursor+hardInspected)%hard.length];
   if(!sponsoredMenu(el)&&!el.getAttribute?.("href")?.includes("/ads/about"))continue;
   const card=feedCardFrom(el,doc);
   if(card&&hide(card,null,"feed")){count++;continue;}
   const section=rightRailCandidate(el,doc,win);
   if(section&&hide(section,null,"rail"))count++;
  }
  hardCursor=hard.length?(hardCursor+hardInspected)%hard.length:0;
  stats.lastHidden=count;
  return count;
 }

 return {scan,scanVisible,scanInserted,restore,setExceptions,observeMutation,
  diagnostics(){return Object.freeze({platform:"facebook",hidden:hidden.size,
   cachedLabels:cache.size,limit,menuCursor,articleCursor,bylineCursor,referenceCursor,
   railHeadingCursor,railLabelCursor,railLinkCursor,marketplaceCursor,mobileCursor,hardCursor,exceptions:exceptions.length,
   metaAgents:Object.freeze(root.DKMetaAgentNesty?.agents?.map(x=>x.id)||[]),...stats});},
  get hiddenCount(){return hidden.size;}};
}
const api={create,sampleAddedNodes,sampleChangedNodes,sampleFastLabels,samplePortalIds,sampleFastArticles,sampleEvidenceNodes,samplePostSiblings,sampleIndependentAnchors,isFacebook,isAdLabel,isSponsoredLabel,labelsOf,inByline,linkedAuthorAdByline,referenceLabels,referenceTargetLabels,cachedSponsored,CACHED_SPONSORED_TTL_MS,hasAdEvidence,safeCard,holdsSeparatePostSiblings,railSection,feedCardFrom,rightRailCandidate,sponsoredMenu,railAdLink,rightRailLinkCard,splitLabelRoot,nestedLabelVariants,sponsoredFeedCard,mobileLayout,mobilePostFrom,marketplacePage,marketplaceTileFrom,marketplaceSignal};
root.DKFacebookAds=api;
if(typeof module!=="undefined")module.exports=api;
})(typeof globalThis!=="undefined"?globalThis:this);
