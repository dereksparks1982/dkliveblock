/* DK Live Block Build 45: user-initiated Firefox Block Element context menu.
 * The source tab is checked at click time; no page content can create menu actions.
 * No network access or recording, and no new background timers. */
(function(root){"use strict";
const ID="dk-live-block-element-picker";
const URL_SCHEME=/^https?:\/\//i;
function eligibleTab(tab){
 return Number.isInteger(tab?.id)&&tab.id>=0&&
 typeof tab.url==="string"&&URL_SCHEME.test(tab.url);
}
function install(browser,enabled,allowed){
 const menus=browser?.contextMenus;
 if(!menus?.create||!menus.onClicked?.addListener||!browser?.tabs?.sendMessage)return false;
 try{
  menus.create({id:ID,title:"Block element with DK Live Block",
    contexts:["page","image","link","selection","video"]});
 }catch(error){console.warn("DK Live Block context menu:",String(error).slice(0,120));return false;}
 menus.onClicked.addListener((info,tab)=>{
  if(info?.menuItemId!==ID||!enabled()||!eligibleTab(tab)||!allowed(tab))return;
  const opts=Number.isInteger(info.frameId)&&info.frameId>=0?
   {frameId:info.frameId}:{frameId:0};
  Promise.resolve(browser.tabs.sendMessage(tab.id,{action:"startPicker"},opts))
   .catch(()=>{}); // Restricted Firefox pages cannot be picked.
 });
 return true;
}
async function sync(browser,visible){
 if(!browser?.contextMenus?.update)return false;
 try{await browser.contextMenus.update(ID,{visible:!!visible});return true;}
 catch(_){return false;}
}
const API=Object.freeze({ID,eligibleTab,install,sync});
root.DKContextMenu=API;
if(typeof module!=="undefined")module.exports=API;
})(typeof globalThis!=="undefined"?globalThis:this);
