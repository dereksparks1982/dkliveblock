/* DK Live Block: YouTube compatibility pack, strictly DATA only.
   No remote JS, scriptlets, network allow rules, arbitrary procedures or redirects.
   Only simple, ad-specific cosmetic selectors on explicitly approved YouTube hosts. */
(function(root){"use strict";
const SOURCE="https://raw.githubusercontent.com/dereksparks1982/dkliveblock/main/filters/youtube.txt";
const MAX_LENGTH=120000,MAX_RULES=300;
const HOSTS=new Set(["youtube.com","youtube-nocookie.com"]);
const SELECTOR=/^(?:[.#][a-zA-Z_][a-zA-Z0-9_-]{1,110}|[a-z][a-z0-9-]{2,110})$/;
const AD_WORD=/(?:\bads?\b|ad-slot|ad-overlay|display-ad|video-ad|search-pyv|promot|promo|sponsor|masthead|advertis)/i;
function validate(input){
 if(typeof input!=="string"||input.length<80||input.length>MAX_LENGTH||input.includes("\u0000"))
  throw Error("Invalid YouTube compatibility pack size");
 const lines=input.replace(/\r\n/g,"\n").split("\n");
 if(lines[0].trim()!=="[Adblock Plus 2.0]")throw Error("YouTube pack header missing");
 const markers=lines.filter(line=>/^! DKLB-YouTube-Pack:/.test(line));
 if(markers.length!==1||!/^! DKLB-YouTube-Pack: [1-9]\d{0,6}$/.test(markers[0]))
  throw Error("YouTube pack version missing or invalid");
 const version=Number(markers[0].split(": ")[1]),usable=[],unique=new Set();
 for(const line of lines){
  const entry=line.trim();
  if(!entry||entry[0]==="!"||entry[0]==="[")continue;
  // Reuse the engine's cosmetic parser but do not accept general filter features.
  if(entry.includes("#@#")||entry.includes("#?#")||entry.includes("#$#")||entry.includes("#%#"))
   throw Error("Advanced or exception rules are not allowed in YouTube pack");
  const parsed=DKRules.cosmetic(entry);
  if(!parsed||!HOSTS.has(parsed.scope)||!SELECTOR.test(parsed.selector)||
     !AD_WORD.test(parsed.selector)||DKVideoAssist.protectSelector(parsed.selector)||
     DKAuthProtection.safeCosmetics([parsed.selector]).length!==1)
   throw Error("Unsafe or unsupported YouTube pack selector");
  if(unique.has(entry))throw Error("Duplicate YouTube pack selector");
  unique.add(entry);usable.push(entry);
  if(usable.length>MAX_RULES)throw Error("Too many YouTube pack selectors");
 }
 if(usable.length<3)throw Error("YouTube pack needs at least three safe selectors");
 return {version,text:input.replace(/\r\n/g,"\n"),count:usable.length};
}
function restore(cache){
 try{
  if(!cache||typeof cache!=="object")return null;
  const parsed=validate(cache.text);
  if(cache.version!==parsed.version)return null;
  return {text:parsed.text,version:parsed.version,updated:Number.isFinite(cache.updated)?cache.updated:0,
   checked:Number.isFinite(cache.checked)?cache.checked:0,
   etag:DKSubscriptionCache.safeTag(cache.etag),lastModified:DKSubscriptionCache.safeDate(cache.lastModified)};
 }catch(_){return null;}
}
function transition(current,candidate,heldVersion=0){
 const next=validate(candidate);
 if(next.version<=heldVersion)throw Error("This YouTube pack version was rolled back; waiting for a newer version");
 if(current&&next.version<current.version)throw Error("YouTube pack version downgrade rejected");
 if(current&&next.version===current.version){
  if(next.text!==current.text)throw Error("YouTube pack was modified without a new version");
  return {changed:false,next:current};
 }
 return {changed:true,next,previous:current||null};
}
function status(active,previous,heldVersion,error="",enabled=true){
 return {version:active?.version||0,previousVersion:previous?.version||0,
  heldVersion:heldVersion||0,checked:active?.checked||0,error:String(error||"").slice(0,150),
  remoteEnabled:!!enabled};
}
const api={SOURCE,validate,restore,transition,status};
root.DKYouTubeMaintenance=api;
if(typeof module!=="undefined")module.exports=api;
})(typeof globalThis!=="undefined"?globalThis:this);
