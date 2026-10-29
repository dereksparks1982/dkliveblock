/* DK Live Block: selective, opt-in Firefox proxy routing. No proxy is provided. */
(function(root){"use strict";
const DEFAULT=Object.freeze({enabled:false,type:"socks",host:"127.0.0.1",port:9050,proxyDNS:true,mode:"domains",domains:[]});
const badSuffixes=[".localhost",".local",".lan",".internal",".home.arpa",".invalid",".test"];
function validHost(input){
 if(typeof input!=="string"||input.length>253||input.length<3||input!==input.trim()||/[/@:?#*\s]/.test(input))return false;
 const bits=input.toLowerCase().split(".");
 return bits.length>=2&&bits.every(p=>p.length>0&&p.length<=63&&/^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/.test(p));
}
function privateDestination(host){
 const x=String(host||"").toLowerCase().replace(/\.$/,"");
 if(!x||x==="localhost"||x.includes(":")||badSuffixes.some(s=>x.endsWith(s)))return true;
 if(/^\d+(?:\.\d+){3}$/.test(x))return true; // No IP literal routing, including private LAN.
 return false;
}
function proxyHost(input){
 if(typeof input!=="string"||!input||input.length>253||input!==input.trim())return false;
 if(input==="localhost")return true;
 if(/^\d+(?:\.\d+){3}$/.test(input))return input.split(".").map(Number).every(n=>n>=0&&n<=255);
 return validHost(input);
}
function hostFrom(raw){
 try{const u=new URL(raw);return /^https?:$/.test(u.protocol)?u.hostname.toLowerCase().replace(/\.$/,""):"";}
 catch(_){return "";}
}
function domainMatch(host,domain){return !!host&&(host===domain||host.endsWith("."+domain));}
function validate(input){
 if(!input||typeof input!=="object"||Array.isArray(input))return {error:"Invalid network settings."};
 const enabled=input.enabled===true,type=input.type||"socks",mode=input.mode||"domains",host=String(input.host??"127.0.0.1").trim().toLowerCase(),port=Number(input.port??9050);
 if(!["socks","http","https"].includes(type))return {error:"Choose SOCKS5, HTTP or HTTPS."};
 if(!["domains","images"].includes(mode))return {error:"Choose domain routing or image routing."};
 if(!proxyHost(host))return {error:"Invalid proxy server hostname or address."};
 if(!Number.isInteger(port)||port<1||port>65535)return {error:"Proxy port must be 1–65535."};
 const raw=input.domains??[];
 if(!Array.isArray(raw)||raw.length>80)return {error:"At most 80 websites can be configured."};
 const domains=[];
 for(const value of raw){
  if(typeof value!=="string"||!validHost(value))return {error:"Use only website hostnames, not URLs or wildcards."};
  const d=value.toLowerCase();
  if(privateDestination(d))return {error:"Local-network destinations are not routable."};
  if(d.endsWith(".onion")&&type!=="socks")return {error:"Onion sites require SOCKS5 with remote DNS."};
  if(!domains.includes(d))domains.push(d);
 }
 if(domains.some(d=>d.endsWith(".onion"))&&type==="socks"&&input.proxyDNS===false)return {error:"Onion destinations require remote DNS."};
 if(enabled&&!domains.length)return {error:"Choose at least one website before enabling the proxy."};
 return {value:{enabled,type,mode,host,port,domains,proxyDNS:type==="socks"?input.proxyDNS!==false:true}};
}
function route(request,config,tabURL=""){
 if(!config?.enabled||!config.domains?.length||!request||!/^https?:/i.test(request.url||"")||request.type==="speculative")return null;
 const target=hostFrom(request.url);
 if(!target||privateDestination(target)||target===config.host)return null;
 if(target.endsWith(".onion")&&(config.type!=="socks"||!config.proxyDNS))return null;
 const match=config.mode==="domains"
  ?config.domains.some(d=>domainMatch(target,d))
  :(request.type==="image"||request.type==="imageset")&&config.domains.some(d=>domainMatch(hostFrom(request.documentUrl||request.originUrl||tabURL),d));
 if(!match)return null;
 const proxy={type:config.type,host:config.host,port:config.port};
 if(config.type==="socks")proxy.proxyDNS=config.proxyDNS;
 return [proxy,null]; // Do not fall back silently to a different proxy on failure.
}
function classifyFailure(reason){
 const e=String(reason||"").toUpperCase().slice(0,120);
 if(/PROXY_/.test(e))return "proxy";
 if(/UNKNOWN_HOST|DNS_|NXDOMAIN|NAME_NOT_RESOLVED/.test(e))return "dns";
 if(/CERT|SSL|TLS|SEC_ERROR/.test(e))return "tls";
 if(/TIMEOUT|TIMED_OUT|CONNECTION|NET_RESET|OFFLINE|NETWORK|REFUSED|RESET/.test(e))return "connection";
 return "other";
}
const api={DEFAULT,validHost,privateDestination,hostFrom,domainMatch,validate,route,classifyFailure};
root.DKNetwork=api;
if(typeof module!=="undefined")module.exports=api;
})(typeof globalThis!=="undefined"?globalThis:this);
