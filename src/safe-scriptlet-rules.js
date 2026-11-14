/* DK Live Block: site-scoped user-authored scriptlet parser.
   Never interprets scripts from automatic filter-list subscriptions. */
(function(root){"use strict";
const HOST=/^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)*$/;
const NAME=/^[A-Za-z_$][A-Za-z0-9_$]{0,39}$/;
const BAD=new Set(["__proto__","constructor","prototype","document","location","navigator",
 "fetch","XMLHttpRequest","eval","Function","globalThis","self","top","parent",
 "frames","opener","browser","chrome","history","JSON","Promise","crypto",
 "localStorage","sessionStorage","cookieStore","__defineGetter__",
 "__defineSetter__","__lookupGetter__","__lookupSetter__","toString",
 "toLocaleString","valueOf","hasOwnProperty","isPrototypeOf",
 "propertyIsEnumerable"]);
const VALUES=new Set(["true","false","null","undefined","0","1"]);
function validHost(h){return typeof h==="string"&&h.length<254&&h.includes(".")&&HOST.test(h);}
function validPath(p){
 if(typeof p!=="string"||p.length>120)return false;
 const x=p.split(".");
 return x.length>=1&&x.length<=3&&x.every(k=>NAME.test(k)&&!BAD.has(k));
}
function parse(raw){
 if(typeof raw!=="string"||raw.length>300)return null;
 const text=raw.trim(),mark=text.includes("##+js(")?"##+js(":text.includes("#@#+js(")?"#@#+js(":"";
 if(!mark||!text.endsWith(")"))return null;
 const index=text.indexOf(mark),site=text.slice(0,index).toLowerCase(),exception=mark.startsWith("#@#");
 if(!validHost(site))return null;
 const body=text.slice(index+mark.length,-1);
 if(exception&&!body)return {site,exception,all:true};
 const args=body.split(",").map(v=>v.trim());
 if(args[0]==="abort-on-property-read"&&args.length===2&&validPath(args[1]))
  return {site,exception,name:"abort-on-property-read",path:args[1]};
 if(args.length!==3||args[0]!=="set-constant"||!validPath(args[1])||!VALUES.has(args[2]))return null;
 return {site,exception,name:"set-constant",path:args[1],value:args[2]};
}
// The MAIN-world tree cannot install a leaf and its ancestor/descendant
// simultaneously. Resolve the collision before the 24-shim runtime budget.
// Preserve the first eligible user-authored rule, leave unrelated siblings.
function pathConflict(path,selectedPaths){
 for(const other of selectedPaths){
  if(other===path||other.startsWith(path+".")||path.startsWith(other+"."))return true;
 }
 return false;
}
function select(text,host){
 if(typeof text!=="string"||text.length>200000||!validHost(host))return [];
 const added=new Map(),removed=new Set();let disabled=false,index=0;
 for(const line of text.split(/\r?\n/)){
  if(++index>4000)break;
  const r=parse(line);
  if(!r||!(host===r.site||host.endsWith("."+r.site)))continue;
  if(r.all){disabled=true;continue;}
  const id=r.name+"|"+r.path+"|"+(r.value??"");
  if(r.exception)removed.add(id);
  else added.set(id,r.name==="abort-on-property-read"?{name:r.name,path:r.path}:{name:r.name,path:r.path,value:r.value});
 }
 // Resolve exceptions before applying the 24-shim runtime limit.
 // Otherwise 24 excepted entries can hide later eligible user rules.
 const selected=[],paths=new Set();
 if(!disabled)for(const [id,rule] of added){
  if(removed.has(id)||pathConflict(rule.path,paths))continue;
  selected.push(rule);paths.add(rule.path);
  if(selected.length>=24)break;
 }
 return selected;
}
const API=Object.freeze({validHost,validPath,parse,select,pathConflict});
root.DKSafeScriptletRules=API;
if(typeof module!=="undefined")module.exports=API;
})(typeof globalThis!=="undefined"?globalThis:this);
