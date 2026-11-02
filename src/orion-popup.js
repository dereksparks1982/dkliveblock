/* Orion-only popup pause control, requiring active-tab messaging. */
(function(root){"use strict";
const api=root.browser||root.chrome,doc=root.document;
const button=doc?.getElementById("site-pause"),status=doc?.getElementById("site-status");
if(!api||!button||!status)return;
let tab=null,paused=false,busy=false;
function update(){button.disabled=busy||tab===null;button.textContent=paused?"Resume on this website":"Pause on this website";}
async function call(obj,name,args){
 return new Promise((resolve,reject)=>{
  if(typeof obj?.[name]!=="function"){reject(Error("Orion API unavailable"));return;}
  let done=false;const end=(v,e)=>{if(done)return;done=true;e?reject(e):resolve(v);};
  try{
   const r=obj[name](...args,v=>{const e=api.runtime?.lastError;end(v,e?Error(String(e.message||"Request failed")):null);});
   if(r&&typeof r.then==="function")r.then(v=>end(v),e=>end(null,e));
   else if(r!==undefined)end(r);
  }catch(e){end(null,e);}
 });
}
async function send(action,value){
 return call(api.tabs,"sendMessage",[tab,action==="dk-orion-set-pause"?{action,paused:value}:{action}]);
}
async function init(){
 busy=true;update();
 try{
  const rows=await call(api.tabs,"query",[{active:true,currentWindow:true}]);
  const current=Array.isArray(rows)?rows[0]:null;
  if(!Number.isSafeInteger(current?.id))throw Error("Open a regular website first");
  tab=current.id;
  const response=await send("dk-orion-status");
  if(!response?.ok||!response.ready||!response.site)throw Error("Page controls unavailable; reload the tab");
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
  if(!r?.ok)throw Error(r?.error||"Pause failed");
  paused=r.paused===true;
  status.textContent=r.site+(r.persistent?" · saved":" · current page only");
 }catch(e){status.textContent=String(e?.message||"Pause failed");}
 finally{busy=false;update();}
});
init();
})(typeof globalThis!=="undefined"?globalThis:this);
