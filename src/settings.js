/* DK Live Block: defensive restoration of local settings and cached filter data. */
(function(root){"use strict";
const BOOLEAN=["enabled","autoUpdate","autoYouTubeRules","youtubeSkip","adRecognition","cookieReject","distractionControl","antiAdblock","paywallPopups","stripTracking","requestLog","rememberVideos","strictPopupSites","showContextMenu","showBadge","showDevtoolsPanel"];
function object(x){return x&&typeof x==="object"&&!Array.isArray(x)?x:{};}
function restoreSettings(raw,defaults,keys){
 const src=object(raw),value={...defaults,listEnabled:{...defaults.listEnabled},paused:[],mediaRecovery:[],popupProtectionPaused:[]};
 for(const name of BOOLEAN)if(typeof src[name]==="boolean")value[name]=src[name];
 const known=object(src.listEnabled);
 for(const key of keys)if(typeof known[key]==="boolean")value.listEnabled[key]=known[key];
 if(Array.isArray(src.paused))
  value.paused=[...new Set(src.paused.filter(h=>DKManualRules.validHost(h)))].slice(0,500);
 if(Array.isArray(src.mediaRecovery))
  value.mediaRecovery=[...new Set(src.mediaRecovery.filter(h=>typeof h==="string"&&DKVideoAssist.isStreamingHost(h)&&DKManualRules.validHost(h)))].slice(0,12);
 if(Array.isArray(src.popupProtectionPaused))
  value.popupProtectionPaused=[...new Set(src.popupProtectionPaused.filter(h=>DKManualRules.validHost(h)))].slice(0,500);
 value.customRules=typeof src.customRules==="string"&&src.customRules.length<=1000000?src.customRules:"";
 const subs=DKSubscriptions.validate(src.customSubscriptions??[]);
 value.customSubscriptions=subs.urls||[];
 const net=DKNetwork.validate(src.network||DKNetwork.DEFAULT);
 value.network=net.value||{...DKNetwork.DEFAULT,domains:[]};
 const counter=src.blockedTotal;
 value.blockedTotal=Number.isSafeInteger(counter)&&counter>=0&&counter<1e13?counter:0;
 const updated=src.lastUpdate;
 value.lastUpdate=Number.isFinite(updated)&&updated>=0&&updated<Date.now()+86400000?updated:0;
 return value;
}
function restoreLists(input,identifiers,maxTotal=50000000){
 const source=object(input),out={},errors={};let used=0;
 for(const id of identifiers){
  const cached=object(source[id]);
  if(typeof cached.text!=="string")continue;
  try{
   const text=DKListIO.verify(cached.text);
   if(used+text.length>maxTotal){errors[id]="Cached list exceeds local storage budget.";continue;}
   used+=text.length;
   out[id]={
    text,updated:Number.isFinite(cached.updated)&&cached.updated>=0?cached.updated:0,
    checked:Number.isFinite(cached.checked)&&cached.checked>=0?cached.checked:0,
    etag:DKSubscriptionCache.safeTag(cached.etag),
    lastModified:DKSubscriptionCache.safeDate(cached.lastModified)
   };
  }catch(_){errors[id]="Ignored invalid cached filter-list data.";}
 }
 return {lists:out,errors};
}
function restoreErrors(source,ids){
 const raw=object(source),out={};
 for(const key of ids)if(typeof raw[key]==="string")out[key]=raw[key].slice(0,150);
 return out;
}
root.DKSettings={restoreSettings,restoreLists,restoreErrors};
if(typeof module!=="undefined")module.exports=root.DKSettings;
})(typeof globalThis!=="undefined"?globalThis:this);
