/* DK Live Block. Independent filter engine (partial ABP syntax). */
(function(g){"use strict";
const R=DKRules;
class FilterEngine {
 constructor(text=""){this.load(text);}
 load(text){
  this.hostIndex=new Map();this.tokenIndex=new Map();this.generic=[];this.special=[];this.paramRules=[];this.cosmetic=[];this.procedural=[];this.cosmeticGlobal=[];this.cosmeticByHost=new Map();this.proceduralByHost=new Map();this.networkCount=0;this.unsupportedCount=0;
  const pending=[],disabled=new Set();
  for(const raw of text.split(/\r?\n/)){const line=raw.trim();if(!line||line[0]==="!"||line[0]==="[")continue;
   const p=R.procedural(line);if(p){this.procedural.push(p);for(const domain of p.scope.split(","))if(!domain.startsWith("~"))this.addIndex(this.proceduralByHost,domain,p);continue;}
   const c=R.cosmetic(line);if(c){
    this.cosmetic.push(c);
    const parts=c.scope.split(",").map(x=>x.trim()).filter(x=>x&&!x.startsWith("~"));
    if(!parts.length)this.cosmeticGlobal.push(c);
    else for(const scope of parts)this.addIndex(this.cosmeticByHost,scope,c);
    continue;
   }
   const rule=R.network(line);if(!rule){this.unsupportedCount++;continue;}
   if(rule.badfilter)disabled.add(rule.key);else pending.push(rule);
  }
  for(const r of pending){if(disabled.has(r.key))continue;
   if(r.special){this.special.push(r);continue;}
   if(r.removeparam){this.paramRules.push(r);continue;}
   this.networkCount++;
   // The native regex parser escapes punctuation for unanchored plain
   // strings. Keep that exact compiled regex for Unicode or unusual URLs.
   // ASCII literal requests can use indexOf without running a RegExp.
   if(!r.p.startsWith("/")&&!r.p.startsWith("|")&&
      /^[\x21-\x7e]+$/.test(r.p)&&!/[\*\^|]/.test(r.p))
    r.fastLiteral=r.compiled.ignoreCase?r.p.toLowerCase():r.p;
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
 addIndex(index,domain,rule){
  const bucket=index.get(domain);
  if(bucket)bucket.push(rule);
  else index.set(domain,[rule]);
 }
 byHost(index,host){
  if(!host)return [];
  const parts=host.split("."),result=[];
  for(let i=0;i<parts.length;i++){
   const list=index.get(parts.slice(i).join("."));
   if(list)result.push(...list);
  }
  return result;
 }

 // Traverse buckets in their previous order without allocating a new
 // candidate array for each network request. Only tokens that actually
 // resolve to an indexed bucket occupy the deduplication set.
 visitCandidates(url,requestHost,visit,lowerURL){
  const host=requestHost===undefined?R.host(url):requestHost;
  for(const rule of this.generic)visit(rule);
  let suffix=host;
  for(;;){
   const bucket=this.hostIndex.get(suffix);
   if(bucket)for(const rule of bucket)visit(rule);
   const next=suffix.indexOf(".");
   if(next<0)break;
   suffix=suffix.slice(next+1);
  }
  if(!this.tokenIndex.size)return;
  const lower=lowerURL===undefined?url.toLowerCase():lowerURL,seen=new Set();
  for(let i=0;i<lower.length-3;i++){
   const token=lower.slice(i,i+4),bucket=this.tokenIndex.get(token);
   if(!bucket||seen.has(token))continue;
   seen.add(token);
   for(const rule of bucket)visit(rule);
  }
 }
 // Public/debug API remains array-returning, with unchanged rule order.
 candidates(url,requestHost){
  const result=[];
  this.visitCandidates(url,requestHost,rule=>result.push(rule));
  return result;
 }
 // Prechecked ASCII substring matching is equivalent to our escaped
 // literal regex. Always fall back to the original regex for Unicode.
 matchesRule(rule,url,lower,ascii){
  if(rule.fastLiteral&&ascii){
   return rule.compiled.ignoreCase?
    lower.includes(rule.fastLiteral):url.includes(rule.fastLiteral);
  }
  return rule.compiled.test(url);
 }
 cleanNavigation(raw){
  if(typeof raw!=="string"||raw.length>16000||!/^https?:\/\//i.test(raw)||!raw.includes("?"))return null;
  if(this.getPagePolicy(raw).document)return null;
  let url;try{url=new URL(raw);}catch(_){return null;}
  const host=R.host(raw),remove=new Set(),except=new Set();
  const reserved=new Set(["token","auth","signature","sig","state","code","key","expires"]);
  for(const rule of this.paramRules){
   if(rule.include.size&&!rule.include.has("document")||rule.exclude.has("document"))continue;
   if(!R.networkScopeMatches(host,rule.scope)||rule.third===true||rule.anchor&&!R.sub(host,rule.anchor)||!rule.compiled.test(raw))continue;
   if(rule.exception)except.add(rule.removeparam);else remove.add(rule.removeparam);
  }
  const protectedCampaignKeys=new Set(["utm_token","utm_auth","utm_signature",
   "utm_sig","utm_state","utm_code","utm_key","utm_expires",
   "utm_session","utm_nonce"]);
  // Retaining a signing field alone is insufficient: a cryptographic URL
  // signature may cover the entire original query and its exact ordering.
  // Do not rewrite any part of these access, callback or signed URLs.
  const protectedQuery=new Set([...reserved,
   "x-amz-signature","x-amz-algorithm","x-amz-credential","x-amz-security-token",
   "x-goog-signature","x-goog-credential","x-goog-algorithm",
   "googleaccessid","policy","signature","sig"]);
  for(const key of url.searchParams.keys()){
   const lower=key.toLowerCase();
   if(protectedQuery.has(lower)||protectedCampaignKeys.has(lower))return null;
  }
  const utmExceptions=new Set([...except].filter(name=>
   /^utm_[a-z0-9_]+$/i.test(name)).map(name=>name.toLowerCase()));
  let changed=false;
  for(const key of remove){
   if(key==="utm_*"){
    if(except.has(key))continue;
    for(const name of [...new Set(url.searchParams.keys())]){
     if(!/^utm_[a-z0-9_]+$/i.test(name)||except.has(name)||
        utmExceptions.has(name.toLowerCase())||reserved.has(name.toLowerCase())||
        protectedCampaignKeys.has(name.toLowerCase()))continue;
     url.searchParams.delete(name);changed=true;
    }
    continue;
   }
   if(except.has(key)||reserved.has(key.toLowerCase())||
      except.has("utm_*")&&/^utm_[a-z0-9_]+$/i.test(key)||
      !url.searchParams.has(key))continue;
   url.searchParams.delete(key);changed=true;
  }
  return changed?url.toString():null;
 }
 getPagePolicy(url){const policy={document:false,elemhide:false,generichide:false,genericblock:false},h=R.host(url);
  for(const r of this.special)if(R.networkScopeMatches(h,r.scope)&&(!r.anchor||R.sub(h,r.anchor))&&r.compiled.test(url))policy[r.special]=true;
  return policy;
 }
 checkRequest(url,type,docHost,policy={},method=""){
  if(typeof url!=="string"||url.length>16384||!/^https?:/i.test(url)||policy.document)return {block:false,rule:null};
  const target=R.host(url),kind=R.TYPE[type]||type||"other";
  const lower=url.toLowerCase(),ascii=!/[^\x00-\x7f]/.test(url);
  let block=null,allow=null,important=null;
  this.visitCandidates(url,target,r=>{
   if(kind==="popup"&&!r.include.has("popup"))return;
   if(r.methods){
    const m=typeof method==="string"?method.toUpperCase():"";
    if(!m||r.methods.no.has(m)||
       r.methods.yes.size&&!r.methods.yes.has(m))return;
   }
   if(policy.genericblock&&!r.scope&&!r.exception)return;
   if(r.include.size&&!r.include.has(kind)||r.exclude.has(kind)||!R.networkScopeMatches(docHost,r.scope))return;
   if(r.targetScope&&!R.domains(target,r.targetScope))return;
   if(r.denyallow&&R.domains(target,r.denyallow))return;
   if(r.third!==null&&r.third!==(!!(target&&docHost&&R.site(target)!==R.site(docHost))))return;
   if(r.anchor&&!R.sub(target,r.anchor)||!this.matchesRule(r,url,lower,ascii))return;
   if(r.exception)allow=r;else if(r.important)important=r;else block=r;
  },lower);
  return important?{block:true,rule:important}:allow?{block:false,rule:allow}:{block:!!block,rule:block};
 }
 shouldBlock(url,type,docHost,policy,method){return this.checkRequest(url,type,docHost,policy,method).block;}
 getProcedural(h,policy={}){
  if(policy.document||policy.elemhide)return [];
  const matching=this.byHost(this.proceduralByHost,h).filter(x=>R.domains(h,x.scope,","));
  const key=x=>x.selector+"|"+x.mode+"|"+
   (x.mode==="attr"?x.attribute+"="+x.value:x.mode==="css"?
    x.property+"="+x.value:(x.text||x.target));
  const except=new Set(matching.filter(x=>x.exception).map(key));
  // Repeated entries in independently maintained lists must not consume
  // scarce page-world scan slots or multiply DOM querySelectorAll work.
  const seen=new Set(),results=[];
  for(const x of matching){
   const fingerprint=key(x);
   if(x.exception||except.has(fingerprint)||seen.has(fingerprint))continue;
   seen.add(fingerprint);
   results.push({selector:x.selector,mode:x.mode,
    ...(x.mode==="text"?{text:x.text}:x.mode==="attr"?
     {attribute:x.attribute,value:x.value}:x.mode==="css"?
     {property:x.property,value:x.value}:{target:x.target})});
   if(results.length>=300)break;
  }
  return results;
 }
 getSelectors(h,policy={},limit=Infinity){
  if(policy.document||policy.elemhide)return [];
  const hidden=new Set(),exceptions=new Set(),specific=this.byHost(this.cosmeticByHost,h);
  for(const r of [...this.cosmeticGlobal,...specific])
   if(R.domains(h,r.scope,",")&&!(policy.generichide&&!r.scope))
    (r.exception?exceptions:hidden).add(r.selector);
  for(const selector of exceptions)hidden.delete(selector);
  // Preserve the long-standing global-first order for ordinary pages.
  // Only when the caller will truncate an oversized selector collection
  // prioritize relevant explicit-site selectors before broad generic ones.
  if(limit===0)return [];
  if(!Number.isSafeInteger(limit)||limit<0||hidden.size<=limit)return [...hidden];
  const selected=[],used=new Set();
  for(const r of specific){
   if(!r.exception&&!used.has(r.selector)&&hidden.has(r.selector)){
    used.add(r.selector);selected.push(r.selector);
    if(selected.length>=limit)return selected;
   }
  }
  for(const selector of hidden){
   if(used.has(selector))continue;
   selected.push(selector);
   if(selected.length>=limit)break;
  }
  return selected;
 }
}
g.DKFilter={FilterEngine};
if(typeof module!=="undefined")module.exports=g.DKFilter;
})(typeof globalThis!=="undefined"?globalThis:this);
