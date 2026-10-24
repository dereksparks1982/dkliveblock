/* DK Live Block: shared rule helpers. */
(function(g){"use strict";
const TYPE={main_frame:"document",sub_frame:"subdocument",xmlhttprequest:"xmlhttprequest"};
const RES=new Set(["script","image","stylesheet","media","font","object","xmlhttprequest","subdocument","document","ping","websocket","other"]);
const SUFFIX=new Set(["co.uk","org.uk","co.nz","com.au","co.jp","co.in","co.kr","com.br"]);
function host(url){try{return new URL(url).hostname.toLowerCase();}catch(_){return "";}}
function sub(h,d){return Boolean(h&&d&&(h===d||h.endsWith("."+d)));}
function site(h){const b=h.split(".");return b.slice(-(SUFFIX.has(b.slice(-2).join("."))?3:2)).join(".");}
function domains(h,list,sep="|"){if(!list)return true;const a=list.split(sep),yes=a.filter(x=>x&&!x.startsWith("~"));return !a.some(x=>x.startsWith("~")&&sub(h,x.slice(1)))&&(!yes.length||yes.some(x=>sub(h,x)));}
g.DKRules={TYPE,RES,SUFFIX,host,sub,site,domains};
})(typeof globalThis!=="undefined"?globalThis:this);
