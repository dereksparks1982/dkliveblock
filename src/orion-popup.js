/* Orion-only popup pause control, requiring active-tab messaging. */
(function(root){"use strict";
const api=root.browser||root.chrome,doc=root.document;
const button=doc?.getElementById("site-pause"),status=doc?.getElementById("site-status");
if(!api||!button||!status)return;
let tab=null,paused=false,busy=false,site=null;
function hostFromUrl(input){
 try{
  const u=new URL(input);
  const h=u.hostname.toLowerCase();
  return ["https:","http:"].includes(u.protocol)&&!u.username&&!u.password&&
    /^[a-z0-9.-]+$/.test(h)&&h.length>0&&!h.includes("..")?h:null;
 }catch(_){return null;}
}
function update(){button.disabled=busy||tab===null;button.textContent=paused?"Resume on this website":"Pause on this website";}
async function call(obj,name,args){
 return new Promise((resolve,reject)=>{
  if(typeof obj?.[name]!=="function"){reject(Error("Orion API unavailable"));return;}
  let done=false;const end=(v,e)=>{if(done)return;done=true;e?reject(e):resolve(v);};
  try{
   const r=obj[name](...args,v=>{const e=api.runtime?.lastError;end(v,e?Error(String(e.message||"Request failed")):null);});
   if(r&&typeof r.then==="function")r.then(v=>end(v),e=>end(null,e));
   else if(r!==undefined)end(r);
  }catch(e){
   // Firefox-style browser.* APIs may be Promise-only and reject callbacks.
   // Retry with the documented Promise signature, without weakening scope.
   try{
    const result=obj[name](...args);
    if(result&&typeof result.then==="function")result.then(v=>end(v),err=>end(null,err));
    else end(null,e);
   }catch(err){end(null,err);}
  }
 });
}
async function send(action,value){
 return call(api.tabs,"sendMessage",[tab,action==="dk-orion-set-pause"?
  {action,site,paused:value}:{action,site}]);
}
async function init(){
 busy=true;update();
 try{
  const rows=await call(api.tabs,"query",[{active:true,currentWindow:true}]);
  const current=Array.isArray(rows)?rows[0]:null;
  site=hostFromUrl(current?.url||"");
  if(!Number.isSafeInteger(current?.id)||!site)throw Error("Open a regular website first");
  tab=current.id;
  const response=await send("dk-orion-status");
  if(!response?.ok||!response.ready||response.site!==site)
   throw Error("Website changed or page controls unavailable; reopen the popup");
  paused=response.paused===true;
  status.textContent=response.site+(response.persistent?" · saved":" · current page only");
 }catch(e){tab=null;status.textContent=String(e?.message||"Unavailable");}
 finally{busy=false;update();}
}
button.addEventListener("click",async()=>{
 if(busy||tab===null)return;
 busy=true;update();
 try{
  const r=await send("dk-orion-set-pause",!paused);
  if(!r?.ok||r.site!==site)throw Error(r?.error||"Website changed; reopen the popup");
  paused=r.paused===true;
  status.textContent=r.site+(r.persistent?" · saved":" · current page only");
 }catch(e){
  // Do not leave an enabled control backed by stale state after failed save.
  tab=null;status.textContent=String(e?.message||"Pause failed")+"; reopen DK controls";
 }
 finally{busy=false;update();}
});
init();
})(typeof globalThis!=="undefined"?globalThis:this);
