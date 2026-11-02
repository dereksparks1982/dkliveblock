/* DK Live Block: event-driven cookie sentinels.
   Dormant unless a matching browser event arrives. No polling, payload
   storage, automatic cookie blocking, or external service dependency. */
(function(root){"use strict";
const TYPES=Object.freeze(["http-response","cookie-change","script-write"]);
const MAX_HEADERS=32,MAX_HEADER_LENGTH=8192;
const names=Object.freeze({
 "http-response":"HTTP Set-Cookie header received (attempted, not confirmed stored)",
 "cookie-change":"Browser cookie set/removed (post-change)",
 "script-write":"Script cookie write (requires a separately tested page hook)"
});
function parseHttp(header,site,responseHost){
 const domainHost=root.DKCookieIntelligence.cleanHost(responseHost);
 const siteHost=root.DKCookieIntelligence.cleanHost(site);
 if(!siteHost||!domainHost||typeof header!=="string"||
  header.length>MAX_HEADER_LENGTH)return null;
 const boundary=header.indexOf(";");
 const pair=header.slice(0,boundary<0?header.length:boundary);
 const equals=pair.indexOf("=");
 if(equals<=0)return null;
 const cookieName=pair.slice(0,equals).trim();
 if(!root.DKCookieIntelligence.validName(cookieName))return null;
 let domain=domainHost,path="/",secure=false,httpOnly=false,partitioned=false,
  sameSite="unspecified";
 if(boundary>=0){
  for(const part of header.slice(boundary+1).split(";").slice(0,24)){
   const ix=part.indexOf("=");
   const key=(ix<0?part:part.slice(0,ix)).trim().toLowerCase();
   const value=ix<0?"":part.slice(ix+1).trim();
   if(key==="secure")secure=true;
   else if(key==="httponly")httpOnly=true;
   else if(key==="partitioned")partitioned=true;
   else if(key==="samesite"&&/^(lax|strict|none)$/i.test(value))
    sameSite=value.toLowerCase()==="none"?"no_restriction":value.toLowerCase();
   else if(key==="path"&&value.startsWith("/")&&value.length<=256)path=value;
   else if(key==="domain"){
    const candidate=root.DKCookieIntelligence.cleanHost(value);
    if(candidate&&(domainHost===candidate||domainHost.endsWith("."+candidate)))
     domain=candidate;
   }
  }
 }
 return root.DKCookieIntelligence.cookieMetadata({
  site:siteHost,domain,name:cookieName,path,secure,httpOnly,partitioned,
  sameSite,source:"http-response",outcome:"attempted"
 });
}
function create(sink){
 if(typeof sink!=="function")throw new TypeError("Cookie sentinel sink required.");
 const handlers=new Map(TYPES.map(type=>[type,[]]));
 function on(type,handler){
  if(!handlers.has(type)||typeof handler!=="function")return false;
  handlers.get(type).push(handler);return true;
 }
 function wake(type,payload){
  if(!handlers.has(type))return 0;
  let matched=0;
  for(const handler of handlers.get(type)){
   try{matched+=Math.max(0,Number(handler(payload)||0));}catch(_){}
  }
  return matched;
 }
 on("http-response",event=>{
  const site=root.DKCookieIntelligence.cleanHost(event?.site);
  const dest=root.DKCookieIntelligence.cleanHost(event?.responseHost);
  const headers=event?.responseHeaders;
  if(!site||!dest||!Array.isArray(headers))return 0;
  let accepted=0,seen=0;
  for(const header of headers){
   if(++seen>MAX_HEADERS)break;
   if(String(header?.name||"").toLowerCase()!=="set-cookie")continue;
   // The Set-Cookie VALUE is inspected only transiently for its name and
   // attributes. Its value never enters sink(), snapshots or diagnostics.
   const record=parseHttp(header.value,site,dest);
   if(record&&sink(record)!==false)accepted++;
  }
  return accepted;
 });
 return Object.freeze({on,wake,types:TYPES,descriptions:names,
  handlers:()=>Object.freeze(TYPES.map(type=>
   Object.freeze({type,armed:handlers.get(type).length>0})))});
}
const API=Object.freeze({create,parseHttp,TYPES});
root.DKCookieSentinels=API;
if(typeof module!=="undefined")module.exports=API;
})(typeof globalThis!=="undefined"?globalThis:this);
