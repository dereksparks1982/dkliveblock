/* DK Live Block: shared rule helpers. */
(function(g){"use strict";
const TYPE={main_frame:"document",sub_frame:"subdocument",xmlhttprequest:"xmlhttprequest",imageset:"image",beacon:"ping"};
const ALIASES={xhr:"xmlhttprequest",css:"stylesheet",frame:"subdocument"};
const RES=new Set(["script","image","stylesheet","media","font","object","xmlhttprequest","subdocument","document","ping","websocket","other","popup"]);
const SUFFIX=new Set(["co.uk","org.uk","ac.uk","gov.uk","net.uk","me.uk","co.nz","org.nz","govt.nz","ac.nz","net.nz","com.au","net.au","org.au","edu.au","gov.au","asn.au","id.au","com.br","net.br","org.br","gov.br","co.jp","ne.jp","or.jp","ac.jp","go.jp","co.kr","ne.kr","or.kr","go.kr","ac.kr","co.in","net.in","org.in","firm.in","gen.in","ind.in","ac.in","gov.in","com.mx","org.mx","gob.mx","com.ar","net.ar","org.ar","gob.ar","com.tr","com.cn","net.cn","org.cn","gov.cn","com.tw","org.tw","gov.tw","com.hk","com.sg","com.my","com.ph","com.pk","co.id","co.th","co.za","co.ke","com.ng","com.gh","co.ug","co.tz","co.il","org.il","gov.il","ac.il","com.eg","com.sa","com.ua","com.ru","github.io","pages.dev","netlify.app","vercel.app","blogspot.com","appspot.com","herokuapp.com","workers.dev","web.app","firebaseapp.com","azurewebsites.net","cloudfront.net","s3.amazonaws.com"]);
function host(url){try{return new URL(url).hostname.toLowerCase().replace(/\.$/,"");}catch(_){return "";}}
function sub(h,d){return Boolean(h&&d&&(h===d||h.endsWith("."+d)));}
function site(h){if(!h||!h.includes(".")||h.includes(":")||/^\d+\.\d+\.\d+\.\d+$/.test(h))return h;const b=h.replace(/\.$/,"").split(".");return b.slice(-(SUFFIX.has(b.slice(-2).join("."))?3:2)).join(".");}
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
function regex(pattern,matchCase=false){
 if(pattern[0]==="/"&&pattern.endsWith("/")&&pattern.length>2){const expr=pattern.slice(1,-1);if(expr.length>512||/\\[1-9]|\(\?<|\([^)]*[+*][^)]*\)[+*{]/.test(expr))return null;
  // Reject obvious polynomial/exponential backtracking patterns from untrusted lists.
  if(/\((?:\?:)?[^()]*\|[^()]*\)[+*{]/.test(expr)||/\.\*\.\*/.test(expr)||
     /\([^)]*\)[+*][+*]/.test(expr))return null;try{return new RegExp(expr,matchCase?"":"i");}catch(_){return null;}}
 let p=pattern,start="",end="";
 if(p.startsWith("||")){start="^[a-z][a-z0-9+.-]*:\\/\\/(?:[^/?#@:]*\\.)?";p=p.slice(2);}
 else if(p[0]==="|"){start="^";p=p.slice(1);}
 if(p.endsWith("|")){end="$";p=p.slice(0,-1);}
 let s="";for(const c of p)s+=c==="*" ? ".*" : c==="^" ? "(?:[^a-zA-Z0-9_.%-]|$)" : /[\\.^$+?{}()[\]|]/.test(c)?"\\"+c:c;
 try{return new RegExp(start+s+end,matchCase?"":"i");}catch(_){return null;}
}
function network(raw){
 let line=raw.trim();if(!line||/^[!\[#]/.test(line)||/##|#@#|#@\?#|#\?#|#\$#|#%#|#@\$#/.test(line))return null;
 const exception=line.startsWith("@@");if(exception)line=line.slice(2);
 let p=line,opts=[],i=line.lastIndexOf("$");
 if(i>0&&/^[a-z0-9~-]+(?:[=,]|$)/i.test(line.slice(i+1))){p=line.slice(0,i);opts=line.slice(i+1).split(",");}
 if(!p||p.length>2048||/\s/.test(p)||p.startsWith("javascript:"))return null;
 const include=new Set(),exclude=new Set();let scope="",targetScope="",denyallow="",third=null,important=false,badfilter=false,special="",matchCase=false,removeparam="";
 for(const item of opts){const neg=item[0]==="~",o=neg?item.slice(1):item;
  if((o.startsWith("domain=")||o.startsWith("from="))&&!neg){
   if(scope)return null;
   scope=o.slice(o.indexOf("=")+1).toLowerCase();
   if(!validDomains(scope))return null;
   continue;
  }
  if(o.startsWith("to=")&&!neg){if(targetScope)return null;targetScope=o.slice(3).toLowerCase();if(!validDomains(targetScope))return null;continue;}
  if(o.startsWith("denyallow=")&&!neg){if(denyallow)return null;denyallow=o.slice(10).toLowerCase();if(!validDomains(denyallow)||denyallow.includes("~"))return null;continue;}
  if(o.startsWith("removeparam=")&&!neg){
   if(removeparam)return null;
   removeparam=o.slice(12);
   if(!/^[a-zA-Z0-9_.~-]{1,64}$/.test(removeparam))return null;
   continue;
  }
  if(o==="third-party"||o==="3p"){third=!neg;continue;}
  if(o==="first-party"||o==="1p"){third=neg;continue;}
  if(o==="match-case"){matchCase=!neg;continue;}
  if(o==="important"&&!neg){important=true;continue;}
  if(o==="badfilter"&&!neg){badfilter=true;continue;}
  if(["document","elemhide","generichide","genericblock"].includes(o)&&exception&&!neg){special=o;continue;}
  const resource=ALIASES[o]||o;
  if(RES.has(resource)){(neg?exclude:include).add(resource);continue;}return null;
 }
 if(denyallow&&!scope)return null;
 const compiled=regex(p,matchCase);if(!compiled)return null;
 let anchor="";if(p.startsWith("||")){const m=/^\|\|([a-z0-9.-]+)(?=[\^/|?*: ]|$)/i.exec(p);if(m)anchor=m[1].toLowerCase();}
 return {p,compiled,anchor,exception,include,exclude,scope,targetScope,denyallow,third,important,badfilter,special,removeparam,key:[p,exception?"allow":"block",...opts.filter(x=>x!=="badfilter").sort()].join("|")};
}

function cosmetic(line){
 const m=/^([^#]*)(#@#|##)(.+)$/.exec(line.trim());if(!m)return null;
 const scope=m[1].toLowerCase(),selector=m[3].trim();
 if(!selector||selector.length>600||/[{};\r\n]/.test(selector)||!/^[\w.~, -]*$/.test(scope)||/\+js\(|:-abp-|:style\(|:remove\(/i.test(selector))return null;
 return {scope,selector,exception:m[2]==="#@#"};
}
function procedural(line){
 const match=/^([^#]+)(#@\?#|#\?#)(.+)$/.exec(line.trim());if(!match)return null;
 const scope=match[1].toLowerCase(),raw=match[3].trim();
 if(!/^[a-z0-9.-]+$/.test(scope))return null;
 const contains=/^([a-z][\w.#>[\]="'\s:-]{0,160}):-abp-contains\(([^()]{1,120})\)$/i.exec(raw);
 if(contains&&!/[{};\\]/.test(contains[2]))
  return {scope,selector:contains[1].trim(),mode:"text",text:contains[2],exception:match[2]==="#@?#"};
 const has=/^([a-z][\w.#>[\]="'\s:-]{0,160}):-abp-has\(([^()]{1,150})\)$/i.exec(raw);
 if(has&&/^[a-zA-Z.#\[][a-zA-Z0-9_.#>[\]="'\s:*-]*$/.test(has[2])&&!/[{};\\]/.test(has[2]))
  return {scope,selector:has[1].trim(),mode:"has",target:has[2].trim(),exception:match[2]==="#@?#"};
 return null;
}
g.DKRules={TYPE,RES,SUFFIX,host,sub,site,domains,regex,network,cosmetic,procedural,validDomains};
if(typeof module!=="undefined")module.exports=g.DKRules;
})(typeof globalThis!=="undefined"?globalThis:this);
