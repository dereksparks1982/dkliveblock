"use strict";
/* User-driven local-only browsing, search, import and export. No remote requests. */
const $=id=>document.getElementById(id);
let libraryItems=[];
function makeRow(entry){
 const row=document.createElement("div");row.className="dependency-row";
 const desc=document.createElement("div");desc.className="dependency-description";
 const name=document.createElement("strong");name.textContent=entry.title;
 const detail=document.createElement("p");
 detail.textContent="Position: "+Math.floor(entry.position/60)+"m "+(entry.position%60)+"s · Saved "+new Date(entry.savedAt).toLocaleString();
 desc.append(name,detail);
 const buttons=document.createElement("div");buttons.className="dependency-actions";
 const resume=document.createElement("button");resume.textContent="Resume";
 resume.addEventListener("click",async()=>{const url=DKVideoLibrary.resumeUrl(entry);if(url)await browser.tabs.create({url});});
 const remove=document.createElement("button");remove.textContent="Remove";
 remove.addEventListener("click",async()=>{
  remove.disabled=true;
  try{const result=await browser.runtime.sendMessage({action:"removeSavedVideo",videoId:entry.id});
   if(result.ok)await load();else $("libraryNotice").textContent=result.error||"Unable to remove video.";
  }catch(error){$("libraryNotice").textContent=error.message;remove.disabled=false;}
 });
 buttons.append(resume,remove);row.append(desc,buttons);return row;
}
function render(){
 const items=DKVideoLibrary.search(libraryItems,$("videoSearch").value,$("videoSort").value);
 const box=$("libraryRows");box.replaceChildren();
 $("libraryNotice").textContent=libraryItems.length+" saved · "+items.length+" shown.";
 for(const entry of items)box.appendChild(makeRow(entry));
 if(!libraryItems.length)$("libraryNotice").textContent="No videos saved yet. Open YouTube and use Save for Later.";
}
async function load(){
 const result=await browser.runtime.sendMessage({action:"getSavedVideos"});
 if(!Array.isArray(result))throw Error("Could not load local video library.");
 libraryItems=DKVideoLibrary.list(result);
 render();
}
$("refreshLibrary").addEventListener("click",()=>load().catch(e=>$("libraryNotice").textContent=e.message));
$("videoSearch").addEventListener("input",render);
$("videoSort").addEventListener("change",render);
$("openSettings").addEventListener("click",()=>browser.tabs.create({url:browser.runtime.getURL("options.html#dependencies")}));
$("exportLibrary").addEventListener("click",()=>{
 const backup=DKVideoLibrary.exportBackup(libraryItems);
 const blob=new Blob([JSON.stringify(backup,null,2)],{type:"application/json"});
 const url=URL.createObjectURL(blob),link=document.createElement("a");
 link.href=url;link.download="dk-live-block-saved-videos.json";link.click();
 setTimeout(()=>URL.revokeObjectURL(url),1000);
 $("libraryNotice").textContent="Local JSON backup saved. No data uploaded.";
});
$("importLibrary").addEventListener("change",async event=>{
 const file=event.target.files?.[0];if(!file)return;
 if(file.size>750000){$("libraryNotice").textContent="Backup exceeds the 750 KB limit.";return;}
 try{
  const backup=JSON.parse(await file.text());
  const imported=DKVideoLibrary.importBackup(backup);
  if(!imported)throw Error("Invalid DK Live Block video library backup.");
  if(!window.confirm("Merge "+imported.length+" saved video(s) into this library? Existing videos will be preserved where space allows."))return;
  const result=await browser.runtime.sendMessage({action:"importSavedVideos",backup});
  if(!result.ok)throw Error(result.error||"Import rejected.");
  await load();$("libraryNotice").textContent="Imported "+imported.length+" video(s); "+libraryItems.length+" in library.";
 }catch(error){$("libraryNotice").textContent="Import failed: "+error.message;}
 finally{event.target.value="";}
});
$("clearLibrary").addEventListener("click",async()=>{
 if(!window.confirm("Permanently remove ALL saved videos from this local library? This does not delete downloaded files."))return;
 const result=await browser.runtime.sendMessage({action:"clearSavedVideos"});
 if(result.ok)await load();else $("libraryNotice").textContent=result.error||"Clear failed.";
});
load().catch(error=>$("libraryNotice").textContent=error.message);
