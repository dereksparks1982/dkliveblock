/* DK Live Block: shared rule helpers. */
(function(g){"use strict";
const TYPE={main_frame:"document",sub_frame:"subdocument",xmlhttprequest:"xmlhttprequest"};
const RES=new Set(["script","image","stylesheet","media","font","object","xmlhttprequest","subdocument","document","ping","websocket","other"]);
const SUFFIX=new Set(["co.uk","org.uk","co.nz","com.au","co.jp","co.in","co.kr","com.br"]);
function host(url){try{return new URL(url).hostname.toLowerCase();}catch(_){return "";}}
function sub(h,d){return Boolean(h&&d&&(h===d||h.endsWith("."+d)));}
function site(h){const b=h.split(".");return b.slice(-(SUFFIX.has(b.slice(-2).join("."))?3:2)).join(".");}
function domains(h,list,sep="|"){if(!list)return true;const a=list.split(sep),yes=a.filter(x=>x&&!x.startsWith("~"));return !a.some(x=>x.startsWith("~")&&sub(h,x.slice(1)))&&(!yes.length||yes.some(x=>sub(h,x)));}

function regex(pattern,matchCase=false){
 if(pattern[0]==="/"&&pattern.endsWith("/")&&pattern.length>2){try{return new RegExp(pattern.slice(1,-1),matchCase?"":"i");}catch(_){return null;}}
 let p=pattern,start="",end="";
 if(p.startsWith("||")){start="^[a-z][a-z0-9+.-]*:\\/\\/(?:[^/?#@:]*\\.)?";p=p.slice(2);}
 else if(p[0]==="|"){start="^";p=p.slice(1);}
 if(p.endsWith("|")){end="$";p=p.slice(0,-1);}
 let s="";for(const c of p)s+=c==="*" ? ".*" : c==="^" ? "(?:[^a-zA-Z0-9_.%-]|$)" : /[\\.^$+?{}()[\]|]/.test(c)?"\\"+c:c;
 try{return new RegExp(start+s+end,matchCase?"":"i");}catch(_){return null;}
}
function network(raw){
 let line=raw.trim();if(!line||/^[!\[#]/.test(line)||line.includes("##")||line.includes("#@#")||line.includes("#?#"))return null;
 const exception=line.startsWith("@@");if(exception)line=line.slice(2);
 let p=line,opts=[],i=line.lastIndexOf("$");
 if(i>0&&/^[a-z~-]+(?:[=,]|$)/i.test(line.slice(i+1))){p=line.slice(0,i);opts=line.slice(i+1).split(",");}
 if(!p||p.length>2048||/\s/.test(p))return null;
 const include=new Set(),exclude=new Set();let scope="",third=null,important=false,badfilter=false,special="",matchCase=false;
 for(const item of opts){const neg=item[0]==="~",o=neg?item.slice(1):item;
  if(o.startsWith("domain=")&&!neg){scope=o.slice(7).toLowerCase();if(!/^[\w.~|-]+$/.test(scope))return null;continue;}
  if(o==="third-party"){third=!neg;continue;}
  if(o==="match-case"){matchCase=!neg;continue;}
  if(o==="important"&&!neg){important=true;continue;}
  if(o==="badfilter"&&!neg){badfilter=true;continue;}
  if(["document","elemhide","generichide","genericblock"].includes(o)&&exception&&!neg){special=o;continue;}
  if(RES.has(o)){(neg?exclude:include).add(o);continue;}return null;
 }
 const compiled=regex(p,matchCase);if(!compiled)return null;
 let anchor="";if(p.startsWith("||")){const m=/^\|\|([a-z0-9.-]+)(?=[\^/|?*: ]|$)/i.exec(p);if(m)anchor=m[1].toLowerCase();}
 return {p,compiled,anchor,exception,include,exclude,scope,third,important,badfilter,special,key:[p,exception?"allow":"block",...opts.filter(x=>x!=="badfilter").sort()].join("|")};
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
 const parsed=/^([a-z][\w.#>[\]="'\s:-]{0,160}):-abp-contains\(([^()]{1,120})\)$/i.exec(raw);
 if(!parsed||/[{};\\]/.test(parsed[2]))return null;
 return {scope,selector:parsed[1].trim(),text:parsed[2],exception:match[2]==="#@?#"};
}
g.DKRules={TYPE,RES,SUFFIX,host,sub,site,domains,regex,network,cosmetic,procedural};
if(typeof module!=="undefined")module.exports=g.DKRules;
})(typeof globalThis!=="undefined"?globalThis:this);
