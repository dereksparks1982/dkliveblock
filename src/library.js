"use strict";
const $=id=>document.getElementById(id);
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
 remove.addEventListener("click",async()=>{const result=await browser.runtime.sendMessage({action:"removeSavedVideo",videoId:entry.id});if(result.ok)await load();});
 buttons.append(resume,remove);row.append(desc,buttons);return row;
}
async function load(){
 const result=await browser.runtime.sendMessage({action:"getSavedVideos"});
 const items=Array.isArray(result)?DKVideoLibrary.list(result):[];
 const box=$("libraryRows");box.replaceChildren();
 $("libraryNotice").textContent=items.length?items.length+" video(s) saved locally.":"No videos saved yet.";
 for(const entry of items)box.appendChild(makeRow(entry));
}
$("refreshLibrary").addEventListener("click",()=>load().catch(e=>$("libraryNotice").textContent=e.message));
$("openSettings").addEventListener("click",()=>browser.tabs.create({url:browser.runtime.getURL("options.html#dependencies")}));
load().catch(e=>$("libraryNotice").textContent=e.message);
