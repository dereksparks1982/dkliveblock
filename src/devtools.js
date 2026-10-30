"use strict";
/* Optional Firefox DevTools panel, opened only when the user enables it. */
(async()=>{
 try{
  if(!browser.devtools?.panels?.create)return;
  const settings=await browser.runtime.sendMessage({action:"getSettings"});
  if(settings?.settings?.showDevtoolsPanel!==true)return;
  await browser.devtools.panels.create("DK Live Block","","devtools-panel.html");
 }catch(_){/* DevTools permission may not have been granted. */}
})();
