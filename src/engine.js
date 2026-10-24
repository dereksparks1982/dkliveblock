/* DK Live Block. Independent filter engine (partial ABP syntax). */
(function(g){"use strict";
const R=DKRules;
class FilterEngine {
 constructor(text=""){this.load(text);}
 load(text){
  this.hostIndex=new Map();this.tokenIndex=new Map();this.generic=[];this.special=[];this.cosmetic=[];this.procedural=[];this.networkCount=0;this.unsupportedCount=0;
  const pending=[],disabled=new Set();
  for(const raw of text.split(/\r?\n/)){const line=raw.trim();if(!line||line[0]==="!"||line[0]==="[")continue;
   const p=R.procedural(line);if(p){this.procedural.push(p);continue;}
   const c=R.cosmetic(line);if(c){this.cosmetic.push(c);continue;}
   const rule=R.network(line);if(!rule){this.unsupportedCount++;continue;}
   if(rule.badfilter)disabled.add(rule.key);else pending.push(rule);
  }
  for(const r of pending){if(disabled.has(r.key))continue;
   if(r.special){this.special.push(r);continue;}
   this.networkCount++;
   if(!r.anchor){
    const text=r.p.startsWith("/")&&r.p.endsWith("/")?[]:r.p.split(/[\*\^\|]/).filter(x=>x.length>=4);
    const token=text.sort((a,b)=>b.length-a.length)[0]?.toLowerCase().slice(0,4);
    if(token){if(!this.tokenIndex.has(token))this.tokenIndex.set(token,[]);this.tokenIndex.get(token).push(r);}else this.generic.push(r);
    continue;
   }
   if(!this.hostIndex.has(r.anchor))this.hostIndex.set(r.anchor,[]);
   this.hostIndex.get(r.anchor).push(r);
  }
 }
 candidates(url){const result=this.generic.slice(),parts=R.host(url).split(".");
  for(let i=0;i<parts.length;i++){const rules=this.hostIndex.get(parts.slice(i).join("."));if(rules)result.push(...rules);}
  const lower=url.toLowerCase(),seen=new Set();
  for(let i=0;i<lower.length-3;i++){const token=lower.slice(i,i+4);if(seen.has(token))continue;seen.add(token);const rules=this.tokenIndex.get(token);if(rules)result.push(...rules);}
  return result;
 }
 getPagePolicy(url){const policy={document:false,elemhide:false,generichide:false,genericblock:false},h=R.host(url);
  for(const r of this.special)if(R.domains(h,r.scope)&&(!r.anchor||R.sub(h,r.anchor))&&r.compiled.test(url))policy[r.special]=true;
  return policy;
 }
 checkRequest(url,type,docHost,policy={}){
  if(!/^https?:/i.test(url)||policy.document)return {block:false,rule:null};
  const target=R.host(url),kind=R.TYPE[type]||type||"other";
  let block=null,allow=null,important=null;
  for(const r of this.candidates(url)){
   if(policy.genericblock&&!r.scope&&!r.exception)continue;
   if(r.include.size&&!r.include.has(kind)||r.exclude.has(kind)||!R.domains(docHost,r.scope))continue;
   if(r.third!==null&&r.third!==(R.site(target)!==R.site(docHost)))continue;
   if(r.anchor&&!R.sub(target,r.anchor)||!r.compiled.test(url))continue;
   if(r.exception)allow=r;else if(r.important)important=r;else block=r;
  }
  return important?{block:true,rule:important}:allow?{block:false,rule:allow}:{block:!!block,rule:block};
 }
 shouldBlock(url,type,docHost,policy){return this.checkRequest(url,type,docHost,policy).block;}
 getProcedural(h,policy={}){
  if(policy.document||policy.elemhide)return [];
  const matching=this.procedural.filter(x=>R.domains(h,x.scope,","));
  const except=new Set(matching.filter(x=>x.exception).map(x=>x.selector+"|"+x.text));
  return matching.filter(x=>!x.exception&&!except.has(x.selector+"|"+x.text)).map(x=>({selector:x.selector,text:x.text}));
 }
 getSelectors(h,policy={}){
  if(policy.document||policy.elemhide)return [];
  const hidden=new Set(),exceptions=new Set();
  for(const r of this.cosmetic)if(R.domains(h,r.scope,",")&&!(policy.generichide&&!r.scope))(r.exception?exceptions:hidden).add(r.selector);
  for(const s of exceptions)hidden.delete(s);return [...hidden];
 }
}
g.DKFilter={FilterEngine};
if(typeof module!=="undefined")module.exports=g.DKFilter;
})(typeof globalThis!=="undefined"?globalThis:this);
