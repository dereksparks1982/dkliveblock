/* DK Live Block toolbar indicator: retain original cyan PNG; synthesize pause/disabled tints locally. */
(function(root){"use strict";
const SOURCE="icons/dk-live-block.png";
const COLORS=Object.freeze({disabled:[239,70,85],paused:[250,174,53]});
const TITLES=Object.freeze({
 active:"DK Live Block: protection active",
 disabled:"DK Live Block: protection disabled here",
 paused:"DK Live Block: temporarily paused on this tab"
});
function state(globalEnabled,siteAllowed,tabPaused){
 return !globalEnabled||siteAllowed?"disabled":tabPaused?"paused":"active";
}
function tint(original,output,color){
 const input=original.data,result=output.data;
 if(input.length!==result.length)throw Error("Icon image dimensions differ");
 for(let i=0;i<input.length;i+=4){
  const a=input[i+3];if(!a)continue;
  const brightness=(input[i]*0.2126+input[i+1]*0.7152+input[i+2]*0.0722)/255;
  const factor=0.48+0.52*brightness;
  result[i]=Math.round(color[0]*factor);
  result[i+1]=Math.round(color[1]*factor);
  result[i+2]=Math.round(color[2]*factor);
  result[i+3]=a;
 }
 return output;
}
function create(browser,doc=typeof document!=="undefined"?document:null,ImageType=typeof Image!=="undefined"?Image:null){
 let loading=null;
 const current=new Map(),pending=new Map();
 function prepare(){
  if(loading)return loading;
  loading=new Promise(resolve=>{
   if(!doc?.createElement||!ImageType||!browser.runtime?.getURL){resolve(null);return;}
   try{
    const image=new ImageType();
    image.onload=()=>{
     try{
      const frames={disabled:{},paused:{}};
      for(const size of [16,32]){
       const canvas=doc.createElement("canvas");canvas.width=size;canvas.height=size;
       const ctx=canvas.getContext("2d",{willReadFrequently:true});
       if(!ctx?.getImageData||!ctx.createImageData||!ctx.drawImage)throw Error("Canvas unsupported");
       ctx.drawImage(image,0,0,size,size);
       const original=ctx.getImageData(0,0,size,size);
       for(const [mode,rgb] of Object.entries(COLORS))
        frames[mode][size]=tint(original,ctx.createImageData(size,size),rgb);
      }
      resolve(frames);
     }catch(_){resolve(null);}
    };
    image.onerror=()=>resolve(null);
    image.src=browser.runtime.getURL(SOURCE);
   }catch(_){resolve(null);}
  });
  return loading;
 }
 function apply(tabId,mode){
  if(!Number.isInteger(tabId)||tabId<0||!Object.prototype.hasOwnProperty.call(TITLES,mode))return;
  if(current.get(tabId)===mode)return;
  current.set(tabId,mode);
  const marker=Symbol();pending.set(tabId,marker);
  const action=browser.browserAction;
  action?.setTitle?.({tabId,title:TITLES[mode]})?.catch?.(()=>{});
  if(typeof action?.setIcon!=="function")return;
  if(mode==="active"){
   action.setIcon({tabId,path:SOURCE}).catch(()=>{});
   return;
  }
  prepare().then(frames=>{
   if(pending.get(tabId)!==marker||current.get(tabId)!==mode)return;
   if(frames?.[mode])return action.setIcon({tabId,imageData:frames[mode]}).catch(()=>{});
   return action.setIcon({tabId,path:SOURCE}).catch(()=>{});
  }).catch(()=>{});
 }
 function reset(tabId){pending.delete(tabId);current.delete(tabId);}
 return Object.freeze({apply,reset,prepare});
}
const API=Object.freeze({SOURCE,COLORS,TITLES,state,tint,create});
root.DKIconState=API;
if(typeof module!=="undefined")module.exports=API;
})(typeof globalThis!=="undefined"?globalThis:this);
