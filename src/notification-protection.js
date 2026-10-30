/* DK Live Block Build 50: Firefox browser-owned notification prompt control.
   Uses browserSettings.webNotificationsDisabled, never page injection or
   extension-generated notifications. Setting is Firefox-wide; site-specific
   permissions already granted by the user remain in force. */
(function(root){"use strict";
const OWNED="controlled_by_this_extension",AVAILABLE="controllable_by_this_extension";
async function sync(browser,wantBlocked){
 const setting=browser?.browserSettings?.webNotificationsDisabled;
 if(!setting?.get||!setting.set||!setting.clear)
  return {supported:false,controlled:false,blocked:false,error:"Firefox global notification control is unavailable."};
 try{
  const before=await setting.get({});
  if(wantBlocked){
   if(before.levelOfControl!==OWNED&&before.levelOfControl!==AVAILABLE)
    return {supported:true,controlled:false,blocked:!!before.value,
     error:"Another setting or extension controls Firefox notification permissions."};
   if(before.levelOfControl!==OWNED||before.value!==true)
    await setting.set({value:true});
  }else if(before.levelOfControl===OWNED){
   await setting.clear({});
  }
  const after=await setting.get({});
  return {supported:true,controlled:after.levelOfControl===OWNED,
   blocked:after.value===true,level:after.levelOfControl};
 }catch(error){
  return {supported:true,controlled:false,blocked:false,
   error:String(error?.message||error).slice(0,160)};
 }
}
async function status(browser){
 const setting=browser?.browserSettings?.webNotificationsDisabled;
 if(!setting?.get)return {supported:false,controlled:false,blocked:false,error:"Unavailable."};
 try{
  const state=await setting.get({});
  return {supported:true,controlled:state.levelOfControl==="controlled_by_this_extension",
   blocked:state.value===true,level:state.levelOfControl};
 }catch(error){return {supported:true,controlled:false,blocked:false,
  error:String(error?.message||error).slice(0,160)};}
}
const API=Object.freeze({sync,status});
root.DKNotificationProtection=API;
if(typeof module!=="undefined")module.exports=API;
})(typeof globalThis!=="undefined"?globalThis:this);
