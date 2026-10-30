/* DK Live Block Build 38: tightly scoped request allowances.
   Pure, bounded, no URL paths or query strings stored. */
(function(root){"use strict";
const TYPES=new Set(["script","image","imageset","stylesheet","media","font","object",
 "xmlhttprequest","sub_frame","ping","beacon","websocket","other"]);
const SCOPES=new Set(["temporary","session","remember"]);
const TTL=600000,MAX=150;
function host(value){
 if(typeof value!=="string"||value.length>253||value!==value.toLowerCase())return "";
 const labels=value.split(".");
 if(labels.length<2||!labels.every(x=>/^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/.test(x)))return "";
 return value;
}
function choice(site,destination,type,scope){
 const s=host(site),d=host(destination);
 if(!s||!d||!TYPES.has(type)||!SCOPES.has(scope))return null;
 return {site:s,host:d,type,scope};
}
function make(){return {temporary:new Map(),session:[],remember:[]};}
function idOf(row){return [row.scope,row.site,row.host,row.type].join("|");}
function restore(input){
 if(!Array.isArray(input))return [];
 const found=new Map();
 for(const entry of input.slice(0,MAX*4)){
  if(!entry||entry.scope!=="remember")continue;
  const valid=choice(entry.site,entry.host,entry.type,"remember");
  if(valid)found.set(idOf(valid),valid);
  if(found.size>=MAX)break;
 }
 return [...found.values()];
}
function grant(state,tab,site,dest,type,scope,now=Date.now()){
 const record=choice(site,dest,type,scope);
 if(!record)return {error:"Only a specific site, request hostname, and resource type can be allowed."};
 const validTab=Number.isInteger(tab)&&tab>=0;
 if(scope==="temporary"&&!validTab)return {error:"A current tab is required."};
 const target=scope==="temporary"?(state.temporary.get(tab)||[]):state[scope];
 const key=idOf(record);
 const next=target.filter(x=>idOf(x)!==key);
 next.push(scope==="temporary"?{...record,expires:now+TTL}:record);
 if(next.length>MAX)next.splice(0,next.length-MAX);
 if(scope==="temporary")state.temporary.set(tab,next);
 else state[scope]=next;
 return {ok:true,rule:record,expires:scope==="temporary"?now+TTL:null};
}
function matches(state,tab,site,dest,type,now=Date.now()){
 const c=choice(site,dest,type,"session");if(!c)return false;
 const test=r=>r.site===site&&r.host===dest&&r.type===type;
 if(state.remember.some(test)||state.session.some(test))return true;
 const temp=state.temporary.get(tab)||[];
 if(!temp.length)return false;
 const kept=temp.filter(x=>x.expires>now);
 if(kept.length!==temp.length){
  if(kept.length)state.temporary.set(tab,kept);
  else state.temporary.delete(tab);
 }
 return kept.some(test);
}
function list(state,tab,site,now=Date.now()){
 const rows=[];
 if(!host(site))return rows;
 for(const scope of ["remember","session","temporary"]){
  const values=scope==="temporary"?(state.temporary.get(tab)||[]):state[scope];
  for(const entry of values){
   if(entry.site===site&&(scope!=="temporary"||entry.expires>now))rows.push({...entry});
  }
 }
 return rows;
}
function revoke(state,tab,site,dest,type,scope){
 const c=choice(site,dest,type,scope);if(!c)return false;
 const target=scope==="temporary"?(state.temporary.get(tab)||[]):state[scope];
 const next=target.filter(x=>idOf(x)!==idOf(c));
 if(target.length===next.length)return false;
 if(scope==="temporary"){if(next.length)state.temporary.set(tab,next);else state.temporary.delete(tab);}
 else state[scope]=next;
 return true;
}
function dropTab(state,tab){state.temporary.delete(tab);}
const api=Object.freeze({TYPES,TTL,MAX,choice,make,restore,grant,matches,list,revoke,dropTab});
root.DKRequestControls=api;
if(typeof module!=="undefined")module.exports=api;
})(typeof globalThis!=="undefined"?globalThis:this);