/* DK Live Block: shared rule helpers. */
(function(g){"use strict";
const TYPE={main_frame:"document",sub_frame:"subdocument",xmlhttprequest:"xmlhttprequest",imageset:"image",beacon:"ping"};
const ALIASES={xhr:"xmlhttprequest",css:"stylesheet",frame:"subdocument",
 doc:"document",ghide:"generichide",ehide:"elemhide",popunder:"popup"};
const RES=new Set(["script","image","stylesheet","media","font","object","xmlhttprequest","subdocument","document","ping","websocket","other","popup"]);
const SUFFIX=new Set(["co.uk","org.uk","ac.uk","gov.uk","net.uk","me.uk","co.nz","org.nz","govt.nz","ac.nz","net.nz","com.au","net.au","org.au","edu.au","gov.au","asn.au","id.au","com.br","net.br","org.br","gov.br","co.jp","ne.jp","or.jp","ac.jp","go.jp","co.kr","ne.kr","or.kr","go.kr","ac.kr","co.in","net.in","org.in","firm.in","gen.in","ind.in","ac.in","gov.in","com.mx","org.mx","gob.mx","com.ar","net.ar","org.ar","gob.ar","com.tr","com.cn","net.cn","org.cn","gov.cn","com.tw","org.tw","gov.tw","com.hk","com.sg","com.my","com.ph","com.pk","co.id","co.th","co.za","co.ke","com.ng","com.gh","co.ug","co.tz","co.il","org.il","gov.il","ac.il","com.eg","com.sa","com.ua","com.ru","github.io","pages.dev","netlify.app","vercel.app","blogspot.com","appspot.com","herokuapp.com","workers.dev","web.app","firebaseapp.com","azurewebsites.net","cloudfront.net","s3.amazonaws.com"]);
function host(url){try{return new URL(url).hostname.toLowerCase().replace(/\.$/,"");}catch(_){return "";}}
function sub(h,d){return Boolean(h&&d&&(h===d||h.endsWith("."+d)));}
function site(h){
 if(!h||!h.includes(".")||h.includes(":")||/^\d+\.\d+\.\d+\.\d+$/.test(h))return h;
 const psl=typeof DKPublicSuffix!=="undefined"?DKPublicSuffix:
  typeof require==="function"?require("./public-suffix.js"):null;
 if(psl)return psl.registrable(h);
 const b=h.replace(/\.$/,"").split(".");
 return b.slice(-(SUFFIX.has(b.slice(-2).join("."))?3:2)).join(".");
}
function domains(h,list,sep="|"){if(!list)return true;const a=list.split(sep),yes=a.filter(x=>x&&!x.startsWith("~"));return !a.some(x=>x.startsWith("~")&&sub(h,x.slice(1)))&&(!yes.length||yes.some(x=>sub(h,x)));}

function validDomains(str){
 if(typeof str!=="string"||str.length>1500||!str)return false;
 const parts=str.split("|");
 return parts.length<=64&&parts.every(p=>{
  const hostname=p.startsWith("~")?p.slice(1):p;
  return !!hostname&&hostname.length<=253&&!hostname.includes("..")&&!hostname.startsWith(".")&&!hostname.endsWith(".")&&
   hostname.split(".").every(label=>/^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/.test(label));
 });
}
// Only the source-domain option of *network* filters accepts a single-label
// entity shorthand (e.g. publisher.*). Keep validDomains strict for URLs,
// origins, manual destination controls, and target/denyallow restrictions.
function validNetworkScope(scope){
 if(typeof scope!=="string"||!scope||scope.length>1500)return false;
 const parts=scope.split("|");
 return parts.length<=64&&parts.every(raw=>{
  const label=raw.startsWith("~")?raw.slice(1):raw;
  return /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)\.\*$/.test(label)||
    validDomains(label);
 });
}
function networkScopeMatches(hostname,scope){
 if(!scope)return true;
 if(typeof hostname!=="string"||!hostname)return false;
 const pieces=scope.split("|"),positives=pieces.filter(x=>x&&!x.startsWith("~"));
 const match=raw=>{
  if(raw.endsWith(".*")){
   const entity=raw.slice(0,-2);
   const registered=site(hostname);
   // Compare only the registrable site's entity label. A forged host like
   // publisher.evil.com must not match publisher.*.
   return registered.includes(".")&&registered.split(".")[0]===entity;
  }
  return sub(hostname,raw);
 };
 return !pieces.some(x=>x.startsWith("~")&&match(x.slice(1)))&&
  (!positives.length||positives.some(match));
}
function regex(pattern,matchCase=false){
 if(pattern[0]==="/"&&pattern.endsWith("/")&&pattern.length>2){const expr=pattern.slice(1,-1);if(expr.length>512||/\\[1-9]|\(\?<|\([^)]*[+*][^)]*\)[+*{]/.test(expr))return null;
  // Reject obvious polynomial/exponential backtracking patterns from untrusted lists.
  if(/\((?:\?:)?[^()]*\|[^()]*\)[+*{]/.test(expr)||/\.\*\.\*/.test(expr)||
     /\([^()]*\{\d+(?:,\d*)?\}[^()]*\)(?:[+*]|\{\d)/.test(expr)||
     /\([^)]*\)[+*][+*]/.test(expr))return null;try{return new RegExp(expr,matchCase?"":"i");}catch(_){return null;}}
 let p=pattern,start="",end="";
 if(p.startsWith("||")){start="^[a-z][a-z0-9+.-]*:\\/\\/(?:[^/?#@:]*\\.)?";p=p.slice(2);}
 else if(p[0]==="|"){start="^";p=p.slice(1);}
 if(p.endsWith("|")){end="$";p=p.slice(0,-1);}
 let s="";for(const c of p)s+=c==="*" ? ".*" : c==="^" ? "(?:[^a-zA-Z0-9_.%-]|$)" : /[\\.^$+?{}()[\]|]/.test(c)?"\\"+c:c;
 try{return new RegExp(start+s+end,matchCase?"":"i");}catch(_){return null;}
}
function network(raw){
 let line=raw.trim();if(!line||/^[!\[#]/.test(line)||/#[@$?%^]*[#^]/.test(line))return null;
 const exception=line.startsWith("@@");if(exception)line=line.slice(2);
 let p=line,opts=[],i=line.lastIndexOf("$");
 // "$script,domain=..." and "$removeparam=..." are option-only rules.
 // Their implicit URL pattern is "*", not the literal option text.
 // In particular, do not silently accept unknown option syntax as a rule.
 if(i>=0&&/^[a-z0-9~-]+(?:[=,]|$)/i.test(line.slice(i+1))){
  p=i===0?"*":line.slice(0,i);opts=line.slice(i+1).split(",");
 }
 if(!p||p.startsWith("$")||p.length>2048||/\s/.test(p)||p.startsWith("javascript:"))return null;
 const include=new Set(),exclude=new Set();let scope="",targetScope="",denyallow="",third=null,important=false,badfilter=false,special="",matchCase=false,removeparam="",redirect="",methods=null;
 for(const item of opts){const neg=item[0]==="~",o=neg?item.slice(1):item;
  if((o.startsWith("domain=")||o.startsWith("from="))&&!neg){
   if(scope)return null;
   scope=o.slice(o.indexOf("=")+1).toLowerCase();
   if(!validNetworkScope(scope))return null;
   continue;
  }
  if(o.startsWith("to=")&&!neg){if(targetScope)return null;targetScope=o.slice(3).toLowerCase();if(!validDomains(targetScope))return null;continue;}
  if(o.startsWith("denyallow=")&&!neg){if(denyallow)return null;denyallow=o.slice(10).toLowerCase();if(!validDomains(denyallow)||denyallow.includes("~"))return null;continue;}
  if(o.startsWith("removeparam=")&&!neg){
   if(removeparam)return null;
   removeparam=o.slice(12);
   if(removeparam!=="utm_*"&&!/^[a-zA-Z0-9_.~-]{1,64}$/.test(removeparam))return null;
   continue;
  }
  if(o.startsWith("method=")&&!neg){
   if(methods)return null;
   const entries=o.slice(7).toUpperCase().split("|");
   const known=new Set(["GET","POST","HEAD","PUT","PATCH","DELETE","OPTIONS"]);
   if(!entries.length||entries.length>7||
      entries.some(x=>!known.has(x.startsWith("~")?x.slice(1):x)))return null;
   const yes=new Set(entries.filter(x=>!x.startsWith("~")));
   const no=new Set(entries.filter(x=>x.startsWith("~")).map(x=>x.slice(1)));
   if([...yes].some(x=>no.has(x)))return null;
   methods={yes,no};continue;
  }
  if(o.startsWith("redirect=")&&!neg){
   const name=o.slice(9);
   if(redirect||!["noop.js","empty.css"].includes(name)||exception)return null;
   redirect=name;continue;
  }
  if(o==="third-party"||o==="3p"){third=!neg;continue;}
  if(o==="first-party"||o==="1p"){third=neg;continue;}
  if(o==="match-case"){matchCase=!neg;continue;}
  if(o==="important"&&!neg){important=true;continue;}
  if(o==="badfilter"&&!neg){badfilter=true;continue;}
  const resource=ALIASES[o]||o;
  if(["document","elemhide","generichide","genericblock"].includes(resource)&&exception&&!neg){special=resource;continue;}
  if(RES.has(resource)){(neg?exclude:include).add(resource);continue;}return null;
 }
 // Entity scopes only affect network request matching. Do not broaden
 // document/page policies or query rewriting through a syntax extension.
 if(scope.includes(".*")&&(special||removeparam))return null;
 if(denyallow&&!scope)return null;
 // Page policies and query cleanup have no resource request method.
 if(methods&&(special||removeparam))return null;
 // Navigation query cleanup cannot honor request-target scope or denyallow
 // semantics. Reject instead of silently broadening the author's rule.
 if(removeparam&&(targetScope||denyallow||redirect||special||
   third===true||exclude.has("document")||
   include.size&&!(include.size===1&&include.has("document"))))return null;
 // Never allow broad, arbitrary, media, navigation or sign-in substitutions.
 if(redirect){
  const kind=redirect==="noop.js"?"script":"stylesheet";
  if(include.size!==1||!include.has(kind)||exclude.size||removeparam||special||
     !(scope||p.startsWith("||")))return null;
 }
 const compiled=regex(p,matchCase);if(!compiled)return null;
 // Index by exact host only if syntax specifies a real hostname boundary.
 // "||ad*.example", "||adserver" and "||example.*/ads" are prefixes,
 // not full hosts. The token index must still see those rules.
 let anchor="";
 if(p.startsWith("||")){
  const m=/^\|\|([a-z0-9.-]+)(?=[\^/|?:])/i.exec(p);
  if(m&&!m[1].endsWith("."))anchor=m[1].toLowerCase();
 }
 return {p,compiled,anchor,exception,include,exclude,scope,targetScope,denyallow,third,important,badfilter,special,removeparam,redirect,methods,key:[p,exception?"allow":"block",...opts.filter(x=>x!=="badfilter").sort()].join("|")};
}

function cosmetic(line){
 const m=/^([^#]*)(#@#|##)(.+)$/.exec(line.trim());if(!m)return null;
 const scope=m[1].toLowerCase();
 let selector=m[3].trim();
 // A narrow, safe subset of uBO :style(): hiding with CSS only.
 // Translate into an ordinary cosmetic hide and reuse existing site policies,
 // exceptions, authentication protection and video-player safeguards.
 // Never interpret arbitrary style declarations from downloaded lists.
 if(/:style\(/i.test(selector)){
  const parts=/^(.+):style\(\s*display\s*:\s*none\s*!important\s*;?\s*\)$/i.exec(selector);
  if(!parts||!scope||!validDomains(scope.replace(/,/g,"|"))||
     !scope.split(",").some(x=>x&&!x.startsWith("~")))return null;
  selector=parts[1].trim();
  if(!selector||selector.length>320||
     !/^[a-zA-Z0-9_.#>+~:\[\]="' *-]+$/.test(selector)||
     /^(?:\*|html|body|head|main|video|audio|iframe|object|embed|form|input|button|textarea|select)(?:$|[.#:[ >+~])/i.test(selector)||
     /^(?:#movie_player|\.html5-video-player)(?:$|[.#:[ >+~])/i.test(selector))return null;
 }
 if(!selector||selector.length>600||/[{};\r\n]/.test(selector)||!/^[\w.~, -]*$/.test(scope)||/\+js\(|:-abp-|:has-text\(|:style\(|:remove\(|:matches-css\(|:matches-attr\(|:upward\(|:xpath\(|:contains\(|:watch-attr\(/i.test(selector))return null;
 return {scope,selector,exception:m[2]==="#@#"};
}
function procedural(line){
 const match=/^([^#]+)(#@\?#|#\?#|#@#|##)(.+)$/.exec(line.trim());if(!match)return null;
 const scope=match[1].toLowerCase(),raw=match[3].trim();
 const standard=match[2]==="##"||match[2]==="#@#";
 if(standard&&!/:(?:has-text|contains|matches-attr|matches-css)\(/i.test(raw))return null;
 const sites=scope.split(",");
 const included=sites.filter(h=>!h.startsWith("~"));
 if(!included.length||sites.length>16||
   sites.some(item=>{
    const h=item.startsWith("~")?item.slice(1):item;
    return !h||h.length>253||h.includes("..")||
     !h.split(".").every(part=>/^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/.test(part));
   }))
  return null;
 // First-party, bounded literal subset of uBO :matches-css().
 // No downloaded regular expressions, selector traversal, or style writes.
 // The reversible page-side procedural hider applies existing player/login
 // protection and never removes nodes from the document.
 const css=/^([a-z.#][\w.#>\[\]="'\s:-]{0,160}):matches-css\(\s*(position|display|visibility|opacity|z-index)\s*:\s*([a-z0-9.+-]{1,32})\s*\)$/i.exec(raw);
 if(css&&/^(?:[a-z]|[.#][a-z_])/i.test(css[1].trim())){
  const property=css[2].toLowerCase(),value=css[3].toLowerCase();
  if((property==="position"&&/^(?:fixed|absolute|sticky|relative|static)$/.test(value))||
     (property==="display"&&/^(?:none|block|flex|grid|inline|inline-block)$/.test(value))||
     (property==="visibility"&&/^(?:visible|hidden|collapse)$/.test(value))||
     (property==="opacity"&&/^(?:0(?:\.\d{1,3})?|1(?:\.0{1,3})?)$/.test(value))||
     (property==="z-index"&&/^(?:auto|-?\d{1,6})$/.test(value)))
   return {scope,selector:css[1].trim(),mode:"css",property,value,
    exception:match[2]==="#@?#"||match[2]==="#@#"};
  return null;
 }
 // Deliberately conservative subset of :matches-attr. Match a single
 // attribute's *literal* value only, without regexes or executable actions.
 // Domain-scoped rules only; generic/global procedural actions stay rejected.
 const attribute=/^([a-z.#][\w.#>[\]="'\s:-]{0,160}):matches-attr\(([a-zA-Z_][a-zA-Z0-9_:-]{0,63})=([^()]{1,120})\)$/i.exec(raw);
 if(attribute&&/^(?:[a-z]|[.#][a-z_])/i.test(attribute[1].trim())){
  let literal=attribute[3].trim();
  if(literal.length>=2&&(literal[0]==='"'&&literal.endsWith('"')||
     literal[0]==="'"&&literal.endsWith("'")))literal=literal.slice(1,-1);
  if(literal.length>=1&&literal.length<=90&&
     /^[a-zA-Z0-9 _.:/@+-]+$/.test(literal)&&
     !(literal[0]==="/"&&literal.endsWith("/")))
   return {scope,selector:attribute[1].trim(),mode:"attr",
    attribute:attribute[2],value:literal,
    exception:match[2]==="#@?#"||match[2]==="#@#"};
  return null;
 }
 const contains=/^([a-z.#][\w.#>[\]="'\s:-]{0,160})(?::-abp-contains|:-abp-has-text|:has-text|:contains)\(([^()]{1,120})\)$/i.exec(raw);
 if(contains){
  if(!/^(?:[a-z]|[.#][a-z_])/i.test(contains[1].trim()))return null;
  let text=contains[2].trim();
  // A mismatched quote or /pattern/flags expression is not a literal.
  // Refusing it avoids claiming a rule works when it silently cannot match.
  if(text.startsWith('"')!==text.endsWith('"')||
     text.startsWith("'")!==text.endsWith("'"))return null;
  if((text.startsWith('"')&&text.endsWith('"'))||
     (text.startsWith("'")&&text.endsWith("'")))text=text.slice(1,-1);
  if(!text||/^\/.*\/[a-z]*$/i.test(text)||
     /[{};\\\x00-\x1f\x7f]/.test(text))return null;
  return {scope,selector:contains[1].trim(),mode:"text",text,
   exception:match[2]==="#@?#"||match[2]==="#@#"};
 }
 const has=/^([a-z.#][\w.#>[\]="'\s:-]{0,160})(?::-abp-has|:has)\(([^()]{1,150})\)$/i.exec(raw);
 if(has&&/^(?:[a-z]|[.#][a-z_])/i.test(has[1].trim())&&/^[a-zA-Z.#\[][a-zA-Z0-9_.#>[\]="'\s:*-]*$/.test(has[2])&&!/[{};\\]/.test(has[2]))
  return {scope,selector:has[1].trim(),mode:"has",target:has[2].trim(),exception:match[2]==="#@?#"};
 return null;
}
g.DKRules={TYPE,RES,SUFFIX,host,sub,site,domains,regex,network,cosmetic,procedural,
 validDomains,validNetworkScope,networkScopeMatches};
if(typeof module!=="undefined")module.exports=g.DKRules;
})(typeof globalThis!=="undefined"?globalThis:this);
