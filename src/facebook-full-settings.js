"use strict";
(function(){
 const defaults=Object.freeze({"hideSponsored":true,"hideUnlabeledAds":true,"hideSuggested":false,"hideUnfollowed":false,"showMarkers":false,"placeholderMode":false,"hideAppBanner":true,"hideStories":false,"hideReels":false,"hidePeopleYouMayKnow":false});
 const keys=Object.keys(defaults),texts=["keepPages","adPages"];
 const $=id=>document.getElementById(id);
 let ready=false,language="en";
 function msg(en,ru){$("fbStatus").textContent=language==="ru"?ru:en;}
 function cleaned(value){return [...new Set(String(value||"").split(/\r?\n/).map(s=>s.trim()).filter(Boolean))].slice(0,200).join("\n").slice(0,20000);}
 async function load(){
  try{
   const [saved,ui]=await Promise.all([
    browser.storage.local.get({...defaults,keepPages:"",adPages:""}),
    browser.storage.local.get("dkUiLanguage")]);
   language=ui.dkUiLanguage==="ru"?"ru":"en";document.documentElement.lang=language;
   for(const node of document.querySelectorAll("[data-en]"))
    node.textContent=node.dataset[language]||node.dataset.en;
   for(const key of keys)$(key).checked=saved[key]===true;
   for(const key of texts)$(key).value=String(saved[key]||"").slice(0,20000);
   ready=true;msg("Ready. Save to apply.","Готово. Сохраните изменения.");
  }catch(_){msg("Unable to load settings.","Не удалось загрузить настройки.");}
 }
 $("saveFacebook").addEventListener("click",async()=>{
  if(!ready){msg("Not ready.","Не готово.");return;}
  const data={};for(const key of keys)data[key]=$(key).checked;
  for(const key of texts)data[key]=cleaned($(key).value);
  const protectedNames=new Set(data.keepPages.toLowerCase().split("\n").filter(Boolean));
  data.adPages=data.adPages.split("\n").filter(s=>s&&!protectedNames.has(s.toLowerCase())).join("\n");
  try{await browser.storage.local.set(data);
   for(const key of texts)$(key).value=data[key];
   msg("Saved. Refresh Facebook to test.","Сохранено. Обновите Facebook для проверки.");
  }catch(_){msg("Could not save.","Не удалось сохранить.");}
 });
 load();
})();
