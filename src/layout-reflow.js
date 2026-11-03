/* DK Live Block: opt-in, reversible video-list reflow. Builds 288–293.
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
const AD_MARKER=/(?:^|[\s_-])(?:ad|ads|advert|advertisement|adslot|banner|sponsor|sponsored|promotion)(?:$|[\s_-])/i;
function supports(host,path="/"){
 return (host==="pornhub.com"||host==="www.pornhub.com")&&
  (path==="/"||path==="/video"||(path==="/video/search"||path.startsWith("/video/search/")));
}
function videoTile(el){
 if(String(el?.tagName||"").toUpperCase()!=="LI"||
    !el.classList?.contains?.("videoblock"))return false;
 return !!el.querySelector?.('a[href*="view_video.php"],a[href^="/video/"]');
}
function emptyAdSlot(el){
 if(!["LI","DIV"].includes(String(el?.tagName||"").toUpperCase()))return false;
 const marker=[el.id||"",typeof el.className==="string"?el.className:""].join(" ");
 const label=String(el.getAttribute?.("aria-label")||"").trim();
 if(label&&(!AD_MARKER.test(label)||label.length>90))return false;
 if(marker.length>240||!AD_MARKER.test(marker)||String(el.textContent||"").trim()||
    typeof el.querySelector!=="function")return false;
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
// Read-only visual-geometry sample, triggered only by an explicit dashboard
// check. Coordinates are never reported, retained, or used for CSS changes.
// Each adjacent, valid, same-row video pair contributes at most one sample.
function measureHorizontalGaps(cards){
 const output={sampledTiles:0,sameRowPairs:0,widePairs:0,largestWideGapPx:0};
 let previous=null;
 for(const tile of (Array.isArray(cards)?cards.slice(0,MAX_CHILDREN):[])){
  if(!videoTile(tile)||typeof tile.getBoundingClientRect!=="function"){
   previous=null;continue;
  }
  let raw;
  try{raw=tile.getBoundingClientRect();}catch(_){previous=null;continue;}
  if(!raw){previous=null;continue;}
  const {left,right,top,bottom}=raw;
  if(![left,right,top,bottom].every(Number.isFinite)){
   previous=null;continue;
  }
  const width=right-left,height=bottom-top;
  if(width<80||width>1200||height<40||height>1200||
     Math.abs(left)>1000000||Math.abs(top)>1000000){
   previous=null;continue;
  }
  output.sampledTiles++;
  const current={left,right,top,width};
  if(previous&&Math.abs(current.top-previous.top)<=12&&
     current.left>=previous.right-4&&current.left>previous.left){
   const gap=Math.max(0,current.left-previous.right);
   // Relative to the narrower card; a fixed pixel threshold alone
   // would incorrectly flag ordinary responsive card layouts.
   const wide=gap>Math.max(56,Math.min(previous.width,current.width)*0.4);
   output.sameRowPairs++;
   if(wide){
    output.widePairs++;
    output.largestWideGapPx=Math.max(output.largestWideGapPx,
     Math.min(4096,Math.round(gap/8)*8));
   }
  }
  previous=current;
 }
 return Object.freeze(output);
}
function create(doc,win){
 const host=String(win?.location?.hostname||"").toLowerCase();
 if(!supports(host)||win?.top&&win.top!==win)return null;
 const grids=new Set(),slots=new Set();
 let style=null,scans=0;
 function restore(){
  // A failed removal stays tracked for a future retry; do not report
  // successful cleanup until our classes and stylesheet are really gone.
  let complete=true;
  for(const grid of grids){
   try{
    grid.classList?.remove(GRID);
    if(grid.classList?.contains(GRID)){complete=false;continue;}
    grids.delete(grid);
   }catch(_){complete=false;}
  }
  for(const slot of slots){
   try{
    slot.classList?.remove(EMPTY);
    if(slot.classList?.contains(EMPTY)){complete=false;continue;}
    slots.delete(slot);
   }catch(_){complete=false;}
  }
  if(style){
   try{
    style.remove();
    if(style.isConnected)complete=false;
    else style=null;
   }catch(_){complete=false;}
  }
  return complete&&grids.size===0&&slots.size===0&&!style;
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
 // Read-only, bounded layout inspection. No selectors, titles or URLs returned.
 function diagnostics(){
  const report={supportedPage:supports(host,String(win?.location?.pathname||"/")),
   eligibleLists:0,videoTiles:0,emptyAdSlots:0,mixedLists:0,
   shortLists:0,oversizedLists:0,scannedLists:0,
   appliedLists:grids.size,appliedSlots:slots.size,scans,
   geometry:{sampledTiles:0,sameRowPairs:0,widePairs:0,largestWideGapPx:0}};
  if(!report.supportedPage||!doc?.body||!doc?.querySelectorAll)
   return Object.freeze({...report,geometry:Object.freeze(report.geometry)});
  try{
   const lists=doc.querySelectorAll("ul.videos");
   for(let i=0;i<Math.min(lists.length,MAX_GRIDS);i++){
    const node=lists[i],children=node?.children||[];
    report.scannedLists++;
    if(children.length>MAX_CHILDREN){report.oversizedLists++;continue;}
    if(children.length<2){report.shortLists++;continue;}
    const found=candidate(node);
    if(!found){report.mixedLists++;continue;}
    report.eligibleLists++;
    report.videoTiles+=Math.min(MAX_CHILDREN,found.videos);
    report.emptyAdSlots+=Math.min(MAX_CHILDREN,found.slots.length);
    const tiles=Array.from(children).filter(videoTile);
    const measure=measureHorizontalGaps(tiles);
    for(const key of Object.keys(report.geometry))
     report.geometry[key]+=measure[key];
    report.geometry.largestWideGapPx=Math.max(
     report.geometry.largestWideGapPx,measure.largestWideGapPx);
   }
  }catch(_){return Object.freeze({...report,inspectionUnavailable:true,
   geometry:Object.freeze({...report.geometry})});}
  report.geometry=Object.freeze(report.geometry);
  return Object.freeze(report);
 }
 // Only an explicit owner action may compare the original layout against a
 // temporary grid. It must restore original classes/styles before returning.
 // Reject an already-enabled grid; never flicker or interfere with it.
 function preview(){
  if(!supports(host,String(win?.location?.pathname||"/"))||
     grids.size>0||style?.isConnected)return Object.freeze({ok:false,reason:"not-eligible"});
  if(doc?.fullscreenElement)return Object.freeze({ok:false,reason:"fullscreen-active"});
  let before;
  try{before=diagnostics();}catch(_){return Object.freeze({ok:false,reason:"inspection-unavailable"});}
  if(before.inspectionUnavailable||before.eligibleLists<1||
     before.geometry.sameRowPairs<1)
   return Object.freeze({ok:false,reason:"no-comparable-pairs"});
  let after=null,applied=0,error=null,restored=false;
  try{
   applied=scan();
   if(applied>0)after=diagnostics();
  }catch(_){error="preview-failed";}
  finally{restored=restore();}
  if(!restored)return Object.freeze({ok:false,reason:"restoration-incomplete"});
  if(error)return Object.freeze({ok:false,reason:error});
  if(!after||after.inspectionUnavailable||after.eligibleLists!==before.eligibleLists||
     after.videoTiles!==before.videoTiles||
     after.geometry.sampledTiles!==before.geometry.sampledTiles||
     after.geometry.sameRowPairs!==before.geometry.sameRowPairs)
   return Object.freeze({ok:false,reason:"page-changed"});
  // Geometry is an aggregate; even a better number is not a real-user
  // screenshot result or proof of suppressed ads.
  return Object.freeze({ok:true,source:"temporary-css-preview",
   appliedLists:applied,before,after,restored:true});
 }
 function status(){return Object.freeze({site:"pornhub",enabled:!!style&&grids.size>0,
  grids:grids.size,emptySlots:slots.size,scans});}
 return Object.freeze({scan,restore,status,diagnostics,preview});
}
const API=Object.freeze({supports,videoTile,emptyAdSlot,candidate,
 measureHorizontalGaps,create,CSS,GRID,EMPTY});
root.DKLayoutReflow=API;
if(typeof module!=="undefined")module.exports=API;
})(typeof globalThis!=="undefined"?globalThis:this);
