/* DK Live Block / Agent Nesty Meta 01-03, Build 266.
   Local simulated evasions only; no tracking, remote AI or standalone blocking.
   Single-post safety checks remain the responsibility of DKFacebookAds. */
(function(root){"use strict";
const agents=Object.freeze([
 Object.freeze({id:"agent_nesty_meta_01",status:"armed",job:"Short segmented Sponsored labels"}),
 Object.freeze({id:"agent_nesty_meta_02",status:"armed",job:"Sponsored menu wording variants"}),
 Object.freeze({id:"agent_nesty_meta_03",status:"armed",job:"Event-driven label CSS rechecks"})
]);
function normalize(t){return String(t||"").replace(/[\p{Cf}\p{Mn}\p{Co}]/gu,"").replace(/[\s·•|]+/g," ").trim().toLowerCase();}
function label(t){const s=normalize(t);return s==="sponsored"||s==="ad";}
function segmentedLabels(el,win){
 const nodes=Array.from(el?.children||[]);
 if(nodes.length<2||nodes.length>8||nodes.some(n=>n?.tagName!=="SPAN"||(n.children?.length||0)!==0))return [];
 let total=0;const chunks=[];
 for(let i=0;i<nodes.length;i++){
  const n=nodes[i],text=String(n.textContent||"");
  if(!text||text.length>12||(total+=text.length)>40)return [];
  chunks.push({n,text,index:i});
 }
 if(!/spon|ad/i.test(chunks.map(x=>x.text).join("")))return [];
 const ordered=[];
 for(const x of chunks){
  let order=x.index,hidden=false;
  try{
   const c=win?.getComputedStyle?.(x.n),rank=Number.parseInt(c?.order,10);
   if(Number.isSafeInteger(rank)&&Math.abs(rank)<=10000)order=rank;
   hidden=c?.display==="none"||c?.visibility==="hidden";
  }catch(_){}
  if(!hidden)ordered.push({text:x.text,order,index:x.index,classes:x.n.classList?.length||0});
 }
 if(ordered.length<2)return [];
 ordered.sort((a,b)=>a.order-b.order||a.index-b.index);
 return [...new Set([ordered,ordered.filter(x=>x.classes>10),ordered.filter(x=>x.classes<=10)]
  .map(xs=>xs.map(x=>x.text).join("")).filter(label))];
}
function sponsoredAction(el){
 const s=normalize(el?.getAttribute?.("aria-label"));
 if(s.length<15||s.length>132||
   !/^(?:(?:open|view|more) (?:menu|actions|options) for sponsored content|(?:menu|actions|options) for sponsored content|sponsored content (?:menu|actions|options))$/.test(s))return false;
 return String(el.tagName||"").toUpperCase()==="BUTTON"||el.getAttribute?.("role")==="button"||el.getAttribute?.("aria-haspopup")==="menu";
}
function labelMutation(change,win){
 if(change?.type!=="attributes"||
  !["class","style","hidden","aria-hidden"].includes(change.attributeName))return false;
 let node=change.target;
 if(node?.nodeType!==1)return false;
 for(let i=0;node&&i<3;i++,node=node.parentElement){
  if(node.tagName!=="SPAN")continue;
  const t=String(node.textContent||"");
  if(!t||t.length>48||node.closest?.('p,blockquote,[role="paragraph"],[role="dialog"],form,nav')||
   !node.closest?.('main,[role="main"],[role="complementary"]'))continue;
  if(label(t)||segmentedLabels(node,win).length)return true;
 }
 return false;
}
const api=Object.freeze({agents,segmentedLabels,sponsoredAction,labelMutation});
root.DKMetaAgentNesty=api;
if(typeof module!=="undefined")module.exports=api;
})(typeof globalThis!=="undefined"?globalThis:this);
