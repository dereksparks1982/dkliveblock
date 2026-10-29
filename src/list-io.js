/* DK Live Block: memory-bounded filter subscription downloads. Data only, never code. */
(function(root){"use strict";
const MAX_BYTES=20000000, MIN_LENGTH=300;
function assertResponse(res){
 if(!res||!res.ok)throw Error("HTTP "+(res?.status||"unavailable"));
 const header=res.headers?.get?.("content-length");
 if(header!=null&&header!==""){
  const size=Number(header);
  if(!Number.isFinite(size)||size<0||size>MAX_BYTES)throw Error("List too large or invalid length");
 }
}
function verify(text){
 if(typeof text!=="string"||text.length<MIN_LENGTH||text.length>MAX_BYTES||
    !/\[Adblock Plus|! Title:|! Homepage:/i.test(text.slice(0,4000)))throw Error("Invalid filter list");
 if(text.includes("\u0000"))throw Error("Invalid binary filter list");
 return text;
}
async function read(res){
 assertResponse(res);
 // A ReadableStream allows cancellation before a giant response exhausts memory.
 if(res.body&&typeof res.body.getReader==="function"){
  const reader=res.body.getReader(),decoder=new TextDecoder("utf-8");
  let total=0,text="";
  try{
   while(true){
    const piece=await reader.read();
    if(piece.done)break;
    const chunk=piece.value;
    total+=chunk.byteLength;
    if(total>MAX_BYTES){await reader.cancel().catch(()=>{});throw Error("List too large");}
    text+=decoder.decode(chunk,{stream:true});
    if(text.length>MAX_BYTES){await reader.cancel().catch(()=>{});throw Error("List too large");}
   }
   text+=decoder.decode();
  }finally{try{reader.releaseLock();}catch(_){}}
  return verify(text);
 }
 // Old fetch mocks lack a stream; browsers use the bounded streaming path above.
 if(typeof res.text!=="function")throw Error("Unreadable filter list");
 return verify(await res.text());
}
root.DKListIO={read,verify,MAX_BYTES};
if(typeof module!=="undefined")module.exports=root.DKListIO;
})(typeof globalThis!=="undefined"?globalThis:this);
