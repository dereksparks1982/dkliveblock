/* DK Live Block: first-party Meta GraphQL advertising response filtering.
   Independent bounded implementation inspired by the documented shapes in
   uAssets. No uBlock scriptlet code, foreign engine or network telemetry.
   Unrecognized/invalid payloads remain byte-for-byte untouched. */
(function(root){"use strict";
const MAX_BYTES=1500000,MAX_FILTERS=8,MAX_PER_TAB=2,MAX_DELAY_MS=4000,MAX_LIFETIME_MS=20000,MAX_RECORDS=1000,MAX_CHUNKS=2048;
let live=0;
const byTab=new Map(),statsByTab=new Map();
function object(x){return x!==null&&typeof x==="object"&&!Array.isArray(x);}
function validSite(host){return ["facebook.com","www.facebook.com","web.facebook.com","m.facebook.com"].includes(host);}
function route(url){
 try{
  const u=new URL(url);
  return u.protocol==="https:"&&!u.username&&!u.password&&
    ["www.facebook.com","web.facebook.com"].includes(u.hostname)&&
    /^\/api\/graphql\/?$/.test(u.pathname)&&!u.hash;
 }catch(_){return false;}
}
// Marketplace listing composer and bulk creation depend on unmodified
// GraphQL response envelopes. There is no sponsored feed to prune there.
// A precise route gate is preferable to a broad Facebook-wide exception.
function protectedComposerPage(url){
 try{
  const u=new URL(url);
  return u.protocol==="https:"&&validSite(u.hostname)&&
   /^\/marketplace\/(?:create(?:\/|$)|you\/selling\/create(?:\/|$))/i.test(u.pathname);
 }catch(_){return false;}
}
function eligible(d,site){
 if(!d||d.type!=="xmlhttprequest"||d.statusCode!==200||
    String(d.method||"").toUpperCase()!=="POST"||
    !Number.isSafeInteger(d.tabId)||d.tabId<0||!route(d.url)||!validSite(site))return false;
 try{
  const u=new URL(d.documentUrl||d.originUrl||"");
  return u.protocol==="https:"&&validSite(u.hostname)&&!u.username&&!u.password&&
   !protectedComposerPage(d.documentUrl||d.originUrl||"");
 }catch(_){return false;}
}
function header(headers,name){
 const matches=headers.filter(h=>String(h?.name||"").toLowerCase()===name);
 return matches.length===1&&typeof matches[0].value==="string"?matches[0].value:"";
}
function safeHeaders(d){
 const hs=d?.responseHeaders;
 if(!Array.isArray(hs)||hs.length>80)return false;
 if(hs.filter(h=>String(h?.name||"").toLowerCase()==="content-type").length!==1)return false;
 if(hs.filter(h=>String(h?.name||"").toLowerCase()==="content-length").length>1)return false;
 if(hs.some(h=>["content-range","content-disposition"].includes(String(h?.name||"").toLowerCase())))return false;
 const ct=header(hs,"content-type");
 if(!/^\s*(?:application\/json|text\/json|text\/javascript|application\/x-javascript)(?:\s*;|$)/i.test(ct))return false;
 const directives=[...ct.matchAll(/;\s*charset\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s;]+))/gi)];
 if(directives.length>1||/;\s*charset\b/i.test(ct)&&directives.length!==1)return false;
 if(directives.length){
  const charset=(directives[0][1]??directives[0][2]??directives[0][3]).toLowerCase();
  if(!["utf-8","utf8"].includes(charset))return false;
 }
 const len=header(hs,"content-length");
 if(len&&(!/^\d+$/.test(len)||Number(len)>MAX_BYTES))return false;
 return true;
}
function dropFromArray(obj,prop,predicate){
 if(!object(obj)||!Array.isArray(obj[prop])||obj[prop].length>MAX_RECORDS)return 0;
 const list=obj[prop],keep=list.filter(item=>!predicate(item));
 if(list.length===keep.length)return 0;
 obj[prop]=keep;return list.length-keep.length;
}
// Newer Facebook GraphQL uses th_dat_spo for some sponsored_data fields.
// Existing historical ad-id handling stays intact. The new alias demands a
// typed SponsoredData object or a short nonempty ad_id to avoid false positives.
// Callers inspect only explicit feed/search/Marketplace/side ad collections,
// never arbitrary private messages, root data.node or JSON.parse canaries.
function adMetadata(value,renamed=false){
 return object(value)&&(value.__typename==="SponsoredData"||
  (renamed?(typeof value.ad_id==="string"&&value.ad_id.length>0&&value.ad_id.length<=256):
   Object.prototype.hasOwnProperty.call(value,"ad_id")));
}
function sponsoredFields(unit){
 return object(unit)&&(adMetadata(unit.sponsored_data)||
  adMetadata(unit.th_dat_spo,true));
}
// Independently documented exact Facebook ad-label rendering strategy.
// An arbitrary class name or quoted text is insufficient. Require the
// specific nested metadata location within a known feed/search ad unit.
const SPONSORED_LABEL_STRATEGY="CometStorySponsoredLabelStrategy";
function sponsoredRenderStrategy(n){
 const metadata=n?.comet_sections?.context_layout?.story?.comet_sections?.metadata;
 if(!object(metadata))return false;
 const keys=Object.keys(metadata);
 // Never walk the full feed on a pathological metadata object.
 if(keys.length>24)return false;
 return keys.some(k=>object(metadata[k])&&
  metadata[k].__typename===SPONSORED_LABEL_STRATEGY);
}
// Search may classify several distinct ad roles ending in _ADS. Never
// apply that broader role test to normal feeds or user content.
function sponsoredSearchNode(node){
 if(adNode(node))return true;
 const role=node?.role;
 return typeof role==="string"&&role.length<=48&&
  /^[A-Z][A-Z_]{0,40}_ADS$/.test(role);
}
function sponsoredSearchEdge(edge){
 return sponsoredEdge(edge)||sponsoredSearchNode(edge?.node);
}
function adNode(n){
 return object(n)&&(n.__typename==="SponsoredData"||
  n.__typename==="MarketplaceFeedAdStory"||
  n.role==="SEARCH_ADS"||sponsoredRenderStrategy(n)||
  sponsoredFields(n)||sponsoredFields(n.story)||
  sponsoredFields(n.relay_rendering_strategy?.view_model?.story));
}
function sponsoredEdge(edge){
 if(!object(edge)||!object(edge.node))return false;
 return edge.category==="SPONSORED"||adNode(edge.node)||
  sponsoredFields(edge.relay_rendering_strategy?.view_model?.story);
}
function pruneEdges(parent){
 return dropFromArray(parent,"edges",sponsoredEdge);
}
// First-party GraphQL uses both edge wrappers and direct node collections.
// Restrict this optional route to named feed containers. Never prune a bare
// data.node, a shared/composer record, a message inbox or arbitrary arrays.
function pruneFeedCollection(parent){
 if(!object(parent))return 0;
 return pruneEdges(parent)+dropFromArray(parent,"nodes",adNode);
}
function pruneSearchCollection(parent){
 if(!object(parent))return 0;
 return dropFromArray(parent,"edges",sponsoredSearchEdge)+
  dropFromArray(parent,"nodes",sponsoredSearchNode);
}
function pruneRecord(doc){
 if(!object(doc)||doc.error||Array.isArray(doc.errors)&&doc.errors.length)return 0;
 const data=doc.data;if(!object(data))return 0;
 let removed=0;
 const viewer=data.viewer;
 if(object(viewer)){
  if(object(viewer.news_feed))removed+=pruneFeedCollection(viewer.news_feed);
  // Facebook also embeds Marketplace sponsored stories inside these
  // dedicated feed collections. Never inspect a generic user-owned array.
  if(object(viewer.marketplace_feed_stories))
   removed+=pruneFeedCollection(viewer.marketplace_feed_stories);
  const side=viewer.sideFeedUnit;
  if(object(side)&&Array.isArray(side.nodes)&&side.nodes.length<=MAX_RECORDS){
   // new_adverts is a dedicated ad slot. Only remove explicitly marked ad
   // records. Retain non-ad data and all unknown response shapes.
   for(const unit of side.nodes){
    if(!object(unit)||!object(unit.new_adverts))continue;
    removed+=dropFromArray(unit.new_adverts,"nodes",ad=>adNode(ad)||
     object(ad)&&ad.__typename==="AdsSideFeedUnit");
   }
   // Retain the AdsSideFeedUnit wrapper and original node ordering even when
   // an ad-only inner array becomes empty. Facebook's Marketplace composer
   // and other client code may require the wrapper's stable shape.
  }
 }
 const results=data.serpResponse?.results;
 if(object(results))removed+=pruneSearchCollection(results);
 const marketUnits=data.marketplace_search?.feed_units;
 if(object(marketUnits))removed+=pruneFeedCollection(marketUnits);
 // Other GraphQL shapes are deliberately left intact, including the generic
 // data.node path, messaging, reactions and unrelated feed components.
 return removed;
}
// Facebook sometimes wraps GraphQL records in RequireJS / __bbox envelopes.
// Follow only those known transport keys, not arbitrary user data. Bounded
// breadth/depth prevents a large or unusual response from using unlimited CPU.
function pruneRequireEnvelope(doc){
 if(!object(doc)||!Array.isArray(doc.require)||doc.require.length>100)return 0;
 const stack=[{node:doc.require,depth:0}],seen=new Set();
 let visits=0,removed=0;
 while(stack.length&&visits++<1000){
  const {node,depth}=stack.pop();
  if(depth>20||!node||typeof node!=="object"||seen.has(node))continue;
  seen.add(node);
  if(Array.isArray(node)){
   if(node.length>100)continue;
   for(let i=node.length-1;i>=0;i--)
    if(node[i]&&typeof node[i]==="object")stack.push({node:node[i],depth:depth+1});
   continue;
  }
  if(!object(node))continue;
  // Each nested __bbox.result may itself be another envelope.
  if(object(node.__bbox)){
   if(object(node.__bbox.result)){
    removed+=pruneRecord(node.__bbox.result);
    stack.push({node:node.__bbox.result,depth:depth+1});
   }
   if(Array.isArray(node.__bbox.require))
    stack.push({node:node.__bbox.require,depth:depth+1});
  }
  if(Array.isArray(node.require))
   stack.push({node:node.require,depth:depth+1});
  if(object(node.result))stack.push({node:node.result,depth:depth+1});
 }
 return removed;
}
// Nesty Meta 05: fail-open safety before mutating known RequireJS transport.
 // Inspect the same explicit require / __bbox / result routes as the rewriter.
 // Any nested GraphQL error, unusual depth or collection cap cancels all edits.
function errorBearing(node){
 return object(node)&&(node.error!==undefined&&node.error!==null||
  Array.isArray(node.errors)&&node.errors.length>0);
}
function safeRequireEnvelope(doc){
 if(!object(doc)||errorBearing(doc)||errorBearing(doc.__bbox))return false;
 if(!Object.prototype.hasOwnProperty.call(doc,"require"))return true;
 if(!Array.isArray(doc.require)||doc.require.length>100)return false;
 const stack=[{node:doc.require,depth:0}],seen=new Set();
 let visited=0;
 while(stack.length){
  if(++visited>1000)return false;
  const {node,depth}=stack.pop();
  if(depth>20)return false;
  if(!node||typeof node!=="object"||seen.has(node))continue;
  seen.add(node);
  if(Array.isArray(node)){
   if(node.length>100)return false;
   for(let i=node.length-1;i>=0;i--)
    if(node[i]&&typeof node[i]==="object")stack.push({node:node[i],depth:depth+1});
   continue;
  }
  if(!object(node))continue;
  if(errorBearing(node))return false;
  if(Object.prototype.hasOwnProperty.call(node,"__bbox")&&
     !object(node.__bbox))return false;
  if(Object.prototype.hasOwnProperty.call(node,"require")&&
     !Array.isArray(node.require))return false;
  if(Object.prototype.hasOwnProperty.call(node,"result")&&
     !object(node.result))return false;
  if(object(node.__bbox)){
   if(errorBearing(node.__bbox))return false;
   if(Object.prototype.hasOwnProperty.call(node.__bbox,"result")&&
      !object(node.__bbox.result))return false;
   if(Object.prototype.hasOwnProperty.call(node.__bbox,"require")&&
      !Array.isArray(node.__bbox.require))return false;
   if(object(node.__bbox.result))stack.push({node:node.__bbox.result,depth:depth+1});
   if(Array.isArray(node.__bbox.require))stack.push({node:node.__bbox.require,depth:depth+1});
  }
  if(Array.isArray(node.require))stack.push({node:node.require,depth:depth+1});
  if(object(node.result))stack.push({node:node.result,depth:depth+1});
 }
 return true;
}

function prunePayload(doc){
 // Do not alter a response containing GraphQL errors, even if a nested
 // __bbox object happens to resemble an ad feed.
 if(!safeRequireEnvelope(doc))return 0;
 let count=pruneRecord(doc);
 // The envelope is used only when explicitly present, and a response's
 // unrelated non-ad fields are never traversed by the ad matcher.
 count+=pruneRequireEnvelope(doc);
 return count;
}
function rewrite(text){
 if(typeof text!=="string"||text.length<2||text.length>MAX_BYTES)
  return {text,changed:false,removed:0};
 const prefix=text.startsWith("for (;;);")?"for (;;);":"";
 const raw=prefix?text.slice(prefix.length):text;
 const whitespace=/^(\s*)([\s\S]*?)(\s*)$/.exec(raw);
 if(!whitespace)return {text,changed:false,removed:0};
 let result;
 try{
  const obj=JSON.parse(whitespace[2]);
  const removed=prunePayload(obj);
  if(removed){
   const next=prefix+whitespace[1]+JSON.stringify(obj)+whitespace[3];
   // The input cap is in bytes; the edited UTF-8 body must meet the same
   // bound before it is passed to Firefox's response writer.
   if(new TextEncoder().encode(next).byteLength<=MAX_BYTES)
    result={text:next,changed:true,removed};
  }
 }catch(_){}
 if(result)return result;
 // Facebook also delivers one JSON record per line, sometimes following
 // its anti-JSON-hijacking prefix. Leave non-JSON lines and delimiters intact.
 if(!raw.includes("\n"))return {text,changed:false,removed:0};
 // Treat JSONL as one transaction. A corrupt/truncated line or a
 // GraphQL error response must NEVER produce partial modifications.
 // Keep original bytes for any uncertain mixed-format transport.
 const parts=raw.split(/(\r?\n)/);
 if(parts.length>MAX_RECORDS*2+1)return {text,changed:false,removed:0};
 const edits=[];
 let removed=0;
 for(let i=0;i<parts.length;i+=2){
  const line=parts[i];
  if(!line.trim())continue;
  const m=/^(\s*)(\{[\s\S]*\})(\s*)$/.exec(line);
  if(!m)return {text,changed:false,removed:0};
  let obj;
  try{obj=JSON.parse(m[2]);}
  catch(_){return {text,changed:false,removed:0};}
  if(!safeRequireEnvelope(obj))
   return {text,changed:false,removed:0};
  const n=prunePayload(obj);
  if(n){edits.push([i,m[1]+JSON.stringify(obj)+m[3]]);removed+=n;}
 }
 if(!removed)return {text,changed:false,removed:0};
 for(const [index,value]of edits)parts[index]=value;
 const next=prefix+parts.join("");
 return new TextEncoder().encode(next).byteLength<=MAX_BYTES?
  {text:next,changed:true,removed}:{text,changed:false,removed:0};
}
function note(tab,kind,removed=0){
 if(!Number.isSafeInteger(tab)||tab<0)return;
 const old=statsByTab.get(tab)||{attached:0,modified:0,removed:0,unchanged:0,errors:0,oversized:0,timeout:0,skipped:0};
 const row={...old};
 if(kind in row)row[kind]=Math.min(1000000,row[kind]+1);
 if(removed)row.removed=Math.min(1000000,row.removed+removed);
 statsByTab.delete(tab);statsByTab.set(tab,row);
 if(statsByTab.size>100)statsByTab.delete(statsByTab.keys().next().value);
}
function stats(tab){return Object.freeze({...statsByTab.get(tab)||{}});}
function clear(tab){statsByTab.delete(tab);}
function attach(d,webRequest,clock=root){
 if(!eligible(d,d.pageHost||"")||!safeHeaders(d)||
    typeof webRequest?.filterResponseData!=="function")return false;
 const tab=d.tabId;
 if(live>=MAX_FILTERS||(byTab.get(tab)||0)>=MAX_PER_TAB){note(tab,"skipped");return false;}
 let filter;try{filter=webRequest.filterResponseData(d.requestId);}
 catch(_){note(tab,"errors");return false;}
 live++;byTab.set(tab,(byTab.get(tab)||0)+1);note(tab,"attached");
 let chunks=[],size=0,cursor=0,finished=false,idleTimer=null,lifeTimer=null;
 function cancelTimer(timer){
  if(timer!==null)try{clock?.clearTimeout?.(timer);}catch(_){}
 }
 function flushAndDisconnect(kind){
  if(finished)return;
  try{original();}catch(_){note(tab,"errors");}
  note(tab,kind);finish(true);
 }
 function renewIdle(){
  if(typeof clock?.setTimeout!=="function")return;
  cancelTimer(idleTimer);
  idleTimer=clock.setTimeout(()=>flushAndDisconnect("timeout"),MAX_DELAY_MS);
  idleTimer?.unref?.();
 }
 function original(){
  // Move the cursor before writing, never replay a partially written chunk.
  while(cursor<chunks.length)filter.write(chunks[cursor++]);
  chunks=[];cursor=0;
 }
 function finish(disconnect=false){
  if(finished)return;finished=true;
  cancelTimer(idleTimer);cancelTimer(lifeTimer);idleTimer=null;lifeTimer=null;
  chunks=[];live=Math.max(0,live-1);
  const count=(byTab.get(tab)||1)-1;
  if(count)byTab.set(tab,count);else byTab.delete(tab);
  try{disconnect?filter.disconnect():filter.close();}
  catch(_){if(!disconnect)try{filter.disconnect();}catch(__){}}
 }
 filter.ondata=event=>{
  if(finished)return;
  try{
   const chunk=new Uint8Array(event.data);
   if(size+chunk.byteLength>MAX_BYTES||chunks.length>=MAX_CHUNKS){
    original();filter.write(chunk);note(tab,"oversized");finish(true);return;
   }
   chunks.push(chunk);size+=chunk.byteLength;
   renewIdle();
  }catch(_){
   try{original();}catch(__){}
   note(tab,"errors");finish(true);
  }
 };
 filter.onstop=()=>{
  if(finished)return;
  let modifiedWriteAttempted=false,abort=false;
  try{
   const bytes=new Uint8Array(size);let offset=0;
   for(const chunk of chunks){bytes.set(chunk,offset);offset+=chunk.length;}
   const text=new TextDecoder("utf-8",{fatal:true}).decode(bytes);
   const next=rewrite(text);
   if(next.changed){
    const output=new TextEncoder().encode(next.text);
    modifiedWriteAttempted=true;filter.write(output);
    note(tab,"modified",next.removed);
   }else{original();note(tab,"unchanged");}
  }catch(_){
   if(!modifiedWriteAttempted)try{original();}catch(__){}
   if(modifiedWriteAttempted)abort=true;
   note(tab,"errors");
  }finally{finish(abort);}
 };
 filter.onerror=()=>{
  if(finished)return;
  try{original();}catch(_){}
  note(tab,"errors");finish(true);
 };
 if(typeof clock?.setTimeout==="function"){
  try{
   renewIdle();
   lifeTimer=clock.setTimeout(()=>flushAndDisconnect("timeout"),MAX_LIFETIME_MS);
   lifeTimer?.unref?.();
  }catch(_){ // A failed scheduler must not strand the interception.
   flushAndDisconnect("errors");
   return false;
  }
 }
 return true;
}
// Agent Nesty Meta 05 owns the reversible Facebook-only GraphQL experiment.
const EXPERIMENT_OWNER="agent_nesty_meta_05";
function experimentEnabled(settings,request,site){
 return settings?.enabled===true&&settings?.adRecognition===true&&
  settings?.metaGraphqlFilter===true&&eligible(request,site);
}
const API=Object.freeze({EXPERIMENT_OWNER,experimentEnabled,MAX_BYTES,MAX_FILTERS,MAX_PER_TAB,MAX_DELAY_MS,MAX_LIFETIME_MS,MAX_CHUNKS,
 validSite,route,eligible,protectedComposerPage,safeHeaders,adMetadata,sponsoredFields,adNode,sponsoredEdge,sponsoredRenderStrategy,sponsoredSearchNode,sponsoredSearchEdge,pruneFeedCollection,pruneSearchCollection,pruneRecord,pruneRequireEnvelope,safeRequireEnvelope,rewrite,attach,stats,clear});
root.DKMetaGraphQL=API;
if(typeof module!=="undefined")module.exports=API;
})(typeof globalThis!=="undefined"?globalThis:this);
