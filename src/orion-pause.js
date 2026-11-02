/* Orion-only exact-host user pause. No background, telemetry or web requests. */
(function(root){"use strict";
const api=root.browser||root.chrome,host=String(root.location?.hostname||"").toLowerCase();
const KEY="dkOrionPausedHosts",MAX=100,store=api?.storage?.local;
let paused=false,ready=false,listener=null,saved=!!store,queue=Promise.resolve();
function valid(x){return typeof x==="string"&&x.length<=253&&x===x.toLowerCase()&&
 /^[a-z0-9.-]+$/.test(x)&&!x.startsWith(".")&&!x.endsWith(".")&&!x.includes("..");}
function safeList(value){
 if(!Array.isArray(value))return [];
 const out=new Set();
 for(const x of value.slice(0,MAX*2)){if(valid(x))out.add(x);if(out.size>=MAX)break;}
 return [...out];
}
function call(object,name,args){
 return new Promise((resolve,reject)=>{
  if(typeof object?.[name]!=="function"){reject(Error("Unsupported Orion feature"));return;}
  let finished=false;
  function done(v,error){if(finished)return;finished=true;error?reject(error):resolve(v);}
  const cb=v=>{const e=api?.runtime?.lastError;done(v,e?Error(String(e.message||"Browser error")):null);};
  try{
   const result=object[name](...args,cb);
   if(result&&typeof result.then==="function")result.then(v=>done(v),e=>done(null,e));
   else if(result!==undefined)done(result);
  }catch(e){
   try{const result=object[name](...args);
    if(result&&typeof result.then==="function")result.then(v=>done(v),err=>done(null,err));
    else done(null,e);
   }catch(error){done(null,error);}
  }
 });
}
function apply(next){paused=next===true;ready=true;listener?.(paused);}
const control=Object.freeze({register(fn){listener=fn;if(ready)listener(paused);},
 get(){return Object.freeze({ready,paused,site:host,persistent:saved});}});
root.DKOrionPause=control;
async function read(){
 const record=await call(store,"get",[KEY]);
 // A corrupt saved opt-out cannot silently become an empty allowlist.
 if(!record||typeof record!=="object"||
   Object.prototype.hasOwnProperty.call(record,KEY)&&!Array.isArray(record[KEY]))
  throw Error("Invalid saved Orion site settings");
 return safeList(record[KEY]);
}
async function change(next){
 if(!ready||!valid(host)||typeof next!=="boolean")throw Error("Invalid site setting");
 if(!store){apply(next);return control.get();}
 const list=await read(),newList=list.filter(x=>x!==host);
 if(next&&newList.length>=MAX)throw Error("Saved site limit reached");
 if(next)newList.push(host);
 await call(store,"set",[{[KEY]:newList}]);
 apply(next);return control.get();
}
api?.runtime?.onMessage?.addListener?.((message,sender,respond)=>{
 if(!message||typeof message!=="object")return false;
 if(message.action!=="dk-orion-status"&&message.action!=="dk-orion-set-pause")return false;
 // An already-open popup can outlive a navigation. Never apply its request
 // to a different origin that reused the same tab ID.
 if(message.site!==host||!valid(host)){
  respond({ok:false,error:"Website changed; reopen DK controls"});return false;
 }
 if(message.action==="dk-orion-status"){respond({ok:true,...control.get()});return false;}
 if(typeof message.paused!=="boolean"){respond({ok:false,error:"Invalid choice"});return false;}
 queue=queue.then(()=>change(message.paused)).then(state=>respond({ok:true,...state}),
  e=>respond({ok:false,error:String(e?.message||"Settings unavailable")}));
 return true;
});
api?.storage?.onChanged?.addListener?.((changes,area)=>{
 if(area==="local"&&changes?.[KEY]&&ready&&valid(host))
  apply(safeList(changes[KEY].newValue).includes(host));
});
if(!valid(host)){apply(true);}
else if(!store){apply(false);}
else read().then(list=>apply(list.includes(host)),()=>{saved=false;apply(true);});
})(typeof globalThis!=="undefined"?globalThis:this);
