/* DK Live Block: first-party Meta GraphQL advertising response filtering.
   Independent bounded implementation inspired by the documented shapes in
   uAssets. No uBlock scriptlet code, foreign engine or network telemetry.
   Unrecognized/invalid payloads remain byte-for-byte untouched. */
(function(root){"use strict";
const MAX_BYTES=1500000,MAX_FILTERS=8,MAX_PER_TAB=2,MAX_DELAY_MS=4000,MAX_RECORDS=1000;
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
function eligible(d,site){
 if(!d||d.type!=="xmlhttprequest"||d.statusCode!==200||
    String(d.method||"").toUpperCase()!=="POST"||
    !Number.isSafeInteger(d.tabId)||d.tabId<0||!route(d.url)||!validSite(site))return false;
 try{
  const u=new URL(d.documentUrl||d.originUrl||"");
  return u.protocol==="https:"&&validSite(u.hostname)&&!u.username&&!u.password;
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
// Match affirmative ad metadata on an explicitly recognized feed unit,
// not an arbitrary "sponsored" string embedded in normal user content.
function adNode(n){
 return object(n)&&(n.__typename==="SponsoredData"||
   n.__typename==="MarketplaceFeedAdStory"||
   n.role==="SEARCH_ADS"||
   object(n.sponsored_data)&&("ad_id" in n.sponsored_data||
     n.sponsored_data.__typename==="SponsoredData")||
   object(n.story)&&object(n.story.sponsored_data)&&
    ("ad_id" in n.story.sponsored_data||
     n.story.sponsored_data.__typename==="SponsoredData")||
   object(n.relay_rendering_strategy?.view_model?.story?.sponsored_data)&&
    "ad_id" in n.relay_rendering_strategy.view_model.story.sponsored_data);
}
function sponsoredEdge(edge){
 if(!object(edge)||!object(edge.node))return false;
 return edge.category==="SPONSORED"||adNode(edge.node)||
   object(edge.relay_rendering_strategy?.view_model?.story?.sponsored_data)&&
    "ad_id" in edge.relay_rendering_strategy.view_model.story.sponsored_data;
}
function pruneEdges(parent){
 return dropFromArray(parent,"edges",sponsoredEdge);
}
function pruneRecord(doc){
 if(!object(doc)||doc.error||Array.isArray(doc.errors)&&doc.errors.length)return 0;
 const data=doc.data;if(!object(data))return 0;
 let removed=0;
 const viewer=data.viewer;
 if(object(viewer)){
  if(object(viewer.news_feed))removed+=pruneEdges(viewer.news_feed);
  // Facebook also embeds Marketplace sponsored stories inside these
  // dedicated feed collections. Never inspect a generic user-owned array.
  if(object(viewer.marketplace_feed_stories))
   removed+=pruneEdges(viewer.marketplace_feed_stories);
  const side=viewer.sideFeedUnit;
  if(object(side)&&Array.isArray(side.nodes)&&side.nodes.length<=MAX_RECORDS){
   // new_adverts is a dedicated ad slot. Only remove explicitly marked ad
   // records. Retain non-ad data and all unknown response shapes.
   for(const unit of side.nodes){
    if(!object(unit)||!object(unit.new_adverts))continue;
    removed+=dropFromArray(unit.new_adverts,"nodes",ad=>
     object(ad)&&(object(ad.sponsored_data)||
      ad.__typename==="SponsoredData"||ad.__typename==="AdsSideFeedUnit"));
   }
   removed+=dropFromArray(side,"nodes",n=>
    object(n)&&n.__typename==="AdsSideFeedUnit"&&
    (!object(n.new_adverts)||!Array.isArray(n.new_adverts.nodes)||
      n.new_adverts.nodes.length===0));
  }
 }
 const results=data.serpResponse?.results;
 if(object(results))removed+=pruneEdges(results);
 const marketUnits=data.marketplace_search?.feed_units;
 if(object(marketUnits))removed+=pruneEdges(marketUnits);
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
function prunePayload(doc){
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
  if(removed)result={text:prefix+whitespace[1]+JSON.stringify(obj)+whitespace[3],changed:true,removed};
 }catch(_){}
 if(result)return result;
 // Facebook also delivers one JSON record per line, sometimes following
 // its anti-JSON-hijacking prefix. Leave non-JSON lines and delimiters intact.
 if(!raw.includes("\n"))return {text,changed:false,removed:0};
 const parts=raw.split(/(\r?\n)/);
 let removed=0;
 for(let i=0;i<parts.length;i+=2){
  const line=parts[i],m=/^(\s*)([\s\S]*?)(\s*)$/.exec(line);
  if(!m||!m[2].startsWith("{"))continue;
  try{
   const obj=JSON.parse(m[2]);const n=prunePayload(obj);
   if(n){parts[i]=m[1]+JSON.stringify(obj)+m[3];removed+=n;}
  }catch(_){}
 }
 return removed?{text:prefix+parts.join(""),changed:true,removed}:
  {text,changed:false,removed:0};
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
 let chunks=[],size=0,cursor=0,finished=false,deadline=null;
 function original(){
  // Move the cursor before writing, never replay a partially written chunk.
  while(cursor<chunks.length)filter.write(chunks[cursor++]);
  chunks=[];cursor=0;
 }
 function finish(disconnect=false){
  if(finished)return;finished=true;
  try{if(deadline!==null)clock?.clearTimeout?.(deadline);}catch(_){}
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
   if(size+chunk.byteLength>MAX_BYTES){
    original();filter.write(chunk);note(tab,"oversized");finish(true);return;
   }
   chunks.push(chunk);size+=chunk.byteLength;
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
   deadline=clock.setTimeout(()=>{
    if(finished)return;
    try{original();}catch(_){}
    note(tab,"timeout");finish(true);
   },MAX_DELAY_MS);
   deadline?.unref?.();
  }catch(_){}
 }
 return true;
}
const API=Object.freeze({MAX_BYTES,MAX_FILTERS,MAX_PER_TAB,MAX_DELAY_MS,
 validSite,route,eligible,safeHeaders,pruneRecord,pruneRequireEnvelope,rewrite,attach,stats,clear});
root.DKMetaGraphQL=API;
if(typeof module!=="undefined")module.exports=API;
})(typeof globalThis!=="undefined"?globalThis:this);
