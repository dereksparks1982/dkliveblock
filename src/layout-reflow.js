/* DK Live Block: opt-in, reversible video-list reflow. Build 288.
   Scope: known Pornhub video-list markup only. Never moves DOM nodes, fetches
   videos, alters playback, reflows other sites, or executes website scripts. */
(function(root){"use strict";
const GRID="dk-live-block-compact-video-grid";
const EMPTY="dk-live-block-empty-ad-slot";
const STYLE_ID="dk-live-block-layout-reflow";
const CSS=`ul.videos.${GRID}{display:grid!important;grid-template-columns:repeat(auto-fill,minmax(min(100%,210px),1fr))!important;gap:12px!important;align-items:start!important;list-style:none!important}
ul.videos.${GRID}>li.videoblock{float:none!important;clear:none!important;width:auto!important;max-width:none!important;min-width:0!important;margin:0!important}
ul.videos.${GRID}>.${EMPTY}{display:none!important}`;
const MAX_GRIDS=12,MAX_CHILDREN=120;
const AD_MARKER=/(?:^|[\\s_-])(?:ad|ads|advert|advertisement|adslot|banner|sponsor|sponsored|promotion)(?:$|[\\s_-])/i;
function supports(host,path="/"){
 return (host==="pornhub.com"||host==="www.pornhub.com")&&
  (path==="/"||path==="/video"||path.startsWith("/video/search"));
}
function videoTile(el){
 if(String(el?.tagName||"").toUpperCase()!=="LI"||
    !el.classList?.contains?.("videoblock"))return false;
 return !!el.querySelector?.('a[href*="view_video.php"],a[href^="/video/"]');
}
function emptyAdSlot(el){
 if(!["LI","DIV"].includes(String(el?.tagName||"").toUpperCase()))return false;
 const marker=[el.id||"",typeof el.className==="string"?el.className:""].join(" ");
 if(marker.length>240||!AD_MARKER.test(marker)||String(el.textContent||"").trim())return false;
 // Never hide interactive controls, media, thumbnails or unknown ad wrappers
 // whose contents could be legitimate or recover after page updates.
 return !el.querySelector?.('a,button,input,form,video,audio,iframe,img,svg,[role="button"],[contenteditable]');
}
function candidate(list){
 if(String(list?.tagName||"").toUpperCase()!=="UL"||
   !list.classList?.contains?.("videos")||list.isConnected===false||
   list.closest?.('header,nav,footer,form,[role="dialog"],[role="navigation"]'))return null;
 const children=Array.from(list.children||[]);
 if(children.length<2||children.length>MAX_CHILDREN)return null;
 let videos=0;const slots=[];
 for(const child of children){
  if(videoTile(child)){videos++;continue;}
  if(emptyAdSlot(child)){slots.push(child);continue;}
  // The list has mixed sections or controls. Refuse to restyle it.
  return null;
 }
 return videos>=2?Object.freeze({list,videos,slots:Object.freeze(slots)}):null;
}
function create(doc,win){
 const host=String(win?.location?.hostname||"").toLowerCase();
 if(!supports(host)||win?.top&&win.top!==win)return null;
 const grids=new Set(),slots=new Set();
 let style=null,scans=0;
 function restore(){
  for(const grid of grids)try{grid.classList?.remove(GRID);}catch(_){}
  for(const slot of slots)try{slot.classList?.remove(EMPTY);}catch(_){}
  grids.clear();slots.clear();style?.remove?.();style=null;
 }
 function scan(){
  if(!supports(host,String(win?.location?.pathname||"/"))||!doc?.body||!doc?.querySelectorAll){
   restore();return 0;
  }
  let inspected;
  try{inspected=Array.from(doc.querySelectorAll("ul.videos")).slice(0,MAX_GRIDS);}
  catch(_){restore();return 0;}
  const accepted=[];
  for(const node of inspected){const record=candidate(node);if(record)accepted.push(record);}
  const keepGrids=new Set(accepted.map(x=>x.list));
  const keepSlots=new Set(accepted.flatMap(x=>x.slots));
  for(const grid of grids)if(!keepGrids.has(grid)){grid.classList?.remove(GRID);grids.delete(grid);}
  for(const slot of slots)if(!keepSlots.has(slot)){slot.classList?.remove(EMPTY);slots.delete(slot);}
  if(!accepted.length){style?.remove?.();style=null;scans++;return 0;}
  try{
   if(!style||style.isConnected===false){
    style=doc.createElement("style");style.id=STYLE_ID;style.textContent=CSS;
    doc.documentElement.appendChild(style);
   }
   for(const record of accepted){
    if(!grids.has(record.list)){record.list.classList.add(GRID);grids.add(record.list);}
    for(const slot of record.slots)if(!slots.has(slot)){slot.classList.add(EMPTY);slots.add(slot);}
   }
  }catch(_){restore();return 0;}
  scans++;
  return accepted.length;
 }
 function status(){return Object.freeze({site:"pornhub",enabled:!!style&&grids.size>0,
  grids:grids.size,emptySlots:slots.size,scans});}
 return Object.freeze({scan,restore,status});
}
const API=Object.freeze({supports,videoTile,emptyAdSlot,candidate,create,CSS,GRID,EMPTY});
root.DKLayoutReflow=API;
if(typeof module!=="undefined")module.exports=API;
})(typeof globalThis!=="undefined"?globalThis:this);
