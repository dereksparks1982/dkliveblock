/* DK Live Block Build 48: curated, supplementary regional subscriptions.
   URLs are published by the known Adblock Plus subscription directory.
   No list is installed merely because Firefox has a matching UI language. */
(function(root){"use strict";
const catalog=Object.freeze([
 Object.freeze({key:"lang_ar",name:"Arabic · Liste AR",code:"ar",url:"https://easylist-downloads.adblockplus.org/Liste_AR.txt",note:"Supplement for Liste FR and EasyList; enable French as well."}),
 Object.freeze({key:"lang_tr",name:"Turkish · Turkish Filters",code:"tr",url:"https://easylist-downloads.adblockplus.org/turkish-filters.txt"}),
 Object.freeze({key:"lang_ru",name:"Russian · RU AdList",code:"ru",url:"https://easylist-downloads.adblockplus.org/advblock.txt"}),
 Object.freeze({key:"lang_fr",name:"French · Liste FR",code:"fr",url:"https://easylist-downloads.adblockplus.org/liste_fr.txt"}),
 Object.freeze({key:"lang_de",name:"German · EasyList Germany",code:"de",url:"https://easylist-downloads.adblockplus.org/easylistgermany.txt"}),
 Object.freeze({key:"lang_zh",name:"Chinese · EasyList China",code:"zh",url:"https://easylist-downloads.adblockplus.org/easylistchina.txt"})
]);
function recommendations(languages){
 if(!Array.isArray(languages))return [];
 const supported=new Set();
 for(const raw of languages.slice(0,20)){
  if(typeof raw!=="string"||raw.length>45)continue;
  const code=raw.toLowerCase().split("-")[0];
  for(const x of catalog)if(x.code===code)supported.add(x.key);
 }
 // Liste AR is supplementary to Liste FR: never silently suggest AR alone.
 if(supported.has("lang_ar"))supported.add("lang_fr");
 return catalog.map(x=>x.key).filter(x=>supported.has(x)).slice(0,4);
}
const API=Object.freeze({catalog,recommendations});
root.DKLanguageLists=API;
if(typeof module!=="undefined")module.exports=API;
})(typeof globalThis!=="undefined"?globalThis:this);
